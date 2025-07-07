'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks/redux';
import { updateTabBodyType, type BodyType, type RequestBody } from '../../../store/restSlice';
import { useDebouncedBodyValidation } from '../../../hooks/useDebouncedBodyValidation';

interface RequestBodyTabProps {
  tabId: string;
  body: RequestBody;
}

export function RequestBodyTab({ tabId, body }: RequestBodyTabProps) {
  const dispatch = useAppDispatch();
  const { debouncedValidate } = useDebouncedBodyValidation(tabId);
  const [showBeautified, setShowBeautified] = useState(false);

  const handleBodyTypeChange = (value: string) => {
    dispatch(updateTabBodyType({ tabId, bodyType: value as BodyType }));
    // Reset beautified view when type changes
    setShowBeautified(false);
  };

  const isJsonValid = body.type === 'json' && body.validation.isValid;
  const showBeautifyButton = isJsonValid;
  const isBeautifiedMode = showBeautified && isJsonValid;

  return (
    <div className="space-y-3">
      {/* Body Type Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">Request Body</h3>
          
          {/* Body Type Selector */}
          <Select value={body.type} onValueChange={handleBodyTypeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="text">Text</SelectItem>
            </SelectContent>
          </Select>

          {/* Validation Badge */}
          {!body.validation.isValid && (
            <Badge variant="destructive" className="text-xs">Invalid</Badge>
          )}
        </div>

        {/* Beautify Toggle Button */}
        {showBeautifyButton && (
          <Button
            variant={showBeautified ? "default" : "outline"}
            size="sm"
            onClick={() => setShowBeautified(!showBeautified)}
            className="h-7 text-xs gap-1.5"
          >
            <Wand2 className="h-3 w-3" />
            {showBeautified ? 'Raw' : 'Beautify'}
          </Button>
        )}
      </div>

      {/* Body Content Editor */}
      {body.type !== 'none' && (
        <div className="space-y-2">
          <Textarea 
            placeholder={body.type === 'json' ? '{"key": "value"}' : 'Enter text content...'}
            value={isBeautifiedMode ? body.content.formatted : body.content.raw}
            onChange={(e) => debouncedValidate(e.target.value)}
            readOnly={isBeautifiedMode}
            className={`min-h-[200px] font-mono text-sm ${
              !body.validation.isValid ? 'border-destructive' : ''
            } ${
              isBeautifiedMode ? 'bg-muted/30 cursor-default' : ''
            }`}
          />
          
          {/* Beautified Mode Helper Text */}
          {isBeautifiedMode && (
            <p className="text-xs text-muted-foreground">
              Showing beautified JSON. Click "Raw" to edit.
            </p>
          )}
          
          {/* Validation Error */}
          {!body.validation.isValid && body.validation.error && (
            <p className="text-sm text-destructive">{body.validation.error}</p>
          )}
        </div>
      )}
    </div>
  );
}