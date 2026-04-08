'use client';

import { Suspense, useEffect, useRef, useState, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { ChatBubble } from '@/components/ChatBubble';
import { QuickReplies } from '@/components/QuickReplies';
import { Send, Map, Ship, Utensils, Home, Check } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

function FAQChat() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        parts: [{ type: 'text', text: 'Dạ em chào bác! Em là Long Xì AI, trợ lý ảo của Bình Minh Homestay. Bác cần hỏi gì về phòng ốc, vé tàu hay chỗ chơi cứ nhắn em nhé!' }]
      } as any
    ]
  });

  const [input, setInput] = useState('');
  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSentInitial = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialQuery && !hasSentInitial.current) {
      sendMessage({ text: initialQuery });
      hasSentInitial.current = true;
    }
  }, [initialQuery, sendMessage]);

  const handleQuickReply = (text: string, isPill = false) => {
    sendMessage({ text });
  };

  const latestCart = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const parts = messages[i].parts ?? [];
      for (let j = parts.length - 1; j >= 0; j--) {
        const p = parts[j] as any;
        if (typeof p.type === 'string' && p.type.startsWith('tool-')) {
          const toolName = p.type.replace(/^tool-/, '');
          if (toolName === 'update_cart') {
            const args = p.input ?? p.args ?? {};
            if (args.activeItems || args.removedItems) {
              return { active: args.activeItems || [], removed: args.removedItems || [] };
            }
          }
        }
      }
    }
    return { active: [], removed: [] };
  }, [messages]);

  return (
    <div className="flex flex-col h-[100dvh] bg-bg-primary">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-xl border-b border-text-primary/5 text-text-primary px-4 py-3 pt-[calc(env(safe-area-inset-top)+12px)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] rounded-full overflow-hidden bg-bg-secondary flex-shrink-0 relative border border-text-primary/5">
            <Image src="/longxiavatar.jpg" alt="Long Xì AI" fill className="object-cover" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-bg-primary rounded-full z-10" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-lg leading-none">Long Xì</h1>
              <span className="px-2 py-0.5 rounded-full bg-text-primary/10 text-text-primary text-[0.6875rem] font-bold uppercase tracking-wider">AI</span>
            </div>
            <p className="text-xs text-text-primary/50 font-medium tracking-wide mt-1">Bình Minh Homestay • Minh Châu</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
         ref={chatContainerRef}
         className="flex-1 overflow-y-auto px-4 py-4 pb-32"
      >
        {messages.map(m => {
          // Extract text content từ parts HOẶC content thuần
          const textFromParts = (m.parts ?? []).map((p: any) => p.type === 'text' ? p.text : '').join('');
          const textContent = textFromParts || (m as any).content || '';
          
          // Extract tool parts (v7: type = "tool-{toolName}", state = "input-available", data = input)
          const toolInvocations = (m.parts ?? [])
            .filter((p: any) => typeof p.type === 'string' && p.type.startsWith('tool-'))
            .map((p: any) => {
              const toolName = p.type.replace(/^tool-/, '');
              // Map v7 states → ChatBubble expects 'call' khi input sẵn sàng
              const state =
                p.state === 'input-available' ||
                p.state === 'input-streaming' ||
                p.state === 'output-available'
                  ? 'call'
                  : p.state ?? '';
              return {
                toolName,
                state,
                args: p.input ?? {},
              };
            });

          return (
            <ChatBubble
              key={m.id}
              role={m.role as 'user' | 'assistant'}
              content={textContent}
              toolInvocations={toolInvocations.length > 0 ? toolInvocations : undefined}
              onOptionClick={(val) => handleQuickReply(val, true)}
            />
          );
        })}
        
        {/* Booking Receipt Footnote (AI-Driven) */}
        {(latestCart.active.length > 0 || latestCart.removed.length > 0) && messages.length > 0 && (
          <div className="flex justify-start w-full mb-4 px-2 animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-[85%] bg-accent/5 border border-accent/20 rounded-[20px] p-4 ml-10">
              <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Hành trang hiện tại
              </h4>
              <ul className="flex flex-wrap gap-2">
                {latestCart.active.map((item: string, idx: number) => (
                  <li key={`a-${idx}`} className="bg-bg-primary text-text-primary text-sm px-3 py-1.5 rounded-full border border-text-primary/10 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {item}
                  </li>
                ))}
                {latestCart.removed.map((item: string, idx: number) => (
                  <li key={`r-${idx}`} className="bg-bg-primary text-text-primary/40 line-through text-sm px-3 py-1.5 rounded-full border border-text-primary/5 flex items-center gap-1 opacity-70">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-primary/30" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <ChatBubble role="assistant" content="" isTyping={true} />
        )}
        
        {messages.filter(m => m.role === 'user').length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 px-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-20 h-20 rounded-full overflow-hidden relative mb-4 ring-4 ring-bg-secondary">
              <Image src="/longxiavatar.jpg" alt="Long Xì" fill className="object-cover" />
            </div>
            <h2 className="text-xl font-heading font-bold text-text-primary text-center mb-2">Long Xì có thể giúp gì cho bác?</h2>
            <p className="text-sm text-text-primary/60 text-center mb-8 px-4">Tư vấn phòng ốc, lịch trình tàu xe, địa điểm ăn chơi tại đảo Minh Châu - Quan Lạn.</p>
            
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              <button onClick={() => handleQuickReply("Tư vấn giá phòng và đặt phòng?")} className="relative overflow-hidden flex flex-col items-start p-4 rounded-[24px] bg-bg-secondary/50 border border-text-primary/5 transition-all w-full text-left after:content-[''] after:absolute after:inset-0 after:rounded-[inherit] after:bg-text-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-text-primary/8 active:after:bg-text-primary/12">
                 <Home className="w-5 h-5 text-text-primary/70 mb-2" strokeWidth={1.5} />
                 <span className="text-sm font-semibold text-text-primary leading-tight">Phòng ốc <br/>& Đặt phòng</span>
              </button>
              <button onClick={() => handleQuickReply("Tư vấn vé tàu cao tốc ra đảo?")} className="relative overflow-hidden flex flex-col items-start p-4 rounded-[24px] bg-bg-secondary/50 border border-text-primary/5 transition-all w-full text-left after:content-[''] after:absolute after:inset-0 after:rounded-[inherit] after:bg-text-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-text-primary/8 active:after:bg-text-primary/12">
                 <Ship className="w-5 h-5 text-text-primary/70 mb-2" strokeWidth={1.5} />
                 <span className="text-sm font-semibold text-text-primary leading-tight">Vé tàu <br/>cao tốc</span>
              </button>
              <button onClick={() => handleQuickReply("Bãi tắm và điểm check in gần home?")} className="relative overflow-hidden flex flex-col items-start p-4 rounded-[24px] bg-bg-secondary/50 border border-text-primary/5 transition-all w-full text-left after:content-[''] after:absolute after:inset-0 after:rounded-[inherit] after:bg-text-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-text-primary/8 active:after:bg-text-primary/12">
                 <Map className="w-5 h-5 text-text-primary/70 mb-2" strokeWidth={1.5} />
                 <span className="text-sm font-semibold text-text-primary leading-tight">Bãi tắm <br/> & Cảnh đẹp</span>
              </button>
              <button onClick={() => handleQuickReply("Các địa điểm và đồ ăn ngon ở Quan Lạn?")} className="relative overflow-hidden flex flex-col items-start p-4 rounded-[24px] bg-bg-secondary/50 border border-text-primary/5 transition-all w-full text-left after:content-[''] after:absolute after:inset-0 after:rounded-[inherit] after:bg-text-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-text-primary/8 active:after:bg-text-primary/12">
                 <Utensils className="w-5 h-5 text-text-primary/70 mb-2" strokeWidth={1.5} />
                 <span className="text-sm font-semibold text-text-primary leading-tight">Ăn gì <br/>ở Quan Lạn?</span>
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-[84px] left-0 right-0 bg-bg-primary pt-2 pb-2 z-40 border-t border-text-primary/5">
        <div className="px-4 pb-2">
          <QuickReplies onSelect={handleQuickReply} />
        </div>
        
        <form onSubmit={handleSubmit} className="px-4">
          <div className="flex items-center gap-2 bg-bg-secondary rounded-[24px] p-2 pr-2">
            <button type="button" className="relative overflow-hidden w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full text-text-primary/60 transition-all after:content-[''] after:absolute after:inset-0 after:rounded-[inherit] after:bg-text-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-text-primary/8 active:after:bg-text-primary/12">
              <svg className="w-5 h-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              placeholder="nhắn Long Xì..."
              className="flex-1 max-h-[120px] min-h-[40px] bg-transparent border-none outline-none resize-none pt-[10px] pb-2 text-base text-text-primary placeholder:text-text-primary/40 scrollbar-hide"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) {
                    handleSubmit(e as any);
                    if (textareaRef.current) {
                       textareaRef.current.style.height = 'auto'; // Reset size on submit
                    }
                  }
                }
              }}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="relative w-10 h-10 flex flex-shrink-0 items-center justify-center bg-text-primary text-bg-primary rounded-full transition-all disabled:opacity-[0.38] after:content-[''] after:absolute after:inset-0 after:rounded-[inherit] after:bg-bg-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-bg-primary/8 active:after:bg-bg-primary/12 before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-[44px] before:h-[44px]"
            >
              <Send className="w-4 h-4 ml-0.5" strokeWidth={1.5} />
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[0.6875rem] text-text-primary/40">Long Xì có thể nhầm lẫn. Cần gấp vui lòng gọi hotline.</span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <Suspense fallback={<div className="h-[100dvh] bg-bg-primary flex items-center justify-center">Loading...</div>}>
      <FAQChat />
    </Suspense>
  );
}
