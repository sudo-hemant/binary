'use client';

import { useState, useMemo } from 'react';
import { MethodSelector } from '../common/MethodSelector';
import { UrlInput } from '../common/UrlInput';
import { SendButton } from '../common/SendButton';
import { CodeGenerationDialog } from '../common/CodeGenerationDialog';
import { Button } from '@/components/ui/button';
import { Code } from 'lucide-react';
import { generateCurlCommand } from '../../utils/codeGeneration';
import { substituteVariables, substituteVariablesInObject } from '../../utils/variableSubstitution';
import { useAppSelector } from '@/store/hooks/redux';
import { selectActiveEnvironment } from '../../store/restSlice';
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
  const activeEnvironment = useAppSelector(selectActiveEnvironment);

  const handleShowCurl = () => {
    setShowCodeDialog(true);
  };

  // Generate curl command with environment variables substituted
  const curlCommand = useMemo(() => {
    const envVariables = activeEnvironment?.variables || [];

    // Apply variable substitution to all fields
    const processedUrl = envVariables.length > 0
      ? substituteVariables(url, envVariables)
      : url;
    const processedHeaders = envVariables.length > 0
      ? substituteVariablesInObject(headers, envVariables)
      : headers;
    const processedParams = envVariables.length > 0
      ? substituteVariablesInObject(params, envVariables)
      : params;
    const processedBody = envVariables.length > 0
      ? substituteVariablesInObject(body, envVariables)
      : body;

    return generateCurlCommand({
      method,
      url: processedUrl,
      headers: processedHeaders,
      body: processedBody,
      params: processedParams
    });
  }, [method, url, headers, body, params, activeEnvironment]);

  return (
    <>
      <div className="flex gap-2">
        <MethodSelector value={method} onChange={onMethodChange} />
        <UrlInput value={url} onChange={onUrlChange} className="flex-1" />

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