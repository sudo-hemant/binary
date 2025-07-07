'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RootState } from '@/store/store';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateWorkspace: (workspace: { name: string; description?: string }) => Promise<void>;
}

export function CreateWorkspaceDialog({ open, onOpenChange, onCreateWorkspace }: CreateWorkspaceDialogProps) {
  const { workspaces } = useSelector((state: RootState) => state.workspace);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateWorkspaceName = (workspaceName: string): string | null => {
    const trimmedName = workspaceName.trim();
    
    if (!trimmedName) {
      return 'Workspace name is required';
    }
    
    if (trimmedName.length < 2) {
      return 'Workspace name must be at least 2 characters';
    }
    
    if (trimmedName.length > 50) {
      return 'Workspace name must be less than 50 characters';
    }
    
    // Check for duplicate names (case-insensitive)
    const isDuplicate = workspaces.some(
      workspace => workspace.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (isDuplicate) {
      return 'A workspace with this name already exists';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateWorkspaceName(name);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateWorkspace({
        name: name.trim(),
        description: description.trim() || undefined
      });
      
      // Reset form
      setName('');
      setDescription('');
      setError('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create workspace:', error);
      setError('Failed to create workspace. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    onOpenChange(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) {
      setError(''); // Clear error when user starts typing
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Name</Label>
            <Input
              id="workspace-name"
              placeholder="Enter workspace name"
              value={name}
              onChange={handleNameChange}
              required
              aria-invalid={!!error}
              aria-describedby={error ? 'name-error' : undefined}
              className={error ? 'border-destructive focus:ring-destructive' : ''}
            />

            {error && (
              <p 
                id="name-error" 
                className="text-sm text-destructive mt-1"
                role="alert"
                aria-live="polite"
              >
                {error}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workspace-description">Description (optional)</Label>
            <Textarea
              id="workspace-description"
              placeholder="Enter workspace description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Workspace'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}