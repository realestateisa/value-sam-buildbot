import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Video,
  X,
} from "lucide-react";

import { CallbackForm } from "@/components/CallbackForm";
import TypingIndicator from "@/components/TypingIndicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logoImport from "@/assets/logo.png";
import { Message, TERRITORIES } from "@/types/chat";
import { loadChatSession, saveChatSession, clearChatSession } from "@/utils/chatStorage";
import { detectTerritory } from "@/utils/territoryDetection";

// Fallback VBH logo as base64 - guarantees logo works on any client embed
const VBH_LOGO_FALLBACK = "data:image/png;base64,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+7e39fx9P+1e/8uh+P+/9u53b/H4fT/t3e/Xq7D+f9z+3q/34bh9P+9c/vt+HE4/f/u3e/X8XD6/7t7v17O6///3O793+1wOP7/7t2d6zj8+9+97t/jdPz/3L39dzgc/v/t3a3L+f9/+/q+7Yft///u3d2/u+P//+7d/T4P2///d6/v8zqc/r93r/9/l+P/5+7d2//X4bD1/+/e37v/D8PhffZu3+tw+v/bvb5f58P//9u9v9/H0/H//+7d/bsd1///u9f36zgc/3/27u/LMBz//+3c3ev7vQ7D+P+/e3dfx+P/15797+t5GP7/79z+vxyHw3/P3bv/+3Ycx+//+7e7t+9/Op7//+3e/bteh/H/f/v2/3E8/H/dud1fx/Hw/3fPfr3uh+H/+87t9/N6HP7/7d7+O06H/7+79+f7cDz+/+ze79vpfPz/3r1/z+P6/3/37u51ux6H/7+79+flcDz+/+7d79dh/P+2c/t/Hc7/P7u3+2s/nP9/dm7f3+PheP7/27u/z9Pp+P+7e7+e1+H8/7N7+/4dD+f/n53b9+d+OP/+2bl9P8+H4/+vnbv/t9N6+P+xc/v+uQ/D8f9r5/b8Px/O/z93bt+/y2H7/7Fz+/26Daf/v93b/79ch+P/3+7d//flMPz/27m9/8/D8P9/5/b8vJ2G0/+/3dv3/3YYxv+/O7f34+l4/P+xc7v/7Yfj/7+d2/vnOh7+/+3c3t/n8XD+/7t7+/4eh+P/z87t/ns5nI7/H7u37+/xdPz/273//7kO4///ndv1eh3O/393b++/y/Hw/3fn9vy7DMf/nzu36+U4nP8/dm/f/8th/P+/c3v/n87D6f9/93Y9Lof//zu368P7Mv7/37n9/12Gw/+fndu/x+Xw/3/n9u/zcjoe/393bs+/0+H/z+7t/XU9HP//dm7P7+N6+P+5e/v/HIfx/9/O7f17PB7//+3c/n3Oh///u7f/7+Pxv+/O7d/nchj/f+7c3r/n4XD+/7l7e/8ch/H/f+f2/bwdz///u7f773Ec/v/v3J7/58PG/+/27f19Hg7//3du79/jcfj/v3N7/l7u/P/fvX3/z4fh/P+ze7t/3s/D9v9z5/b8vZ3O/z+7t/f3+Tgc//937+b3chz+/+3evsflMP7/7tyef5fj6X8=";

// Use imported logo if it's valid base64, otherwise use fallback
const logo =
  typeof logoImport === "string" && logoImport.startsWith("data:image")
    ? logoImport
    : VBH_LOGO_FALLBACK;

const TERRITORY_ADDRESSES: Record<string, string> = {
  oxford: "3015 S Jefferson Davis Hwy, Sanford, NC 27332",
  greenville: "783 East Butler Rd, Suite D, Mauldin, SC 29662",
  smithfield: "721 Seafood House Rd, Selma, NC 27576",
  statesville: "201 Absher Park Rd, Statesville, NC 28625",
  sanford: "3015 S Jefferson Davis Hwy, Sanford, NC 27332",
};
  oxford: "3015 S Jefferson Davis Hwy, Sanford, NC 27332",
  greenville: "783 East Butler Rd, Suite D, Mauldin, SC 29662",
  smithfield: "721 Seafood House Rd, Selma, NC 27576",
  statesville: "201 Absher Park Rd, Statesville, NC 28625",
  sanford: "3015 S Jefferson Davis Hwy, Sanford, NC 27332"
};
export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, number>>({});
  const [customGptSessionId, setCustomGptSessionId] = useState<string | null>(null);
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const {
    toast
  } = useToast();

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
        id: "1",
        role: "assistant",
        content: "Hey there👋🏻! I'm Sam, what can I answer for you?",
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
  }, [inputValue]);

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

  // Shadow DOM widget - no iframe postMessage needed
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date()
    };
    
    // Bundle ALL state updates (including isLoading) in a single flushSync
    flushSync(() => {
      setMessages(prev => [...prev, userMessage]);
      setInputValue("");
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

    // Check if message contains location information
    const territory = detectTerritory(inputValue);
    if (territory && (inputValue.toLowerCase().includes("appointment") || inputValue.toLowerCase().includes("schedule") || inputValue.toLowerCase().includes("meet"))) {
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
      const {
        data,
        error
      } = await supabase.functions.invoke("chat-with-sam", {
        body: {
          messages: messages.concat(userMessage).map(m => ({
            role: m.role,
            content: m.content
          })),
          sessionId: customGptSessionId
        }
      });
      if (error) throw error;

      // Store the session ID if this is the first message
      if (data.sessionId && !customGptSessionId) {
        setCustomGptSessionId(data.sessionId);
      }

      // Check if the response triggers appointment scheduling
      if (data.message.toLowerCase().includes("schedule_appointment")) {
        setShowLocationInput(true);
      } else {
        const rawMsg = data.message ?? "";
        const normalizedMsg = rawMsg.replace(/\u2019/g, "'").trim(); // normalize curly apostrophes
        const isUnknown = normalizedMsg === "I don't know the answer to that just yet. Please reach out to support for further help." || rawMsg.toLowerCase().includes("reach out to support for further help");
        if (isUnknown) {
          setShowCallbackForm(true);
        } else {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.message,
            timestamp: new Date(),
            citations: data.citations || []
          };
          setMessages(prev => [...prev, assistantMessage]);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      // Restore focus after response is complete
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };
  const handleBookAppointment = () => {
    setShowLocationInput(true);
  };
  const handleLocationSubmit = async () => {
    if (!locationInput.trim()) return;
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("detect-territory", {
        body: {
          location: locationInput
        }
      });
      if (error) throw error;
      if (data.success) {
        const {
          territoryKey,
          territory
        } = data;

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
            brandColor: "#000000"
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
              brandColor: "#000000"
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
  const content = <>
      {/* Chat Button */}
      <div className={`fixed z-50 transition-all duration-300 ${
        isOpen && isMobile 
          ? 'top-4 right-4' 
          : 'bottom-6 right-6'
      }`}>
        {/* Speech Bubble */}
        {!isOpen && <div className="absolute bottom-full right-0 mb-2 animate-fade-in z-[60]">
            
          </div>}
        
        <Button 
          onClick={() => setIsOpen(!isOpen)} 
          className="h-20 w-20 rounded-full bg-primary text-primary-foreground button-lift hover:shadow-2xl hover:scale-110 transition-all duration-300 p-2" 
          size="icon"
        >
          {isOpen ? <X className="h-8 w-8" /> : <img src={logo} alt="Value Build Homes" className="h-full w-full rounded-full" />}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && <Card 
          ref={chatRef} 
          className={`fixed flex flex-col glass-morphism z-50 overflow-visible transition-all duration-300 ${
            isMobile 
              ? 'inset-0 w-full h-full rounded-none' 
              : `bottom-[112px] right-6 w-[400px] h-[690px] rounded-2xl ${showCalendar ? '!w-[500px] !h-[828px]' : ''}`
          }`}
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* Header */}
          <div className={`${showCalendar || showCallbackForm ? "hidden" : ""} flex items-center justify-between p-4 border-b border-border/30 ${showLocationInput && !showCalendar ? "bg-[#E93424]" : "bg-gradient-to-r from-primary to-primary/90"} text-primary-foreground transition-all duration-300 rounded-t-2xl`}>
            {!showLocationInput && <div className="flex items-center gap-2">
                <div className="relative">
                  <img src={logo} alt="Value Build Homes" className="h-10 w-10 rounded-full bg-white p-0.5" />
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-primary"></div>
                </div>
                <div>
                  <h3 className="text-base font-semibold">Sam</h3>
                  <p className="text-xs opacity-90 font-medium">Digital Assistant</p>
                </div>
              </div>}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => {
            setIsOpen(false);
            setShowCalendar(false);
            setShowLocationInput(false);
            setShowCallbackForm(false);
          }} className="h-8 w-8 text-primary-foreground hover:bg-white/30 transition-colors duration-200" aria-label="Close chat">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Header */}
          {showCalendar && selectedTerritory && <div className="border-b bg-muted p-4">
              {(() => {
          const territory = Object.values(TERRITORIES).find(t => t.calNamespace === selectedTerritory);
          if (!territory) return null;
          const territoryKey = Object.keys(TERRITORIES).find(key => TERRITORIES[key as keyof typeof TERRITORIES].calNamespace === selectedTerritory);
          const isInPerson = territory.appointmentType === "in-person";
          const address = territoryKey ? TERRITORY_ADDRESSES[territoryKey] : null;
          return <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isInPerson ? <MapPin className="h-4 w-4 text-primary" /> : <Video className="h-4 w-4 text-blue-500" />}
                        <span className="font-semibold text-xs">
                          {isInPerson ? "In-Person Appointment" : "Virtual Appointment"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => {
                  setShowCalendar(false);
                  setSelectedTerritory(null);
                  setShowLocationInput(true);
                }} className="h-6 px-2 text-[11px] transition-all duration-200">
                          Change Location
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                  setShowCalendar(false);
                  setSelectedTerritory(null);
                  setShowLocationInput(false);
                }} className="h-6 w-6 transition-all duration-200">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {isInPerson && address ? <p className="text-xs text-muted-foreground">Design Studio Location: {address}</p> : <p className="text-xs text-muted-foreground">
                        A virtual meeting link will be provided after booking.
                      </p>}
                  </div>;
        })()}
            </div>}

          {/* Red Overlay Appointment Form */}
          {showLocationInput && !showCalendar ? <div className="flex-1 flex flex-col items-center justify-center bg-[#E93424] p-8 animate-fade-in relative">
              {/* Back Button */}
              <Button variant="ghost" className="absolute top-3 left-3 text-white hover:bg-white/10 font-medium transition-all duration-200" onClick={() => setShowLocationInput(false)}>
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
              </Button>

              {/* Centered Content */}
              <div className="w-full max-w-md space-y-6">
                {/* Logo */}
                <div className="flex justify-center">
                  <img src={logo} alt="Value Build Homes" className="h-20 w-20 rounded-full bg-white p-1" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-white text-center">Schedule an Appointment</h2>

                {/* Input Form */}
                <div className="space-y-3">
                  <Input value={locationInput} onChange={e => setLocationInput(e.target.value)} onKeyPress={e => e.key === "Enter" && locationInput.length >= 3 && handleLocationSubmit()} placeholder="What county will you build in?" disabled={isLoading} className="bg-white text-black border-none placeholder:text-gray-500 h-11 text-[16px] text-center placeholder:text-center" />
                  {locationInput.length >= 3 && <Button onClick={handleLocationSubmit} disabled={isLoading} className="w-full bg-white text-[#E93424] hover:bg-gray-100 h-11 font-medium transition-colors duration-200 animate-fade-in">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
                    </Button>}
                </div>
              </div>
            </div> : <>
              {/* Messages */}
              {/* Chat Messages - hidden when calendar or callback form is shown */}
              {!showCalendar && !showCallbackForm && <ScrollArea className={`flex-1 overflow-hidden overflow-x-hidden ${showCalendar ? "p-4 pr-6" : "pl-2 pr-2 pb-3 md:pl-3 md:pr-5 md:pb-3"}`} ref={scrollRef}>
                  <div className={`max-w-full ${showCalendar ? "space-y-4" : "space-y-3"}`}>
                    {messages.map(message => <div key={message.id} className={`flex w-full max-w-full min-w-0 overflow-hidden pt-2 ${message.role === "user" ? "justify-end" : "justify-start gap-2"} group`}>
                        {message.role === "assistant" && <img src={logo} alt="Sam" className={`h-8 w-8 rounded-full bg-white p-0.5 flex-shrink-0 mt-1 transition-opacity ${isLoading ? "animate-pulse" : ""}`} />}
                        <div className="flex flex-col max-w-full min-w-0 overflow-hidden">
                          <div className={`rounded-lg p-2.5 min-w-0 max-w-[85vw] md:max-w-[312px] ${message.role === "user" ? "inline-block" : "inline-block"} ${message.role === "user" ? "bg-primary text-primary-foreground shadow-sm hover:shadow-md" : "bg-muted shadow-sm hover:shadow-md"} ${message.role === "assistant" ? "" : ""} transition-all duration-200`}>
                            <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere leading-relaxed">
                              {message.content}
                            </p>

                            {/* Action Button */}
                            {message.action && <Button onClick={message.action.onClick} variant="outline" size="sm" className="mt-3 w-full transition-all hover:scale-105" aria-label={message.action.label}>
                                <span className="truncate">{message.action.label}</span>
                              </Button>}
                          </div>

                          {/* Citations */}
                          {message.role === "assistant" && message.citations && message.citations.length > 0 && <div className="mt-2 min-w-0 overflow-hidden max-w-[85vw] md:max-w-[312px] inline-block">
                              <div className="text-xs font-medium text-muted-foreground mb-2 truncate">
                                Here's how I found this answer
                              </div>
                              {(() => {
                    const currentIndex = expandedCitations[message.id] || 0;
                    const citation = message.citations![currentIndex];
                    const totalCitations = message.citations!.length;
                    const url = citation.url;

                    // Always use Value Build Homes favicon since citations are from their website
                    const faviconUrl = "https://www.google.com/s2/favicons?domain=valuebuildhomes.com&sz=32";
                    return <Card className={`w-full max-w-full ${showCalendar ? "p-3" : "p-2.5"} bg-background border shadow-sm overflow-hidden`}>
                                    <div className="flex items-start gap-2 overflow-hidden min-w-0">
                                      <div className="flex-1 min-w-0 overflow-hidden">
                                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 group overflow-hidden text-ellipsis min-w-0 shrink">
                                          <h4 className={`${showCalendar ? "text-base" : "text-sm"} font-medium line-clamp-1 min-w-0 flex-1`}>
                                            {citation.title || "Reference"}
                                          </h4>
                                          <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                        {citation.description ? <p className={`${showCalendar ? "text-sm" : "text-xs"} text-muted-foreground mt-0.5 line-clamp-2 break-words overflow-wrap-anywhere overflow-hidden min-h-[2.6em]`}>
                                            {citation.description}
                                          </p> : <p className={`${showCalendar ? "text-sm" : "text-xs"} text-muted-foreground mt-0.5 opacity-0 pointer-events-none min-h-[2.6em]`} aria-hidden="true">
                                            placeholder
                                          </p>}
                                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate overflow-hidden break-all">
                                          {url}
                                        </p>
                                      </div>
                                    </div>

                                    {totalCitations > 1 && <div className="flex items-center justify-between mt-2 pt-2 border-t">
                                        <span className="text-[11px] text-muted-foreground font-medium">
                                          {currentIndex + 1} of {totalCitations}
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <Button variant="ghost" size="icon" onClick={() => setExpandedCitations(prev => ({
                            ...prev,
                            [message.id]: Math.max(0, currentIndex - 1)
                          }))} disabled={currentIndex === 0} className="h-5 w-5 p-0 transition-all duration-200">
                                            <ChevronLeft className="h-2.5 w-2.5" />
                                          </Button>
                                          <Button variant="ghost" size="icon" onClick={() => setExpandedCitations(prev => ({
                            ...prev,
                            [message.id]: Math.min(totalCitations - 1, currentIndex + 1)
                          }))} disabled={currentIndex === totalCitations - 1} className="h-5 w-5 p-0 transition-all duration-200">
                                            <ChevronRight className="h-2.5 w-2.5" />
                                          </Button>
                                        </div>
                                      </div>}
                                  </Card>;
                  })()}
                            </div>}
                        </div>
                      </div>)}

                    {/* Typing Indicator */}
                    {showTypingIndicator && <TypingIndicator />}
                  </div>
                </ScrollArea>}
            </>}

          {/* Calendar View - standalone when active */}
          {showCalendar && selectedTerritory && <div className="flex-1 flex flex-col overflow-hidden">
              <div ref={calendarRef} id={`cal-inline-${selectedTerritory}`} className="flex-1 w-full overflow-auto"></div>
            </div>}

          {/* Callback Form View - standalone when active */}
          {showCallbackForm && <CallbackForm onClose={() => setShowCallbackForm(false)} />}

          {/* Action Buttons */}
          {!showLocationInput && !showCalendar && !showCallbackForm && <div className="px-4 pt-3 pb-2 border-t border-border/10 bg-gradient-to-b from-background to-muted/20 w-full">
              <Button 
                onClick={handleBookAppointment} 
                className="group w-full h-12 font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0" 
                aria-label="Book an appointment"
              >
              <Calendar className="h-4 w-4 mr-2 transition-all duration-300 group-hover:scale-110 flex-shrink-0" strokeWidth={2.5} />
                <span className="text-sm font-semibold truncate">Schedule Appointment</span>
              </Button>
            </div>}

          {/* Message Input - hidden when calendar, location input, or callback form is shown */}
          {!showCalendar && !showLocationInput && !showCallbackForm && <div className="px-5 pt-2 pb-5 border-t border-border/20 bg-gradient-to-b from-background via-muted/5 to-muted/10 rounded-b-2xl">
              <div className="relative flex items-center gap-2 p-1 rounded-2xl bg-gradient-to-br from-background to-muted/30 border border-border/40 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300">
                <div className="flex-1 relative group">
                  {!inputValue && (
                    <div className="absolute inset-0 pointer-events-none flex items-center px-4 py-3.5">
                      <span className="text-base bg-[linear-gradient(90deg,hsl(var(--muted-foreground)/0.6)_0%,hsl(var(--muted-foreground)/0.6)_40%,hsl(var(--foreground)/0.95)_50%,hsl(var(--muted-foreground)/0.6)_60%,hsl(var(--muted-foreground)/0.6)_100%)] bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer">
                        Ask me anything..
                      </span>
                    </div>
                  )}
                  <Textarea 
                    ref={textareaRef} 
                    value={inputValue} 
                    onChange={e => setInputValue(e.target.value)} 
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="" 
                    className="min-h-[48px] max-h-[120px] resize-none py-3.5 px-4 text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl transition-all" 
                    rows={1}
                    aria-label="Type your message" 
                  />
                  {inputValue.length > 500 && <span className="absolute bottom-3 right-4 text-[10px] text-muted-foreground font-medium">
                      {inputValue.length}
                    </span>}
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()} 
                  size="icon" 
                  className="h-[43px] w-[43px] rounded-xl bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 transition-all duration-200 flex-shrink-0"
                  aria-label="Send message"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </div>}
        </Card>}
    </>;
  return content;
};