import { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { MessageCircle, X, Send, Loader2, Calendar, Phone, ChevronLeft, ChevronRight, ExternalLink, MapPin, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Message, Citation, TERRITORIES } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { CallbackForm } from './CallbackForm';
import { saveChatSession, loadChatSession } from '@/utils/chatStorage';
import { detectTerritory } from '@/utils/territoryDetection';
import TypingIndicator from '@/components/TypingIndicator';
import vbhLogo from '@/assets/logo.png';

const TERRITORY_ADDRESSES: Record<string, string> = {
  oxford: "3015 S Jefferson Davis Hwy, Sanford, NC 27332",
  greenville: "783 East Butler Rd, Suite D, Mauldin, SC 29662",
  smithfield: "721 Seafood House Rd, Selma, NC 27576",
  statesville: "201 Absher Park Rd, Statesville, NC 28625",
  sanford: "3015 S Jefferson Davis Hwy, Sanford, NC 27332",
};

export const ChatWidgetVBH = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [customGptSessionId, setCustomGptSessionId] = useState<string | null>(null);
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, number>>({});
  
  // Calendar/appointment state
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load saved chat session on mount
  useEffect(() => {
    const savedSession = loadChatSession();
    if (savedSession && savedSession.messages.length > 0) {
      setMessages(savedSession.messages);
      setCustomGptSessionId(savedSession.customGptSessionId);
    }
  }, []);

  // Show welcome message when chat opens (if no saved messages)
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: "Hi! I'm SAM, your Value Build Homes assistant. I'm here to help you learn about our homes, answer your questions, and guide you through your home-buying journey. How can I help you today?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatSession(messages, customGptSessionId);
    }
  }, [messages, customGptSessionId]);

  // Smooth scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      const textareaHadFocus = document.activeElement === textareaRef.current;
      
      const scrollElement = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement;
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: "smooth"
        });
        
        if (textareaHadFocus && textareaRef.current) {
          requestAnimationFrame(() => {
            textareaRef.current?.focus();
          });
        }
      }
    }
  }, [messages, isLoading, showTypingIndicator]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [inputMessage]);

  // Delay showing typing indicator by 1 second
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isLoading) {
      timeoutId = setTimeout(() => {
        setShowTypingIndicator(true);
      }, 1000);
    } else {
      setShowTypingIndicator(false);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  // Lock chat window width into CSS variable for stable citation sizing
  useEffect(() => {
    if (!chatRef.current) return;
    const setWidthVar = () => {
      const w = chatRef.current!.clientWidth;
      chatRef.current!.style.setProperty("--chat-width", `${w}px`);
    };
    setWidthVar();
    const ro = new ResizeObserver(setWidthVar);
    ro.observe(chatRef.current);
    return () => ro.disconnect();
  }, []);

  // Cal.com integration effect
  useEffect(() => {
    if (!showCalendar || !selectedTerritory) return;
    setCalendarLoading(true);
    const territory = Object.values(TERRITORIES).find(t => t.calNamespace === selectedTerritory);
    if (!territory) return;
    const w = window as any;

    // Detect if we're in Shadow DOM or regular DOM
    const rootElement = document.querySelector('#cal-inline-' + selectedTerritory);
    const rootNode = rootElement?.getRootNode() as ShadowRoot | Document;
    const isShadowDOM = rootNode && 'host' in rootNode;

    // Get the appropriate document head (Shadow DOM or regular document)
    const targetHead = isShadowDOM ? rootNode as ShadowRoot : document.head;
    const queryRoot = isShadowDOM ? rootNode as ShadowRoot : document;

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
    if (!queryRoot.querySelector('link[href="https://app.cal.com/embed/embed.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://app.cal.com/embed/embed.css";
      if (isShadowDOM) {
        (targetHead as ShadowRoot).appendChild(link);
      } else {
        document.head.appendChild(link);
      }
    }

    // Function to initialize Cal.com after both script and container are ready
    const initCal = () => {
      const container = calendarRef.current;
      if (!container) {
        return;
      }

      // Clear any previous inline render
      container.innerHTML = "";

      // Queue init with namespace
      w.Cal("init", territory.calNamespace, {
        origin: "https://app.cal.com"
      });

      // Configure UI settings
      w.Cal("ui", {
        hideEventTypeDetails: true,
        layout: "month_view",
        styles: {
          branding: {
            brandColor: "#E2362B"
          }
        }
      });

      // Pass the actual DOM element instead of selector
      w.Cal("inline", {
        namespace: territory.calNamespace,
        elementOrSelector: container,
        calLink: territory.calLink,
        config: {
          theme: "light"
        }
      });
      setCalendarLoading(false);
    };

    // Ensure Cal embed JS - always in main document head as it needs window access
    const existingScript = document.querySelector('script[src="https://app.cal.com/embed/embed.js"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://app.cal.com/embed/embed.js";
      script.async = true;
      script.onload = () => {
        // Wait for container to be rendered before initializing
        if (calendarRef.current) {
          initCal();
        }
      };
      script.onerror = () => {
        setCalendarError("Failed to load calendar");
        setCalendarLoading(false);
      };
      document.head.appendChild(script);
    } else {
      // Script already exists, check if it's loaded
      if (w.Cal && typeof w.Cal === 'function' && w.Cal.ns) {
        // Wait for container to be rendered before initializing
        if (calendarRef.current) {
          initCal();
        }
      } else {
        // Script exists but not loaded yet, wait for it
        existingScript.addEventListener('load', () => {
          if (calendarRef.current) {
            initCal();
          }
        });
      }
    }
  }, [showCalendar, selectedTerritory]);

  // Initialize calendar when container ref becomes available
  useEffect(() => {
    if (showCalendar && selectedTerritory && calendarRef.current) {
      const w = window as any;
      if (w.Cal && typeof w.Cal === 'function' && w.Cal.ns) {
        const territory = TERRITORIES[selectedTerritory];
        if (!territory) return;

        // Clear and initialize
        calendarRef.current.innerHTML = "";
        w.Cal("init", territory.calNamespace, {
          origin: "https://app.cal.com"
        });
        w.Cal("ui", {
          hideEventTypeDetails: true,
          layout: "month_view",
          styles: {
            branding: {
              brandColor: "#E2362B"
            }
          }
        });
        w.Cal("inline", {
          namespace: territory.calNamespace,
          elementOrSelector: calendarRef.current,
          calLink: territory.calLink,
          config: {
            theme: "light"
          }
        });
        setCalendarLoading(false);
      }
    }
  }, [calendarRef.current, showCalendar, selectedTerritory]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };
    
    // Bundle ALL state updates (including isLoading) in a single flushSync
    flushSync(() => {
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsLoading(true);
    });
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    
    // Immediately restore focus after synchronous state updates
    if (textareaRef.current) {
      textareaRef.current.focus();
    }

    // Check if message contains location information for scheduling
    const territory = detectTerritory(inputMessage);
    if (territory && (inputMessage.toLowerCase().includes("appointment") || inputMessage.toLowerCase().includes("schedule") || inputMessage.toLowerCase().includes("meet"))) {
      setSelectedTerritory(territory.calNamespace);
      setShowCalendar(true);
      const territoryMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Great! I've found that ${territory.name} territory serves your area. This territory offers ${territory.appointmentType} appointments. I'll show you the calendar below where you can select a time that works for you.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, territoryMessage]);
      setIsLoading(false);
      return;
    }

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('chat-with-sam', {
        body: {
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          sessionId: customGptSessionId
        }
      });

      if (functionError) throw functionError;

      if (!customGptSessionId && functionData.sessionId) {
        setCustomGptSessionId(functionData.sessionId);
      }

      // Check if the response triggers appointment scheduling
      if (functionData.message.toLowerCase().includes("schedule_appointment")) {
        setShowLocationInput(true);
      } else {
        // Check if AI doesn't know the answer and should trigger callback form
        const rawMsg = functionData.message ?? "";
        const normalizedMsg = rawMsg.replace(/\u2019/g, "'").trim();
        const isUnknown = normalizedMsg === "I don't know the answer to that just yet. Please reach out to support for further help." || rawMsg.toLowerCase().includes("reach out to support for further help");
        
        if (isUnknown) {
          setShowCallbackForm(true);
        } else {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: functionData.message,
            timestamp: new Date(),
            citations: functionData.citations as Citation[]
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      // Restore focus after response is complete
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleScheduleAppointment = () => {
    setShowLocationInput(true);
  };

  const handleLocationSubmit = async () => {
    if (!locationInput.trim()) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("detect-territory", {
        body: {
          location: locationInput
        }
      });
      if (error) throw error;
      if (data.success) {
        const { territoryKey } = data;

        // Map territory keys to Cal.com namespaces
        const territoryData = TERRITORIES[territoryKey as keyof typeof TERRITORIES];
        if (territoryData) {
          setSelectedTerritory(territoryData.calNamespace);
          setShowCalendar(true);
          setShowLocationInput(false);
          setLocationInput("");
        }
      } else {
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "I'm sorry, but we don't currently build in that area. Value Build Homes currently serves counties in North Carolina and South Carolina. We're expanding! Please check back or contact us for updates.",
          timestamp: new Date(),
          action: {
            label: "Change Location",
            onClick: () => {
              setLocationInput("");
              setShowLocationInput(true);
            }
          }
        };
        setMessages(prev => [...prev, errorMessage]);
        setLocationInput("");
        setShowLocationInput(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error processing your location. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallbackRequest = () => {
    setShowCallbackForm(true);
  };

  return (
    <>
      {/* Chat Button */}
      <div className={`fixed z-50 transition-all duration-300 ${
        isOpen && isMobile 
          ? 'top-4 right-4' 
          : 'bottom-6 right-6'
      }`}>
        <Button 
          onClick={() => setIsOpen(!isOpen)} 
          className="h-20 w-20 rounded-full bg-primary text-primary-foreground hover:shadow-2xl hover:scale-110 transition-all duration-300 p-0 border-4 border-white/20 flex items-center justify-center" 
          size="icon"
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isOpen ? (
              <X className="chat-icon-large" />
            ) : (
              <MessageCircle fill="currentColor" strokeWidth={1.5} className="chat-icon-large" />
            )}
          </span>
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <Card 
          ref={chatRef} 
          className={`fixed flex flex-col z-50 overflow-visible transition-all duration-300 ${
            isMobile 
              ? 'inset-0 w-full h-full rounded-none' 
              : showCallbackForm 
                ? 'bottom-[112px] right-6 w-[480px] h-[690px] rounded-2xl'
                : showCalendar
                  ? 'bottom-[112px] right-6 w-[500px] h-[828px] rounded-2xl'
                  : 'bottom-[112px] right-6 w-[400px] h-[690px] rounded-2xl'
          }`}
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          data-mobile-fullscreen={isMobile ? "true" : "false"}
        >
          {/* Header - hidden when calendar, location input, or callback form is shown */}
          <div className={`${showCalendar || showCallbackForm || showLocationInput ? "hidden" : ""} flex items-center justify-between p-4 border-b border-border/30 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground transition-all duration-300 rounded-t-2xl`}>
            <div className="flex items-center gap-2">
              <div className="relative">
                <img src={vbhLogo} alt="Value Build Homes" className="h-10 w-10 rounded-full bg-white p-0.5" />
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-primary"></div>
              </div>
              <div>
                <h3 className="text-base font-semibold">SAM</h3>
                <p className="text-xs opacity-90 font-medium">Digital Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setIsOpen(false);
                  setShowCalendar(false);
                  setShowLocationInput(false);
                  setShowCallbackForm(false);
                }} 
                className="h-8 w-8 text-primary-foreground hover:bg-white/30 transition-colors duration-200" 
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Header */}
          {showCalendar && selectedTerritory && (
            <div className="border-b bg-muted p-4">
              {(() => {
                const territory = Object.values(TERRITORIES).find(t => t.calNamespace === selectedTerritory);
                if (!territory) return null;
                const territoryKey = Object.keys(TERRITORIES).find(key => TERRITORIES[key as keyof typeof TERRITORIES].calNamespace === selectedTerritory);
                const isInPerson = territory.appointmentType === "in-person";
                const address = territoryKey ? TERRITORY_ADDRESSES[territoryKey] : null;
                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isInPerson ? <MapPin className="h-4 w-4 text-primary" /> : <Video className="h-4 w-4 text-blue-500" />}
                        <span className="font-semibold text-xs">
                          {isInPerson ? "In-Person Appointment" : "Virtual Appointment"}
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
                      <p className="text-xs text-muted-foreground">Design Studio Location: {address}</p>
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
            <div className="flex-1 flex flex-col items-center justify-center bg-[#E93424] p-8 animate-fade-in relative rounded-t-2xl">
              {/* Back Button */}
              <Button 
                variant="ghost" 
                className="absolute top-3 left-3 text-white hover:bg-white/10 font-medium transition-all duration-200" 
                onClick={() => setShowLocationInput(false)}
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
              </Button>

              {/* Close Button */}
              <Button 
                variant="ghost" 
                size="icon"
                className="absolute top-3 right-3 text-white hover:bg-white/10 transition-all duration-200" 
                onClick={() => {
                  setIsOpen(false);
                  setShowLocationInput(false);
                }}
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Centered Content */}
              <div className="w-full max-w-md space-y-6">
                {/* Logo */}
                <div className="flex justify-center">
                  <img src={vbhLogo} alt="Value Build Homes" className="h-20 w-20 rounded-full bg-white p-1" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-white text-center">Schedule an Appointment</h2>

                {/* Input Form */}
                <div className="space-y-3">
                  <Input 
                    value={locationInput} 
                    onChange={e => setLocationInput(e.target.value)} 
                    onKeyPress={e => e.key === "Enter" && locationInput.length >= 3 && handleLocationSubmit()} 
                    placeholder="What county will you build in?" 
                    disabled={isLoading} 
                    className="bg-white text-black border-none placeholder:text-gray-500 h-11 text-[16px] text-center placeholder:text-center" 
                  />
                  {locationInput.length >= 3 && (
                    <Button 
                      onClick={handleLocationSubmit} 
                      disabled={isLoading} 
                      className="w-full bg-white text-[#E93424] hover:bg-gray-100 h-11 font-medium transition-colors duration-200 animate-fade-in"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Messages - hidden when calendar or callback form is shown */}
              {!showCalendar && !showCallbackForm && (
                <ScrollArea className="flex-1 overflow-hidden overflow-x-hidden pl-2 pr-2 pb-3 md:pl-3 md:pr-5 md:pb-3" ref={scrollRef}>
                  <div className="max-w-full space-y-3">
                    {messages.map(message => (
                      <div 
                        key={message.id} 
                        className={`flex w-full max-w-full min-w-0 overflow-hidden pt-2 ${
                          message.role === "user" ? "justify-end" : "justify-start gap-2"
                        } group`}
                      >
                        {message.role === "assistant" && (
                          <img 
                            src={vbhLogo} 
                            alt="SAM" 
                            className={`h-8 w-8 rounded-full bg-white p-0.5 flex-shrink-0 mt-1 transition-opacity ${isLoading ? "animate-pulse" : ""}`} 
                          />
                        )}
                        <div className="flex flex-col max-w-full min-w-0 overflow-hidden">
                          <div className={`rounded-lg p-2.5 min-w-0 max-w-[85vw] md:max-w-[312px] ${
                            message.role === "user" 
                              ? "inline-block bg-primary text-primary-foreground shadow-sm hover:shadow-md" 
                              : "inline-block bg-muted shadow-sm hover:shadow-md"
                          } transition-all duration-200`}>
                            <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere leading-relaxed">
                              {message.content}
                            </p>

                            {/* Action Button */}
                            {message.action && (
                              <Button 
                                onClick={message.action.onClick} 
                                variant="outline" 
                                size="sm" 
                                className="mt-3 w-full transition-all hover:scale-105"
                              >
                                <span className="truncate">{message.action.label}</span>
                              </Button>
                            )}
                          </div>

                          {/* Citations */}
                          {message.role === "assistant" && message.citations && message.citations.length > 0 && (
                            <div className="mt-2 min-w-0 overflow-hidden max-w-[85vw] md:max-w-[312px] inline-block">
                              <div className="text-xs font-medium text-muted-foreground mb-2 truncate">
                                Here's how I found this answer
                              </div>
                              {(() => {
                                const currentIndex = expandedCitations[message.id] || 0;
                                const citation = message.citations![currentIndex];
                                const totalCitations = message.citations!.length;
                                const url = citation.url;

                                return (
                                  <Card className="w-full max-w-full p-2.5 bg-background border shadow-sm overflow-hidden">
                                    <div className="flex items-start gap-2 overflow-hidden min-w-0">
                                      <div className="flex-1 min-w-0 overflow-hidden">
                                        <a 
                                          href={url} 
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          className="text-primary hover:underline flex items-center gap-1 group overflow-hidden text-ellipsis min-w-0 shrink"
                                        >
                                          <h4 className="text-sm font-medium line-clamp-1 min-w-0 flex-1">
                                            {citation.title || "Reference"}
                                          </h4>
                                          <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                        {citation.description ? (
                                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 break-words overflow-wrap-anywhere overflow-hidden min-h-[2.6em]">
                                            {citation.description}
                                          </p>
                                        ) : (
                                          <p className="text-xs text-muted-foreground mt-0.5 opacity-0 pointer-events-none min-h-[2.6em]" aria-hidden="true">
                                            placeholder
                                          </p>
                                        )}
                                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate overflow-hidden break-all">
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

                    {/* Typing indicator */}
                    {showTypingIndicator && <TypingIndicator />}
                  </div>
                </ScrollArea>
              )}
            </>
          )}

          {/* Calendar View - standalone when active */}
          {showCalendar && selectedTerritory && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {calendarLoading && (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {calendarError && (
                <div className="flex-1 flex items-center justify-center text-destructive">
                  {calendarError}
                </div>
              )}
              <div ref={calendarRef} id={`cal-inline-${selectedTerritory}`} className="flex-1 w-full overflow-auto"></div>
            </div>
          )}

          {/* Callback Form */}
          {showCallbackForm && <CallbackForm onClose={() => setShowCallbackForm(false)} />}

          {/* Input Area - hidden when calendar, location input, or callback form is shown */}
          {!showCallbackForm && !showLocationInput && !showCalendar && (
            <div className="border-t border-border/30 bg-background/80 backdrop-blur-sm rounded-b-2xl">
              {/* Schedule Appointment Button - Full Width Red */}
              <div className="p-3 pb-2 bg-gradient-to-b from-transparent to-background/50">
                <Button 
                  onClick={handleScheduleAppointment}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Schedule Appointment
                </Button>
              </div>

              {/* Message Input */}
              <div className="p-3 pt-2">
                <div className="flex items-end gap-2">
                  <Textarea 
                    ref={textareaRef}
                    placeholder="Type your message..." 
                    value={inputMessage} 
                    onChange={(e) => setInputMessage(e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }} 
                    className="flex-1 min-h-[44px] max-h-[120px] resize-none text-sm rounded-xl border-border/50 focus:border-primary/50 transition-colors duration-200"
                    rows={1}
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!inputMessage.trim() || isLoading} 
                    size="icon" 
                    className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 transition-all duration-200 flex-shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                {/* Secondary Request Callback Link */}
                <button 
                  onClick={handleCallbackRequest}
                  className="w-full mt-2 text-xs text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center justify-center gap-1"
                >
                  <Phone className="h-3 w-3" />
                  Or request a callback
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </>
  );
};
