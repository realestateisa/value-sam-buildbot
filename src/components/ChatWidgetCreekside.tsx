import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Calendar, Phone, RotateCcw, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Message, Citation } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import TypingIndicator from './TypingIndicator';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
          timestamp: new Date(),
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
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('chat-with-creekside', {
        body: {
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          sessionId: customGptSessionId,
        }
      });

      if (functionError) throw functionError;

      if (!customGptSessionId && functionData.sessionId) {
        setCustomGptSessionId(functionData.sessionId);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: functionData.message,
        timestamp: new Date(),
        citations: functionData.citations as Citation[],
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
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
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    toast({
      title: 'Chat Reset',
      description: 'Your conversation has been cleared.',
    });
  };

  const handleScheduleAppointment = () => {
    window.open('https://app.usemotion.com/meet/andrew-burton/dream', '_blank');
  };

  const handleCallbackRequest = () => {
    setShowCallbackForm(true);
  };

  if (showCallbackForm) {
    return <CallbackFormCreekside onClose={() => setShowCallbackForm(false)} />;
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg hover:scale-110 transition-transform z-50 button-lift"
          style={{ 
            backgroundColor: '#465E4C',
            padding: '0.5rem'
          }}
        >
          <img 
            src={creeksideLogo} 
            alt="Creekside Homes" 
            className="w-full h-full object-contain rounded-full"
          />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[400px] h-[690px] glass-morphism rounded-lg shadow-2xl flex flex-col z-50 md:w-[400px] md:h-[690px] mobile:fixed mobile:inset-0 mobile:w-full mobile:h-full mobile:rounded-none mobile:bottom-0 mobile:right-0">
          <div className="p-4 border-b flex justify-between items-center" style={{ backgroundColor: '#465E4C' }}>
            <div className="flex items-center gap-3">
              <img 
                src={creeksideLogo} 
                alt="Creekside Homes" 
                className="h-10 w-10 rounded-full bg-white p-0.5"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-white">SAM</span>
                <span className="text-xs text-white/80">Digital Assistant</span>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-white/80">Online</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetChat}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: '#F9FAFB' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'text-white'
                      : 'bg-white border'
                  }`}
                  style={message.role === 'user' ? { backgroundColor: '#465E4C' } : {}}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs font-semibold mb-1" style={{ color: '#B38C61' }}>Sources:</p>
                      {message.citations.map((citation, idx) => (
                        <a
                          key={idx}
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs block hover:underline mb-1"
                          style={{ color: '#465E4C' }}
                        >
                          {citation.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border rounded-lg p-3">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t space-y-2" style={{ backgroundColor: '#F9FAFB' }}>
            <div className="flex gap-2">
              <Button
                onClick={handleScheduleAppointment}
                className="flex-1 text-white hover:opacity-90"
                size="sm"
                style={{ backgroundColor: '#465E4C' }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
              <Button
                onClick={handleCallbackRequest}
                variant="outline"
                className="flex-1"
                size="sm"
                style={{ borderColor: '#465E4C', color: '#465E4C' }}
              >
                <Phone className="h-4 w-4 mr-2" />
                Request Callback
              </Button>
            </div>
            <div className="flex gap-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="resize-none"
                rows={2}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="self-end text-white"
                style={{ backgroundColor: '#465E4C' }}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
