
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import ChatMessage from '@/components/ChatMessage';
import PreferenceForm from '@/components/PreferenceForm';
import AudioVisualizer from '@/components/AudioVisualizer';
import { Mic, MicOff, Send, X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const { user, logout } = useAuth();
  const { messages, sendMessage, isLoading } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    hasPermission, 
    error: voiceError 
  } = useVoiceRecognition({
    onResult: (text) => setInputMessage(text),
    onEnd: () => {}
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update input message when transcript changes
  useEffect(() => {
    if (transcript) {
      setInputMessage(transcript);
    }
  }, [transcript]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
      if (isListening) {
        stopListening();
      }
    }
  };

  const toggleVoiceRecognition = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">N8N Chatbot</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline-block">
              {user?.email}
            </span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => logout()}
              aria-label="Sign out"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row container mx-auto p-4 gap-4">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 p-4 overflow-hidden flex flex-col mb-4">
            <div className="flex-1 overflow-y-auto">
              {!hasMessages && (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <div className="mb-4 p-4 rounded-full bg-secondary">
                    <Mic className="h-6 w-6" />
                  </div>
                  <p>Say something to start a conversation</p>
                  <p className="text-sm mt-2">Or type a message below</p>
                </div>
              )}
              
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    imageUrl={message.imageUrl}
                    timestamp={message.timestamp}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </Card>
          
          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                className="pr-12"
              />
              {inputMessage && (
                <button
                  type="button"
                  onClick={() => setInputMessage('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <div className="absolute left-3 bottom-full mb-2">
                <AudioVisualizer isActive={isListening} />
              </div>
            </div>
            
            <Button
              type="button"
              size="icon"
              variant={isListening ? "destructive" : "secondary"}
              onClick={toggleVoiceRecognition}
              disabled={hasPermission === false}
              title={
                hasPermission === false
                  ? "Microphone access denied"
                  : isListening
                  ? "Stop listening"
                  : "Start voice input"
              }
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <Button type="submit" size="icon" disabled={!inputMessage.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
        
        {/* Preferences Section */}
        <div className="w-full md:w-72">
          <PreferenceForm />
        </div>
      </div>
    </div>
  );
};

export default Chat;
