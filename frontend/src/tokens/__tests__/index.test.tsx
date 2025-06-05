import { describe, it, expect } from 'vitest';
import { tokens, type Tokens } from '../index';

describe('tokens object', () => {
  it('should satisfy the Tokens type', () => {
    const typedTokens: Tokens = tokens;
    expect(typedTokens).toBe(tokens);
  });
});
