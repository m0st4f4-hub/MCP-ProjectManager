import { describe, it, expect } from 'vitest';
import { render, screen } from '@/__tests__/utils/test-utils';
import ErrorBoundary from '../ErrorBoundary';

const ProblemChild = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  it('renders fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });

  it('renders custom fallback when provided', () => {
    const Custom = () => <div data-testid="custom">Oops</div>;
    render(
      <ErrorBoundary fallback={<Custom />}>
        <ProblemChild />
      </ErrorBoundary>
    );
    expect(screen.getByTestId('custom')).toHaveTextContent('Oops');
  });
});
