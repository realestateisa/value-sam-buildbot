import { Message } from '@/types/chat';

const STORAGE_KEY = 'creekside-chat-session';
const EXPIRATION_DAYS = 7;

interface ChatSession {
  messages: Message[];
  customGptSessionId: string | null;
  timestamp: string;
}

export const saveChatSession = (messages: Message[], customGptSessionId: string | null) => {
  try {
    // Filter out welcome message (id: '1')
    const messagesToSave = messages.filter(msg => msg.id !== '1');
    
    const session: ChatSession = {
      messages: messagesToSave,
      customGptSessionId,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    // Failed to save chat session
  }
};

export const loadChatSession = (): { messages: Message[]; customGptSessionId: string | null } | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const session: ChatSession = JSON.parse(stored);
    
    if (isSessionExpired(session.timestamp)) {
      clearChatSession();
      return null;
    }

    // Reconstruct Date objects
    const messages = session.messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));

    return {
      messages,
      customGptSessionId: session.customGptSessionId,
    };
  } catch (error) {
    return null;
  }
};

export const clearChatSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Failed to clear chat session
  }
};

export const isSessionExpired = (timestamp: string): boolean => {
  const sessionDate = new Date(timestamp);
  const now = new Date();
  const diffDays = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > EXPIRATION_DAYS;
};
