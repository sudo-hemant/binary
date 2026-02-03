'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Plus, Import, Folder, FileText } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks/redux';
import { addCollectionFolder, addCollectionRequest, createTab } from '../../store/restSlice';

type DialogType = 'folder' | 'request' | null;

export function CollectionHeader() {
  const dispatch = useAppDispatch();
  const currentWorkspace = useAppSelector((state) => state.workspace.currentWorkspace);

  const [showMenu, setShowMenu] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [itemName, setItemName] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleOpenDialog = (type: DialogType) => {
    setDialogType(type);
    setItemName(type === 'folder' ? 'New Folder' : 'New Request');
    setShowMenu(false);
  };

  const handleCreate = () => {
    if (!itemName.trim() || !currentWorkspace) return;

    if (dialogType === 'folder') {
      dispatch(addCollectionFolder({
        name: itemName.trim(),
        parentId: null, // Root level
      }));
    } else if (dialogType === 'request') {
      // Create a new tab with a specific ID
      const tabId = `tab-${Date.now()}`;
      dispatch(createTab({
        id: tabId,
        name: itemName.trim(),
        workspaceId: currentWorkspace,
      }));
      // Add the request to collection with matching ID
      dispatch(addCollectionRequest({
        name: itemName.trim(),
        parentId: null,
        requestId: tabId,
      }));
    }

    setDialogType(null);
    setItemName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
  };

  return (
    <div className="flex items-center justify-between mb-2">
      <div className="relative" ref={menuRef}>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setShowMenu(!showMenu)}
        >
          <Plus className="h-3 w-3" />
        </Button>

        {showMenu && (
          <div className="absolute left-0 top-7 z-50 min-w-[140px] bg-popover border rounded-md shadow-md py-1">
            <button
              className="w-full px-3 py-1.5 text-sm text-left hover:bg-accent flex items-center gap-2"
              onClick={() => handleOpenDialog('folder')}
            >
              <Folder className="h-3.5 w-3.5" />
              New Folder
            </button>
            <button
              className="w-full px-3 py-1.5 text-sm text-left hover:bg-accent flex items-center gap-2"
              onClick={() => handleOpenDialog('request')}
            >
              <FileText className="h-3.5 w-3.5" />
              New Request
            </button>
          </div>
        )}
      </div>

      <span className="text-xs font-medium text-muted-foreground flex-1 text-center">Collections</span>

      <Button variant="ghost" size="icon" className="h-6 w-6">
        <Import className="h-3 w-3" />
      </Button>

      {/* New Folder / Request Dialog */}
      <Dialog open={dialogType !== null} onOpenChange={(open) => !open && setDialogType(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'folder' ? 'New Folder' : 'New Request'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'folder'
                ? 'Create a new folder to organize your requests.'
                : 'Create a new API request.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={dialogType === 'folder' ? 'Folder name' : 'Request name'}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!itemName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
