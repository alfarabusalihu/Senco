'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const AiChatWidget = dynamic(
  () => import('@/components/AiChatWidget').then((mod) => mod.AiChatWidget),
  { ssr: false }
);

export function AiChatWrapper() {
  return <AiChatWidget />;
}
export default AiChatWrapper;
