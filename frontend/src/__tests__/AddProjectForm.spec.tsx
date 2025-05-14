// Task ID: 212
// Agent Role: FrontendAgent
// Timestamp: YYYY-MM-DDTHH:MM:SSZ

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AddProjectForm from '../components/AddProjectForm'; // Adjust path as necessary

jest.mock('@/contexts/ProjectContext'); // Mock ProjectContext

// Mock the onSubmit prop function which likely comes from useProjectStore
const mockOnSubmit = jest.fn();

describe('AddProjectForm', () => {
  const renderForm = () => {
    return render(
      <AddProjectForm onClose={jest.fn()} onSubmit={mockOnSubmit} />
    );
  };

  beforeEach(() => {
    // Clear mocks before each test
    mockOnSubmit.mockClear(); // Clear the onSubmit mock
  });

  it('renders input fields and a submit button', () => {
    renderForm();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /define new initiative/i })).toBeInTheDocument();
  });

  it('allows typing into input fields', async () => {
    renderForm();
    const nameInput = screen.getByLabelText(/name/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test Project Name' } });
    });
    await act(async () => {
      fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    });

    expect(nameInput).toHaveValue('Test Project Name');
    expect(descriptionInput).toHaveValue('Test Description');
  });

  it('calls onSubmit with valid data', async () => {
    renderForm();

    const nameInput = screen.getByLabelText(/name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /define new initiative/i });

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'New Project' } });
    });
    await act(async () => {
      fireEvent.change(descriptionInput, { target: { value: 'A cool new project' } });
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Check if onSubmit was called with the correct data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'New Project',
        description: 'A cool new project',
      });
    });
  });

  it('does not call onSubmit if name is empty', async () => {
    renderForm();
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /define new initiative/i });

    await act(async () => {
      fireEvent.change(descriptionInput, { target: { value: 'Test Description without name' } });
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
    // Optionally, check for an error message if the form displays one
  });
}); 