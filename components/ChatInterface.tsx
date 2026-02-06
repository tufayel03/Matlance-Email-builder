import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../types';
import { SparklesIcon, SendIcon, KeyIcon } from './Icons';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isGenerating: boolean;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  model: string;
  onModelChange: (model: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isGenerating,
  apiKey,
  onApiKeyChange,
  model,
  onModelChange
}) => {
  const [inputText, setInputText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputText]);

  // Check if the last message was an error to highlight settings
  const lastMessageIsError = messages.length > 0 && messages[messages.length - 1].role === 'model' && (
      messages[messages.length - 1].content.includes('API Key') || 
      messages[messages.length - 1].content.includes('Error')
  );

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim() && !isGenerating) {
      onSendMessage(inputText);
      setInputText('');
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1f20] text-gray-100">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-[#131314] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold text-xl">
            Matlance Email Builder
          </span>
          <SparklesIcon className="w-5 h-5 text-purple-400" />
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)} 
          className={`p-2 rounded-full transition-colors ${
            showSettings 
                ? 'text-blue-400 bg-[#282a2c]' 
                : lastMessageIsError && !apiKey
                    ? 'text-red-400 bg-red-900/20 animate-pulse'
                    : 'text-gray-400 hover:text-gray-200'
          }`}
          title="API Settings"
        >
          <KeyIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 py-3 bg-[#1e1f20] border-b border-gray-700 animate-in fade-in slide-in-from-top-2 space-y-3">
           <div>
               <label className="text-xs text-gray-400 mb-1.5 block uppercase tracking-wider font-semibold">Gemini API Key</label>
               <div className="relative">
                 <input
                   type="password"
                   value={apiKey}
                   onChange={(e) => onApiKeyChange(e.target.value)}
                   className="w-full bg-[#282a2c] text-white px-4 py-2 pr-10 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                   placeholder="Enter your API Key here..."
                 />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {apiKey ? <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> : <div className="w-2 h-2 bg-gray-600 rounded-full"></div>}
                 </div>
               </div>
               <p className="text-[10px] text-gray-500 mt-1">
                 Saved locally. <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Get a key</a>.
               </p>
           </div>
           
           <div>
               <label className="text-xs text-gray-400 mb-1.5 block uppercase tracking-wider font-semibold">Model</label>
               <select 
                value={model}
                onChange={(e) => onModelChange(e.target.value)}
                className="w-full bg-[#282a2c] text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm appearance-none"
               >
                   <option value="gemini-3-flash-preview">Gemini 3 Flash (Fast &amp; Reliable)</option>
                   <option value="gemini-3-pro-preview">Gemini 3 Pro (Complex Reasoning)</option>
               </select>
               <p className="text-[10px] text-gray-500 mt-1">
                 Use Flash for speed/quotas. Use Pro for complex layouts.
               </p>
           </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 opacity-60">
             <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <SparklesIcon className="w-8 h-8 text-blue-400" />
             </div>
             <p className="text-lg font-medium text-gray-300">How can I help you design your email?</p>
             <p className="text-sm mt-2 max-w-xs">Try "Create a welcome email for a tech SaaS" or "Design a newsletter with a dark theme".</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-[#282a2c] text-white rounded-br-none' 
                  : msg.content.includes('Error') || msg.content.includes('API Key')
                    ? 'bg-red-900/20 text-red-200 border border-red-800'
                    : 'bg-transparent text-gray-200'
              }`}
            >
               {msg.role === 'model' && (
                 <div className="mb-1 flex items-center gap-2 text-xs font-bold text-blue-400">
                   <SparklesIcon className="w-3 h-3" />
                   AI Architect
                 </div>
               )}
              {msg.content}
            </div>
          </div>
        ))}
        {isGenerating && (
           <div className="flex justify-start">
             <div className="bg-transparent px-5 py-3 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#1e1f20]">
        <form 
          onSubmit={handleSubmit}
          className="relative bg-[#282a2c] rounded-3xl border border-gray-600 focus-within:border-gray-400 transition-colors"
        >
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent text-white px-6 py-4 pr-12 rounded-3xl focus:outline-none placeholder-gray-500 resize-none max-h-[200px] overflow-y-auto block custom-scrollbar"
            placeholder="Describe your email template..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            rows={1}
            style={{ minHeight: '56px' }}
          />
          <button 
            type="button" 
            onClick={() => handleSubmit()}
            disabled={!inputText.trim() || isGenerating}
            className={`absolute right-2 bottom-2 p-2 rounded-full transition-colors ${
              inputText.trim() && !isGenerating 
                ? 'text-white bg-blue-600 hover:bg-blue-500' 
                : 'text-gray-500'
            }`}
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
        <div className="text-center mt-2 text-[10px] text-gray-500">
          Matlance Email Builder can make mistakes. Please check the code.
        </div>
      </div>
    </div>
  );
};