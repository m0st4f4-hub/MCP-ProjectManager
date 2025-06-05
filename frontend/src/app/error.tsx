"use client";

import React, { useEffect } from "react";
import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Flex direction="column" align="center" justify="center" minH="100vh" gap={6}>
      <Heading as="h1" size="lg">Something went wrong</Heading>
      <Text>We encountered an unexpected error.</Text>
      <Button onClick={reset} colorScheme="blue">
        Try Again
      </Button>
      <Button as={Link} href="/" variant="outline" colorScheme="blue">
        Go Home
      </Button>
    </Flex>
  );
}
