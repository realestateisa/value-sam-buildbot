import { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { MessageCircle, X, Send, Loader2, Calendar, Phone, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Message, Citation } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { CallbackFormCreekside } from './CallbackFormCreekside';
import { saveChatSession, loadChatSession, clearChatSession } from '@/utils/chatStorageCreekside';
import TypingIndicatorCreekside from '@/components/TypingIndicatorCreekside';
import creeksideLogo from '@/assets/creekside-logo.png';
export const ChatWidgetCreekside = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [customGptSessionId, setCustomGptSessionId] = useState<string | null>(null);
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, number>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
        content: "Hi! I'm SAM, your Creekside Homes assistant. I'm here to help you learn about our homes, answer your questions, and guide you through your home-buying journey. How can I help you today?",
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

  // Notify parent embed to resize iframe when widget opens/closes or size changes
  useEffect(() => {
    const postResize = (w: number, h: number, open: boolean, mobile: boolean) => {
      try {
        window.parent?.postMessage({
          type: "chatbot-resize",
          width: Math.ceil(w),
          height: Math.ceil(h),
          isOpen: open,
          isMobile: mobile
        }, "*");
      } catch {}
    };
    const compact = {
      width: 88,
      height: 146
    };
    if (!isOpen) {
      postResize(compact.width, compact.height, false, isMobile);
      return;
    }
    
    // On mobile full-screen, send viewport dimensions
    if (isMobile) {
      postResize(window.innerWidth, window.innerHeight, true, true);
      return;
    }
    
    const baseWidth = showCallbackForm ? 480 : 400;
    const baseHeight = 690;
    const paddingBottom = 140; // space for button/offset within iframe

    const sendCurrentSize = () => {
      const rect = chatRef.current?.getBoundingClientRect();
      const w = Math.max(baseWidth, rect?.width ?? baseWidth);
      const h = (rect?.height ?? baseHeight) + paddingBottom;
      postResize(w, h, true, false);
    };
    sendCurrentSize();
    const ro = new ResizeObserver(() => sendCurrentSize());
    if (chatRef.current) ro.observe(chatRef.current);
    return () => ro.disconnect();
  }, [isOpen, isMobile, showCallbackForm]);
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
    try {
      const {
        data: functionData,
        error: functionError
      } = await supabase.functions.invoke('chat-with-creekside', {
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
    window.open('https://app.usemotion.com/meet/andrew-burton/dream', '_blank');
  };
  const handleCallbackRequest = () => {
    setShowCallbackForm(true);
  };
  return <>
      {/* Chat Button */}
      <div className={`fixed z-50 transition-all duration-300 ${
        isOpen && isMobile 
          ? 'top-4 right-4' 
          : 'bottom-6 right-6'
      }`}>
        <Button 
          onClick={() => setIsOpen(!isOpen)} 
          className="h-20 w-20 rounded-full bg-primary text-primary-foreground button-lift hover:shadow-2xl hover:scale-110 transition-all duration-300 p-0 border-4 border-[#B38C61] flex items-center justify-center" 
          size="icon"
        >
          {isOpen ? <X className="h-8 w-8" /> : <MessageCircle style={{ width: 64, height: 64 }} fill="currentColor" strokeWidth={1.5} />}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && <Card 
          ref={chatRef} 
          className={`fixed flex flex-col glass-morphism z-50 overflow-visible transition-all duration-300 ${
            isMobile 
              ? 'inset-0 w-full h-full rounded-none' 
              : showCallbackForm 
                ? 'bottom-[112px] right-6 w-[480px] h-[690px] rounded-2xl'
                : 'bottom-[112px] right-6 w-[400px] h-[690px] rounded-2xl'
          }`}
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          data-mobile-fullscreen={isMobile ? "true" : "false"}
        >
          {/* Header */}
          <div className={`${showCallbackForm ? "hidden" : ""} flex items-center justify-between p-4 border-b border-border/30 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground transition-all duration-300 rounded-t-2xl`}>
            <div className="flex items-center gap-2">
              <div className="relative">
                <img src={creeksideLogo} alt="Creekside Homes" className="h-10 w-10 rounded-full bg-white p-0.5" />
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-primary"></div>
              </div>
              <div>
                <h3 className="text-base font-semibold">SAM</h3>
                <p className="text-xs opacity-90 font-medium">Digital Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => {
                setIsOpen(false);
                setShowCallbackForm(false);
              }} className="h-8 w-8 text-primary-foreground hover:bg-white/30 transition-colors duration-200" aria-label="Close chat">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          {!showCallbackForm && <ScrollArea className="flex-1 overflow-hidden overflow-x-hidden pl-2 pr-2 pb-3 md:pl-3 md:pr-5 md:pb-3" ref={scrollRef}>
            <div className="max-w-full space-y-3">
              {messages.map(message => (
                <div key={message.id} className={`flex w-full max-w-full min-w-0 overflow-hidden pt-2 ${message.role === "user" ? "justify-end" : "justify-start gap-2"} group`}>
                  {message.role === "assistant" && <img src={creeksideLogo} alt="SAM" className={`h-8 w-8 rounded-full bg-white p-0.5 flex-shrink-0 mt-1 transition-opacity ${isLoading ? "animate-pulse" : ""}`} />}
                  <div className="flex flex-col max-w-full min-w-0 overflow-hidden">
                    <div className={`rounded-lg p-2.5 min-w-0 max-w-[85vw] md:max-w-[312px] ${message.role === "user" ? "inline-block bg-primary text-primary-foreground shadow-sm hover:shadow-md" : "inline-block bg-muted shadow-sm hover:shadow-md"} transition-all duration-200`}>
                      <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere leading-relaxed">
                        {message.content}
                      </p>
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

                          // Use Creekside favicon
                          const faviconUrl = "https://www.google.com/s2/favicons?domain=creeksidehomes.com&sz=32";
                          
                          return (
                            <Card className="w-full max-w-full p-2.5 bg-background border shadow-sm overflow-hidden">
                              <div className="flex items-start gap-2 overflow-hidden min-w-0">
                                <div className="flex-1 min-w-0 overflow-hidden">
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 group overflow-hidden text-ellipsis min-w-0 shrink">
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

              {/* Typing Indicator with Creekside branding */}
              {showTypingIndicator && <TypingIndicatorCreekside />}
            </div>
          </ScrollArea>}

          {/* Callback Form View - standalone when active */}
          {showCallbackForm && <CallbackFormCreekside onClose={() => setShowCallbackForm(false)} />}

          {/* Action Buttons */}
          {!showCallbackForm && <div className="px-4 pt-3 pb-2 border-t border-border/10 bg-gradient-to-b from-background to-muted/20 w-full">
            <Button 
              onClick={handleScheduleAppointment} 
              className="group w-full h-12 font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0" 
              aria-label="Book an appointment"
            >
              <Calendar className="h-4 w-4 mr-2 transition-all duration-300 group-hover:scale-110 flex-shrink-0" strokeWidth={2.5} />
              <span className="text-sm font-semibold truncate">Schedule Appointment</span>
            </Button>
          </div>}

          {/* Message Input */}
          {!showCallbackForm && <div className="px-5 pt-2 pb-5 border-t border-border/20 bg-gradient-to-b from-background via-muted/5 to-muted/10 rounded-b-2xl">
            <div className="relative flex items-center gap-2 p-1 rounded-2xl bg-gradient-to-br from-background to-muted/30 border border-border/40 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300">
              <div className="flex-1 relative group">
                {!inputMessage && (
                  <div className="absolute inset-0 pointer-events-none flex items-center px-4 py-3.5">
                    <span className="text-base bg-[linear-gradient(90deg,hsl(var(--muted-foreground)/0.6)_0%,hsl(var(--muted-foreground)/0.6)_40%,hsl(var(--foreground)/0.95)_50%,hsl(var(--muted-foreground)/0.6)_60%,hsl(var(--muted-foreground)/0.6)_100%)] bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer">
                      Ask me anything..
                    </span>
                  </div>
                )}
                <Textarea 
                  ref={textareaRef} 
                  value={inputMessage} 
                  onChange={e => setInputMessage(e.target.value)} 
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
                {inputMessage.length > 500 && (
                  <span className="absolute bottom-3 right-4 text-[10px] text-muted-foreground font-medium">
                    {inputMessage.length}
                  </span>
                )}
              </div>
              <Button 
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()} 
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
};