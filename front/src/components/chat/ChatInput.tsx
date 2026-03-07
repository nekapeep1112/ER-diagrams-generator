'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, ChevronDown } from 'lucide-react';
import type { SqlDialect } from '@/types';

interface ChatInputProps {
  onSendMessage: (message: string, sqlDialect: SqlDialect) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const SQL_DIALECTS: { value: SqlDialect; label: string }[] = [
  { value: 'PostgreSQL', label: 'PostgreSQL' },
  { value: 'MySQL', label: 'MySQL' },
  { value: 'SQLite', label: 'SQLite' },
  { value: 'SQL Server', label: 'SQL Server' },
  { value: 'Oracle', label: 'Oracle' },
];

export default function ChatInput({ onSendMessage, isLoading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [sqlDialect, setSqlDialect] = useState<SqlDialect>('PostgreSQL');
  const [showDialectSelect, setShowDialectSelect] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setShowDialectSelect(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim(), sqlDialect);
      setMessage('');
    }
  };

  return (
    <div className="pt-2 pb-4 px-4">
      <div
        onClick={() => textareaRef.current?.focus()}
        className="
          flex items-end gap-3 p-4 rounded-2xl cursor-pointer
          bg-gradient-to-r from-[#0f0f1a] to-[#1a1a2e]
          border border-[#1e1e2e]/50
          focus-within:border-cyan-500/30
          focus-within:shadow-[0_0_20px_rgba(6,182,212,0.15), 0_0_40px_rgba(6,182,212,0.2)]
          transition-all duration-300
          group-focus-within:scale-[1.02]
        ">
        <div className="flex-1 flex flex-col gap-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Опишите структуру базы данных..."
            disabled={disabled || isLoading}
            rows={1}
            className="
              flex-1 bg-transparent resize-none
              text-white placeholder-zinc-500 text-sm
              focus:outline-none
              disabled:opacity-50
              min-h-[24px] leading-relaxed
              overflow-y-auto
              [scrollbar-width:none]
              [-ms-overflow-style:none]
              [&::-webkit-scrollbar]:hidden
            "
          />
          {/* SQL Dialect selector */}
          <div className="flex items-center gap-2" ref={selectRef}>
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDialectSelect(!showDialectSelect);
                }}
                className="
                  flex items-center gap-1 px-2 py-1 rounded-md
                  bg-zinc-800/50 border border-zinc-700/50
                  text-xs text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30
                  transition-colors
                "
              >
                <span>{sqlDialect}</span>
                <ChevronDown size={12} className={`transition-transform ${showDialectSelect ? 'rotate-180' : ''}`} />
              </button>
              {showDialectSelect && (
                <div className="
                  absolute bottom-full left-0 mb-1 z-20
                  bg-[#1a1a2e] border border-[#1e1e2e] rounded-lg shadow-lg
                  overflow-hidden min-w-[120px]
                ">
                  {SQL_DIALECTS.map((dialect) => (
                    <button
                      key={dialect.value}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSqlDialect(dialect.value);
                        setShowDialectSelect(false);
                      }}
                      className={`
                        w-full px-3 py-2 text-left text-xs
                        transition-colors
                        ${sqlDialect === dialect.value
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                        }
                      `}
                    >
                      {dialect.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleSend}
          disabled={!message.trim() || isLoading || disabled}
          className={`
            p-2.5 rounded-xl transition-all duration-300 flex-shrink-0
            ${
              message.trim() && !isLoading
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'
                : 'bg-zinc-800/50 text-zinc-500'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
