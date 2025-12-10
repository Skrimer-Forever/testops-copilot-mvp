"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight, User, Mail, Lock, Fingerprint } from "lucide-react";
import { AuthBackground } from "@/components/ui/auth-background";

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
}

export const AuthScreen = ({ onLoginSuccess }: AuthScreenProps) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const endpoint = mode === "login" ? "/api/login" : "/api/register";
    
    // Формируем payload
    const body: any = { email, password };
    if (mode === "register") {
      body.username = username;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Ошибка при авторизации");
      }
      const userDisplay = data.user?.username || data.user?.email || "User";
      onLoginSuccess(userDisplay);
      if (data.user) {
        onLoginSuccess(data.user); 
    } else {
        // Фоллбэк
        onLoginSuccess({ username: userDisplay, id: 0 }); 
    }

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-black text-white overflow-hidden">
      <AuthBackground />
      <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />

      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          layout: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.5 }
        }}
        className="w-full max-w-md relative z-10 p-4"
      >
        <div className="bg-slate-950/30 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-lime-500 rounded-b-full blur-[2px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-lime-500/10 blur-3xl rounded-full" />

          <motion.div layout className="text-center mb-8 relative z-10">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent mb-2">
              TestOps Assistant
            </h1>
            <motion.p 
              key={mode}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-slate-400 text-sm"
            >
              {mode === "login" ? "Добро пожаловать обратно" : "Создайте аккаунт для начала работы"}
            </motion.p>
          </motion.div>

          <motion.div layout className="flex bg-slate-900/40 p-1 rounded-xl mb-6 border border-white/5 relative z-10">
            <button
              onClick={() => { setMode("login"); setError(null); }}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                mode === "login" ? "bg-slate-800/80 text-white shadow-sm border border-white/10" : "text-slate-400 hover:text-white"
              )}
            >
              Вход
            </button>
            <button
              onClick={() => { setMode("register"); setError(null); }}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                mode === "register" ? "bg-slate-800/80 text-white shadow-sm border border-white/10" : "text-slate-400 hover:text-white"
              )}
            >
              Регистрация
            </button>
          </motion.div>

          {/* Блок ошибки */}
          <AnimatePresence>
            {error && (
              <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <AnimatePresence initial={false}>
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30, opacity: { duration: 0.2 } }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1 pt-1"> 
                    <label className="text-xs font-medium text-slate-400 ml-1">Имя пользователя</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-lime-400 transition-colors" />
                      <input
                        type="text"
                        required={mode === "register"}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="username"
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-10 py-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/50 transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div layout className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 ml-1">
                  {mode === "login" ? "Email" : "Email"}
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-lime-400 transition-colors" />
                  <input
                    type="email" // Важно: type="email" для валидации браузером
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-10 py-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 ml-1">Пароль</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-lime-400 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-10 py-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/50 transition-all"
                  />
                </div>
              </div>
            </motion.div>

            <motion.button
              layout
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-gradient-to-r from-lime-600 to-lime-500 hover:from-lime-500 hover:to-lime-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(132,204,22,0.4)] hover:shadow-[0_0_25px_-5px_rgba(132,204,22,0.6)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Войти" : "Создать аккаунт"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <motion.div layout className="mt-6 text-center">
            <p className="text-xs text-slate-600 flex items-center justify-center gap-1">
              <Fingerprint className="w-3 h-3" />
              Secured by TestOps Security
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
