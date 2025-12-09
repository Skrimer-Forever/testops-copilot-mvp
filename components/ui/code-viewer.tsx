"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, X, Terminal } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeViewerProps {
  code: string;
  language?: string;
  filename?: string;
  onClose: () => void;
}

export const CodeViewer = ({ code, language = "typescript", filename = "Component.tsx", onClose }: CodeViewerProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="flex flex-col w-full h-[85vh] bg-[#1e1e1e] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
    >
      {/* Шапка Artifact */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-slate-300">{filename}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded hover:bg-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Тело с кодом */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: "1.5rem", background: "transparent", fontSize: "14px" }}
          showLineNumbers={true}
          wrapLines={true}  
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </motion.div>
  );
};