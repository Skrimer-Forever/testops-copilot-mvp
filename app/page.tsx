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
import { ChevronDown, PanelLeft, Code2, Terminal } from "lucide-react";


// --- ТИПЫ ---
type CodeSnippet = {
  id: string;
  title: string;
  preview: string;
  fullCode: string;
  language: string;
};


type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  files?: File[];
  isStreaming?: boolean;
  codeSnippets?: CodeSnippet[];
  attachedCode?: string;
  attachedFileName?: string;
};


type ChatSession = {
  id: string;
  title: string;
};


type AppPhase = "auth" | "loading" | "app";


// --- ЭФФЕКТ ПЕЧАТНОЙ МАШИНКИ ---
const TypewriterEffect = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
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
  const [appPhase, setAppPhase] = useState<AppPhase>("auth");
  const [username, setUsername] = useState("User");
  const [userId, setUserId] = useState<number | null>(null);


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


  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.2); border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.4); }
      .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.2) transparent; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);


  const loadChats = async (uid: number) => {
    try {
      const res = await fetch(`/api/chats?userId=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data);
      }
    } catch (e) {
      console.error("Error loading chats", e);
    }
  };


  const loadMessages = async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}`);
      if (res.ok) {
        const dbMessages = await res.json();
        setMessages(
          dbMessages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            attachedCode: m.attachedCode || undefined,
            attachedFileName: m.attachedFileName || undefined,
          }))
        );
      }
    } catch (e) {
      console.error("Error loading messages", e);
    }
  };


  useEffect(() => {
    const savedUserStr = localStorage.getItem("testops_user");
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser && savedUser.id) {
          setUsername(savedUser.username);
          setUserId(savedUser.id);
          loadChats(savedUser.id);
          setAppPhase("app"); 
        }
      } catch (e) {
        localStorage.removeItem("testops_user");
      }
    }
  }, []);


  const handleLoginSuccess = (user: any) => {
    if (typeof user === "object" && user.id) {
      setUsername(user.username);
      setUserId(user.id);
      localStorage.setItem("testops_user", JSON.stringify(user));
      loadChats(user.id);
    } else {
      setUsername(typeof user === "string" ? user : "User");
    }
    setAppPhase("loading");
  };


  const handleLoadingComplete = () => {
    setAppPhase("app");
  };


  const handleLogout = () => {
    localStorage.removeItem("testops_user");
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
    setIsCodePanelOpen(false);
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


  const openCodeFromMessage = (code: string, filename: string) => {
    setCurrentCode(code);
    setCurrentFileName(filename);
    setIsCodePanelOpen(true);
  };


  // --- ЛОГИКА ОТПРАВКИ СООБЩЕНИЯ ---
  const handleSendMessage = async (
    content: string,
    files?: File[],
    mode?: "api-swagger" | "e2e-automation" | "ui-requirements" | "api-automation" | null
  ) => {
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


    let chatIdForSave = activeChatId;


    try {
      if (!chatIdForSave && userId !== null) {
        const title = content.slice(0, 30);
        const res = await fetch("/api/chats", {
          method: "POST",
          body: JSON.stringify({ userId, title }),
        });
        if (res.ok) {
          const newChat = await res.json();
          chatIdForSave = newChat.id;
          setActiveChatId(newChat.id);
          setChatHistory((prev) => [newChat, ...prev]);
        }
      }


      if (chatIdForSave) {
        await fetch(`/api/chats/${chatIdForSave}`, {
          method: "POST",
          body: JSON.stringify({ role: "user", content: content }),
        });
      }


      // --- НАСТРОЙКА API ENDPOINT ---
      let apiEndpoint = "/api/proxy/chat"; // По умолчанию - обычный чат с LLM
      
      const urlRegex = /https?:\/\/[^\s]+/g;
      const foundUrls = content.match(urlRegex);
      const targetBaseUrl = foundUrls ? foundUrls[0] : null;


      let requestBody: any = {
        messages: [{ role: "user", content: content }],
        model: "deepseek-chat",
        temperature: 0.7,
      };


      if (mode === "api-swagger") {
        apiEndpoint = "/api/proxy/api-swagger";
        requestBody = {
          swagger_url: content.includes("http") ? content.trim() : null,
          swagger_json: !content.includes("http") ? content : null,
        };
      } else if (mode === "e2e-automation") {
        apiEndpoint = "/api/proxy/e2e-automation";
        requestBody = {
          base_url: targetBaseUrl || "https://example.com",
          name: "Auto-generated Suite",
          cases: [
            {
              id: "temp-1",
              title: "User Scenario",
              description: content,
              steps: [],
              expected_result: "Success",
              priority: "HIGH",
              tags: ["e2e", "auto"],
            },
          ],
        };
      } else if (mode === "api-automation") {
        apiEndpoint = "/api/proxy/api-automation";
        
        // Извлекаем URL из текста
        const swaggerUrlMatch = content.match(urlRegex);
        const swaggerUrl = swaggerUrlMatch ? swaggerUrlMatch[0] : content.trim();
        
        requestBody = {
          name: "API Automation Suite",
          cases: [
            {
              id: "api-auto-1",
              title: "Swagger API Tests",
              description: `Generate pytest tests from Swagger`,
              steps: [],
              expected_result: "API tests generated successfully",
              priority: "HIGH",
              tags: ["api", "pytest", "swagger"]
            }
          ],
          swagger_url: swaggerUrl.startsWith('http') ? swaggerUrl : null
        };
      }
      


      console.log(`>>> Calling API [${mode || "chat"}]:`, apiEndpoint);
      
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });


      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error (${apiEndpoint}): ${response.status} ${errorText}`);
      }


      const data = await response.json();
      console.log(">>> RESPONSE DATA:", data);


      let replyText = "✅ Результат:";
      let snippets: CodeSnippet[] = [];
      let hasCode = false;


      // --- ОБРАБОТКА ОБЫЧНОГО ЧАТА (LLM) ---
      if (!mode) {
        // Поддержка разных форматов ответа от LLM
        if (data.choices && data.choices[0]?.message?.content) {
          replyText = data.choices[0].message.content;
        } else if (data.message) {
          replyText = data.message;
        } else if (data.content) {
          replyText = data.content;
        } else if (typeof data === 'string') {
          replyText = data;
        }
      }
      
      // --- ЛОГИКА РАЗБИЕНИЯ ALLURE CODE (ОДНА СТРОКА -> МНОГО ФАЙЛОВ) ---
      else if (data.allure_code) {
          const fullCode = data.allure_code.replace(/\\n/g, "\n");
          
          const lines = fullCode.split('\n');
          const imports = lines.filter((l: string) => l.trim().startsWith('import') || l.trim().startsWith('from')).join('\n');
          
          const rawParts = fullCode.split(/\n(?=class\s+Test)/g);

          if (rawParts.length > 1) {
              replyText = `✅ Сгенерировано ${data.test_count || rawParts.length - 1} тестов (Allure).`;
              
              rawParts.forEach((part: string, index: number) => {
                  if (!part.includes("class Test") && !part.includes("def test_")) return;

                  const snippetCode = (part.includes("import ") ? "" : imports + "\n\n") + part.trim();
                  
                  const nameMatch = part.match(/class\s+(Test[A-Za-z0-9_]+)/);
                  const fileName = nameMatch ? `${nameMatch[1]}.py` : `test_scenario_${index}.py`;

                  snippets.push({
                      id: `snippet-allure-${Date.now()}-${index}`,
                      title: fileName,
                      preview: snippetCode.split('\n').slice(0, 8).join('\n') + "\n...",
                      fullCode: snippetCode,
                      language: "python"
                  });
              });
              hasCode = true;
          } 
          else {
              replyText = `✅ Сгенерировано ${data.test_count || 1} тестов.`;
              snippets.push({
                  id: `snippet-allure-full-${Date.now()}`,
                  title: data.suite_name ? `${data.suite_name.replace(/\s+/g, '_')}.py` : "full_test_suite.py",
                  preview: fullCode.split('\n').slice(0, 10).join('\n') + "\n...",
                  fullCode: fullCode,
                  language: "python"
              });
              hasCode = true;
          }
      }
      
      else if (data.test_files || data.files || (Array.isArray(data))) {
          const filesArray = data.test_files || data.files || data;
          if (Array.isArray(filesArray)) {
              replyText = `✅ Сгенерировано ${filesArray.length} файлов.`;
              snippets = filesArray.map((file: any, index: number) => ({
                 id: `snippet-${Date.now()}-${index}`,
                 title: file.filename || `file_${index + 1}.py`,
                 preview: file.code ? (file.code.split('\n').slice(0, 5).join('\n') + "\n...") : "No code",
                 fullCode: file.code || "",
                 language: "python"
              }));
              hasCode = true;
          }
      }

      else if (data.pytest_code) {
          replyText = "✅ Pytest автотесты сгенерированы.";
          const code = data.pytest_code.replace(/\\n/g, "\n");
          snippets.push({
             id: `snippet-${Date.now()}`,
             title: "test_api_automation.py",
             preview: code.split('\n').slice(0, 5).join('\n') + "\n...",
             fullCode: code,
             language: "python"
          });
          hasCode = true;
      }
      else if (mode === "api-swagger" || data.test_suite) {
         replyText = `✅ API тесты из Swagger обработаны.`;
         const code = JSON.stringify(data, null, 2);
         snippets.push({
            id: `snippet-swagger-${Date.now()}`,
            title: "api_tests_swagger.json",
            preview: code.split('\n').slice(0, 10).join('\n') + "\n...",
            fullCode: code,
            language: "json"
         });
         hasCode = true;
      }
      else if (data.test_cases || data.covered_features) {
         const cases = data.test_cases || data.covered_features;
         replyText = `✅ Сгенерировано ${Array.isArray(cases) ? cases.length : 0} тест-кейсов.`;
         const code = JSON.stringify(cases, null, 2);
         snippets.push({
            id: `snippet-cases-${Date.now()}`,
            title: "manual_test_cases.json",
            preview: code.split('\n').slice(0, 10).join('\n') + "\n...",
            fullCode: code,
            language: "json"
         });
         hasCode = true;
      }


      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: replyText,
        isStreaming: false,
        codeSnippets: hasCode ? snippets : undefined,
        attachedCode: hasCode && snippets.length > 0 ? snippets[0].fullCode : undefined,
        attachedFileName: hasCode && snippets.length > 0 ? snippets[0].title : undefined,
      };


      setMessages((prev) => [...prev, aiMessage]);


      if (chatIdForSave) {
        await fetch(`/api/chats/${chatIdForSave}`, {
          method: "POST",
          body: JSON.stringify({
            role: "assistant",
            content: replyText,
            attachedCode: hasCode && snippets.length > 0 ? snippets[0].fullCode : null,
            attachedFileName: hasCode && snippets.length > 0 ? snippets[0].title : null,
          }),
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


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isChatStarted, isThinking]);


  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <AnimatePresence initial={false}>
        {appPhase === "auth" && (
          <motion.div
            key="auth"
            className="absolute inset-0 z-20 bg-black"
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
        <LampContainer className="bg-black">
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


            {currentCode && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCodePanelOpen(!isCodePanelOpen)}
                className={cn(
                  "p-2 border rounded-lg backdrop-blur-md transition-colors",
                  isCodePanelOpen
                    ? "bg-slate-800 border-slate-600 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                    : "bg-slate-900/50 hover:bg-slate-800 border-slate-700/50 text-slate-300"
                )}
              >
                <Code2 className="w-6 h-6" />
              </motion.button>
            )}


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
                    className="absolute top-4 right-16 z-50 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
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
                        className={cn(
                          "flex w-full",
                          msg.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] px-5 py-3 rounded-2xl text-base leading-relaxed shadow-sm relative group",
                            msg.role === "user"
                              ? "bg-[#1e40af]/30 text-blue-100 border border-blue-500/20 rounded-br-none"
                              : "bg-slate-900/60 text-slate-200 border border-slate-700/50 rounded-bl-none overflow-x-auto"
                          )}
                        >
                          {msg.role === "assistant" && msg.isStreaming ? (
                            <TypewriterEffect text={msg.content} />
                          ) : (
                            <div className="flex flex-col gap-4 w-full">
                              <span className="whitespace-pre-wrap">{msg.content}</span>


                              {msg.codeSnippets && msg.codeSnippets.length > 0 && (
                                <div className="flex flex-col gap-3 w-full">
                                  {msg.codeSnippets.map((snippet) => (
                                    <div 
                                      key={snippet.id} 
                                      className="bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden w-full transition-colors hover:border-slate-700"
                                    >
                                      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800">
                                        <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                                          <Code2 className="w-4 h-4 text-sky-500" />
                                          <span className="truncate">{snippet.title}</span>
                                        </div>
                                        <span className="text-xs text-slate-500 uppercase">{snippet.language}</span>
                                      </div>
                                      <div className="p-4 bg-slate-950/30 text-xs font-mono text-slate-400 overflow-hidden relative font-medium">
                                        <pre style={{ margin: 0 }}>
                                          {snippet.preview}
                                        </pre>
                                        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-slate-950/50 to-transparent pointer-events-none" />
                                      </div>
                                      <div className="px-4 py-2 bg-slate-900/40 border-t border-slate-800 flex justify-end">
                                        <button
                                          onClick={() => openCodeFromMessage(snippet.fullCode, snippet.title)}
                                          className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 text-sky-400 text-xs font-medium rounded-lg transition-colors"
                                        >
                                          <PanelLeft className="w-3 h-3" />
                                          Развернуть
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}


                              {!msg.codeSnippets && msg.attachedCode && (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() =>
                                    openCodeFromMessage(
                                      msg.attachedCode!,
                                      msg.attachedFileName || "code"
                                    )
                                  }
                                  className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-sky-400 transition-colors w-fit"
                                >
                                  <Terminal className="w-4 h-4" />
                                  <span>Открыть {msg.attachedFileName || "код"}</span>
                                </motion.button>
                              )}
                            </div>
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
                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/60 border border-lime-500/20 rounded-2xl rounded-bl-none backdrop-blur-sm shadow-[0_0_15px_-5px_rgba(132,204,22,0.3)]">
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


                <motion.div layout="position" className="w-full" onClickCapture={handleOpenChat}>
                  <PromptInputBox
                    onSend={handleSendMessage}
                    isLoading={isThinking}
                    placeholder={
                      isCodePanelOpen ? "Обсудить код..." : "Спроси меня о чем угодно..."
                    }
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
