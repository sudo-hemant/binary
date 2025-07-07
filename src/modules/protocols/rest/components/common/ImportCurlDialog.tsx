'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { handleCurlImport, formatImportError, formatWarnings, type ImportResult } from '../../utils/curlImporter';
import type { ParsedCurlRequest } from '../../utils/curlParser';

interface ImportCurlDialogProps {
  open: boolean;
  onClose: () => void;
  onImportCurl: (parsed: ParsedCurlRequest) => void;
}

interface ImportDialogHeaderProps {
  onClose: () => void;
}

interface ImportDialogBodyProps {
  curlCommand: string;
  setCurlCommand: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  importResult?: ImportResult;
}

interface ImportDialogFooterProps {
  curlCommand: string;
  onClose: () => void;
  onPaste: () => void;
  onImportCurl: () => void;
  importResult?: ImportResult;
}

function ImportDialogHeader({ onClose }: ImportDialogHeaderProps) {
  return (
    <DialogHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div>
          <DialogTitle className="text-lg font-semibold">
            Import cURL
          </DialogTitle>
          <DialogDescription className="sr-only">
            Import a cURL command to create a new API request
          </DialogDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-sm"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </DialogHeader>
  );
}

function ImportDialogBody({ 
  curlCommand, 
  setCurlCommand, 
  onKeyDown, 
  textareaRef,
  importResult
}: ImportDialogBodyProps) {
  return (
    <div className="space-y-4">
      <Textarea
        ref={textareaRef}
        value={curlCommand}
        onChange={(e) => setCurlCommand(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Paste your cURL command here..."
        className="min-h-[200px] font-mono text-sm"
        aria-label="cURL command input"
      />
      
      {/* Error Display */}
      {importResult && !importResult.success && (
        <Alert variant="destructive" className="overflow-hidden">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <AlertDescription className="break-words overflow-hidden text-sm">
            {formatImportError(importResult.error || 'Unknown error')}
          </AlertDescription>
        </Alert>
      )}

      {/* Success with Warnings */}
      {importResult && importResult.success && importResult.warnings && importResult.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="whitespace-pre-line">
              {formatWarnings(importResult.warnings)}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success without Warnings */}
      {importResult && importResult.success && (!importResult.warnings || importResult.warnings.length === 0) && (
        <Alert className="border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            cURL command parsed successfully! Ready to import.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function ImportDialogFooter({ 
  curlCommand, 
  onClose, 
  onPaste, 
  onImportCurl,
  importResult
}: ImportDialogFooterProps) {
  const canImport = curlCommand.trim() && 
                    importResult?.success;

  return (
    <DialogFooter className="flex justify-between sm:justify-between">
      <Button
        variant="outline"
        onClick={onClose}
      >
        Cancel
      </Button>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={onPaste}
        >
          Paste
        </Button>
        <Button
          onClick={onImportCurl}
          disabled={!canImport}
        >
          Import
        </Button>
      </div>
    </DialogFooter>
  );
}

export function ImportCurlDialog({ open, onClose, onImportCurl }: ImportCurlDialogProps) {
  const [curlCommand, setCurlCommand] = useState('');
  const [importResult, setImportResult] = useState<ImportResult | undefined>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus textarea when dialog opens
  useEffect(() => {
    if (open) {
      // Wait for dialog animation to complete before focusing
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Clear state when dialog closes
  useEffect(() => {
    if (!open) {
      setCurlCommand('');
      setImportResult(undefined);
    }
  }, [open]);

  // Parse cURL command when it changes (with debouncing)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (curlCommand.trim()) {
        const result = handleCurlImport(curlCommand);
        setImportResult(result);
      } else {
        setImportResult(undefined);
      }
    }, 300); // Debounce validation by 300ms

    return () => clearTimeout(timer);
  }, [curlCommand]);

  const handleImportCurl = () => {
    if (!importResult?.success || !importResult.data) return;
    
    onImportCurl(importResult.data);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent Enter from creating new lines, use it to import
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleImportCurl();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCurlCommand(text);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl [&>button]:hidden overflow-hidden">
        <ImportDialogHeader onClose={onClose} />
        
        <div className="overflow-y-auto max-h-[calc(80vh-8rem)]">
          <ImportDialogBody
            curlCommand={curlCommand}
            setCurlCommand={setCurlCommand}
            onKeyDown={handleKeyDown}
            textareaRef={textareaRef}
            importResult={importResult}
          />
        </div>
        
        <ImportDialogFooter
          curlCommand={curlCommand}
          onClose={onClose}
          onPaste={handlePaste}
          onImportCurl={handleImportCurl}
          importResult={importResult}
        />
      </DialogContent>
    </Dialog>
  );
}