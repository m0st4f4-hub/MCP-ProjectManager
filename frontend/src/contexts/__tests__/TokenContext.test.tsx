import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import { TokenProvider, useToken } from '../TokenContext';

const Dummy = () => {
  const { token, setToken, clearToken } = useToken();
  return (
    <div>
      <span data-testid="token-value">{token}</span>
      <button onClick={() => setToken('new-token')} data-testid="set-button" />
      <button onClick={clearToken} data-testid="clear-button" />
    </div>
  );
};

describe('TokenContext', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('initializes from localStorage and updates token', async () => {
    localStorage.setItem('token', 'stored');
    render(
      <TestWrapper>
        <TokenProvider>
          <Dummy />
        </TokenProvider>
      </TestWrapper>
    );
    expect(screen.getByTestId('token-value').textContent).toBe('stored');
    await user.click(screen.getByTestId('set-button'));
    expect(screen.getByTestId('token-value').textContent).toBe('new-token');
    await user.click(screen.getByTestId('clear-button'));
    expect(screen.getByTestId('token-value').textContent).toBe('');
  });
});
