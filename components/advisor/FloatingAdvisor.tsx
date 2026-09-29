"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Copy, ThumbsUp, ThumbsDown, Sparkles, AlertTriangle } from "lucide-react";
import { NBButton } from "../nb/NBButton";
import { MarkdownMessage } from "./MarkdownMessage";
import { generateClientAdvisorReply } from "@/lib/advisor/clientEngine";
import { useAttendanceStore } from "@/lib/store";

export interface MessageItem {
  id: string;
  sender: "user" | "advisor";
  text: string;
  resultCard?: any;
  timestamp: string;
}

export const FloatingAdvisor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "1",
      sender: "advisor",
      text: "Hello! I am your **Attendance Advisor** for SRM Trichy. Ask me any question regarding your safe bunk limits, upcoming classes, or leave scenarios.",
      timestamp: "Just now",
    },
  ]);
  const [hasWarning, setHasWarning] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setHasWarning(false);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const attendanceState = useAttendanceStore();

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: MessageItem = {
      id: Math.random().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (!res.ok) {
        throw new Error("API route unavailable");
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "advisor",
          text: data.reply,
          resultCard: data.resultCard,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      // Offline / Static GitHub Pages fallback
      const clientReply = generateClientAdvisorReply(query, attendanceState);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "advisor",
          text: clientReply.reply,
          resultCard: clientReply.resultCard,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const suggestedPrompts = [
    "📍 Heading to IST 509",
    "Call the Squad for free room",
    "Can I skip tomorrow?",
    "Which subject is most at risk?",
    "Find vacant room on Floor 4",
    "How many classes do I need for 90%?",
    "What if I take OD for 2 days?",
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 group">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-nb-yellow border-[3px] border-nb-ink shadow-[6px_6px_0px_#0A0A0A] flex items-center justify-center hover:-translate-x-1 hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all relative cursor-pointer"
            aria-label="Open Attendance Advisor chat"
          >
            <MessageSquare className="w-8 h-8 text-nb-ink" />

            {/* Red Notification Dot for warning */}
            {hasWarning && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-nb-red border-2 border-nb-ink rounded-full animate-ping" />
            )}
            {hasWarning && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-nb-red border-2 border-nb-ink rounded-full" />
            )}

            {/* Hover tooltip label */}
            <div className="absolute right-20 bg-white border-2 border-nb-ink shadow-[2px_2px_0px_#0A0A0A] px-2.5 py-1 font-heading uppercase text-xs font-black text-nb-ink whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              ASK ADVISOR ★
            </div>
          </button>
        )}
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[620px] z-50 bg-white border-[4px] border-nb-ink shadow-[10px_10px_0px_#0A0A0A] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="bg-nb-yellow border-b-[3px] border-nb-ink p-3.5 flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-nb-ink text-nb-yellow border-2 border-nb-ink flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-xs uppercase tracking-wider text-nb-ink leading-tight">
                  ATTENDANCE ADVISOR
                </h3>
                <span className="font-mono text-[10px] text-zinc-700 font-bold block">
                  CLAUDE ENGINE • SRM TRICHY EEE
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([messages[0]])}
                className="font-mono text-[10px] font-bold text-zinc-700 hover:text-nb-ink px-1.5 py-0.5 border border-nb-ink bg-white"
                title="Clear chat"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 bg-white text-nb-ink border-2 border-nb-ink shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-center font-mono font-black text-xs hover:bg-zinc-100"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages List with ARIA live support */}
          <div
            className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-50 font-mono text-xs"
            aria-live="polite"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 border-[2px] border-nb-ink ${
                    m.sender === "user"
                      ? "bg-nb-blue text-white shadow-[3px_3px_0px_#0A0A0A]"
                      : "bg-white text-nb-ink shadow-[4px_4px_0px_#0A0A0A]"
                  }`}
                >
                  <MarkdownMessage content={m.text} isUser={m.sender === "user"} />

                  {/* Structured Result Card */}
                  {m.resultCard && (
                    <div className="mt-3 p-2.5 bg-yellow-50 border-2 border-nb-ink text-nb-ink space-y-1">
                      <div className="font-heading font-black text-xs uppercase text-zinc-900">
                        {m.resultCard.title}
                      </div>
                      {m.resultCard.percentage !== undefined && (
                        <div className="text-[11px]">Standing: <strong>{m.resultCard.percentage}%</strong> ({m.resultCard.status})</div>
                      )}
                      {m.resultCard.mustAttend !== undefined && (
                        <div className="text-[11px] text-nb-red font-bold">Must Attend: {m.resultCard.mustAttend} classes</div>
                      )}
                      {m.resultCard.afterPct !== undefined && (
                        <div className="text-[11px]">After Leave: <strong>{m.resultCard.afterPct}%</strong> ({m.resultCard.delta}%)</div>
                      )}
                    </div>
                  )}

                  {m.sender === "advisor" && (
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-zinc-200 text-[10px] text-zinc-500">
                      <span>{m.timestamp}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopy(m.text)}
                          className="hover:text-nb-ink"
                          title="Copy text"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button className="hover:text-nb-ink" title="Helpful">
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button className="hover:text-nb-ink" title="Not helpful">
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white border-2 border-nb-ink shadow-[2px_2px_0px_#0A0A0A] w-fit font-mono text-xs">
                <Sparkles className="w-4 h-4 text-nb-yellow animate-spin" />
                <span>Advisor is executing calculations...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Chips */}
          <div className="p-2 bg-white border-t border-zinc-200 flex gap-1.5 overflow-x-auto select-none no-scrollbar">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="whitespace-nowrap font-mono text-[10px] font-bold bg-zinc-100 hover:bg-nb-yellow border border-nb-ink px-2 py-1 shadow-[1px_1px_0px_#0A0A0A] transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t-[3px] border-nb-ink space-y-2">
            <div className="flex items-center gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask e.g. 'Can I take OD for 2 days next week?'"
                className="flex-1 px-3 py-2 font-mono text-xs border-2 border-nb-ink shadow-[2px_2px_0px_#0A0A0A] focus:outline-none resize-none max-h-24"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="h-9 px-3.5 bg-nb-yellow text-nb-ink font-heading font-black text-xs uppercase border-2 border-nb-ink shadow-[2px_2px_0px_#0A0A0A] hover:bg-yellow-400 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[10px] font-mono text-zinc-500 text-center leading-tight">
              Estimates based on your entered data. Check the official portal for statutory records.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
