import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ModalProvider from '../ModalProvider';
import Modal from 'react-modal';

vi.mock('react-modal', () => ({ default: { setAppElement: vi.fn() } }));

describe('ModalProvider', () => {
  it('sets react-modal app element on mount', () => {
    render(
      <ModalProvider>
        <div />
      </ModalProvider>
    );

    expect(Modal.setAppElement).toHaveBeenCalledWith(document.body);
  });

  it('renders children', () => {
    render(
      <ModalProvider>
        <span data-testid="child">Child</span>
      </ModalProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
