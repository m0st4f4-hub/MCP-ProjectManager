"use client";

import React from "react";
import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function NotFound() {
  return (
    <Flex direction="column" align="center" justify="center" minH="100vh" gap={6}>
      <Heading as="h1" size="lg">Oops! Page Not Found</Heading>
      <Text>The page you requested could not be found.</Text>
      <Button as={Link} href="/" colorScheme="blue">
        Go Home
      </Button>
    </Flex>
  );
}
