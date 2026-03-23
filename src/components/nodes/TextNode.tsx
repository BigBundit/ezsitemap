import { Handle, Position, useReactFlow, NodeToolbar } from '@xyflow/react';
import React, { useRef, useEffect } from 'react';
import { Trash2, Edit2 } from 'lucide-react';

export default function TextNode({ id, data, isConnectable, selected }: any) {
  const { updateNodeData, deleteElements } = useReactFlow();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { label: evt.target.value });
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

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [data.label]);

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} className="flex gap-1 bg-white p-1 rounded-md shadow-md border border-slate-200">
        <button onClick={onEdit} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors" title="Edit text">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors" title="Delete node">
          <Trash2 className="w-4 h-4" />
        </button>
      </NodeToolbar>
      <div className={`group relative p-2 min-w-[150px] transition-all border border-slate-300 rounded-md bg-white shadow-sm ${selected ? 'ring-2 ring-slate-400' : 'hover:border-slate-400'}`}>
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 !bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Handle type="target" position={Position.Left} id="left" isConnectable={isConnectable} className="w-2 h-2 !bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        <textarea
          ref={inputRef}
          className="nodrag w-full outline-none bg-transparent font-medium text-slate-700 text-sm resize-none overflow-hidden"
          value={data.label}
          onChange={onChange}
          onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
          placeholder="Type something..."
          rows={1}
          style={{ minHeight: '24px' }}
        />
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 !bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Handle type="source" position={Position.Right} id="right" isConnectable={isConnectable} className="w-2 h-2 !bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </>
  );
}
