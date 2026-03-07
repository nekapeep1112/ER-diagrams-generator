'use client';

import { useEffect, useRef, useState } from 'react';
import { Database, Sparkles, Copy, Check, Code } from 'lucide-react';
import type { Message } from '@/types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4">
          <Database size={32} className="text-cyan-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">
          ER Database Generator
        </h3>
        <p className="text-sm text-zinc-400 max-w-xs">
          Опишите структуру базы данных на естественном языке, и AI создаст для вас ER-диаграмму и SQL код
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : ''}`}
        >
          <div
            className={`
              max-w-[95%] px-4 py-2.5 rounded-2xl
              ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/10 border border-purple-500/20'
                  : 'bg-transparent'
              }
            `}
          >
            <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>

            {/* SQL Code Block */}
            {message.sql && (
              <div className="mt-3 rounded-lg overflow-hidden border border-zinc-700/50 bg-[#0d0d14]">
                <div className="flex items-center justify-between px-3 py-2 bg-zinc-800/50 border-b border-zinc-700/50">
                  <div className="flex items-center gap-2">
                    <Code size={14} className="text-cyan-400" />
                    <span className="text-xs text-zinc-400 font-medium">SQL</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(message.sql!, message.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-zinc-400 hover:text-cyan-400 hover:bg-zinc-700/50 transition-colors"
                  >
                    {copiedId === message.id ? (
                      <>
                        <Check size={12} className="text-green-400" />
                        <span className="text-green-400">Скопировано</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Копировать</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 overflow-x-auto text-xs text-zinc-300 font-mono leading-relaxed max-h-60 overflow-y-auto">
                  <code>{message.sql}</code>
                </pre>
              </div>
            )}

            {message.er_data && (
              <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center gap-1.5">
                <Sparkles size={12} className="text-cyan-400" />
                <span className="text-xs text-cyan-400">ER-диаграмма обновлена</span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex">
          <div className="bg-zinc-900/50 border border-zinc-800/50 px-4 py-2.5 rounded-2xl">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-zinc-400">Генерация...</span>
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
