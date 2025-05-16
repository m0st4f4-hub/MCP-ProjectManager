import React, { ElementType, ReactNode } from 'react';
import {
    Skeleton,
    Icon,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Tooltip,
    IconButton,
    useToast,
} from '@chakra-ui/react';
import {
    FaArrowUp, FaArrowDown, FaCopy, FaCheckCircle,
    FaProjectDiagram, FaTasks, FaArchive, FaHourglassHalf, 
    FaSpinner, FaBan, FaExclamationTriangle, FaUsersCog, 
    FaUserTie,
} from 'react-icons/fa';
import styles from './DashboardStatsGrid.module.css';
import clsx from 'clsx';

interface StatCardProps {
    icon: ElementType;
    label: ReactNode;
    value: string | number;
    helpText?: ReactNode;
    iconColor?: string;
    trend?: number;
    trendType?: 'up' | 'down';
    onClick?: () => void;
    promptGenerator?: () => string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, helpText, iconColor, trend, trendType, onClick, promptGenerator }) => {
    const [justCopied, setJustCopied] = React.useState(false);
    const toast = useToast();

    const handleCopyPrompt = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (promptGenerator) {
            const prompt = promptGenerator();
            navigator.clipboard.writeText(prompt).then(() => {
                toast({
                    title: "Prompt copied!",
                    description: "Agent prompt copied to clipboard.",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                    position: "top",
                });
                setJustCopied(true);
                setTimeout(() => setJustCopied(false), 2000);
            }).catch(err => {
                console.error("Failed to copy prompt: ", err);
                toast({
                    title: "Copy failed",
                    description: "Could not copy prompt to clipboard.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: "top",
                });
            });
        }
    };

    const CardElement = onClick ? 'button' : 'div';

    return (
        <CardElement
            onClick={onClick}
            className={clsx(
                styles.statCard,
                onClick ? styles.statCardClickable : styles.statCardNonClickable
            )}
        >
            <div className={styles.statCardContent}>
                <Icon as={icon} className={styles.statCardIcon} style={{ color: iconColor }} />
                {/* Using Chakra Stat for semantic structure, but styling it via CSS module classes for its children */}
                <Stat>
                    <div className={styles.statDetails}>
                        <StatLabel as="div" className={styles.statLabel}>{label}</StatLabel>
                        <StatNumber as="div" className={styles.statNumber}>{value}</StatNumber>
                        {helpText && <StatHelpText as="div" className={styles.statHelpText}>{helpText}</StatHelpText>}
                    </div>
                </Stat>
                {trend !== undefined && (
                    <div className={styles.trendIndicator}>
                        <Icon 
                            as={trendType === 'up' ? FaArrowUp : FaArrowDown} 
                            className={clsx(styles.trendIcon, trendType === 'up' ? styles.trendUp : styles.trendDown)} 
                        />
                        <span className={clsx(styles.trendText, trendType === 'up' ? styles.trendUp : styles.trendDown)}>
                            {trend > 0 ? '+' : ''}{trend}%
                        </span>
                    </div>
                )}
            </div>

            {promptGenerator && (
                <Tooltip label={justCopied ? "Prompt Copied!" : "Copy Agent Prompt"} placement="top" closeOnClick={false} hasArrow>
                    <IconButton
                        aria-label="Copy agent prompt"
                        icon={justCopied ? <FaCheckCircle /> : <FaCopy />}
                        onClick={handleCopyPrompt}
                        size="xs"
                        variant="ghost"
                        colorScheme="blue"
                        className={styles.copyButton}
                    />
                </Tooltip>
            )}
        </CardElement>
    );
};

interface TaskStats {
    completed: number;
    failed: number;
    inProgress: number;
    blocked: number;
    toDo: number;
    total: number;
}

interface DashboardStatsGridProps {
    taskStats: TaskStats;
    totalProjects: number;
    activeAgentsCount: number;
    unassignedTasksCount: number;
    totalArchivedProjects: number;
    totalArchivedTasks: number;
}

const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({
    taskStats,
    totalProjects,
    activeAgentsCount,
    unassignedTasksCount,
    totalArchivedProjects,
    totalArchivedTasks,
}) => {
    const isLoaded = true; 

    return (
        <div className={styles.statsGrid}>
            <Skeleton isLoaded={isLoaded} className={styles.skeletonWrapper}>
                <StatCard
                    icon={FaProjectDiagram}
                    label="Active Projects (Filtered)"
                    value={totalProjects}
                    iconColor="var(--chakra-colors-accent-500)" // Using CSS variable for theme color
                />
            </Skeleton>
            <Skeleton isLoaded={isLoaded} className={styles.skeletonWrapper}>
                <StatCard
                    icon={FaTasks}
                    label="Total Tasks (Filtered)"
                    value={taskStats.total}
                    iconColor="var(--chakra-colors-brand-500)"
                />
            </Skeleton>
            <Skeleton isLoaded={isLoaded} className={styles.skeletonWrapper}>
                <StatCard
                    icon={FaArchive}
                    label={<Tooltip label="Total count of all archived projects in the system." placement="top" hasArrow><span>Total Archived Projects</span></Tooltip>}
                    value={totalArchivedProjects}
                    iconColor="var(--chakra-colors-gray-600)"
                />
            </Skeleton>
            <Skeleton isLoaded={isLoaded} className={styles.skeletonWrapper}>
                <StatCard
                    icon={FaArchive}
                    label={<Tooltip label="Total count of all archived tasks in the system." placement="top" hasArrow><span>Total Archived Tasks</span></Tooltip>}
                    value={totalArchivedTasks}
                    iconColor="var(--chakra-colors-gray-600)"
                />
            </Skeleton>
            <Skeleton isLoaded={isLoaded} className={styles.skeletonWrapper}>
                <StatCard
                    icon={FaCheckCircle}
                    label="Completed Tasks (Filtered)"
                    value={taskStats.completed}
                    iconColor="var(--chakra-colors-success-500)"
                />
            </Skeleton>
            <Skeleton isLoaded={isLoaded} className={styles.skeletonWrapper}>
                <StatCard
                    icon={FaHourglassHalf}
                    label="Pending Tasks (To Do, Filtered)"
                    value={taskStats.toDo}
                    iconColor="var(--chakra-colors-warning-500)"
                />
            </Skeleton>
            <Skeleton isLoaded={isLoaded} className={styles.skeletonWrapper}>
                <StatCard
                    icon={FaSpinner}
                    label="In Progress Tasks (Filtered)"
                    value={taskStats.inProgress}
                    iconColor="var(--chakra-colors-blue-500)"
                />
            </Skeleton>
            <Skeleton isLoaded={isLoaded} className={styles.skeletonWrapper}>
                <StatCard
                    icon={FaBan}
                    label="Blocked Tasks (Filtered)"
                    value={taskStats.blocked}
                    iconColor="var(--chakra-colors-orange-500)"
                />
            </Skeleton>
            <Skeleton isLoaded={isLoaded} className={styles.skeletonWrapper}>
                <StatCard
                    icon={FaExclamationTriangle}
                    label="Failed Tasks (Filtered)"
                    value={taskStats.failed}
                    iconColor="var(--chakra-colors-red-600)"
                />
            </Skeleton>
            <Skeleton isLoaded={isLoaded} className={styles.skeletonWrapper}>
                <StatCard 
                    icon={FaUsersCog} 
                    label="Active Agents (with tasks, Filtered)" 
                    value={activeAgentsCount} 
                    iconColor="var(--chakra-colors-purple-500)" 
                />
            </Skeleton>
            <Skeleton isLoaded={isLoaded} className={styles.skeletonWrapper}>
                <StatCard 
                    icon={FaUserTie}
                    label="Unassigned Tasks (Filtered)" 
                    value={unassignedTasksCount} 
                    iconColor="var(--chakra-colors-info-500)"
                />
            </Skeleton>
        </div>
    );
};

export default DashboardStatsGrid; 