import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink, MousePointerClick, Copy } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const storedKey = localStorage.getItem('GEMINI_API_KEY');
    if (storedKey) setApiKey(storedKey);
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <Key className="w-5 h-5 text-indigo-600" />
            API Key Settings
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">How to get your free Gemini API Key:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Step 1 */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-medium text-slate-800 mb-1">1. Go to AI Studio</h4>
                <p className="text-xs text-slate-500 mb-3">Sign in with your Google account.</p>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline mt-auto"
                >
                  Open Google AI Studio
                </a>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                  <MousePointerClick className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-medium text-slate-800 mb-1">2. Create API Key</h4>
                <p className="text-xs text-slate-500 mb-3">Click the "Create API key" button in the dashboard.</p>
                <div className="mt-auto px-3 py-1.5 bg-blue-600 text-white text-[10px] font-medium rounded shadow-sm flex items-center gap-1">
                  <PlusIcon /> Create API key
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                  <Copy className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-medium text-slate-800 mb-1">3. Copy & Paste</h4>
                <p className="text-xs text-slate-500">Copy the generated key and paste it in the input box below.</p>
              </div>

            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Gemini API Key
            </label>
            <p className="text-xs text-slate-500 mb-3">
              This key is stored locally in your browser and is never sent to our servers.
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6 font-mono text-sm"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-sm"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="M12 5v14"/>
    </svg>
  );
}
