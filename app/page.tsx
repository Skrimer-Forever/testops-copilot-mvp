"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { CodeViewer } from "@/components/ui/code-viewer";
import { ThinkingPlanet } from "@/components/ui/thinking-planet";
import { BackgroundShader } from "@/components/ui/background-shader";
import { ChatSidebar } from "@/components/ui/chat-sidebar";
import { AuthScreen } from "@/components/ui/auth-screen";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { UserMenu } from "@/components/ui/user-menu";
import { cn } from "@/lib/utils";
import { ChevronDown, PanelLeft } from "lucide-react";

// --- ТИПЫ ---
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  files?: File[];
  isStreaming?: boolean;
};

type ChatSession = {
  id: string;
  title: string;
};

type AppPhase = "auth" | "loading" | "app";

// --- ЭФФЕКТ ПЕЧАТНОЙ МАШИНКИ ---
const TypewriterEffect = ({ text, onComplete }: { text: string, onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const speed = 10;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, onComplete]);
  return <span className="whitespace-pre-wrap">{displayedText}</span>;
};

// --- ОСНОВНОЙ КОМПОНЕНТ ---
export default function Home() {
  // --- СОСТОЯНИЯ ПРИЛОЖЕНИЯ ---
  const [appPhase, setAppPhase] = useState<AppPhase>("auth");
  const [username, setUsername] = useState("User");
  const [userId, setUserId] = useState<number | null>(null);

  // --- СОСТОЯНИЯ ЧАТА ---
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [isCodePanelOpen, setIsCodePanelOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);

  const [currentCode, setCurrentCode] = useState("");
  const [currentFileName, setCurrentFileName] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- API ФУНКЦИИ ---
  const loadChats = async (uid: number) => {
    try {
      const res = await fetch(`/api/chats?userId=${uid}`);
      if (res.ok) setChatHistory(await res.json());
    } catch (e) { console.error("Error loading chats", e); }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}`);
      if (res.ok) {
        const dbMessages = await res.json();
        setMessages(dbMessages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content
        })));
      }
    } catch (e) { console.error("Error loading messages", e); }
  };

  // --- ЛОГИКА ФАЗ И АВТОРИЗАЦИИ ---

  const handleLoginSuccess = (user: any) => {
    if (typeof user === 'object' && user.id) {
        setUsername(user.username);
        setUserId(user.id);
        loadChats(user.id);
    } else {
        setUsername(typeof user === 'string' ? user : 'User');
    }
    setAppPhase("loading");
  };

  const handleLoadingComplete = () => {
    setAppPhase("app");
  };

  const handleLogout = () => {
    setIsChatStarted(false);
    setIsCodePanelOpen(false);
    setMessages([]);
    setCurrentCode("");
    setActiveChatId(undefined);
    setIsThinking(false);
    setIsSidebarOpen(false);
    setUserId(null);
    setAppPhase("auth");
  };

  const handleNewChat = () => {
    setIsChatStarted(false);
    setIsCodePanelOpen(false);
    setMessages([]);
    setCurrentCode("");
    setActiveChatId(undefined);
    setIsThinking(false);
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setIsChatStarted(true);
    setMessages([]); 
    loadMessages(id);
    setIsSidebarOpen(false);
  };

  const handleCloseChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsChatStarted(false);
    setIsCodePanelOpen(false);
  };

  const handleOpenChat = () => {
    if (!isChatStarted && messages.length > 0) {
      setIsChatStarted(true);
    }
  };

  // --- ЛОГИКА ОТПРАВКИ СООБЩЕНИЯ (ИНТЕГРАЦИЯ С БЭКОМ И ИСТОРИЕЙ) ---
  // --- ЛОГИКА ОТПРАВКИ СООБЩЕНИЯ (ИСПРАВЛЕННАЯ) ---
  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!content.trim() && (!files || files.length === 0)) return;
    if (!isChatStarted) setIsChatStarted(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      files,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    // Локальная переменная для ID чата, чтобы не зависеть от асинхронного стейта
    let chatIdForSave = activeChatId;

    try {
      // 1. Создаем чат, если его нет
      if (!chatIdForSave && userId !== null) {
          const title = content.slice(0, 30);
          const res = await fetch('/api/chats', {
              method: 'POST',
              body: JSON.stringify({ userId, title })
          });
          
          if (res.ok) {
              const newChat = await res.json();
              chatIdForSave = newChat.id; // Запоминаем ID!
              
              // Обновляем UI
              setActiveChatId(newChat.id);
              setChatHistory(prev => [newChat, ...prev]);
          }
      }

      // 2. СОХРАНЯЕМ СООБЩЕНИЕ ЮЗЕРА (теперь точно есть ID)
      if (chatIdForSave) {
          await fetch(`/api/chats/${chatIdForSave}`, {
            method: 'POST',
            body: JSON.stringify({ role: 'user', content: content })
          });
      }

      // 3. Генерация ответа
      const response = await fetch("/api/generation/ui/full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: null,
          html: null,
          requirements_text: content, 
        }),
      });

      if (!response.ok) {
         const errorText = await response.text();
         throw new Error(`Server Error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const formattedJson = JSON.stringify(data, null, 2);
      
      let replyText = "Генерация завершена. Результат:";
      if (data.test_cases && Array.isArray(data.test_cases)) {
          replyText = `Сгенерировано ${data.test_cases.length} тест-кейсов.`;
      }
      
      const fullAiContent = `${replyText}\n\n\`\`\`json\n${formattedJson}\n\`\`\``;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fullAiContent,
        isStreaming: false, 
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setCurrentCode(formattedJson);
      setCurrentFileName("generated_tests.json");
      setIsCodePanelOpen(true);

      // 4. СОХРАНЯЕМ ОТВЕТ БОТА
      if (chatIdForSave) {
          await fetch(`/api/chats/${chatIdForSave}`, {
            method: 'POST',
            body: JSON.stringify({ role: 'assistant', content: fullAiContent })
          });
      }

    } catch (error: any) {
      console.error("Error in chat flow:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ Ошибка: ${error.message}`,
        isStreaming: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  // --- АВТОСКРОЛЛ ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isChatStarted, isThinking]);

  // --- РЕНДЕР ---
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <AnimatePresence initial={false}>
        {appPhase === "auth" && (
          <motion.div 
            key="auth" 
            className="absolute inset-0 z-20"
            transition={{ duration: 0.5 }}
          >
            <AuthScreen onLoginSuccess={handleLoginSuccess} />
          </motion.div>
        )}

        {appPhase === "loading" && (
          <LoadingScreen key="loading" onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>
      {appPhase === "app" && (
        <LampContainer>
          <BackgroundShader />

          <ChatSidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            chats={chatHistory}
            activeChatId={activeChatId}
          />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="fixed top-6 left-6 z-[60] flex items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-700/50 text-slate-300 rounded-lg backdrop-blur-md transition-colors"
            >
              <PanelLeft className="w-6 h-6" />
            </motion.button>

            <UserMenu username={username} onLogout={handleLogout} />
          </motion.div>

          <div className="flex flex-col items-center w-full h-full relative z-50">
            
            <AnimatePresence>
              {!isChatStarted && (
                <motion.div
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute top-1/2 -translate-y-80 z-10 flex justify-center w-full"
                >
                  <h1 className="bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
                    TestOps <br /> Assistant
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div 
              layout
              className={cn(
                "flex w-full gap-4 px-4 transition-none",
                isChatStarted 
                  ? "h-[85vh] my-auto items-center justify-center" 
                  : "h-full items-end justify-center pb-4"
              )}
            >
              
              <motion.div
                layout="position"
                transition={{ type: "spring", damping: 25, stiffness: 120 }}
                className={cn(
                  "flex flex-col items-center justify-end relative z-20 rounded-3xl overflow-hidden",
                  isChatStarted 
                    ? cn(
                        "bg-slate-950/50 border border-slate-800 p-4 backdrop-blur-sm shadow-2xl h-full",
                        isCodePanelOpen ? "w-[50%]" : "w-full max-w-4xl"
                      )
                    : "w-full max-w-5xl h-auto bg-transparent border-transparent mb-12"
                )}
              >
                {isChatStarted && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={handleCloseChat}
                      className="absolute top-4 right-4 z-50 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.button>
                )}

                {isChatStarted && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    ref={scrollRef}
                    className="flex-1 w-full overflow-y-auto overflow-x-hidden mb-4 p-4 rounded-xl custom-scrollbar space-y-6"
                  >
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}
                      >
                        <div className={cn(
                          "max-w-[85%] px-5 py-3 rounded-2xl text-base leading-relaxed shadow-sm",
                          msg.role === "user"
                            ? "bg-[#1e40af]/30 text-blue-100 border border-blue-500/20 rounded-br-none"
                            : "bg-[#1e293b]/60 text-slate-200 border border-slate-700/50 rounded-bl-none overflow-x-auto" 
                        )}>
                          {msg.role === "assistant" && msg.isStreaming ? (
                            <TypewriterEffect text={msg.content} />
                          ) : (
                            <span className="whitespace-pre-wrap">{msg.content}</span>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {isThinking && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="flex w-full justify-start"
                      >
                          <div className="flex items-center gap-2 px-4 py-3 bg-[#1e293b]/60 border border-lime-500/20 rounded-2xl rounded-bl-none backdrop-blur-sm shadow-[0_0_15px_-5px_rgba(132,204,22,0.3)]">
                            <motion.span 
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              className="text-sm font-medium text-lime-400 tracking-wide"
                            >
                              Думаю...
                            </motion.span>
                            <div className="h-8 w-8 relative flex-shrink-0">
                                <ThinkingPlanet className="w-full h-full" />
                            </div>
                          </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                <motion.div 
                  layout="position" 
                  className="w-full"
                  onClickCapture={handleOpenChat} 
                >
                  <PromptInputBox 
                    onSend={handleSendMessage}
                    isLoading={isThinking}
                    placeholder={isCodePanelOpen ? "Обсудить код..." : "Спроси меня о чем угодно..."}
                    className={cn(
                      isChatStarted 
                        ? "border-slate-700 shadow-none bg-slate-900/50" 
                        : "bg-slate-950/30 backdrop-blur-md border-slate-700/30 shadow-2xl hover:bg-slate-950/50 transition-colors"
                    )}
                  />
                </motion.div>
              </motion.div>

              <AnimatePresence mode="popLayout">
                {isChatStarted && isCodePanelOpen && (
                  <motion.div
                    initial={{ opacity: 0, width: 0, x: 20 }}
                    animate={{ opacity: 1, width: "50%", x: 0 }}
                    exit={{ opacity: 0, width: 0, x: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 120 }}
                    className="h-full flex-shrink-0"
                  >
                    <CodeViewer 
                      code={currentCode} 
                      filename={currentFileName}
                      onClose={() => setIsCodePanelOpen(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </div>
        </LampContainer>
      )}
    </div>
  );
}
