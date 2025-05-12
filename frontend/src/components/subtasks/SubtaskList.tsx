import React, { useState, useEffect, useCallback } from 'react';
import { Subtask } from '@/types';
import SubtaskListItem from './SubtaskListItem';
import { listSubtasks, deleteSubtask, updateSubtask } from '@/services/api'; // Assuming these will be used later

interface SubtaskListProps {
  passedSubtasks?: Subtask[]; // Optional: if subtasks are passed directly
  parentTaskId: string;
  onAddSubtaskRequest: () => void; // To signal parent to open create form
  onEditSubtaskRequest: (subtask: Subtask) => void; // To signal parent to open edit form
  // refreshTrigger?: number; // No longer primary, but could be kept for other uses if any
  isLoadingOverride?: boolean;
  errorOverride?: string | null;
  onRequestRefresh?: () => void;
}

const SubtaskList: React.FC<SubtaskListProps> = ({
  passedSubtasks,
  parentTaskId,
  onAddSubtaskRequest,
  onEditSubtaskRequest,
  // refreshTrigger,
  isLoadingOverride,
  errorOverride,
  onRequestRefresh,
}) => {
  // Use passedSubtasks directly if available, otherwise initialize as empty
  // The primary source of truth for subtasks is now TaskItem
  const displayableSubtasks = passedSubtasks || [];
  const isLoading = isLoadingOverride !== undefined ? isLoadingOverride : false;
  const error = errorOverride !== undefined ? errorOverride : null;

  // useEffect for fetching is removed as TaskItem now handles it.

  const handleEditRequest = (subtask: Subtask) => {
    onEditSubtaskRequest(subtask);
  };

  const handleDelete = async (subtaskId: string) => {
    if (!window.confirm('Are you sure you want to delete this subtask?')) {
      return;
    }
    try {
      await deleteSubtask(subtaskId, parentTaskId);
      if (onRequestRefresh) {
        onRequestRefresh();
      }
    } catch (err) {
      console.error('Failed to delete subtask:', err);
      // Consider setting a local error state if not relying on parent for all error display
      alert('Failed to delete subtask.'); // Simple alert for now
    }
  };

  const handleToggleComplete = async (subtaskId: string, completed: boolean) => {
    try {
      // Note: Optimistic update here might be tricky if not also synced with TaskItem's state.
      // For simplicity, we'll rely on onRequestRefresh to update the list from the source.
      await updateSubtask(subtaskId, { completed }, parentTaskId);
      if (onRequestRefresh) {
        onRequestRefresh();
      }
    } catch (err) {
      console.error('Failed to update subtask completion:', err);
      alert('Failed to update subtask status.'); // Simple alert
      // If there was an optimistic update, it should be reverted here.
    }
  };
  
  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading subtasks...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500 bg-red-50 border border-red-200 rounded-md">{error}</div>;
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-700">Subtasks</h3>
        <button
          onClick={onAddSubtaskRequest}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Add Subtask
        </button>
      </div>
      {displayableSubtasks.length === 0 && !isLoading && (
        <p className="text-sm text-gray-500">No subtasks yet. Add one!</p>
      )}
      {displayableSubtasks.map(subtask => (
        <SubtaskListItem
          key={subtask.id}
          subtask={subtask}
          onEditRequest={handleEditRequest}
          onDelete={handleDelete}
          onToggleComplete={handleToggleComplete}
        />
      ))}
    </div>
  );
};

export default SubtaskList; 