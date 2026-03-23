import { Handle, Position, useReactFlow, NodeToolbar } from '@xyflow/react';
import React from 'react';
import { Trash2 } from 'lucide-react';

export default function LineNode({ id, isConnectable, selected }: any) {
  const { deleteElements } = useReactFlow();

  const onDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} className="flex gap-1 bg-white p-1 rounded-md shadow-md border border-slate-200">
        <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors" title="Delete node">
          <Trash2 className="w-4 h-4" />
        </button>
      </NodeToolbar>
      <div className={`group py-4 px-2 min-w-[200px] flex items-center justify-center cursor-pointer transition-all ${selected ? 'ring-2 ring-slate-400 rounded-md bg-white/50' : ''}`}>
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 !bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Handle type="target" position={Position.Left} id="left" isConnectable={isConnectable} className="w-2 h-2 !bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-full h-[2px] bg-slate-400 group-hover:bg-slate-500 transition-colors"></div>
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 !bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Handle type="source" position={Position.Right} id="right" isConnectable={isConnectable} className="w-2 h-2 !bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </>
  );
}
