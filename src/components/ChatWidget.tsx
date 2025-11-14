import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Calendar, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Message, TERRITORIES } from '@/types/chat';
import { detectTerritory } from '@/utils/territoryDetection';
import { useToast } from '@/hooks/use-toast';

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
    
    // Queue inline render using the namespace
    w.Cal('inline', {
      namespace: territory.calNamespace,
      elementOrSelector: `#${containerId}`,
      calLink: territory.calLink,
      config: { layout: 'month_view', theme: 'light', hideEventTypeDetails: true }
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
        <Card className={`fixed bottom-6 left-6 flex flex-col shadow-2xl z-50 transition-all ${showCalendar ? 'w-[720px] h-[1210px]' : 'w-[400px] h-[600px]'}`}>
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

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
                </div>
              ))}
              {isLoading && (
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

          {/* Location Input or Action Buttons */}
          {showLocationInput ? (
            <div className="p-4 border-t">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Where do you plan to build?
              </label>
              <div className="flex gap-2">
                <Input
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLocationSubmit()}
                  placeholder="Enter county or city (e.g., Greenville, SC)"
                  className="flex-1"
                />
                <Button
                  onClick={handleLocationSubmit}
                  className="bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Detecting...' : 'Submit'}
                </Button>
              </div>
            </div>
          ) : !showCalendar && messages.length === 1 && (
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
