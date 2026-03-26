import React, { createContext, useContext, useRef, useState, ReactNode } from 'react';
import { LibraryItem } from '@/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

type AIMode = 'campus' | 'document' | 'library';

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  mode: AIMode;
  setMode: React.Dispatch<React.SetStateAction<AIMode>>;
  pdfFile: File | null;
  setPdfFile: React.Dispatch<React.SetStateAction<File | null>>;
  pdfText: string;
  setPdfText: React.Dispatch<React.SetStateAction<string>>;
  historyRef: React.MutableRefObject<string>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([{
    id: '0',
    role: 'assistant',
    text: 'Welcome to Campus AI Buddy! Ask me anything about your studies or campus life. You can also upload a document 📎 or tag a library resource with @',
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<AIMode>('campus');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState('');
  const historyRef = useRef<string>('');

  return (
    <ChatContext.Provider value={{
      messages, setMessages,
      input, setInput,
      mode, setMode,
      pdfFile, setPdfFile,
      pdfText, setPdfText,
      historyRef,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
