"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, ChevronDown } from "lucide-react";

interface UserMenuProps {
  username: string;
  onLogout: () => void;
}

export const UserMenu = ({ username, onLogout }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-[60]">
      {/* Кнопка профиля */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-700/50 text-slate-300 rounded-lg backdrop-blur-md transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-lime-500/20 flex items-center justify-center border border-lime-500/30">
          <User className="w-3.5 h-3.5 text-lime-400" />
        </div>
        <span className="text-sm font-medium max-w-[100px] truncate">{username}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </motion.button>

      {/* Выпадающее меню */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute top-full left-0 mt-2 w-48 bg-[#0f1117] border border-slate-800 rounded-xl shadow-xl overflow-hidden py-1"
          >
            <div className="px-4 py-2 border-b border-slate-800/50">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Аккаунт</p>
              <p className="text-sm text-slate-300 truncate">{username}</p>
            </div>
            
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Прозрачная подложка, чтобы закрыть меню при клике вне */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </div>
  );
};