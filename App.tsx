import React, { useState, useEffect, useRef } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { Workspace } from './components/Workspace';
import { Message } from './types';
import { generateEmailTemplateStream } from './services/geminiService';

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#131314;color:#e3e3e3;font-family:sans-serif;height:100vh;display:flex;align-items:center;justify-center;">
  <div style="text-align:center;padding:20px;">
    <h1 style="color:#a8c7fa;">Welcome to Matlance Email Builder</h1>
    <p>Describe the email you want to build in the chat.</p>
  </div>
</body>
</html>`;

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [htmlContent, setHtmlContent] = useState<string>(DEFAULT_HTML);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    // Attempt to retrieve from localStorage if running in a browser environment
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gemini_api_key') || '';
    }
    return '';
  });
  
  // Resizing Logic
  const [leftWidth, setLeftWidth] = useState(30); // Percentage
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Limits
    if (newLeftWidth > 20 && newLeftWidth < 60) {
      setLeftWidth(newLeftWidth);
    }
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handleSendMessage = async (text: string) => {
    // 1. Add User Message
    const userMsg: Message = { role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);

    let accumulatedRaw = "";

    try {
      // 2. Call Gemini
      // Pass current HTML if it's not the default placeholder, so Gemini can edit it
      const contextHtml = htmlContent === DEFAULT_HTML ? undefined : htmlContent;
      
      // Clear content to show live generation starting
      setHtmlContent("");

      // Pass the local API key state to the service
      const stream = generateEmailTemplateStream(text, contextHtml, apiKey);

      // 3. Process Stream
      for await (const chunk of stream) {
        accumulatedRaw += chunk;
        
        // Basic cleanup for display while streaming (removes opening markdown code blocks)
        // We don't remove the closing block yet as it might not be there
        const displayHtml = accumulatedRaw.replace(/^```html\s*/, '').replace(/^```\s*/, '');
        setHtmlContent(displayHtml);
      }

      // 4. Final Cleanup
      const finalHtml = accumulatedRaw.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
      setHtmlContent(finalHtml);

      // 5. Add AI Response
      const aiMsg: Message = { 
        role: 'model', 
        content: "I've generated the email template based on your request. You can view the code and preview in the workspace.", 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
       console.error(error);
       const errorMsg: Message = {
         role: 'model',
         content: error instanceof Error ? error.message : "I encountered an error generating the template. Please check your API key.",
         timestamp: Date.now()
       };
       setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#131314]" ref={containerRef}>
      
      {/* Left Panel: Chat */}
      <div style={{ width: `${leftWidth}%` }} className="h-full min-w-[300px]">
        <ChatInterface 
          messages={messages} 
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
        />
      </div>

      {/* Resizer Handle */}
      <div 
        onMouseDown={handleMouseDown}
        className="w-1 bg-[#282a2c] hover:bg-blue-500 cursor-col-resize transition-colors flex items-center justify-center z-50"
      >
        <div className="h-8 w-0.5 bg-gray-600 rounded"></div>
      </div>

      {/* Right Panel: Workspace */}
      <div style={{ width: `${100 - leftWidth}%` }} className="h-full min-w-[400px]">
        <Workspace htmlContent={htmlContent} />
      </div>

    </div>
  );
}

export default App;