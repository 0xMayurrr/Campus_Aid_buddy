import React, { useEffect, useRef, useState } from 'react';
import { askCampusAI, askAboutDocument, askAboutLibraryItem, extractDocText } from '@/services/geminiService';
import { getAllLibraryItems } from '@/services/firestoreService';
import { useLocation } from 'react-router-dom';
import { LibraryItem } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { 
  Bot, Send, Upload, X, FileText, Loader2, User as UserIcon, Sparkles, 
  Info, History, Share2, MoreVertical, Paperclip, Mic, 
  PlusCircle, Play, FileJson, Table2, MessageSquare,
  Globe, Zap, LayoutGrid, Search, BookOpen, Clock, Activity,
  ChevronRight, Bookmark, ArrowRight, Tag, PlayCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

type AIMode = 'campus' | 'document' | 'library';

export default function CampusAI() {
  const { user } = useAuth();
  const location = useLocation();
  const libraryContext = location.state?.libraryItem as LibraryItem | undefined;
  const { messages, setMessages, input, setInput, mode, setMode, pdfFile, setPdfFile, pdfText, setPdfText, historyRef } = useChat();

  const [isLoading, setIsLoading] = useState(false);
  const [allLibraryItems, setAllLibraryItems] = useState<LibraryItem[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [atSuggestions, setAtSuggestions] = useState<LibraryItem[]>([]);
  const [showAtMenu, setShowAtMenu] = useState(false);
  
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAllLibraryItems().then(setAllLibraryItems).catch(console.error);
    // Only set welcome message if chat is empty (first load)
    if (messages.length === 1 && messages[0].id === '0' && libraryContext) {
      setMode('library');
      setMessages([{ id: '0', role: 'assistant', text: `Hello! I've loaded "${libraryContext.title}" from your library. Ask me anything about it!`, timestamp: new Date() }]);
    }
  }, [libraryContext]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDocUpload = async (file: File) => {
    setPdfFile(file);
    setExtracting(true);
    setMode('document');
    addMessage('assistant', `📄 Processing **${file.name}**... please wait.`);
    try {
      const text = await extractDocText(file);
      console.log('Extracted text length:', text.length, 'Preview:', text.slice(0, 200));
      if (!text || text.startsWith('Could not') || text.trim().length < 30) {
        addMessage('assistant', `❌ Extraction returned: "${text?.slice(0, 100)}". Try a different PDF.`);
      } else {
        setPdfText(text);
        addMessage('assistant', `✅ Done! Read **${file.name}** (${Math.round(text.length / 1000)}k chars). Ask me anything!`);
      }
    } catch (err: any) {
      console.error('Doc upload error:', err);
      addMessage('assistant', `❌ Error: ${err.message}. Check console for details.`);
    } finally {
      setExtracting(false);
    }
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    const atIdx = val.lastIndexOf('@');
    if (atIdx !== -1 && atIdx === val.length - 1) {
      setAtSuggestions(allLibraryItems);
      setShowAtMenu(true);
    } else if (atIdx !== -1 && val.slice(atIdx + 1).length > 0 && !val.slice(atIdx + 1).includes(' ')) {
      const q = val.slice(atIdx + 1).toLowerCase();
      setAtSuggestions(allLibraryItems.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.displayId.toLowerCase().includes(q) ||
        i.subject?.toLowerCase().includes(q)
      ));
      setShowAtMenu(true);
    } else {
      setShowAtMenu(false);
    }
  };

  const insertAtTag = (item: LibraryItem) => {
    const atIdx = input.lastIndexOf('@');
    const tag = `@${item.displayId.replace('#', '')} `;
    setInput(input.slice(0, atIdx) + tag);
    setShowAtMenu(false);
  };

  const addMessage = (role: 'user' | 'assistant', text: string) => {
    const msg: Message = { id: Date.now().toString(), role, text, timestamp: new Date() };
    setMessages((prev) => [...prev, msg]);
    if (role === 'user') historyRef.current += `\nStudent: ${text}`;
    if (role === 'assistant') historyRef.current += `\nAssistant: ${text}`;
  };

  const handleSend = async () => {
    const q = input.trim();
    if (!q || isLoading) return;
    setInput('');
    addMessage('user', q);
    setIsLoading(true);
    try {
      let response = '';
      if (mode === 'document' && pdfText) {
        response = await askAboutDocument(pdfText, q);
      } else if (mode === 'library' && libraryContext) {
        response = await askAboutLibraryItem(libraryContext, q);
      } else {
        const tagMatch = q.match(/@SVCE-[A-Z]+-[A-Z0-9]+/i);
        let context = '';
        if (tagMatch) {
          const item = allLibraryItems.find(i => i.displayId.toLowerCase() === tagMatch[0].replace('@', '#').toLowerCase());
          if (item) {
            context = `The student is asking about this library resource:
ID: ${item.displayId}
Title: ${item.title}
Type: ${item.type}
Subject: ${item.subject}
Topic: ${item.topic || 'General'}
Description: ${item.description || 'No description.'}
Uploaded by: ${item.uploadedByName}
Use this as context to answer the student's question.`;
          }
        }
        response = await askCampusAI(q, historyRef.current, context);
      }
      addMessage('assistant', response);
    } catch {
      addMessage('assistant', 'Technical error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 animate-in fade-in duration-700">
      
      {/* ── LEFT COLUMN: REFINED SIDEBAR ── */}
      <aside className="w-[300px] hidden xl:flex flex-col gap-4">
        
        {/* Profile Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                 <UserIcon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                 <h3 className="text-sm font-black text-slate-900 truncate leading-none mb-1.5">{user?.name}</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate">Academic Operations</p>
              </div>
           </div>
        </div>

        {/* Knowledge Context */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col h-[300px] overflow-hidden">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Global Context</h3>
            <div className="w-2 h-2 rounded-full bg-orange-500" />
          </div>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
             {/* Current File */}
             {(pdfFile || libraryContext) && (
               <div className="p-4 bg-orange-50/50 border border-orange-200 rounded-lg animate-in zoom-in">
                  <p className="text-[11px] font-black text-slate-800 truncate leading-none mb-2">{pdfFile?.name || libraryContext?.title}</p>
                  <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest">{pdfFile ? 'PDF ARCHIVE' : `${libraryContext?.type} DATA`}</p>
               </div>
             )}
             
             {/* Recent Activities */}
             {[
               { t: 'FAFSA Verification 2024', d: 'Updated 10m ago' },
               { t: 'Course Eligibility Matrix', d: 'Updated 2h ago' },
             ].map((act, i) => (
                <div key={i} className="p-4 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg cursor-pointer transition-all">
                   <p className="text-[11px] font-bold text-slate-600 truncate mb-1">{act.t}</p>
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{act.d}</p>
                </div>
             ))}
          </div>
        </div>

        {/* Library Resources — click to tag in chat */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Library Resources</h3>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{allLibraryItems.length} items</span>
          </div>
          <p className="text-[9px] font-bold text-slate-400 mb-3 leading-relaxed uppercase tracking-wide">Click to tag in chat → ask AI about it</p>
          <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar flex-1">
            {allLibraryItems.length === 0 ? (
              <p className="text-[11px] text-slate-300 font-bold text-center py-8">No library resources yet</p>
            ) : (
              allLibraryItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setInput(prev => `${prev} @${item.displayId.replace('#', '')} `.trimStart())}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all group/lib hover:border-orange-400 hover:bg-orange-50/30",
                    libraryContext?.id === item.id ? "bg-orange-50 border-orange-300" : "bg-white border-slate-100"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded flex items-center justify-center shrink-0",
                    item.type === 'video' ? "bg-rose-50" : "bg-blue-50"
                  )}>
                    {item.type === 'video'
                      ? <PlayCircle className="w-4 h-4 text-rose-500" />
                      : <FileText className="w-4 h-4 text-blue-500" />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black text-slate-800 truncate leading-none mb-1">{item.title}</p>
                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">@{item.displayId.replace('#', '')}</p>
                  </div>
                  <Tag className="w-3 h-3 text-slate-300 group-hover/lib:text-orange-500 transition-colors shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* ── RIGHT COLUMN: SOPHISTICATED CHAT ── */}
      <section className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
         
         {/* Console Header */}
         <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-white z-10 shadow-sm/5">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                  <Bot className="w-6 h-6 text-orange-500" />
               </div>
               <div>
                  <h2 className="text-xl font-black text-slate-950 tracking-tight leading-none mb-2">Campus AI Console</h2>
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">Active Core</span>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol: {mode}</span>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <Button variant="ghost" className="h-10 w-10 p-0 rounded-lg border border-slate-100"><History className="w-4 h-4 text-slate-400" /></Button>
               <Button className="bg-slate-900 text-white hover:bg-black h-10 px-6 rounded-lg text-[10px] font-black uppercase tracking-widest leading-none">Export Session</Button>
            </div>
         </div>

         {/* Chat Feed */}
         <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-slate-50/30">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-5 max-w-4xl", msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}>
                 <div className={cn(
                   "w-10 h-10 rounded flex items-center justify-center shrink-0 shadow-sm border",
                   msg.role === 'user' ? "bg-orange-500 border-orange-600" : "bg-white border-slate-200"
                 )}>
                    {msg.role === 'user' ? <UserIcon className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-slate-950" />}
                 </div>
                 <div className={cn("flex flex-col gap-2 min-w-0 max-w-[90%]", msg.role === 'user' ? "items-end" : "items-start")}>
                    <div className={cn(
                      "px-6 py-4 rounded-xl text-[14px] leading-relaxed whitespace-pre-wrap shadow-sm border",
                      msg.role === 'user'
                        ? "bg-slate-900 text-white border-slate-800"
                        : "bg-white text-slate-800 border-slate-200 font-medium"
                    )}>
                       {msg.text}
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                       {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* Quick Actions */}
                    {msg.id === '0' && (
                       <div className="flex flex-wrap gap-2 mt-6 animate-in slide-in-from-left-4 duration-700">
                          {[
                            { l: 'Summarize Knowledge Base', i: Search },
                            { l: 'Institutional Risk Report', i: AlertCircle },
                            { l: 'Prepare Study Guide', i: Sparkles },
                          ].map((btn, i) => (
                            <button 
                              key={i}
                              onClick={() => setInput(btn.l)}
                              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-500 hover:border-slate-900 hover:text-slate-950 uppercase tracking-widest transition-all shadow-sm active:scale-95"
                            >
                               {btn.l}
                            </button>
                          ))}
                       </div>
                    )}
                 </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-5">
                 <div className="w-10 h-10 rounded bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    <Bot className="w-5 h-5 text-slate-950" />
                 </div>
                 <div className="bg-white px-6 py-4 rounded-xl border border-slate-100 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-bounce" style={{ animationDelay: '0.4s' }} />
                 </div>
              </div>
            )}
            <div ref={bottomRef} className="h-4" />
         </div>

         {/* Input Box */}
         <div className="p-8 bg-white border-t border-slate-200">
            <div className="max-w-4xl mx-auto flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-2 px-4 shadow-inner focus-within:bg-white focus-within:border-slate-950 transition-all">
               <button onClick={() => fileRef.current?.click()} className="p-2 text-slate-400 hover:text-slate-950 transition-colors">
                  <Paperclip className="w-5 h-5" />
               </button>
               <div className="flex-1 relative">
                 <input 
                   value={input}
                   onChange={(e) => handleInputChange(e.target.value)}
                   onKeyDown={(e) => { if (e.key === 'Enter' && !showAtMenu) handleSend(); if (e.key === 'Escape') setShowAtMenu(false); }}
                   className="w-full bg-transparent border-none focus:ring-0 text-sm py-4 font-bold text-slate-900 placeholder:text-slate-300 outline-none" 
                   placeholder="Ask anything or type @ to tag a library resource..." 
                 />
                 {showAtMenu && atSuggestions.length > 0 && (
                   <div className="absolute bottom-full left-0 mb-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                     <p className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Tag Library Resource</p>
                     <div className="max-h-48 overflow-y-auto">
                       {atSuggestions.map(item => (
                         <button
                           key={item.id}
                           onMouseDown={(e) => { e.preventDefault(); insertAtTag(item); }}
                           className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left"
                         >
                           <div className={cn("w-7 h-7 rounded flex items-center justify-center shrink-0", item.type === 'video' ? 'bg-rose-50' : 'bg-blue-50')}>
                             {item.type === 'video' ? <PlayCircle className="w-3.5 h-3.5 text-rose-500" /> : <FileText className="w-3.5 h-3.5 text-blue-500" />}
                           </div>
                           <div className="min-w-0">
                             <p className="text-[11px] font-black text-slate-800 truncate">{item.title}</p>
                             <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">@{item.displayId.replace('#', '')}</p>
                           </div>
                         </button>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
               <Button 
                 onClick={handleSend}
                 disabled={!input.trim() || isLoading}
                 className="bg-slate-950 text-white rounded-lg px-4 h-12 hover:bg-black transition-all"
               >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
               </Button>
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.ppt,.pptx" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocUpload(e.target.files[0])} />
            <p className="text-center text-[9px] font-black text-slate-300 mt-6 uppercase tracking-[0.3em]">SECURE ACCESS • BUDDY AI INFRASTRUCTURE V3</p>
         </div>
      </section>

    </div>
  );
}

// Subcomponent replacement for AlertCircle if missing from imports above
const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);
