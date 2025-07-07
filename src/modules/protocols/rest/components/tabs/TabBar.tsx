'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks/redux';
import { selectVisibleTabs, selectActiveTab, selectCanAddMoreTabs, createTab, setActiveTab, closeTab } from '../../store/restSlice';
import { TabItem } from './TabItem';
import { NewTabButton } from './NewTabButton';

export function TabBar() {
  const dispatch = useAppDispatch();
  const visibleTabs = useAppSelector(selectVisibleTabs);
  const activeTab = useAppSelector(selectActiveTab);
  const canAddMoreTabs = useAppSelector(selectCanAddMoreTabs);
  const currentWorkspace = useAppSelector(state => state.workspace.currentWorkspace);

  const handleTabClick = (tabId: string) => {
    dispatch(setActiveTab({ tabId }));
  };

  const handleTabClose = (tabId: string) => {
    dispatch(closeTab({ tabId }));
  };

  const handleNewTab = () => {
    if (!currentWorkspace) return;
    dispatch(createTab({ workspaceId: currentWorkspace }));
  };

  return (
    <div className="flex items-center border-b bg-background overflow-x-auto scrollbar-hide min-h-[48px]">
      {/* Tab List */}
      {visibleTabs.map((tab) => (
        <TabItem
          key={tab.id}
          id={tab.id}
          name={tab.name}
          method={tab.request.method}
          isActive={activeTab?.id === tab.id}
          onClick={handleTabClick}
          onClose={handleTabClose}
        />
      ))}

      {/* New Tab Button - flows with tabs */}
      <div className="px-2">
        <NewTabButton 
          onClick={handleNewTab}
          disabled={!canAddMoreTabs}
        />
      </div>
    </div>
  );
}