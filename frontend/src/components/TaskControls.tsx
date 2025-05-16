import React from 'react';
import { AddIcon, ViewIcon, ViewOffIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { GroupByType, ViewMode } from '@/types';
import { useTaskStore } from '@/store/taskStore';
import * as statusUtils from '@/lib/statusUtils';
import ConfirmationModal from './common/ConfirmationModal';
import styles from './TaskControls.module.css';
import { clsx } from 'clsx';
import { useDisclosure } from '@chakra-ui/react';

interface TaskControlsProps {
    groupBy: GroupByType;
    setGroupBy: (value: GroupByType) => void;
    viewMode: ViewMode;
    setViewMode: (value: ViewMode) => void;
    onAddTask: () => void;
    hideGroupBy?: boolean;
    isPolling?: boolean;
    allFilterableTaskIds: string[];
}

const TaskControls: React.FC<TaskControlsProps> = ({
    groupBy,
    setGroupBy,
    viewMode,
    setViewMode,
    onAddTask,
    hideGroupBy = false,
    isPolling = false,
    allFilterableTaskIds,
}) => {
    const selectedTaskIds = useTaskStore(state => state.selectedTaskIds);
    const selectAllTasks = useTaskStore(state => state.selectAllTasks);
    const deselectAllTasks = useTaskStore(state => state.deselectAllTasks);
    const bulkDeleteTasks = useTaskStore(state => state.bulkDeleteTasks);
    const bulkSetStatusTasks = useTaskStore(state => state.bulkSetStatusTasks);
    const taskStoreLoading = useTaskStore(state => state.loading);

    const {
        isOpen: isDeleteConfirmOpen,
        onOpen: onDeleteConfirmOpen,
        onClose: onDeleteConfirmClose,
    } = useDisclosure();

    const [isBulkActionsMenuOpen, setIsBulkActionsMenuOpen] = React.useState(false);

    const areAllTasksSelected = React.useMemo(() => {
        if (allFilterableTaskIds.length === 0) return false;
        return allFilterableTaskIds.every(id => selectedTaskIds.includes(id));
    }, [selectedTaskIds, allFilterableTaskIds]);

    const handleSelectAllToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            selectAllTasks(allFilterableTaskIds);
        } else {
            deselectAllTasks();
        }
    };

    const availableStatusesForBulkUpdate = React.useMemo(() => {
        return statusUtils.getAllStatusIds().filter(id => {
            const attrs = statusUtils.getStatusAttributes(id);
            return !attrs?.isTerminal && !attrs?.isDynamic;
        });
    }, []);

    const handleBulkDeleteConfirm = async () => {
        await bulkDeleteTasks();
        onDeleteConfirmClose();
    };

    return (
        <div className={styles.taskControlsContainer}>
            
            {(selectedTaskIds.length > 0 || allFilterableTaskIds.length > 0) && (
                <>
                    <hr className={styles.dividerNoMarginBottom} />
                    <div className={styles.bulkActionsFlex}>
                        <div className={styles.bulkActionsHStack}>
                            <label className={clsx(styles.checkboxLabel, styles.flexAlignCenter)}>
                                <input
                                    type="checkbox"
                                    checked={areAllTasksSelected}
                                    onChange={handleSelectAllToggle}
                                    disabled={allFilterableTaskIds.length === 0}
                                />
                                <span className={styles.marginLeftSpace2}>Select All ({allFilterableTaskIds.length})</span>
                            </label>
                            {selectedTaskIds.length > 0 && (
                                <span className={styles.selectedCountText}>
                                    {selectedTaskIds.length} selected
                                </span>
                            )}
                        </div>

                        {selectedTaskIds.length > 0 && (
                            <div style={{ position: 'relative' }}>
                                <button 
                                    className={clsx(styles.buttonBaseSm, styles.bulkActionsButton)}
                                    onClick={() => setIsBulkActionsMenuOpen(!isBulkActionsMenuOpen)}
                                >
                                    Bulk Actions <ChevronDownIcon />
                                </button>
                                {isBulkActionsMenuOpen && (
                                    <div className={styles.menuList}> 
                                        <button 
                                            className={clsx(styles.menuItem, styles.menuItemDestructive)}
                                            onClick={() => { onDeleteConfirmOpen(); setIsBulkActionsMenuOpen(false); }}
                                            disabled={taskStoreLoading}
                                        >
                                            <ChevronDownIcon />
                                            Delete Selected ({selectedTaskIds.length})
                                        </button>
                                        <hr className={styles.menuDivider} />
                                        <div className={clsx(styles.menuItem, styles.menuItemDisabled)}>
                                            Set Status to...
                                        </div>
                                        {availableStatusesForBulkUpdate.map(statusId => {
                                            const statusAttrs = statusUtils.getStatusAttributes(statusId);
                                            return (
                                                <button 
                                                    key={statusId} 
                                                    onClick={() => { bulkSetStatusTasks(statusId); setIsBulkActionsMenuOpen(false); }} 
                                                    className={clsx(styles.menuItem, styles.menuItemIndent)}
                                                >
                                                    {statusAttrs?.displayName || statusId}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

            <hr className={styles.divider} />

            <div className={clsx(styles.viewOptionsFlex, (selectedTaskIds.length > 0 || allFilterableTaskIds.length > 0) ? '' : styles.viewOptionsFlexMarginTopNegative)}>
                <div className={styles.viewOptionsLeftHStack}>
                    {isPolling && <div className={styles.pollingSpinner} />}
                    {!hideGroupBy && (
                        <div className={styles.flexAlignCenter}>
                           <label htmlFor="task-group-by-select" className={styles.groupByLabel}>Group:</label>
                            <select 
                                id="task-group-by-select"
                                aria-label="Group by"
                                value={groupBy}
                                onChange={(e) => setGroupBy(e.target.value as GroupByType)}
                                className={clsx(styles.selectControl, styles.groupBySelect)}
                            >
                                <option value="status">Status</option>
                                <option value="project">Project</option>
                                <option value="agent">Agent</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className={styles.viewOptionsRightHStack}>
                    <button
                        className={clsx(styles.buttonBaseSm, styles.viewToggleButton)}
                        onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
                        aria-label={viewMode === 'kanban' ? 'Switch to List View' : 'Switch to Kanban View'}
                    >
                        {viewMode === 'kanban' ? <ViewOffIcon /> : <ViewIcon />}
                        {viewMode === 'kanban' ? 'List View' : 'Kanban View'}
                    </button>
                    <button 
                        className={clsx(styles.buttonBaseSm, styles.addTaskButton)}
                        onClick={onAddTask}
                    >
                        <AddIcon />
                        Add Task
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={onDeleteConfirmClose}
                onConfirm={handleBulkDeleteConfirm}
                title="Confirm Bulk Delete"
                bodyText={`Are you sure you want to delete ${selectedTaskIds.length} selected task(s)? This action cannot be undone.`}
                confirmButtonText="Delete Tasks"
                confirmButtonColorScheme="red"
                isLoading={taskStoreLoading}
            />
        </div>
    );
};

export default TaskControls; 