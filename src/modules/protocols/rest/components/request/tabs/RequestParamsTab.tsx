'use client';

import { KeyValueEditor } from '../KeyValueEditor';
import { useAppDispatch } from '@/store/hooks/redux';
import { updateTabParams, type QueryParam } from '../../../store/restSlice';

interface RequestParamsTabProps {
  tabId: string;
  params: QueryParam[];
  isBulkEditMode: boolean;
}

export function RequestParamsTab({ tabId, params, isBulkEditMode }: RequestParamsTabProps) {
  const dispatch = useAppDispatch();

  const handleParamsChange = (newParams: QueryParam[]) => {
    dispatch(updateTabParams({ tabId, params: newParams }));
  };

  return (
    <KeyValueEditor
      title="Query Parameters"
      section="params"
      items={params}
      isBulkEditMode={isBulkEditMode}
      keyPlaceholder="Key"
      valuePlaceholder="Value"
      bulkPlaceholder="key:value // description&#10;disabled_key:disabled_value // disabled description&#10;// //disabled_key:disabled_value"
      addButtonText="Add Parameter"
      separator=":"
      onChange={handleParamsChange}
    />
  );
}