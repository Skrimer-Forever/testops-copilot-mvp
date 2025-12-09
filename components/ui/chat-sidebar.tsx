"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion"; // <-- Добавил AnimatePresence сюда
import { MessageSquare, Plus, PanelLeft, History } from "lucide-react";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  title: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  chats: Chat[];
  activeChatId?: string;
}

export const ChatSidebar = ({
  isOpen,
  onClose,
  onNewChat,
  onSelectChat,
  chats,
  activeChatId,
}: ChatSidebarProps) => {
  return (
    <>
      {/* Затемнение фона (Overlay) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? "0%" : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-full w-72 bg-[#0f1117] border-r border-slate-800 z-[70] flex flex-col shadow-2xl"
      >
        {/* Шапка сайдбара */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800/50">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <History className="w-5 h-5 text-lime-400" />
            <span>История</span>
          </div>
          
          {/* КНОПКА ЗАКРЫТИЯ */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Закрыть меню"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Кнопка Новый Чат */}
        <div className="p-4">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center gap-2 px-4 py-3 bg-lime-500/10 hover:bg-lime-500/20 text-lime-400 border border-lime-500/50 rounded-xl transition-all group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span className="font-medium">Новый чат</span>
          </button>
        </div>

        {/* Список чатов */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
          <div className="text-xs font-medium text-slate-500 px-4 mb-2 uppercase tracking-wider">
            Недавние
          </div>
          <div className="space-y-1">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => {
                    onSelectChat(chat.id);
                    if (window.innerWidth < 768) onClose();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors text-left",
                  activeChatId === chat.id
                    ? "bg-slate-800 text-white border border-slate-700"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                )}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{chat.title}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
};