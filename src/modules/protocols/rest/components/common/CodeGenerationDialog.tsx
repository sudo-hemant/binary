'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface CodeGenerationDialogProps {
  open: boolean;
  onClose: () => void;
  code: string;
  // language: string;
  title?: string;
}

export function CodeGenerationDialog({ 
  open, 
  onClose, 
  code, 
  // language,
  title = 'Generated Code'
}: CodeGenerationDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0 [&>button]:top-6 [&>button]:right-6">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-lg font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 flex-1 overflow-hidden">
          <div className="bg-muted rounded-lg p-4 h-full max-h-[50vh] overflow-auto">
            <pre className="text-sm font-mono whitespace-pre-wrap break-words">
              {code}
            </pre>
          </div>
        </div>
        
        <div className="p-6 pt-4 border-t">
          <div className="flex justify-end">
            <Button
              onClick={handleCopy}
              className="min-w-[100px]"
              disabled={!code}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}