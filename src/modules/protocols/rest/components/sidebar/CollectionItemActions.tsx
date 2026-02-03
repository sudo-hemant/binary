'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FolderPlus, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks/redux';
import { addCollectionFolder, addCollectionRequest, createTab, deleteCollectionItem } from '../../store/restSlice';
import type { CollectionItem } from '../../store/restSlice';

interface CollectionItemActionsProps {
  item: CollectionItem;
  onStartEdit: (e: React.MouseEvent) => void;
}

type DialogType = 'folder' | 'request' | 'delete' | null;

export function CollectionItemActions({ item, onStartEdit }: CollectionItemActionsProps) {
  const dispatch = useAppDispatch();
  const currentWorkspace = useAppSelector((state) => state.workspace.currentWorkspace);

  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [itemName, setItemName] = useState('');

  const handleAddFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogType('folder');
    setItemName('New Folder');
  };

  const handleAddRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogType('request');
    setItemName('New Request');
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogType('delete');
  };

  const handleCreate = () => {
    if (!itemName.trim() || !currentWorkspace) return;

    if (dialogType === 'folder') {
      dispatch(addCollectionFolder({
        name: itemName.trim(),
        parentId: item.id, // Add to current folder
      }));
    } else if (dialogType === 'request') {
      const tabId = `tab-${Date.now()}`;
      dispatch(createTab({
        id: tabId,
        name: itemName.trim(),
        workspaceId: currentWorkspace,
      }));
      dispatch(addCollectionRequest({
        name: itemName.trim(),
        parentId: item.id, // Add to current folder
        requestId: tabId,
      }));
    }

    setDialogType(null);
    setItemName('');
  };

  const handleConfirmDelete = () => {
    dispatch(deleteCollectionItem({ itemId: item.id }));
    setDialogType(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
  };

  return (
    <>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Add folder/request buttons - only for folders */}
        {item.type === 'folder' && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 hover:bg-accent"
              onClick={handleAddFolder}
              title="Add Folder"
            >
              <FolderPlus className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 hover:bg-accent"
              onClick={handleAddRequest}
              title="Add Request"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </>
        )}

        {/* Rename button - for both folders and requests */}
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 hover:bg-accent"
          onClick={onStartEdit}
          title="Rename"
        >
          <Pencil className="h-3 w-3" />
        </Button>

        {/* Delete button - for both folders and requests */}
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 hover:bg-accent hover:text-destructive"
          onClick={handleDeleteClick}
          title="Delete"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Add Folder/Request Dialog */}
      <Dialog
        open={dialogType === 'folder' || dialogType === 'request'}
        onOpenChange={(open) => !open && setDialogType(null)}
      >
        <DialogContent className="sm:max-w-[400px]" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'folder' ? 'New Folder' : 'New Request'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'folder'
                ? `Create a new folder inside "${item.name}".`
                : `Create a new request inside "${item.name}".`}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={dialogType === 'delete'}
        onOpenChange={(open) => !open && setDialogType(null)}
      >
        <DialogContent className="sm:max-w-[400px]" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Delete {item.type === 'folder' ? 'Folder' : 'Request'}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{item.name}&rdquo;?
              {item.type === 'folder' && item.children && item.children.length > 0 && (
                <span className="block mt-2 text-destructive">
                  This folder contains {item.children.length} item(s). All items will be deleted.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
