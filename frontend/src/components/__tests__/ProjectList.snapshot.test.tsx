import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, TestWrapper } from '@/__tests__/utils/test-utils';
import ProjectList from '../project/ProjectList';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual<typeof import('@chakra-ui/react')>('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

describe('ProjectList snapshot', () => {
  it('renders consistently', () => {
    const { asFragment } = render(
      <TestWrapper>
        <ProjectList />
      </TestWrapper>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
