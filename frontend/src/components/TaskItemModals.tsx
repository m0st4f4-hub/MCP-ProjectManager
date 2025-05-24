import React, { useState } from "react";
import EditTaskModal from "./modals/EditTaskModal";
import TaskDetailsModal from "./modals/TaskDetailsModal";
import { Task } from "@/types";

interface TaskItemModalsProps {
  task: Task;
}

const TaskItemModals: React.FC<TaskItemModalsProps> = ({ task }) => {
  const [isEditTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);

  const handleCloseEditTaskModal = () => setEditTaskModalOpen(false);
  const handleCloseDetailsModal = () => setDetailsModalOpen(false);

  // You may need to pass update handlers, etc., as props or via context
  return (
    <>
      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={handleCloseEditTaskModal}
        task={task}
        onUpdate={async () => { return; }}
      />
      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        taskId={`${task.project_id}-${task.task_number}`}
      />
    </>
  );
};

export default TaskItemModals; 