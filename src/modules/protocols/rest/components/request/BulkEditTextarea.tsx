'use client';

import { Textarea } from '@/components/ui/textarea';

interface BulkEditTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function BulkEditTextarea({ value, onChange, placeholder }: BulkEditTextareaProps) {
  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[200px] font-mono text-sm resize-vertical"
        spellCheck={false}
      />
      <p className="text-xs text-muted-foreground">
        Format: key:value (one per line). Prepend &apos;//&apos; to disable a row.
      </p>
    </div>
  );
}