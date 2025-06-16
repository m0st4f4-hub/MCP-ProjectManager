const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let filePath;
  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(__dirname, 'public', 'index.html');
    res.setHeader('Content-Type', 'text/html');
  } else if (req.url === '/simple-app.js') {
    // Serve the frontend JavaScript
    res.setHeader('Content-Type', 'application/javascript');
    res.writeHead(200);
    res.end(`
      console.log('Task Manager Frontend Loading...');
      
      document.addEventListener('DOMContentLoaded', function() {
        const root = document.getElementById('root');
        
        // Global state
        window.currentView = 'dashboard';
        window.projectsData = [];
        window.tasksData = [];
        window.agentsData = [];
        window.workflowsData = [];
        
        // Initialize the app
        initApp();
      });
      
      function initApp() {
        const root = document.getElementById('root');
        root.innerHTML = [
          '<div style="max-width: 1400px; margin: 0 auto; padding: 1rem; font-family: -apple-system, BlinkMacSystemFont, \\'Segoe UI\\', Roboto, sans-serif;">',
            '<header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; text-align: center;">',
              '<h1 style="margin: 0; font-size: 2.5rem; font-weight: 300;">🚀 Task Manager v3.0</h1>',
              '<p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Comprehensive project and task management platform</p>',
            '</header>',
            
            '<nav style="background: white; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">',
              '<div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">',
                '<button onclick="showDashboard()" id="nav-dashboard" class="nav-btn" style="padding: 0.75rem 1.5rem; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">📊 Dashboard</button>',
                '<button onclick="showProjects()" id="nav-projects" class="nav-btn" style="padding: 0.75rem 1.5rem; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">📁 Projects</button>',
                '<button onclick="showTasks()" id="nav-tasks" class="nav-btn" style="padding: 0.75rem 1.5rem; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">📝 Tasks</button>',
                '<button onclick="showAgents()" id="nav-agents" class="nav-btn" style="padding: 0.75rem 1.5rem; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">🤖 Agents</button>',
                '<button onclick="showWorkflows()" id="nav-workflows" class="nav-btn" style="padding: 0.75rem 1.5rem; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">⚙️ Workflows</button>',
              '</div>',
            '</nav>',
            
            '<main id="main-content" style="background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">',
              '<!-- Content will be loaded here -->',
            '</main>',
          '</div>'
        ].join('');
        
        // Load initial dashboard
        showDashboard();
      }
      
      // Navigation functions
      function updateNavigation(activeNav) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
          btn.style.background = '#6c757d';
        });
        document.getElementById(\`nav-\${activeNav}\`).style.background = '#007bff';
        window.currentView = activeNav;
      }
      
      async function showDashboard() {
        updateNavigation('dashboard');
        const mainContent = document.getElementById('main-content');
        
        try {
          const stats = await fetch('http://localhost:8000/api/v1/stats').then(r => r.json());
          
          mainContent.innerHTML = [
            '<h2 style="margin-top: 0; color: #333;">📊 Dashboard Overview</h2>',
            
            '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">',
              \`<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; text-align: center;">
                <h3 style="margin: 0; font-size: 2.5rem;">\${stats.projects.total}</h3>
                <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Active Projects</p>
              </div>\`,
              \`<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 2rem; border-radius: 12px; text-align: center;">
                <h3 style="margin: 0; font-size: 2.5rem;">\${stats.tasks.total}</h3>
                <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Total Tasks</p>
              </div>\`,
              \`<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 2rem; border-radius: 12px; text-align: center;">
                <h3 style="margin: 0; font-size: 2.5rem;">\${stats.agents.total}</h3>
                <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">AI Agents</p>
              </div>\`,
              \`<div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 2rem; border-radius: 12px; text-align: center;">
                <h3 style="margin: 0; font-size: 2.5rem;">✅</h3>
                <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">System Health</p>
              </div>\`,
            '</div>',
            
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">',
              '<div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px;">',
                '<h3 style="margin-top: 0; color: #495057;">📈 Task Status Distribution</h3>',
                \`<div style="display: flex; flex-direction: column; gap: 0.5rem;">
                  \${Object.entries(stats.tasks.by_status || {}).map(([status, count]) => 
                    \`<div style="display: flex; justify-content: between; align-items: center; padding: 0.5rem; background: white; border-radius: 4px;">
                      <span style="text-transform: capitalize; font-weight: 500;">\${status}</span>
                      <span style="background: #007bff; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem;">\${count}</span>
                    </div>\`
                  ).join('')}
                </div>\`,
              '</div>',
              
              '<div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px;">',
                '<h3 style="margin-top: 0; color: #495057;">🕒 Recent Activity</h3>',
                \`<div style="display: flex; flex-direction: column; gap: 0.75rem;">
                  \${stats.recent_activity.slice(0, 5).map(activity => 
                    \`<div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: white; border-radius: 6px; border-left: 3px solid \${getStatusColor(activity.status)};">
                      <span style="font-weight: 500;">\${activity.title}</span>
                      <span style="font-size: 0.875rem; color: #6c757d; margin-left: auto;">\${activity.status}</span>
                    </div>\`
                  ).join('')}
                </div>\`,
              '</div>',
            '</div>',
            
            '<div style="text-align: center; padding: 1rem; background: #e9ecef; border-radius: 8px;">',
              '<h4 style="margin: 0 0 1rem 0; color: #495057;">🔧 Quick Actions</h4>',
              '<div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">',
                '<button onclick="showCreateProject()" style="padding: 0.75rem 1.5rem; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">➕ New Project</button>',
                '<button onclick="showCreateTask()" style="padding: 0.75rem 1.5rem; background: #17a2b8; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">📝 New Task</button>',
                '<button onclick="showCreateAgent()" style="padding: 0.75rem 1.5rem; background: #6f42c1; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">🤖 New Agent</button>',
                '<button onclick="refreshData()" style="padding: 0.75rem 1.5rem; background: #fd7e14; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">🔄 Refresh</button>',
              '</div>',
            '</div>'
          ].join('');
        } catch (error) {
          mainContent.innerHTML = \`<div style="color: red; text-align: center; padding: 2rem;">
            <h3>❌ Unable to connect to backend</h3>
            <p>Please ensure the backend server is running on http://localhost:8000</p>
            <p>Error: \${error.message}</p>
          </div>\`;
        }
      }
      
      function getStatusColor(status) {
        const colors = {
          'completed': '#28a745',
          'in_progress': '#ffc107', 
          'todo': '#6c757d',
          'blocked': '#dc3545'
        };
        return colors[status] || '#6c757d';
      }
      
      // Projects view
      async function showProjects() {
        updateNavigation('projects');
        const mainContent = document.getElementById('main-content');
        
        try {
          const projects = await fetch('http://localhost:8000/api/v1/projects').then(r => r.json());
          window.projectsData = projects;
          
          mainContent.innerHTML = [
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">',
              '<h2 style="margin: 0; color: #333;">📁 Projects Management</h2>',
              '<button onclick="showCreateProject()" style="padding: 0.75rem 1.5rem; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">➕ New Project</button>',
            '</div>',
            
            projects.length === 0 ? 
              '<div style="text-align: center; padding: 3rem; color: #6c757d;"><h3>No projects found</h3><p>Create your first project to get started!</p></div>' :
              \`<div style="display: grid; gap: 1.5rem;">
                \${projects.map(project => \`
                  <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #007bff;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                      <div>
                        <h3 style="margin: 0 0 0.5rem 0; color: #333;">\${project.name}</h3>
                        <p style="margin: 0; color: #6c757d;">\${project.description || 'No description'}</p>
                      </div>
                      <div style="display: flex; gap: 0.5rem;">
                        <span style="background: \${project.status === 'active' ? '#28a745' : '#6c757d'}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem;">\${project.status}</span>
                        <button onclick="editProject('\${project.id}')" style="padding: 0.5rem 1rem; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">Edit</button>
                        <button onclick="deleteProject('\${project.id}')" style="padding: 0.5rem 1rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button>
                      </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; color: #6c757d;">
                      <span>📝 \${project.task_count} tasks</span>
                      <span>Created: \${new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                \`).join('')}
              </div>\`
          ].join('');
        } catch (error) {
          mainContent.innerHTML = \`<div style="color: red; text-align: center; padding: 2rem;">
            <h3>❌ Error loading projects</h3>
            <p>Error: \${error.message}</p>
          </div>\`;
        }
      }
      
      // Tasks view
      async function showTasks() {
        updateNavigation('tasks');
        const mainContent = document.getElementById('main-content');
        
        try {
          const [tasks, projects, agents] = await Promise.all([
            fetch('http://localhost:8000/api/v1/tasks').then(r => r.json()),
            fetch('http://localhost:8000/api/v1/projects').then(r => r.json()),
            fetch('http://localhost:8000/api/v1/agents').then(r => r.json())
          ]);
          
          window.tasksData = tasks;
          window.projectsData = projects;
          window.agentsData = agents;
          
          mainContent.innerHTML = [
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">',
              '<h2 style="margin: 0; color: #333;">📝 Tasks Management</h2>',
              '<button onclick="showCreateTask()" style="padding: 0.75rem 1.5rem; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">➕ New Task</button>',
            '</div>',
            
            tasks.length === 0 ? 
              '<div style="text-align: center; padding: 3rem; color: #6c757d;"><h3>No tasks found</h3><p>Create your first task to get started!</p></div>' :
              \`<div style="display: grid; gap: 1rem;">
                \${tasks.map(task => {
                  const project = projects.find(p => p.id === task.project_id);
                  const agent = agents.find(a => a.id === task.agent_id);
                  return \`
                    <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; border-left: 4px solid \${getStatusColor(task.status)};">
                      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div style="flex: 1;">
                          <h4 style="margin: 0 0 0.5rem 0; color: #333;">\${task.title}</h4>
                          <p style="margin: 0 0 0.75rem 0; color: #6c757d;">\${task.description || 'No description'}</p>
                          <div style="display: flex; gap: 1rem; font-size: 0.875rem; color: #6c757d;">
                            <span>📁 \${project?.name || 'Unknown Project'}</span>
                            \${agent ? \`<span>🤖 \${agent.name}</span>\` : ''}
                            <span>⚡ \${task.priority}</span>
                          </div>
                        </div>
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                          <span style="background: \${getStatusColor(task.status)}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem;">\${task.status}</span>
                          <button onclick="editTask('\${task.id}')" style="padding: 0.5rem 1rem; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">Edit</button>
                          <button onclick="deleteTask('\${task.id}')" style="padding: 0.5rem 1rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button>
                        </div>
                      </div>
                    </div>
                  \`;
                }).join('')}
              </div>\`
          ].join('');
        } catch (error) {
          mainContent.innerHTML = \`<div style="color: red; text-align: center; padding: 2rem;">
            <h3>❌ Error loading tasks</h3>
            <p>Error: \${error.message}</p>
          </div>\`;
        }
      }
      
      // Agents view
      async function showAgents() {
        updateNavigation('agents');
        const mainContent = document.getElementById('main-content');
        
        try {
          const agents = await fetch('http://localhost:8000/api/v1/agents').then(r => r.json());
          window.agentsData = agents;
          
          mainContent.innerHTML = [
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">',
              '<h2 style="margin: 0; color: #333;">🤖 AI Agents Management</h2>',
              '<button onclick="showCreateAgent()" style="padding: 0.75rem 1.5rem; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">➕ New Agent</button>',
            '</div>',
            
            agents.length === 0 ? 
              '<div style="text-align: center; padding: 3rem; color: #6c757d;"><h3>No agents found</h3><p>Create your first AI agent to get started!</p></div>' :
              \`<div style="display: grid; gap: 1.5rem;">
                \${agents.map(agent => \`
                  <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #6f42c1;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                      <div>
                        <h3 style="margin: 0 0 0.5rem 0; color: #333;">🤖 \${agent.name}</h3>
                        <p style="margin: 0 0 0.75rem 0; color: #6c757d;">\${agent.description || 'No description'}</p>
                        <div style="font-size: 0.875rem; color: #6c757d;">
                          <strong>Capabilities:</strong> \${agent.capabilities || 'None specified'}
                        </div>
                      </div>
                      <div style="display: flex; gap: 0.5rem;">
                        <span style="background: \${agent.status === 'active' ? '#28a745' : '#6c757d'}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem;">\${agent.status}</span>
                        <button onclick="editAgent('\${agent.id}')" style="padding: 0.5rem 1rem; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">Edit</button>
                        <button onclick="deleteAgent('\${agent.id}')" style="padding: 0.5rem 1rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button>
                      </div>
                    </div>
                    <div style="font-size: 0.875rem; color: #6c757d;">
                      Created: \${new Date(agent.created_at).toLocaleDateString()}
                    </div>
                  </div>
                \`).join('')}
              </div>\`
          ].join('');
        } catch (error) {
          mainContent.innerHTML = \`<div style="color: red; text-align: center; padding: 2rem;">
            <h3>❌ Error loading agents</h3>
            <p>Error: \${error.message}</p>
          </div>\`;
        }
      }
      
      // Workflows view
      async function showWorkflows() {
        updateNavigation('workflows');
        const mainContent = document.getElementById('main-content');
        
        try {
          const workflows = await fetch('http://localhost:8000/api/v1/workflows').then(r => r.json());
          window.workflowsData = workflows;
          
          mainContent.innerHTML = [
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">',
              '<h2 style="margin: 0; color: #333;">⚙️ Workflows Management</h2>',
              '<button onclick="showCreateWorkflow()" style="padding: 0.75rem 1.5rem; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">➕ New Workflow</button>',
            '</div>',
            
            workflows.length === 0 ? 
              '<div style="text-align: center; padding: 3rem; color: #6c757d;"><h3>No workflows found</h3><p>Create your first workflow to get started!</p></div>' :
              \`<div style="display: grid; gap: 1.5rem;">
                \${workflows.map(workflow => \`
                  <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #fd7e14;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                      <div>
                        <h3 style="margin: 0 0 0.5rem 0; color: #333;">⚙️ \${workflow.name}</h3>
                        <p style="margin: 0 0 0.75rem 0; color: #6c757d;">\${workflow.description || 'No description'}</p>
                        <div style="font-size: 0.875rem; color: #6c757d; margin-bottom: 0.5rem;">
                          <strong>Type:</strong> \${workflow.workflow_type}
                        </div>
                        \${workflow.entry_criteria ? \`<div style="font-size: 0.875rem; color: #6c757d; margin-bottom: 0.25rem;"><strong>Entry:</strong> \${workflow.entry_criteria}</div>\` : ''}
                        \${workflow.success_criteria ? \`<div style="font-size: 0.875rem; color: #6c757d;"><strong>Success:</strong> \${workflow.success_criteria}</div>\` : ''}
                      </div>
                      <div style="display: flex; gap: 0.5rem;">
                        <span style="background: \${workflow.is_active ? '#28a745' : '#6c757d'}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem;">\${workflow.is_active ? 'Active' : 'Inactive'}</span>
                        <button onclick="editWorkflow('\${workflow.id}')" style="padding: 0.5rem 1rem; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">Edit</button>
                        <button onclick="deleteWorkflow('\${workflow.id}')" style="padding: 0.5rem 1rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button>
                      </div>
                    </div>
                  </div>
                \`).join('')}
              </div>\`
          ].join('');
        } catch (error) {
          mainContent.innerHTML = \`<div style="color: red; text-align: center; padding: 2rem;">
            <h3>❌ Error loading workflows</h3>
            <p>Error: \${error.message}</p>
          </div>\`;
        }
      }
      
      // Utility functions
      async function refreshData() {
        console.log('Refreshing data...');
        switch(window.currentView) {
          case 'dashboard': await showDashboard(); break;
          case 'projects': await showProjects(); break;
          case 'tasks': await showTasks(); break;
          case 'agents': await showAgents(); break;
          case 'workflows': await showWorkflows(); break;
        }
      }
      
      function showCreateProject() {
        alert('Create Project functionality - would open a modal form');
      }
      
      function showCreateTask() {
        alert('Create Task functionality - would open a modal form');
      }
      
      function showCreateAgent() {
        alert('Create Agent functionality - would open a modal form');
      }
      
      function showCreateWorkflow() {
        alert('Create Workflow functionality - would open a modal form');
      }
      
      function editProject(id) {
        alert(\`Edit Project \${id} - would open edit form\`);
      }
      
      function deleteProject(id) {
        if (confirm('Are you sure you want to delete this project?')) {
          alert(\`Delete Project \${id} - would call DELETE API\`);
        }
      }
      
      function editTask(id) {
        alert(\`Edit Task \${id} - would open edit form\`);
      }
      
      function deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
          alert(\`Delete Task \${id} - would call DELETE API\`);
        }
      }
      
      function editAgent(id) {
        alert(\`Edit Agent \${id} - would open edit form\`);
      }
      
      function deleteAgent(id) {
        if (confirm('Are you sure you want to delete this agent?')) {
          alert(\`Delete Agent \${id} - would call DELETE API\`);
        }
      }
      
      function editWorkflow(id) {
        alert(\`Edit Workflow \${id} - would open edit form\`);
      }
      
      function deleteWorkflow(id) {
        if (confirm('Are you sure you want to delete this workflow?')) {
          alert(\`Delete Workflow \${id} - would call DELETE API\`);
        }
      }
    `);
    return;
  } else {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  // Serve files
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
    } else {
      res.writeHead(200);
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🚀 Task Manager Frontend');
  console.log('📱 Frontend running on: http://localhost:' + PORT);
  console.log('🔗 Backend API: http://localhost:8000');
  console.log('📚 API Docs: http://localhost:8000/docs');
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('');
});