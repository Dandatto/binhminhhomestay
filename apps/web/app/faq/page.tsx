"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, User as UserIcon, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState, FormEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";

export default function FAQChatPage() {
  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    messages: [
      {
        id: "welcome",
        role: "assistant",
        parts: [{ type: "text", text: "Dạ em chào bác! Em là Long Xì - quản lý Binh Minh Homestay đây ạ. Bác cần em hỗ trợ lịch tàu hay phòng ốc gì không ạ? Em sẵn sàng giải đáp hết sức mình luôn!" }],
      }
    ]
  });

  const [input, setInput] = useState("");
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value);
  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || status === "streaming" || status === "submitted") return;
    sendMessage({ text: input });
    setInput("");
  };

  const isLoading = status === "streaming" || status === "submitted";

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-sand-white pt-24 pb-20 md:pb-6">
      <div className="flex-1 w-full max-w-3xl mx-auto flex flex-col bg-white md:rounded-3xl md:shadow-2xl overflow-hidden border-x md:border border-sky-blue/20">
        
        {/* Chat Header */}
        <header className="bg-ocean-blue text-white p-4 flex items-center gap-4 z-10 shadow-md">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-sunrise-yellow flex items-center justify-center border-2 border-ocean-blue">
              <span className="text-xl">🤵‍♂️</span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-ocean-blue"></div>
          </div>
          <div>
            <h1 className="font-bold text-lg font-serif tracking-wide flex items-center gap-1">
              Long Xì <ShieldCheck className="w-4 h-4 text-sunrise-yellow" strokeWidth={2} />
            </h1>
            <p className="text-[11px] font-sans text-sky-blue tracking-wider">Cái gì cũng biết!</p>
          </div>
        </header>

        {/* Chat Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-[url('/chat-pattern.png')] bg-repeat bg-opacity-5">
          {messages.map((m: UIMessage) => (
            <motion.div 
              key={m.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-end gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-sunrise-yellow flex-shrink-0 flex items-center justify-center border border-ocean-blue/10">
                  <span className="text-sm">🤵‍♂️</span>
                </div>
              )}
              
              <div 
                className={`px-5 py-3.5 max-w-[85%] text-[15px] font-medium leading-relaxed
                  ${m.role === "user" 
                    ? "bg-ocean-blue text-white rounded-[24px] rounded-br-sm shadow-md" 
                    : "bg-sand-white text-ocean-blue rounded-[24px] rounded-bl-sm border border-sky-blue/20 shadow-sm"
                  }`}
              >
                {/* Dùng div tĩnh để in nội dung markdown cơ bản (xuống dòng) */}
                <div className="whitespace-pre-wrap font-sans">
                  {m.parts?.map((part) => part.type === "text" ? part.text : null).join("") || ""}
                </div>
              </div>

              {m.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-sky-blue flex-shrink-0 flex items-center justify-center border border-ocean-blue/10">
                  <UserIcon className="w-4 h-4 text-ocean-blue" strokeWidth={1.5} />
                </div>
              )}
            </motion.div>
          ))}
          
          {isLoading && (
            <div className="flex items-end gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-sunrise-yellow flex-shrink-0 flex items-center justify-center border border-ocean-blue/10">
                <span className="text-sm">🤵‍♂️</span>
              </div>
              <div className="px-5 py-3.5 bg-sand-white text-ocean-blue rounded-[24px] rounded-bl-sm border border-sky-blue/20 shadow-sm flex gap-1">
                <span className="w-2 h-2 bg-ocean-blue/30 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-ocean-blue/30 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-ocean-blue/30 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-sky-blue/20">
          <form onSubmit={handleSubmit} className="flex items-end gap-2 relative">
            <textarea 
              value={input}
              onChange={handleInputChange}
              placeholder="Nhắn Long Xì (VD: Tàu đi mấy giờ?)..."
              className="flex-1 max-h-32 min-h-[50px] bg-sand-white border border-sky-blue/30 rounded-[20px] px-4 py-3 outline-none focus:border-ocean-blue/50 focus:ring-1 focus:ring-ocean-blue/50 transition-all resize-none text-ocean-blue font-sans text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  // Trigger submit by calling form submit logic implicitly
                  const form = e.currentTarget.form;
                  if (form) form.requestSubmit();
                }
              }}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="w-[50px] h-[50px] flex items-center justify-center bg-ocean-blue text-white rounded-full hover:bg-ocean-blue/90 disabled:opacity-50 disabled:bg-gray-400 transition-colors shadow-md flex-shrink-0 mb-0.5"
            >
              <Send className="w-5 h-5 ml-0.5" strokeWidth={1.5} />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-ocean-blue/40 font-sans uppercase">Trả lời bởi AI Generative (Gemini 2.5)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
