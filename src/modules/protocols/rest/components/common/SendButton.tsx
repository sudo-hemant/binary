'use client';

import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

interface SendButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SendButton({ 
  onClick, 
  loading = false, 
  disabled = false,
  className 
}: SendButtonProps) {
  return (
    <Button 
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Send className="w-4 h-4 mr-2" />
          Send
        </>
      )}
    </Button>
  );
}