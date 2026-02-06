import React, { useState } from 'react';
import { ViewMode } from '../types';
import { CodeIcon, EyeIcon, ColumnsIcon, CopyIcon } from './Icons';

interface WorkspaceProps {
  htmlContent: string;
}

export const Workspace: React.FC<WorkspaceProps> = ({ htmlContent }) => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SPLIT);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const CodeView = () => (
    <div className="h-full flex flex-col bg-[#131314]">
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700 bg-[#1e1f20]">
        <span className="text-xs font-mono text-gray-400">index.html</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          <CopyIcon className="w-3 h-3" />
          {copyFeedback ? 'Copied!' : 'Copy HTML'}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-all">
          {htmlContent || "<!-- Generated code will appear here -->"}
        </pre>
      </div>
    </div>
  );

  const PreviewView = () => (
     <div className="h-full flex flex-col bg-white">
        {/* Browser Mockup Bar */}
        <div className="px-4 py-2 bg-gray-100 border-b border-gray-300 flex items-center gap-2">
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 text-center">
                <div className="bg-white rounded px-2 py-0.5 text-[10px] text-gray-500 inline-block border border-gray-200">
                    email-preview.html
                </div>
            </div>
        </div>
        <div className="flex-1 relative bg-gray-200 overflow-hidden">
             {htmlContent ? (
                <iframe 
                title="Email Preview"
                srcDoc={htmlContent}
                className="w-full h-full border-none bg-white mx-auto shadow-lg"
                style={{ maxWidth: '100%' }} // Allow full width, let email internal max-width handle it
                sandbox="allow-same-origin"
                />
             ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <p>No template generated yet.</p>
                </div>
             )}
        </div>
     </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-12 bg-[#1e1f20] border-b border-gray-700 flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold text-gray-300">Workspace</h2>
        
        <div className="flex bg-[#282a2c] rounded-lg p-1">
            <button 
                onClick={() => setViewMode(ViewMode.PREVIEW)}
                className={`p-1.5 rounded ${viewMode === ViewMode.PREVIEW ? 'bg-[#3c4043] text-white' : 'text-gray-400 hover:text-gray-200'}`}
                title="Preview Only"
            >
                <EyeIcon className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setViewMode(ViewMode.SPLIT)}
                className={`p-1.5 rounded ${viewMode === ViewMode.SPLIT ? 'bg-[#3c4043] text-white' : 'text-gray-400 hover:text-gray-200'}`}
                title="Split View"
            >
                <ColumnsIcon className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setViewMode(ViewMode.CODE)}
                className={`p-1.5 rounded ${viewMode === ViewMode.CODE ? 'bg-[#3c4043] text-white' : 'text-gray-400 hover:text-gray-200'}`}
                title="Code Only"
            >
                <CodeIcon className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
         {viewMode === ViewMode.PREVIEW && <PreviewView />}
         {viewMode === ViewMode.CODE && <CodeView />}
         {viewMode === ViewMode.SPLIT && (
             <div className="flex h-full w-full">
                 <div className="w-1/2 h-full border-r border-gray-700">
                    <PreviewView />
                 </div>
                 <div className="w-1/2 h-full">
                    <CodeView />
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};