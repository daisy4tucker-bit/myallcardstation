import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Headphones,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import * as supportService from '../../services/supportService';
import { SupportMessage, SupportConversation } from '../../services/supportService';
import { useAuth } from '../../context/AuthContext';

export const SupportChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    try {
      setIsLoading(true);
      const res = await supportService.getOrCreateConversation();
      setConversation(res.conversation);
      setMessages(res.conversation.messages || []);
    } catch {
      // silently ignore initial load issues in widget
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !conversation) {
      loadConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputMessage.trim();
    if (!content || !conversation || isSending) return;

    setInputMessage('');
    setIsSending(true);

    const tempId = `temp_${Date.now()}`;
    const optimisticMsg: SupportMessage = {
      id: tempId,
      conversationId: conversation.id,
      senderType: 'CUSTOMER',
      message: content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setIsTyping(true);

    try {
      await supportService.sendSupportMessage(conversation.id, content);
      setTimeout(async () => {
        try {
          const updated = await supportService.getOrCreateConversation();
          setMessages(updated.conversation.messages || []);
        } catch {
          // silently handle
        } finally {
          setIsTyping(false);
        }
      }, 1600);
    } catch {
      setIsTyping(false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Popover Window */}
      {isOpen && (
        <div className="mb-4 w-90 sm:w-96 h-[520px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">Live Support & Help</h3>
                <p className="text-[11px] text-indigo-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online & Active
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Crypto Reminder */}
          <div className="px-3.5 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Crypto Payments (BTC, ETH, LTC, SOL, USDT, USDC) supported.</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isCustomer = msg.senderType === 'CUSTOMER';
                  const isAi = msg.senderType === 'AI_ASSISTANT';

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isCustomer ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isCustomer && (
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 text-xs ${
                            isAi ? 'bg-indigo-600' : 'bg-emerald-600'
                          }`}
                        >
                          {isAi ? <Bot className="w-3 h-3" /> : <Headphones className="w-3 h-3" />}
                        </div>
                      )}

                      <div
                        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                          isCustomer
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-end gap-2 justify-start">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                      <Bot className="w-3 h-3" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl rounded-bl-xs px-3 py-2 shadow-2xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        id="btn-floating-support-chat"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Customer Support Chat"
        className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer relative"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </>
        )}
      </button>
    </div>
  );
};
