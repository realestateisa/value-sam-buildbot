import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Calendar, Phone, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Message, TERRITORIES } from '@/types/chat';
import { detectTerritory } from '@/utils/territoryDetection';
import { useToast } from '@/hooks/use-toast';

const TERRITORY_ADDRESSES: Record<string, string> = {
  oxford: '3015 S Jefferson Davis Hwy, Sanford, NC 27332',
  greenville: '783 East Butler Rd, Suite D, Mauldin, SC 29662',
  smithfield: '721 Seafood House Rd, Selma, NC 27576',
  statesville: '201 Absher Park Rd, Statesville, NC 28625',
  sanford: '3015 S Jefferson Davis Hwy, Sanford, NC 27332',
};

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, number>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: "Hi! I'm SAM, your digital assistant at Value Build Homes. I'm here to help you learn about our custom home building services and answer any questions you have. How can I help you today?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Check if message contains location information
    const territory = detectTerritory(inputValue);
    if (territory && (inputValue.toLowerCase().includes('appointment') || 
        inputValue.toLowerCase().includes('schedule') || 
        inputValue.toLowerCase().includes('meet'))) {
      setSelectedTerritory(territory.calNamespace);
      setShowCalendar(true);
      
      const territoryMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Great! I've found that ${territory.name} territory serves your area. This territory offers ${territory.appointmentType} appointments. I'll show you the calendar below where you can select a time that works for you.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, territoryMessage]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-sam', {
        body: { 
          messages: messages.concat(userMessage).map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        citations: data.citations || [],
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAppointment = () => {
    const appointmentMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Great! To help you book an appointment, could you tell me where you're planning to build your home? Please enter a county or city (e.g., Greenville, SC).",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, appointmentMessage]);
    setShowLocationInput(true);
  };

  const handleLocationSubmit = async () => {
    if (!locationInput.trim()) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('detect-territory', {
        body: { location: locationInput }
      });

      if (error) throw error;

      if (data.success) {
        const { territoryKey, territory } = data;
        
        // Map territory keys to Cal.com namespaces
        const territoryData = TERRITORIES[territoryKey as keyof typeof TERRITORIES];
        
        if (territoryData) {
          setSelectedTerritory(territoryData.calNamespace);
          setShowCalendar(true);
          setShowLocationInput(false);
          
          const territoryMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Great! I've found that ${territory.name} territory serves your area. This territory offers ${territoryData.appointmentType} appointments. Please select a time that works for you from the calendar below.`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, territoryMessage]);
          setLocationInput('');
        }
      } else {
        toast({
          title: "Location not found",
          description: data.message || "I couldn't find that location in our service areas. Please try entering a county name or city in NC, SC, or VA.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error detecting territory:', error);
      toast({
        title: "Error",
        description: "There was an error processing your location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCallback = () => {
    const callbackMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: 'I want to request a callback',
      timestamp: new Date(),
    };
    
    const responseMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: "I'd be glad to arrange a callback for you! To ensure you're connected with the right team member, could you let me know where you're planning to build your home?",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, callbackMessage, responseMessage]);
  };

  useEffect(() => {
    if (!showCalendar || !selectedTerritory) return;

    const territory = Object.values(TERRITORIES).find(t => t.calNamespace === selectedTerritory);
    if (!territory) return;

    const w = window as any;

    // Ensure Cal stub exists BEFORE loading script (prevents 'Cal is not defined')
    if (!w.Cal) {
      const Cal = function (...args: any[]) {
        (Cal as any).q = (Cal as any).q || [];
        (Cal as any).q.push(args);
      } as any;
      Cal.ns = {}; // Add namespace support
      w.Cal = Cal;
    }

    // Ensure Cal embed CSS
    if (!document.querySelector('link[href="https://app.cal.com/embed/embed.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://app.cal.com/embed/embed.css';
      document.head.appendChild(link);
    }

    // Ensure Cal embed JS
    if (!document.querySelector('script[src="https://app.cal.com/embed/embed.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://app.cal.com/embed/embed.js';
      script.async = true;
      document.head.appendChild(script);
    }

    // Clear any previous inline render
    const containerId = `cal-inline-${selectedTerritory}`;
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = '';

    // Queue init with namespace and inline render (processed once script loads)
    w.Cal('init', territory.calNamespace, { origin: 'https://app.cal.com' });
    
    // Configure UI settings
    w.Cal('ui', {
      hideEventTypeDetails: true,
      layout: 'month_view',
      styles: { branding: { brandColor: '#000000' } }
    });
    
    // Queue inline render using the namespace
    w.Cal('inline', {
      namespace: territory.calNamespace,
      elementOrSelector: `#${containerId}`,
      calLink: territory.calLink,
      config: { theme: 'light' }
    });
  }, [showCalendar, selectedTerritory]);

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 h-16 w-16 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
          size="icon"
        >
          <MessageCircle className="h-8 w-8" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={`fixed bottom-6 left-6 flex flex-col shadow-2xl z-50 transition-all ${showCalendar ? 'w-[500px] h-[720px]' : 'w-[400px] h-[600px]'}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">SAM</h3>
                <p className="text-xs opacity-90">Digital Assistant</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsOpen(false);
                setShowCalendar(false);
              }}
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Appointment Type Banner */}
          {showCalendar && selectedTerritory && (
            <div className="border-b bg-muted p-4">
              {(() => {
                const territory = Object.values(TERRITORIES).find(t => t.calNamespace === selectedTerritory);
                if (!territory) return null;
                
                const territoryKey = Object.keys(TERRITORIES).find(
                  key => TERRITORIES[key as keyof typeof TERRITORIES].calNamespace === selectedTerritory
                );
                
                const isInPerson = territory.appointmentType === 'in-person';
                const address = territoryKey ? TERRITORY_ADDRESSES[territoryKey] : null;
                
                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {isInPerson ? (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                      <span className="font-semibold text-sm">
                        {isInPerson ? 'In-Person Appointment' : 'Virtual Appointment'}
                      </span>
                    </div>
                    {isInPerson && address ? (
                      <p className="text-sm text-muted-foreground">
                        Design Studio Location: {address}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        A virtual meeting link will be provided after booking.
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Citations */}
                  {message.role === 'assistant' && message.citations && message.citations.length > 0 && (
                    <div className="mt-2 w-full max-w-[80%] overflow-hidden">
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        Here's how we found this answer
                      </div>
                      {(() => {
                        const currentIndex = expandedCitations[message.id] || 0;
                        const citation = message.citations![currentIndex];
                        const totalCitations = message.citations!.length;
                        const url = citation.url;
                        
                        // Always use Value Build Homes favicon since citations are from their website
                        const faviconUrl = 'https://www.google.com/s2/favicons?domain=valuebuildhomes.com&sz=32';
                        
                        return (
                          <Card className="p-3 bg-background border overflow-hidden">
                            <div className="flex items-start gap-3 overflow-hidden">
                              <img 
                                src={faviconUrl} 
                                alt="Value Build Homes" 
                                className="w-6 h-6 rounded flex-shrink-0 mt-0.5"
                              />
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium text-primary hover:underline block truncate"
                                >
                                  <span className="inline-flex items-center gap-1 max-w-full">
                                    <span className="truncate">{citation.title || 'Reference'}</span>
                                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                  </span>
                                </a>
                                {citation.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {citation.description}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1 truncate break-all">
                                  {url}
                                </p>
                              </div>
                            </div>
                            
                            {totalCitations > 1 && (
                              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                <span className="text-xs text-muted-foreground">
                                  {currentIndex + 1} of {totalCitations}
                                </span>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => {
                                      setExpandedCitations(prev => ({
                                        ...prev,
                                        [message.id]: currentIndex > 0 ? currentIndex - 1 : totalCitations - 1
                                      }));
                                    }}
                                  >
                                    <ChevronLeft className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => {
                                      setExpandedCitations(prev => ({
                                        ...prev,
                                        [message.id]: (currentIndex + 1) % totalCitations
                                      }));
                                    }}
                                  >
                                    <ChevronRight className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Card>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}
              {showLocationInput && !showCalendar && (
                <div className="p-4 border-t bg-muted/30">
                  <div className="flex gap-2">
                    <Input
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLocationSubmit()}
                      placeholder="Enter county or city..."
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleLocationSubmit}
                      size="sm"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Detecting...' : 'Submit'}
                    </Button>
                  </div>
                </div>
              )}
              {isLoading && !showLocationInput && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Calendar Embed */}
          {showCalendar && selectedTerritory && (
            <div className="border-t p-4 h-[600px] overflow-auto">
              <div
                id={`cal-inline-${selectedTerritory}`}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          )}

          {/* Action Buttons */}
          {!showLocationInput && !showCalendar && messages.length === 1 && (
            <div className="p-4 border-t space-y-2">
              <Button
                onClick={handleBookAppointment}
                className="w-full"
                variant="default"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book an Appointment
              </Button>
              <Button
                onClick={handleRequestCallback}
                className="w-full"
                variant="outline"
              >
                <Phone className="h-4 w-4 mr-2" />
                Request a Callback
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
