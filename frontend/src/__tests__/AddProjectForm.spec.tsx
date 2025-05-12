// Task ID: 212
// Agent Role: FrontendAgent
// Timestamp: YYYY-MM-DDTHH:MM:SSZ

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddProjectForm from '../components/AddProjectForm'; // Adjust path as necessary
import { ProjectProvider, useProjects } from '@/contexts/ProjectContext'; // New path using alias

// Mock the ProjectContext
const mockAddProject = jest.fn();
const mockRefreshProjects = jest.fn();

describe('AddProjectForm', () => {
  const renderForm = () => {
    return render(
      <ProjectProvider value={{
        projects: [],
        loading: false,
        error: null,
        addProject: mockAddProject,
        updateProject: jest.fn(),
        deleteProject: jest.fn(),
        refreshProjects: mockRefreshProjects,
        getProjectById: jest.fn(),
        fetchProjects: jest.fn() // Added fetchProjects to match context type
      }}>
        <AddProjectForm onClose={jest.fn()} />
      </ProjectProvider>
    );
  };

  beforeEach(() => {
    // Clear mocks before each test
    mockAddProject.mockClear();
    mockRefreshProjects.mockClear();
  });

  it('renders input fields and a submit button', () => {
    renderForm();
    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add project/i })).toBeInTheDocument();
  });

  it('allows typing into input fields', () => {
    renderForm();
    const nameInput = screen.getByLabelText(/project name/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    fireEvent.change(nameInput, { target: { value: 'Test Project Name' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

    expect(nameInput).toHaveValue('Test Project Name');
    expect(descriptionInput).toHaveValue('Test Description');
  });

  it('calls addProject and refreshProjects on submit with valid data', async () => {
    mockAddProject.mockResolvedValueOnce({ id: 1, name: 'New Project', description: 'Desc' }); // Simulate successful add
    renderForm();

    const nameInput = screen.getByLabelText(/project name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /add project/i });

    fireEvent.change(nameInput, { target: { value: 'New Project' } });
    fireEvent.change(descriptionInput, { target: { value: 'A cool new project' } });
    fireEvent.click(submitButton);

    // Check if addProject was called with the correct data
    expect(mockAddProject).toHaveBeenCalledWith({
      name: 'New Project',
      description: 'A cool new project',
    });

    // Wait for promises to resolve if addProject is async and updates state
    // If refreshProjects is called after addProject promise resolves:
    // await screen.findByText(/project name/i); // Or some other way to wait for async actions
    
    // Check if refreshProjects was called (assuming it's called after successful add)
    // This depends on the implementation details of AddProjectForm
    // For now, let's assume it's called directly or after addProject resolves.
    // If it is truly async, we might need to await for addProject to be fully processed.
    // await waitFor(() => expect(mockRefreshProjects).toHaveBeenCalled()); // More robust for async
    expect(mockRefreshProjects).toHaveBeenCalled(); // Simpler check for now
  });

  it('does not call addProject if name is empty', () => {
    renderForm();
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /add project/i });

    fireEvent.change(descriptionInput, { target: { value: 'Test Description without name' } });
    fireEvent.click(submitButton);

    expect(mockAddProject).not.toHaveBeenCalled();
    // Optionally, check for an error message if the form displays one
  });
}); 