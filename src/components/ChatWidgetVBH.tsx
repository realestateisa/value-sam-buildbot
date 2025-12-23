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
import { CallbackForm } from './CallbackForm';
import { saveChatSession, loadChatSession } from '@/utils/chatStorage';
import TypingIndicator from '@/components/TypingIndicator';
import vbhLogo from '@/assets/logo.png';

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
    window.open('https://www.valuebuild.com/contact', '_blank');
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
                  setShowCallbackForm(false);
                }} 
                className="h-8 w-8 text-primary-foreground hover:bg-white/30 transition-colors duration-200" 
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          {!showCallbackForm && (
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

                            // Use VBH favicon
                            const faviconUrl = "https://www.google.com/s2/favicons?domain=valuebuild.com&sz=32";
                            
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

          {/* Callback Form */}
          {showCallbackForm && <CallbackForm onClose={() => setShowCallbackForm(false)} />}

          {/* Input Area */}
          {!showCallbackForm && (
            <div className="border-t border-border/30 p-3 bg-background/80 backdrop-blur-sm rounded-b-2xl">
              {/* Action Buttons */}
              <div className="flex gap-2 mb-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleScheduleAppointment}
                  className="flex-1 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  Schedule Appointment
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCallbackRequest}
                  className="flex-1 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  <Phone className="h-3.5 w-3.5 mr-1.5" />
                  Request Callback
                </Button>
              </div>

              {/* Message Input */}
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
            </div>
          )}
        </Card>
      )}
    </>
  );
};
