"use client";
import * as logger from '@/utils/logger';

import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }
      return (
        <Box role="alert" textAlign="center" p={6}>
          <Heading size="md" mb={2}>
            Something went wrong.
          </Heading>
          <Text>Try refreshing the page.</Text>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
