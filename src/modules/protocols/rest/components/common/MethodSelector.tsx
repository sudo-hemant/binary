'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const HTTP_METHODS = [
  { value: 'GET', color: 'text-green-600' },
  { value: 'POST', color: 'text-blue-600' },
  { value: 'PUT', color: 'text-yellow-600' },
  { value: 'DELETE', color: 'text-red-600' },
  { value: 'PATCH', color: 'text-purple-600' },
] as const;

interface MethodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MethodSelector({ value, onChange }: MethodSelectorProps) {
  const selectedMethod = HTTP_METHODS.find(m => m.value === value);
  
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[120px]">
        <SelectValue>
          <span className={selectedMethod?.color || ''}>
            {value}
          </span>
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {HTTP_METHODS.map((method) => (
          <SelectItem key={method.value} value={method.value}>
            <span className={method.color}>{method.value}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}