'use client';

import { Input } from '@/components/ui/input';

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function UrlInput({ 
  value, 
  onChange, 
  placeholder = "Enter request URL",
  className 
}: UrlInputProps) {
  return (
    <Input
      type="url"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  );
}