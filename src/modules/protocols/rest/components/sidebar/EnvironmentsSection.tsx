'use client';

import { useState } from 'react';
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
import { Plus, Pencil, Trash2, Check, ChevronRight, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks/redux';
import {
  selectEnvironments,
  selectActiveEnvironmentId,
  addEnvironment,
  updateEnvironment,
  deleteEnvironment,
  setActiveEnvironment,
  type Environment,
  type EnvironmentVariable,
} from '../../store/restSlice';
import { cn } from '@/lib/utils';

type DialogType = 'add' | 'edit' | 'delete' | null;

export function EnvironmentsSection() {
  const dispatch = useAppDispatch();
  const environments = useAppSelector(selectEnvironments);
  const activeEnvironmentId = useAppSelector(selectActiveEnvironmentId);

  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [editingEnv, setEditingEnv] = useState<Environment | null>(null);
  const [envName, setEnvName] = useState('');
  const [envVariables, setEnvVariables] = useState<EnvironmentVariable[]>([]);
  const [expandedEnvId, setExpandedEnvId] = useState<string | null>(null);

  const handleAddClick = () => {
    setDialogType('add');
    setEnvName('New Environment');
    setEnvVariables([{ id: `var-${Date.now()}`, key: '', value: '', enabled: true }]);
  };

  const handleEditClick = (env: Environment, e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogType('edit');
    setEditingEnv(env);
    setEnvName(env.name);
    setEnvVariables([...env.variables]);
  };

  const handleDeleteClick = (env: Environment, e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogType('delete');
    setEditingEnv(env);
  };

  const handleSave = () => {
    if (!envName.trim()) return;

    // Filter out empty variables
    const filteredVars = envVariables.filter(v => v.key.trim() !== '');

    if (dialogType === 'add') {
      dispatch(addEnvironment({
        name: envName.trim(),
        variables: filteredVars,
      }));
    } else if (dialogType === 'edit' && editingEnv) {
      dispatch(updateEnvironment({
        id: editingEnv.id,
        name: envName.trim(),
        variables: filteredVars,
      }));
    }

    resetDialog();
  };

  const handleConfirmDelete = () => {
    if (editingEnv) {
      dispatch(deleteEnvironment({ id: editingEnv.id }));
    }
    resetDialog();
  };

  const resetDialog = () => {
    setDialogType(null);
    setEditingEnv(null);
    setEnvName('');
    setEnvVariables([]);
  };

  const handleSelectEnvironment = (envId: string) => {
    dispatch(setActiveEnvironment({ id: envId }));
  };

  const toggleExpanded = (envId: string) => {
    setExpandedEnvId(expandedEnvId === envId ? null : envId);
  };

  const addVariable = () => {
    setEnvVariables([
      ...envVariables,
      { id: `var-${Date.now()}`, key: '', value: '', enabled: true }
    ]);
  };

  const updateVariable = (index: number, field: keyof EnvironmentVariable, value: string | boolean) => {
    const updated = [...envVariables];
    updated[index] = { ...updated[index], [field]: value };
    setEnvVariables(updated);
  };

  const removeVariable = (index: number) => {
    const updated = envVariables.filter((_, i) => i !== index);
    setEnvVariables(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleAddClick}
        >
          <Plus className="h-3 w-3" />
        </Button>
        <span className="text-xs font-medium text-muted-foreground flex-1 text-center">Environments</span>
        <div className="w-6" /> {/* Spacer for alignment */}
      </div>

      {environments.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground">
          No environments yet
        </div>
      ) : (
        <div className="space-y-1">
          {environments.map((env) => (
            <div key={env.id}>
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1.5 rounded-sm cursor-pointer group",
                  "hover:bg-accent/50 text-xs",
                  activeEnvironmentId === env.id && "bg-primary/10 border-r-2 border-r-primary"
                )}
              >
                <button
                  className="p-0.5 hover:bg-accent rounded"
                  onClick={() => toggleExpanded(env.id)}
                >
                  {expandedEnvId === env.id ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>

                <div
                  className="flex-1 truncate"
                  onClick={() => handleSelectEnvironment(env.id)}
                >
                  <div className="font-medium">{env.name}</div>
                  <div className="text-muted-foreground">
                    {env.variables.length} variable{env.variables.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {activeEnvironmentId === env.id && (
                  <Check className="h-3 w-3 text-primary mr-1" />
                )}

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => handleEditClick(env, e)}
                    title="Edit"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:text-destructive"
                    onClick={(e) => handleDeleteClick(env, e)}
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Expanded variables preview */}
              {expandedEnvId === env.id && env.variables.length > 0 && (
                <div className="ml-6 pl-2 border-l border-border mt-1 space-y-1">
                  {env.variables.map((v) => (
                    <div
                      key={v.id}
                      className={cn(
                        "text-xs py-0.5",
                        !v.enabled && "opacity-50"
                      )}
                    >
                      <span className="text-muted-foreground">{v.key}</span>
                      <span className="mx-1">=</span>
                      <span className="text-foreground">{v.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Environment Dialog */}
      <Dialog
        open={dialogType === 'add' || dialogType === 'edit'}
        onOpenChange={(open) => !open && resetDialog()}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'add' ? 'New Environment' : 'Edit Environment'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'add'
                ? 'Create a new environment with variables.'
                : 'Modify environment name and variables.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Environment Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={envName}
                onChange={(e) => setEnvName(e.target.value)}
                placeholder="Environment name"
                autoFocus
              />
            </div>

            {/* Variables */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Variables</label>
                <Button variant="ghost" size="sm" onClick={addVariable}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>

              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {envVariables.map((variable, index) => (
                  <div key={variable.id} className="flex items-center gap-2">
                    <Input
                      value={variable.key}
                      onChange={(e) => updateVariable(index, 'key', e.target.value)}
                      placeholder="Key"
                      className="flex-1 h-8 text-sm"
                    />
                    <Input
                      value={variable.value}
                      onChange={(e) => updateVariable(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 h-8 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-destructive"
                      onClick={() => removeVariable(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                {envVariables.length === 0 && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No variables. Click &ldquo;Add&rdquo; to create one.
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!envName.trim()}>
              {dialogType === 'add' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={dialogType === 'delete'}
        onOpenChange={(open) => !open && resetDialog()}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Environment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{editingEnv?.name}&rdquo;?
              This will remove all its variables.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={resetDialog}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
