import React from 'react';
import { FileText, Folder, Link as LinkIcon } from 'lucide-react';

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-4 z-10 shadow-sm">
      <div className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
        Elements
      </div>
      <div className="text-xs text-slate-500 mb-2">
        Drag and drop to add to canvas.
      </div>
      
      <div
        className="flex items-center gap-3 px-4 py-3 shadow-sm rounded-lg bg-white border border-slate-200 cursor-grab hover:border-indigo-400 hover:shadow-md transition-all font-medium text-slate-700"
        onDragStart={(event) => onDragStart(event, 'pageNode', 'Page')}
        draggable
      >
        <FileText className="w-5 h-5 text-indigo-500" />
        <span>Page</span>
      </div>

      <div
        className="flex items-center gap-3 px-4 py-3 shadow-sm rounded-lg bg-white border border-slate-200 cursor-grab hover:border-emerald-400 hover:shadow-md transition-all font-medium text-slate-700"
        onDragStart={(event) => onDragStart(event, 'categoryNode', 'Category')}
        draggable
      >
        <Folder className="w-5 h-5 text-emerald-500" />
        <span>Category</span>
      </div>

      <div
        className="flex items-center gap-3 px-4 py-3 shadow-sm rounded-lg bg-white border border-slate-200 cursor-grab hover:border-amber-400 hover:shadow-md transition-all font-medium text-slate-700"
        onDragStart={(event) => onDragStart(event, 'linkNode', 'External Link')}
        draggable
      >
        <LinkIcon className="w-5 h-5 text-amber-500" />
        <span>Link</span>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100">
        <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-md">
          <p className="font-medium text-slate-500 mb-1">Tips:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Select a node and press <kbd className="bg-slate-200 px-1 rounded">Backspace</kbd> to delete it.</li>
            <li>Click and drag between handles to connect nodes.</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
