
import React, { createContext, useContext, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { API_CONFIG } from '@/config';

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
    
    try {
      // Prepare request data including user preferences and message
      const requestData = {
        message: content,
        preferences: preferences,
        timestamp: new Date().toISOString(),
      };
      
      console.log("Sending request to n8n:", requestData);
      
      // Send request to n8n webhook
      const response = await fetch(API_CONFIG.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Parse n8n response
      const data = await response.json();
      console.log("Received response from n8n:", data);
      
      // Create bot message from response
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: data.message || "Here's a suggestion based on your preferences.",
        timestamp: new Date(),
        imageUrl: data.imageUrl || `https://picsum.photos/500/300?random=${Math.floor(Math.random() * 100)}`
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error calling n8n webhook:", error);
      
      // Fallback response if n8n call fails
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to n8n service. Please try again later.",
      });
      
      // Add fallback bot message
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: "I'm having trouble connecting to the service right now. Please try again later.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
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
