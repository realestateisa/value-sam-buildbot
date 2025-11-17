import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Send,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Video,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Message, TERRITORIES } from "@/types/chat";
import { detectTerritory } from "@/utils/territoryDetection";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import TypingIndicator from "@/components/TypingIndicator";
import { saveChatSession, loadChatSession, clearChatSession } from "@/utils/chatStorage";
import { CallbackForm } from "@/components/CallbackForm";

const TERRITORY_ADDRESSES: Record<string, string> = {
  oxford: "3015 S Jefferson Davis Hwy, Sanford, NC 27332",
  greenville: "783 East Butler Rd, Suite D, Mauldin, SC 29662",
  smithfield: "721 Seafood House Rd, Selma, NC 27576",
  statesville: "201 Absher Park Rd, Statesville, NC 28625",
  sanford: "3015 S Jefferson Davis Hwy, Sanford, NC 27332",
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
  const [isInIframe] = useState(() => window.parent !== window);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Notify parent window with desired iframe size (container size for iframe positioning)
  useEffect(() => {
    if (isInIframe) {
      // Calculate total container size: button (80px) + gap (16px) + chat height
      const buttonHeight = 80;
      const gap = 16;
      const chatHeight = showCalendar ? 828 : 690;
      const chatWidth = showCalendar ? 500 : 400;
      const buttonWidth = 80;
      
      const totalWidth = Math.max(buttonWidth, chatWidth);
      const totalHeight = isOpen ? (chatHeight + gap + buttonHeight) : buttonHeight;

      window.parent.postMessage(
        {
          type: 'chatbot-resize',
          isOpen,
          width: totalWidth,
          height: totalHeight,
        },
        '*'
      );
    }
  }, [isOpen, showCalendar, isInIframe]);

  // Load saved session on mount
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
        timestamp: new Date(),
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
      const scrollElement = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement;
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: "smooth",
        });
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
      console.log("Starting typing indicator timeout");
      timeoutId = setTimeout(() => {
        console.log("Showing typing indicator");
        setShowTypingIndicator(true);
      }, 1000);
    } else {
      console.log("Hiding typing indicator, isLoading:", isLoading);
      setShowTypingIndicator(false);
    }

    return () => {
      if (timeoutId) {
        console.log("Clearing typing indicator timeout");
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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setInputValue("");
    setIsLoading(true);

    // Check if message contains location information
    const territory = detectTerritory(inputValue);
    if (
      territory &&
      (inputValue.toLowerCase().includes("appointment") ||
        inputValue.toLowerCase().includes("schedule") ||
        inputValue.toLowerCase().includes("meet"))
    ) {
      setSelectedTerritory(territory.calNamespace);
      setShowCalendar(true);

      const territoryMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Great! I've found that ${territory.name} territory serves your area. This territory offers ${territory.appointmentType} appointments. I'll show you the calendar below where you can select a time that works for you.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, territoryMessage]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("chat-with-sam", {
        body: {
          messages: messages.concat(userMessage).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          sessionId: customGptSessionId,
        },
      });

      if (error) throw error;

      // Store the session ID if this is the first message
      if (data.sessionId && !customGptSessionId) {
        setCustomGptSessionId(data.sessionId);
        console.log("Stored CustomGPT session_id:", data.sessionId);
      }

      // Check if the response triggers appointment scheduling
      if (data.message.toLowerCase().includes("schedule_appointment")) {
        setShowLocationInput(true);
      } else {
        const rawMsg = data.message ?? "";
        const normalizedMsg = rawMsg.replace(/\u2019/g, "'").trim(); // normalize curly apostrophes
        const isUnknown =
          normalizedMsg === "I don't know the answer to that just yet. Please reach out to support for further help." ||
          rawMsg.toLowerCase().includes("reach out to support for further help");

        if (isUnknown) {
          console.log("Opening callback form due to unknown answer response", { rawMsg, normalizedMsg });
          setShowCallbackForm(true);
        } else {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.message,
            timestamp: new Date(),
            citations: data.citations || [],
          };

          setMessages((prev) => [...prev, assistantMessage]);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
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
      const { data, error } = await supabase.functions.invoke("detect-territory", {
        body: { location: locationInput },
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
          setLocationInput("");
        }
      } else {
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "I'm sorry, but we don't currently build in that area. Value Build Homes currently serves counties in North Carolina and South Carolina. We're expanding! Please check back or contact us for updates.",
          timestamp: new Date(),
          action: {
            label: "Change Location",
            onClick: () => {
              setLocationInput("");
              setShowLocationInput(true);
            },
          },
        };
        setMessages((prev) => [...prev, errorMessage]);
        setLocationInput("");
        setShowLocationInput(false);
      }
    } catch (error) {
      console.error("Error detecting territory:", error);
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
    const territory = Object.values(TERRITORIES).find((t) => t.calNamespace === selectedTerritory);
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
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://app.cal.com/embed/embed.css";
      document.head.appendChild(link);
    }

    // Ensure Cal embed JS
    if (!document.querySelector('script[src="https://app.cal.com/embed/embed.js"]')) {
      const script = document.createElement("script");
      script.src = "https://app.cal.com/embed/embed.js";
      script.async = true;
      document.head.appendChild(script);
    }

    // Clear any previous inline render
    const containerId = `cal-inline-${selectedTerritory}`;
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = "";

    // Queue init with namespace and inline render (processed once script loads)
    w.Cal("init", territory.calNamespace, { origin: "https://app.cal.com" });

    // Configure UI settings
    w.Cal("ui", {
      hideEventTypeDetails: true,
      layout: "month_view",
      styles: { branding: { brandColor: "#000000" } },
    });

    // Queue inline render using the namespace
    w.Cal("inline", {
      namespace: territory.calNamespace,
      elementOrSelector: `#${containerId}`,
      calLink: territory.calLink,
      config: { theme: "light" },
    });
  }, [showCalendar, selectedTerritory]);

  // Dynamic positioning: absolute in iframe, fixed on direct page
  const containerClass = isInIframe ? "relative w-full h-full" : "";
  const buttonClass = isInIframe ? "absolute bottom-0 right-0 z-50" : "fixed bottom-6 right-6 z-50";
  const chatClass = isInIframe 
    ? "absolute bottom-[96px] right-0 flex flex-col shadow-2xl z-50 transition-all duration-300 ease-in-out overflow-hidden" 
    : "fixed bottom-[112px] right-6 flex flex-col shadow-2xl z-50 transition-all duration-300 ease-in-out overflow-hidden";

  const chatWidget = (
    <>
      {/* Chat Button */}
      <div className={buttonClass}>
        {/* Speech Bubble */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-2 animate-fade-in">
            <div className="relative bg-white text-[#E93424] px-4 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap border-2 border-[#E93424]">
              Any questions I can help with?
              {/* Triangle pointer with border */}
              <div className="absolute top-full right-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#E93424]"></div>
              <div className="absolute top-full right-6 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-white translate-y-[-2px]"></div>
            </div>
          </div>
        )}
        
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-20 w-20 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 p-2"
          size="icon"
        >
          {isOpen ? (
            <X className="h-8 w-8" />
          ) : (
            <img src={logo} alt="Value Build Homes" className="h-full w-full rounded-full" />
          )}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <Card
          ref={chatRef}
          className={`${chatClass} ${showCalendar ? "w-[500px] h-[828px]" : "w-[400px] h-[690px]"}`}
        >
