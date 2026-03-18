import React from 'react';
import { FileText } from 'lucide-react';
import BaseNode from './BaseNode';

export default function PageNode(props: any) {
  return (
    <BaseNode
      {...props}
      icon={<FileText className="w-5 h-5 text-indigo-500" />}
      containerClass="hover:border-indigo-400"
      handleClass="!bg-indigo-400"
    />
  );
}
