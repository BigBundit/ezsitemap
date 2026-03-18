import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import BaseNode from './BaseNode';

export default function LinkNode(props: any) {
  return (
    <BaseNode
      {...props}
      icon={<LinkIcon className="w-5 h-5 text-amber-500" />}
      containerClass="hover:border-amber-400"
      handleClass="!bg-amber-400"
    />
  );
}
