import React, { useState } from 'react';
import { X, FileText, Loader2 } from 'lucide-react';

interface ImportTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (text: string) => Promise<void>;
}

export default function ImportTextModal({ isOpen, onClose, onImport }: ImportTextModalProps) {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    try {
      await onImport(text);
      setText(''); // Clear on success
      onClose();
    } catch (error) {
      // Error is handled and alerted by the parent component
      console.error("Import failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <FileText className="w-5 h-5 text-indigo-600" />
            Import from Text / Outline
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            Paste your outline here. Use headings, bullet points, or indentation to show the hierarchy. Our AI will automatically convert it into a sitemap.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Home\n- About Us\n  - Our Team\n  - History\n- Services\n  - Web Design\n  - SEO\n- Contact`}
            className="w-full h-64 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 font-mono text-sm resize-none"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={isProcessing || !text.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-sm disabled:bg-indigo-300"
            >
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              Generate Sitemap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
