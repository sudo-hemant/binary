'use client';

import { KeyValueEditor } from '../KeyValueEditor';
import { useAppDispatch } from '@/store/hooks/redux';
import { updateTabHeaders, type Header } from '../../../store/restSlice';

interface RequestHeadersTabProps {
  tabId: string;
  headers: Header[];
  isBulkEditMode: boolean;
}

export function RequestHeadersTab({ tabId, headers, isBulkEditMode }: RequestHeadersTabProps) {
  const dispatch = useAppDispatch();

  const handleHeadersChange = (newHeaders: Header[]) => {
    dispatch(updateTabHeaders({ tabId, headers: newHeaders }));
  };

  return (
    <KeyValueEditor
      title="Headers"
      section="headers"
      items={headers}
      isBulkEditMode={isBulkEditMode}
      keyPlaceholder="Header name"
      valuePlaceholder="Value"
      bulkPlaceholder="Content-Type:application/json // JSON content type&#10;Authorization:Bearer token // Auth header&#10;// X-Custom-Header:value // disabled header"
      addButtonText="Add Header"
      separator=":"
      onChange={handleHeadersChange}
    />
  );
}