import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Calendar, Phone, RotateCcw, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Message, Citation } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { CallbackFormCreekside } from './CallbackFormCreekside';
import { saveChatSession, loadChatSession, clearChatSession } from '@/utils/chatStorageCreekside';
import creeksideLogo from '@/assets/creekside-logo.png';
export const ChatWidgetCreekside = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customGptSessionId, setCustomGptSessionId] = useState<string | null>(null);
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    toast
  } = useToast();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  
  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const savedSession = loadChatSession();
      if (savedSession) {
        setMessages(savedSession.messages);
        setCustomGptSessionId(savedSession.customGptSessionId);
      } else {
        const welcomeMessage: Message = {
          id: '1',
          role: 'assistant',
          content: "Hi! I'm SAM, your Creekside Homes assistant. I'm here to help you learn about our homes, answer your questions, and guide you through your home-buying journey. How can I help you today?",
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [isOpen]);
  useEffect(() => {
    if (messages.length > 1) {
      saveChatSession(messages, customGptSessionId);
    }
  }, [messages, customGptSessionId]);
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
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
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const handleResetChat = () => {
    clearChatSession();
    setCustomGptSessionId(null);
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm SAM, your Creekside Homes assistant. I'm here to help you learn about our homes, answer your questions, and guide you through your home-buying journey. How can I help you today?",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    toast({
      title: 'Chat Reset',
      description: 'Your conversation has been cleared.'
    });
  };
  const handleScheduleAppointment = () => {
    window.open('https://app.usemotion.com/meet/andrew-burton/dream', '_blank');
  };
  const handleCallbackRequest = () => {
    setShowCallbackForm(true);
  };
  return <>
      <div className={`fixed z-50 transition-all duration-300 ${
        isOpen && isMobile 
          ? 'top-4 right-4' 
          : 'bottom-6 right-6'
      }`}>
        <Button 
          onClick={() => setIsOpen(!isOpen)} 
          className="h-20 w-20 rounded-full bg-primary text-primary-foreground button-lift hover:shadow-2xl hover:scale-110 transition-all duration-300 p-2" 
          size="icon"
        >
          {isOpen ? (
            <X className="h-8 w-8" />
          ) : (
            <img src={creeksideLogo} alt="Creekside Homes" className="h-full w-full rounded-full" />
          )}
        </Button>
      </div>

      {isOpen && <div 
        className={`fixed flex flex-col glass-morphism z-40 overflow-hidden transition-all duration-300 ${
          isMobile 
            ? 'inset-0 w-full h-full rounded-none' 
            : 'bottom-[112px] right-6 w-[400px] h-[690px] rounded-2xl'
        }`}
        style={{
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
          <div className="p-4 border-b flex justify-between items-center rounded-t-2xl" style={{
        backgroundColor: '#465E4C'
      }}>
            <div className="flex items-center gap-3">
              <img src={creeksideLogo} alt="Creekside Homes" className="h-10 w-10 rounded-full bg-white p-0.5" />
              <div className="flex flex-col">
                <span className="font-semibold text-white">SAM</span>
                <span className="text-xs text-white/80">Digital Assistant</span>
              </div>
              <div className="flex items-center gap-1 ml-2">
                
                
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleResetChat} className="text-white hover:bg-white/20">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!showCallbackForm && <div className="flex-1 overflow-y-auto pl-2 pr-2 pb-3 md:pl-3 md:pr-5 md:pb-3 space-y-3" style={{
        backgroundColor: '#F9FAFB'
      }}>
            {messages.map(message => <div key={message.id} className={`flex pt-2 ${message.role === 'user' ? 'justify-end' : 'justify-start gap-2'}`}>
                {message.role === 'assistant' && <img src={creeksideLogo} alt="SAM" className="h-8 w-8 rounded-full bg-white p-0.5 flex-shrink-0 mt-1" />}
                <div className={`max-w-[85vw] md:max-w-[312px] rounded-lg p-2.5 shadow-sm hover:shadow-md transition-all duration-200 ${message.role === 'user' ? 'text-white' : 'bg-white border'}`} style={message.role === 'user' ? {
            backgroundColor: '#465E4C'
          } : {}}>
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                  {message.citations && message.citations.length > 0 && <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs font-semibold mb-1" style={{
                color: '#B38C61'
              }}>Sources:</p>
                      {message.citations.map((citation, idx) => <a key={idx} href={citation.url} target="_blank" rel="noopener noreferrer" className="text-xs block hover:underline mb-1" style={{
                color: '#465E4C'
              }}>
                          {citation.title}
                        </a>)}
                    </div>}
                </div>
              </div>)}
            {isLoading && <div className="flex justify-start gap-2 pt-2">
                <img src={creeksideLogo} alt="SAM" className="h-8 w-8 rounded-full bg-white p-0.5 flex-shrink-0 mt-1" />
                <div className="bg-white border rounded-lg p-3">
                  <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                  </div>
                </div>
              </div>}
            <div ref={messagesEndRef} />
          </div>}

          {/* Callback Form View - standalone when active */}
          {showCallbackForm && <CallbackFormCreekside onClose={() => setShowCallbackForm(false)} />}

          {/* Action Button */}
          {!showCallbackForm && <div className="px-4 pt-3 pb-2 border-t w-full" style={{
        backgroundColor: '#F9FAFB',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        background: 'linear-gradient(to bottom, #F9FAFB, rgba(249, 250, 251, 0.8))'
      }}>
            <Button onClick={handleScheduleAppointment} className="group w-full h-12 font-medium text-white hover:opacity-90 rounded-xl shadow-md hover:shadow-lg transition-all duration-300" style={{
          backgroundColor: '#465E4C'
        }}>
              <Calendar className="h-4 w-4 mr-2 transition-all duration-300 group-hover:scale-110 flex-shrink-0" strokeWidth={2.5} />
              <span className="text-sm font-semibold truncate">Schedule Appointment</span>
            </Button>
          </div>}

          {/* Message Input */}
          {!showCallbackForm && <div className="px-5 pt-2 pb-5 border-t rounded-b-2xl" style={{
        backgroundColor: '#F9FAFB',
        borderColor: 'rgba(0, 0, 0, 0.2)',
        background: 'linear-gradient(to bottom, #F9FAFB, rgba(249, 250, 251, 0.9), rgba(249, 250, 251, 0.95))'
      }}>
            <div className="relative flex items-center gap-2 p-1 rounded-2xl border shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300" style={{
          background: 'linear-gradient(to bottom right, #F9FAFB, rgba(249, 250, 251, 0.7))',
          borderColor: 'rgba(0, 0, 0, 0.1)'
        }}>
              <div className="flex-1 relative">
                <Textarea value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask me anything.." className="min-h-[48px] max-h-[120px] resize-none py-3.5 px-4 text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl transition-all" rows={1} disabled={isLoading} />
              </div>
              <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()} size="icon" className="h-[43px] w-[43px] rounded-xl text-white shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 transition-all duration-200 flex-shrink-0" style={{
            backgroundColor: '#465E4C'
          }}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>}
        </div>}
    </>;
};