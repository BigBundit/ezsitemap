import React from 'react';
import { Folder } from 'lucide-react';
import BaseNode from './BaseNode';

export default function CategoryNode(props: any) {
  return (
    <BaseNode
      {...props}
      icon={<Folder className="w-5 h-5 text-emerald-500" />}
      containerClass="hover:border-emerald-400"
      handleClass="!bg-emerald-400"
    />
  );
}
