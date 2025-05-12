import React from 'react';
import { Subtask, SubtaskUpdateData } from '@/types'; // Assuming types are available at this path

interface SubtaskListItemProps {
  subtask: Subtask;
  // For simplicity, onUpdate might trigger opening an edit modal elsewhere
  // onUpdate: (id: string, data: SubtaskUpdateData) => void; 
  onEditRequest: (subtask: Subtask) => void; // To signal parent to open edit form
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
}

const SubtaskListItem: React.FC<SubtaskListItemProps> = ({
  subtask,
  onEditRequest,
  onDelete,
  onToggleComplete,
}) => {
  const handleToggle = () => {
    onToggleComplete(subtask.id, !subtask.completed);
  };

  return (
    <div className={`p-3 my-2 border rounded-lg flex items-center justify-between transition-all duration-300 ease-in-out 
                    ${subtask.completed ? 'bg-green-50 border-green-200 opacity-70' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={subtask.completed}
          onChange={handleToggle}
          className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3 cursor-pointer"
          aria-label={`Mark subtask ${subtask.title} as complete`}
        />
        <div>
          <h4 className={`text-md font-medium ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
            {subtask.title}
          </h4>
          {subtask.description && (
            <p className={`text-sm ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
              {subtask.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onEditRequest(subtask)} // Pass the whole subtask for editing context
          className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          aria-label={`Edit subtask ${subtask.title}`}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(subtask.id)}
          className="px-3 py-1 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          aria-label={`Delete subtask ${subtask.title}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default SubtaskListItem; 