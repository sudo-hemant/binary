'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus } from 'lucide-react';
import { RequestSectionHeader } from '../common/RequestSectionHeader';
import { BulkEditTextarea } from './BulkEditTextarea';

export interface KeyValueItem {
  id: string;
  key: string;
  value: string;
  description: string;
  enabled: boolean;
}

interface KeyValueEditorProps {
  title: string;
  section: 'params' | 'headers';
  items: KeyValueItem[];
  isBulkEditMode: boolean;
  keyPlaceholder: string;
  valuePlaceholder: string;
  bulkPlaceholder: string;
  addButtonText: string;
  separator: string; // ':' for params, ' ' for headers
  onChange: (items: KeyValueItem[]) => void;
}

export function KeyValueEditor({ 
  title,
  section,
  items, 
  isBulkEditMode,
  keyPlaceholder,
  valuePlaceholder,
  bulkPlaceholder,
  addButtonText,
  separator,
  onChange 
}: KeyValueEditorProps) {
  // Local state for bulk edit text to avoid race conditions
  const [bulkText, setBulkText] = useState('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout>(null);
  
  const addItem = () => {
    const newItem: KeyValueItem = {
      id: Date.now().toString(),
      key: '',
      value: '',
      description: '',
      enabled: true
    };
    onChange([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<KeyValueItem>) => {
    onChange(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const deleteAll = () => {
    onChange([]);
  };

  const convertToBulkText = (items: KeyValueItem[]): string => {
    return items.map(item => {
      if (!item.key && !item.value && !item.description) return '';
      const prefix = item.enabled ? '' : '// ';
      const description = item.description ? ` // ${item.description}` : '';
      return `${prefix}${item.key}${separator}${item.value}${description}`;
    }).filter(Boolean).join('\n');
  };

  const convertFromBulkText = (text: string): KeyValueItem[] => {
    return text.split('\n')
      .map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        
        const isDisabled = trimmed.startsWith('//');
        const cleanLine = isDisabled ? trimmed.substring(2).trim() : trimmed;
        const [keyValue, ...descParts] = cleanLine.split(' // ');
        
        let key = '';
        let value = '';
        
        // Both params and headers use colon separator now
        [key = '', value = ''] = keyValue.split(':');
        
        const description = descParts.join(' // ');
        
        return {
          id: `${Date.now()}-${index}`,
          key: key.trim(),
          value: value.trim(),
          description: description || '',
          enabled: !isDisabled
        };
      })
      .filter(Boolean) as KeyValueItem[];
  };

  // Debounced sync function
  const debouncedSyncToItems = useCallback((text: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      const newItems = convertFromBulkText(text);
      onChange(newItems);
    }, 300); // 300ms debounce
  }, [onChange]);

  const handleBulkTextChange = (text: string) => {
    // Update local state immediately for responsive typing
    setBulkText(text);
    
    // Convert and sync to items with debounce
    debouncedSyncToItems(text);
  };

  // ONLY sync items → text when entering bulk edit mode
  // This prevents external changes from overwriting user input
  useEffect(() => {
    if (isBulkEditMode) {
      setBulkText(convertToBulkText(items));
    }
  }, [isBulkEditMode]); // ONLY on mode change, not items change

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <RequestSectionHeader
        title={title}
        section={section}
        isBulkEditMode={isBulkEditMode}
        onDeleteAll={deleteAll}
      />
      
      {isBulkEditMode ? (
        <BulkEditTextarea
          value={bulkText}
          onChange={handleBulkTextChange}
          placeholder={bulkPlaceholder}
        />
      ) : (
        <>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <Checkbox
                  checked={item.enabled}
                  onCheckedChange={(checked) => 
                    updateItem(item.id, { enabled: !!checked })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      updateItem(item.id, { enabled: !item.enabled });
                    }
                  }}
                />
                <Input
                  placeholder={keyPlaceholder}
                  value={item.key}
                  onChange={(e) => updateItem(item.id, { key: e.target.value })}
                  className="flex-1"
                />
                <Input
                  placeholder={valuePlaceholder}
                  value={item.value}
                  onChange={(e) => updateItem(item.id, { value: e.target.value })}
                  className="flex-1"
                />
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={addItem}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {addButtonText}
          </Button>
        </>
      )}
    </div>
  );
}