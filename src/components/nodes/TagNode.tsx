import { Handle, Position, useReactFlow, NodeToolbar } from '@xyflow/react';
import React, { useRef } from 'react';
import { Trash2, Edit2, Tag } from 'lucide-react';

export default function TagNode({ id, data, isConnectable, selected }: any) {
  const { updateNodeData, deleteElements } = useReactFlow();
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
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
      <div className={`group flex items-center gap-2 px-3 py-1.5 shadow-sm rounded-full bg-indigo-50 border-2 transition-colors ${selected ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-indigo-200 hover:border-indigo-300'}`}>
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 !bg-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Tag className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <input
          ref={inputRef}
          className="nodrag outline-none bg-transparent font-medium text-indigo-700 text-xs min-w-[40px]"
          value={data.label}
          onChange={onChange}
          onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
          placeholder="Tag"
          style={{ width: `${Math.max(40, (data.label?.length || 3) * 8)}px` }}
        />
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 !bg-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </>
  );
}
