
import React, { createContext, useContext, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

interface ChatPreferences {
  size: string;
  gender: string;
  style: string;
  color: string;
}

interface ChatContextType {
  messages: ChatMessage[];
  preferences: ChatPreferences;
  isLoading: boolean;
  updatePreferences: (newPrefs: Partial<ChatPreferences>) => void;
  sendMessage: (content: string) => void;
  clearChat: () => void;
}

const defaultPreferences: ChatPreferences = {
  size: '',
  gender: '',
  style: '',
  color: ''
};

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [preferences, setPreferences] = useState<ChatPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);

  const updatePreferences = (newPrefs: Partial<ChatPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Mock API call to your n8n chatbot
    try {
      // In a real app, this would be a fetch to your n8n backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response with random image
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: `Here's a suggestion based on your ${preferences.style || 'preferred'} style and ${preferences.size || 'size'}.`,
        timestamp: new Date(),
        imageUrl: `https://picsum.photos/500/300?random=${Math.floor(Math.random() * 100)}`
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get response from chatbot.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      preferences, 
      isLoading, 
      updatePreferences, 
      sendMessage, 
      clearChat 
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
