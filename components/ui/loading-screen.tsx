"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import TextType from "@/components/ui/text-type";

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  
  // Автоматическое завершение загрузки через 4.5 секунды
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2300);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      // Анимация появления (снизу вверх)
      initial={{ y: "100%" }}
      animate={{ y: "0%" }}
      // Анимация исчезновения (улетает вверх)
      exit={{ y: "-100%" }}
      transition={{ 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1] // Плавная кривая
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white"
    >
      <div className="text-3xl md:text-5xl font-mono font-bold tracking-tighter">
        <TextType
          text={[
            "Инициализация TestOps...",
            "Подключение нейросетей...",
          ]}
          typingSpeed={40}
          deletingSpeed={20}
          pauseDuration={800}
          loop={false} // Не зацикливаем, просто проходим список
          cursorCharacter="█"
          cursorClassName="text-lime-500"
          textColors={["#a3a3a3", "#a3a3a3", "#a3a3a3", "#84cc16"]} // Последний цвет - лаймовый
        />
      </div>
    </motion.div>
  );
};