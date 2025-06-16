import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// Simple Task Manager App
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

const API_BASE_URL = 'http://localhost:8000';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'projects'>('dashboard');

  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  // API calls
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tasks`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/projects`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setError(null);
        await Promise.all([fetchTasks(), fetchProjects()]);
      } else {
        setError('Backend is not responding');
      }
    } catch (err) {
      setError('Cannot connect to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const createTask = async () => {
    if (!newTask.title.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: 'todo',
      created_at: new Date().toISOString(),
    };
    
    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '' });
  };

  const createProject = async () => {
    if (!newProject.name.trim()) return;
    
    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      created_at: new Date().toISOString(),
    };
    
    setProjects([...projects, project]);
    setNewProject({ name: '', description: '' });
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Task Manager</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        <h1>Task Manager</h1>
        <p>Error: {error}</p>
        <button onClick={checkBackendHealth} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
          Retry Connection
        </button>
      </div>
    );
  }

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '2rem',
      borderBottom: '2px solid #eee',
      paddingBottom: '1rem',
    },
    tabs: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      borderBottom: '1px solid #ddd',
    },
    tab: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#f5f5f5',
      border: '1px solid #ddd',
      borderBottom: 'none',
      cursor: 'pointer',
      borderRadius: '8px 8px 0 0',
    },
    activeTab: {
      backgroundColor: '#007bff',
      color: 'white',
    },
    section: {
      backgroundColor: '#f9f9f9',
      padding: '1.5rem',
      borderRadius: '8px',
      marginBottom: '2rem',
    },
    form: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
      flexWrap: 'wrap' as const,
    },
    input: {
      padding: '0.5rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      minWidth: '200px',
    },
    button: {
      padding: '0.5rem 1rem',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    taskItem: {
      backgroundColor: 'white',
      padding: '1rem',
      margin: '0.5rem 0',
      borderRadius: '6px',
      border: '1px solid #ddd',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusButton: {
      padding: '0.25rem 0.5rem',
      margin: '0 0.25rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.8rem',
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>🚀 Task Manager</h1>
        <p>Connected to backend at {API_BASE_URL}</p>
      </header>

      <nav style={styles.tabs}>
        {(['dashboard', 'tasks', 'projects'] as const).map(tab => (
          <button
            key={tab}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {activeTab === 'dashboard' && (
        <div>
          <h2>📊 Dashboard</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div style={styles.section}>
              <h3>📝 Tasks Summary</h3>
              <p>Total: {tasks.length}</p>
              <p>Todo: {tasks.filter(t => t.status === 'todo').length}</p>
              <p>In Progress: {tasks.filter(t => t.status === 'in_progress').length}</p>
              <p>Completed: {tasks.filter(t => t.status === 'completed').length}</p>
            </div>
            <div style={styles.section}>
              <h3>📁 Projects Summary</h3>
              <p>Total Projects: {projects.length}</p>
              <p>Active: {projects.length}</p>
            </div>
            <div style={styles.section}>
              <h3>🔗 API Status</h3>
              <p style={{ color: 'green' }}>✅ Backend Connected</p>
              <p>Health: OK</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div>
          <h2>📝 Tasks</h2>
          <div style={styles.section}>
            <h3>Create New Task</h3>
            <div style={styles.form}>
              <input
                style={styles.input}
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <input
                style={styles.input}
                type="text"
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <button style={styles.button} onClick={createTask}>
                Add Task
              </button>
            </div>
          </div>

          <div>
            <h3>Task List</h3>
            {tasks.length === 0 ? (
              <p>No tasks yet. Create your first task above!</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} style={styles.taskItem}>
                  <div>
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                    <small>Status: {task.status.replace('_', ' ')}</small>
                  </div>
                  <div>
                    <button
                      style={styles.statusButton}
                      onClick={() => updateTaskStatus(task.id, 'todo')}
                    >
                      Todo
                    </button>
                    <button
                      style={styles.statusButton}
                      onClick={() => updateTaskStatus(task.id, 'in_progress')}
                    >
                      In Progress
                    </button>
                    <button
                      style={styles.statusButton}
                      onClick={() => updateTaskStatus(task.id, 'completed')}
                    >
                      Completed
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div>
          <h2>📁 Projects</h2>
          <div style={styles.section}>
            <h3>Create New Project</h3>
            <div style={styles.form}>
              <input
                style={styles.input}
                type="text"
                placeholder="Project name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              />
              <input
                style={styles.input}
                type="text"
                placeholder="Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
              <button style={styles.button} onClick={createProject}>
                Add Project
              </button>
            </div>
          </div>

          <div>
            <h3>Project List</h3>
            {projects.length === 0 ? (
              <p>No projects yet. Create your first project above!</p>
            ) : (
              projects.map(project => (
                <div key={project.id} style={styles.taskItem}>
                  <div>
                    <h4>{project.name}</h4>
                    <p>{project.description}</p>
                    <small>Created: {new Date(project.created_at).toLocaleDateString()}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Mount the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}