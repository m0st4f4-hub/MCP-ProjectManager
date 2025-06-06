import { describe, it, expect } from 'vitest';
import { render, screen } from '@/__tests__/utils/test-utils';
import RootLayout from '../layout';

const ProblemChild = () => {
  throw new Error('Test error');
};

describe('RootLayout ErrorBoundary', () => {
  it('renders fallback UI when child throws', () => {
    render(
      <RootLayout>
        <ProblemChild />
      </RootLayout>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });
});
