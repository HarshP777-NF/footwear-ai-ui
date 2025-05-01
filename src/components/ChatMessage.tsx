
import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

interface ChatMessageProps {
  role: 'user' | 'bot';
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

const ChatMessage = ({ role, content, imageUrl, timestamp }: ChatMessageProps) => {
  const isBot = role === 'bot';
  const formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={cn(
      "flex w-full mb-4",
      isBot ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "flex gap-3 max-w-[80%]",
        isBot ? "flex-row" : "flex-row-reverse"
      )}>
        <Avatar className={cn(
          "h-8 w-8",
          isBot ? "bg-bot-primary" : "bg-accent"
        )}>
          <span className="text-sm text-white font-medium">
            {isBot ? "AI" : "Me"}
          </span>
        </Avatar>
        
        <div className="flex flex-col">
          <Card className={cn(
            "p-3",
            isBot ? "bg-secondary" : "bg-accent text-white"
          )}>
            <div className="text-sm">{content}</div>
            
            {imageUrl && (
              <div className="mt-2">
                <img 
                  src={imageUrl} 
                  alt="Chatbot response" 
                  className="rounded-md max-w-full max-h-64 object-cover"
                  loading="lazy"
                />
              </div>
            )}
          </Card>
          
          <span className={cn(
            "text-xs text-muted-foreground mt-1",
            isBot ? "text-left" : "text-right"
          )}>
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
