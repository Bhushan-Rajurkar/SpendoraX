import { useState, useEffect, useRef } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Maximize2,
  Minimize2,
  Coffee,
  Bus,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";
import { generateFinancialChatResponse } from "../util/taskAdvisorEngine";
import { useNavigate } from "react-router-dom";

const ChatbotWidget = ({
  totalBalance = 0,
  totalIncome = 0,
  totalExpense = 0,
  expenses = [],
  tasks = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "👋 Hi! I am your **Financial AI Coach**.\nI analyze your expenses to help you cut unnecessary spendings (like coffee and daily cabs) and complete your **20 Weekly Gamified Tasks**!\n\nHow can I help you today?",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botReply = generateFinancialChatResponse(query, {
        totalBalance,
        totalIncome,
        totalExpense,
        expenses,
        tasks,
      });

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botReply,
        time: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const quickPrompts = [
    { label: "Analyze my spendings", icon: TrendingDown },
    { label: "Tips to cut down on coffee", icon: Coffee },
    { label: "Save on commute & cabs", icon: Bus },
    { label: "Show weekly tasks progress", icon: CheckCircle2 },
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 group transition-all duration-200 active:scale-95"
          title="Open Financial AI Coach"
        >
          <div className="relative">
            <Bot size={24} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-purple-700 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-purple-700 rounded-full" />
          </div>
          <span className="hidden md:inline text-xs font-semibold tracking-wide pr-1">
            AI Coach
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white shadow-2xl rounded-3xl border border-gray-200/80 flex flex-col overflow-hidden transition-all duration-200 ${
            isExpanded
              ? "inset-4 sm:inset-10"
              : "bottom-5 right-5 w-[92vw] sm:w-[410px] h-[550px] max-h-[88vh]"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Bot size={20} className="text-purple-200" />
              </div>
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  Financial AI Coach <Sparkles size={14} className="text-amber-300" />
                </h4>
                <p className="text-[11px] text-purple-200/80">
                  Habit & Task Optimization Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/80">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 text-xs sm:text-sm">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed whitespace-pre-wrap ${
                    m.sender === "user"
                      ? "bg-purple-700 text-white rounded-br-none shadow-sm"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-xs"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl p-3 rounded-bl-none flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
                  <span
                    className="w-2 h-2 rounded-full bg-purple-600 animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-purple-600 animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  />
                  <span className="ml-1 text-gray-400">AI Coach is analyzing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-2.5 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.label)}
                className="shrink-0 flex items-center gap-1 text-[11px] font-medium bg-gray-100 hover:bg-purple-50 hover:text-purple-700 text-gray-700 px-2.5 py-1.5 rounded-full transition-colors border border-transparent hover:border-purple-200"
              >
                <p.icon size={12} />
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Ask about coffee habits, commute, or tasks..."
              className="flex-1 bg-gray-100 border border-transparent focus:border-purple-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="p-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
              title="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
