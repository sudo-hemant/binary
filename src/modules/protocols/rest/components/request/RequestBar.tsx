'use client';

import { useState } from 'react';
import { MethodSelector } from '../common/MethodSelector';
import { UrlInput } from '../common/UrlInput';
import { SendButton } from '../common/SendButton';
import { CodeGenerationDialog } from '../common/CodeGenerationDialog';
import { EnvironmentSelector } from '../common/EnvironmentSelector';
import { Button } from '@/components/ui/button';
import { Code } from 'lucide-react';
import { generateCurlCommand } from '../../utils/codeGeneration';
import type { Header, QueryParam, RequestBody } from '../../store/restSlice';

interface RequestBarProps {
  method: string;
  url: string;
  loading: boolean;
  headers: Header[];
  body: RequestBody;
  params: QueryParam[];
  onMethodChange: (method: string) => void;
  onUrlChange: (url: string) => void;
  onSend: () => void;
}

export function RequestBar({
  method,
  url,
  loading,
  headers,
  body,
  params,
  onMethodChange,
  onUrlChange,
  onSend
}: RequestBarProps) {
  const [showCodeDialog, setShowCodeDialog] = useState(false);

  const handleShowCurl = () => {
    setShowCodeDialog(true);
  };

  const curlCommand = generateCurlCommand({
    method,
    url,
    headers,
    body,
    params
  });

  return (
    <>
      <div className="flex gap-2">
        <MethodSelector value={method} onChange={onMethodChange} />
        <UrlInput value={url} onChange={onUrlChange} className="flex-1" />
        <EnvironmentSelector />

        <SendButton
          onClick={onSend}
          loading={loading}
          disabled={!url}
          className="min-w-[100px]"
        />

        <Button
          variant="outline"
          className="px-3 gap-3"
          onClick={handleShowCurl}
          disabled={!url}
        >
          <Code className="h-4 w-4" />
          <span> Show Code </span>
        </Button>
      </div>

      <CodeGenerationDialog
        open={showCodeDialog}
        onClose={() => setShowCodeDialog(false)}
        code={curlCommand}
        // language="bash"
        title="Copy as cURL"
      />
    </>
  );
}