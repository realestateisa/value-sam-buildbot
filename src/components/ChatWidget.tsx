import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Calendar, ExternalLink, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Message, TERRITORIES } from '@/types/chat';
import { detectTerritory } from '@/utils/territoryDetection';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';
import TypingIndicator from '@/components/TypingIndicator';

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
        content: "Hi! I'm SAM, your Value Build Homes assistant. I can help you learn about our custom home building services and schedule appointments. What can I help you with?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, isLoading]);

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
          setLocationInput('');
        }
      } else {
        toast({
          title: "We don't build in your area yet",
          description: "Value Build Homes currently serves areas in North Carolina and South Carolina. We're expanding! Please check back or contact us for updates.",
          variant: "destructive",
        });
        
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I'm sorry, but we don't currently build in that area. Value Build Homes serves counties in North Carolina and South Carolina. Is there a different location you'd like to check?",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        setLocationInput('');
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


  useEffect(() => {
    if (!showCalendar || !selectedTerritory) return;

    setCalendarLoading(true);
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
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-20 w-20 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 z-50 p-0"
        size="icon"
      >
        {isOpen ? <X className="h-8 w-8" /> : <img src={logo} alt="Value Build Homes" className="h-16 w-16 rounded-full" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className={`fixed bottom-24 right-6 flex flex-col shadow-2xl z-50 transition-all duration-300 ease-in-out overflow-hidden ${showCalendar ? 'w-[500px] h-[828px]' : 'w-[400px] h-[690px]'}`}>
          {/* Header */}
          <div className={`flex items-center justify-between ${showCalendar ? 'p-4' : 'p-3'} border-b ${showLocationInput && !showCalendar ? 'bg-[#E93424]' : 'bg-primary'} text-primary-foreground transition-colors duration-300`}>
            {!showLocationInput && (
              <div className="flex items-center gap-2">
                <img src={logo} alt="Value Build Homes" className="h-10 w-10 rounded-full bg-white p-0.5" />
                <div>
                  <h3 className="text-base font-semibold">SAM</h3>
                  <p className="text-xs opacity-90 font-medium">Digital Assistant</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsOpen(false);
                setShowCalendar(false);
                setShowLocationInput(false);
              }}
              className="h-8 w-8 text-primary-foreground hover:bg-white/30 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Header */}
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isInPerson ? (
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        )}
                        <span className="font-semibold text-xs">
                          {isInPerson ? 'In-Person Appointment' : 'Virtual Appointment'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowCalendar(false);
                            setSelectedTerritory(null);
                            setShowLocationInput(true);
                          }}
                          className="h-6 px-2 text-[11px] transition-all duration-200"
                        >
                          Change Location
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setShowCalendar(false);
                            setSelectedTerritory(null);
                            setShowLocationInput(false);
                          }}
                          className="h-6 w-6 transition-all duration-200"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {isInPerson && address ? (
                      <p className="text-xs text-muted-foreground">
                        Design Studio Location: {address}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        A virtual meeting link will be provided after booking.
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Red Overlay Appointment Form */}
          {showLocationInput && !showCalendar ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#E93424] p-8 animate-fade-in relative">
              {/* Back Button */}
              <Button 
                variant="ghost" 
                className="absolute top-3 left-3 text-white hover:bg-white/10 font-medium transition-all duration-200"
                onClick={() => setShowLocationInput(false)}
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
              </Button>

              {/* Centered Content */}
              <div className="w-full max-w-md space-y-4">
                {/* Title */}
                <h2 className="text-xl font-semibold text-white text-center">
                  Schedule an Appointment
                </h2>

                {/* Input Form */}
            <div className="space-y-3">
              <Input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLocationSubmit()}
                placeholder="Enter your city or county..."
                disabled={isLoading}
                className="bg-white text-black border-none placeholder:text-gray-500 h-11"
              />
              <Button
                onClick={handleLocationSubmit}
                disabled={isLoading || !locationInput.trim()}
                className="w-full bg-white text-[#E93424] hover:bg-gray-100 h-11 font-medium transition-colors duration-200"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue'}
              </Button>
            </div>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              {/* Chat Messages - hidden when calendar is shown */}
              {!showCalendar && (
        <ScrollArea className={`flex-1 overflow-hidden ${showCalendar ? 'p-4 pr-6' : 'p-3 pr-5'}`} ref={scrollRef}>
          <div className={`${showCalendar ? 'space-y-4' : 'space-y-3'}`}>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex flex-col w-full ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        {/* Shared width wrapper for message bubble and citations */}
                        <div className={`flex flex-col min-w-0 ${showCalendar ? 'max-w-[80%]' : 'max-w-[85%]'} w-full space-y-2`}>
                          <div
                            className={`rounded-lg p-2.5 w-full ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm whitespace-normal break-words">{message.content}</p>
                          </div>

                          {/* Citations */}
                          {message.role === 'assistant' && message.citations && message.citations.length > 0 && (
                            <div className="w-full min-w-0">
                              <div className="text-xs font-medium text-muted-foreground mb-2 break-words">
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
                                <Card className={`${showCalendar ? 'p-3' : 'p-2.5'} bg-background border overflow-hidden shadow-sm`}>
                                  <div className="flex items-start gap-2 min-w-0 overflow-hidden">
                                    <img 
                                      src={faviconUrl} 
                                      alt="Value Build Homes" 
                                      className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5"
                                    />
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-center gap-1 min-w-0 group"
                                      >
                                        <h4 className={`${showCalendar ? 'text-base' : 'text-sm'} font-medium truncate flex-1 min-w-0`}>
                                          {citation.title || 'Reference'}
                                        </h4>
                                        <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </a>
                                      {citation.description && (
                                        <p className={`${showCalendar ? 'text-sm' : 'text-xs'} text-muted-foreground mt-0.5 line-clamp-2`}>
                                          {citation.description}
                                        </p>
                                      )}
                                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                        {url}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {totalCitations > 1 && (
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t">
                                      <span className="text-[11px] text-muted-foreground font-medium">
                                        {currentIndex + 1} of {totalCitations}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setExpandedCitations(prev => ({
                                            ...prev,
                                            [message.id]: Math.max(0, currentIndex - 1)
                                          }))}
                                          disabled={currentIndex === 0}
                                          className="h-5 w-5 p-0 transition-all duration-200"
                                        >
                                          <ChevronLeft className="h-2.5 w-2.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setExpandedCitations(prev => ({
                                            ...prev,
                                            [message.id]: Math.min(totalCitations - 1, currentIndex + 1)
                                          }))}
                                          disabled={currentIndex === totalCitations - 1}
                                          className="h-5 w-5 p-0 transition-all duration-200"
                                        >
                                          <ChevronRight className="h-2.5 w-2.5" />
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
                      </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isLoading && <TypingIndicator />}
                  </div>
                </ScrollArea>
              )}
            </>
          )}

          {/* Calendar View - standalone when active */}
          {showCalendar && selectedTerritory && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div 
                id={`cal-inline-${selectedTerritory}`}
                className="flex-1 w-full overflow-auto"
              >
              </div>
            </div>
          )}


          {/* Action Buttons */}
          {!showLocationInput && !showCalendar && (
        <div className={`${showCalendar ? 'p-4' : 'p-3'} border-t`}>
          <Button
                onClick={handleBookAppointment}
                className="w-full font-medium transition-all duration-200"
                variant="default"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book an Appointment
              </Button>
            </div>
          )}

          {/* Message Input - hidden when calendar or location input is shown */}
          {!showCalendar && !showLocationInput && (
            <div className={`${showCalendar ? 'p-4' : 'p-3'} border-t`}>
              <div className="flex gap-1.5">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about Value Build Homes..."
                  disabled={isLoading}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  size="icon"
                  className="transition-colors duration-200"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </>
  );
};
