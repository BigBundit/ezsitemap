import { Handle, Position, useReactFlow, NodeToolbar, NodeResizer } from '@xyflow/react';
import React, { useRef } from 'react';
import { Trash2, Edit2, Link as LinkIcon, ExternalLink } from 'lucide-react';

export default function LinkNode({ id, data, isConnectable, selected }: any) {
  const { updateNodeData, deleteElements } = useReactFlow();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  const onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { label: evt.target.value });
  };

  const onUrlChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { url: evt.target.value });
  };

  const onDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  const onEdit = () => {
    inputRef.current?.focus();
    if (inputRef.current) {
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  };

  const openLink = () => {
    if (data.url) {
      const formattedUrl = data.url.startsWith('http') ? data.url : `https://${data.url}`;
      window.open(formattedUrl, '_blank');
    }
  };

  return (
    <>
      <NodeResizer 
        isVisible={selected} 
        minWidth={200} 
        minHeight={70} 
        handleClassName="h-2 w-2 bg-white border-2 border-amber-500 rounded"
        lineClassName="border-amber-500"
      />
      <NodeToolbar isVisible={selected} position={Position.Top} className="flex gap-1 bg-white p-1 rounded-md shadow-md border border-slate-200">
        <button onClick={openLink} className="p-1.5 hover:bg-slate-100 rounded text-amber-600 transition-colors" title="Open link">
          <ExternalLink className="w-4 h-4" />
        </button>
        <button onClick={onEdit} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors" title="Edit text">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors" title="Delete node">
          <Trash2 className="w-4 h-4" />
        </button>
      </NodeToolbar>
      <div className={`flex flex-col gap-2 px-4 py-3 shadow-md rounded-lg bg-white border-2 min-w-[200px] w-full h-full group transition-colors ${selected ? 'border-amber-500 ring-4 ring-amber-500/20' : 'border-slate-200 hover:border-amber-400'}`}>
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 !bg-amber-400" />
        <Handle type="target" position={Position.Left} id="left" isConnectable={isConnectable} className="w-3 h-3 !bg-amber-400" />
        
        <div className="flex items-center gap-3">
          <div className="shrink-0 cursor-pointer" onClick={openLink} title="Click to open link">
            <LinkIcon className="w-5 h-5 text-amber-500 hover:text-amber-600 transition-colors" />
          </div>
          <div className="flex-1 w-full flex flex-col gap-1">
            <textarea
              ref={inputRef}
              className="nodrag w-full outline-none bg-transparent font-medium text-slate-700 text-sm resize-none overflow-y-auto"
              value={data.label}
              onChange={onChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                }
              }}
              onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
              placeholder="Link Title"
              style={{ minHeight: '20px' }}
            />
            <input
              ref={urlRef}
              className="nodrag w-full outline-none bg-transparent text-amber-600 text-xs truncate placeholder:text-slate-400"
              value={data.url || ''}
              onChange={onUrlChange}
              onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
              placeholder="https://example.com"
            />
          </div>
        </div>

        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 !bg-amber-400" />
        <Handle type="source" position={Position.Right} id="right" isConnectable={isConnectable} className="w-3 h-3 !bg-amber-400" />
      </div>
    </>
  );
}
