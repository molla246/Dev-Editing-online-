import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-3 rounded-2xl shadow-2xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 animate-bounce">
      <CheckCircle2 className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
};
