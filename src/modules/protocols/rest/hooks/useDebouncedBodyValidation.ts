import { useCallback, useRef } from 'react';
import { useAppDispatch } from '@/store/hooks/redux';
import { updateTabBodyContent, updateTabBodyRaw } from '../store/restSlice';

export function useDebouncedBodyValidation(tabId: string, delay: number = 500) {
  const dispatch = useAppDispatch();
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const debouncedValidate = useCallback((raw: string) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Update raw content immediately for responsive UI
    dispatch(updateTabBodyRaw({ tabId, raw }));

    // Debounce the validation
    timeoutRef.current = setTimeout(() => {
      dispatch(updateTabBodyContent({ tabId, raw }));
    }, delay);
  }, [dispatch, tabId, delay]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { debouncedValidate, cleanup };
}