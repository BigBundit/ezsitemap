import { Handle, Position, useReactFlow, NodeToolbar } from '@xyflow/react';
import React, { useRef } from 'react';
import { Trash2, Edit2 } from 'lucide-react';

interface BaseNodeProps {
  id: string;
  data: any;
  isConnectable: boolean;
  icon: React.ReactNode;
  containerClass: string;
  handleClass: string;
  selected?: boolean;
}

export default function BaseNode({ id, data, isConnectable, icon, containerClass, handleClass, selected }: BaseNodeProps) {
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
    // Move cursor to end of input
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
      <div className={`flex items-center gap-3 px-4 py-3 shadow-md rounded-lg bg-white border-2 min-w-[180px] group transition-colors ${selected ? 'border-indigo-500 ring-4 ring-indigo-500/20' : `border-slate-200 ${containerClass}`}`}>
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} className={`w-3 h-3 ${handleClass}`} />
        <Handle type="target" position={Position.Left} id="left" isConnectable={isConnectable} className={`w-3 h-3 ${handleClass}`} />
        <div>
          {icon}
        </div>
        <div className="flex-1">
          <input
            ref={inputRef}
            className="nodrag w-full outline-none bg-transparent font-medium text-slate-700 text-sm"
            value={data.label}
            onChange={onChange}
            onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
            placeholder="Node Name"
          />
        </div>
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className={`w-3 h-3 ${handleClass}`} />
        <Handle type="source" position={Position.Right} id="right" isConnectable={isConnectable} className={`w-3 h-3 ${handleClass}`} />
      </div>
    </>
  );
}

