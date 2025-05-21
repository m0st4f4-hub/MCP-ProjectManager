import React from "react";
import {
  Box,
  /*Heading, Icon,*/ Text,
  VStack,
  Flex,
  Button,
  Heading,
} from "@chakra-ui/react";
import { WarningTwoIcon } from "@chakra-ui/icons";
import AppIcon from "./common/AppIcon";
import { typography } from "../tokens";

interface TaskErrorProps {
  error: string;
  onRetry: () => void;
}

const TaskError: React.FC<TaskErrorProps> = ({ error, onRetry }) => {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      py={{ base: 12, md: 24 }}
      px={4}
      height="100%"
      bg="bgSurface"
    >
      <Box
        p="8"
        bg="bgSurface"
        borderRadius="lg"
        shadow="md"
        borderWidth="DEFAULT"
        borderStyle="solid"
        borderColor="borderDecorative"
        maxW="md"
      >
        <VStack spacing="5" align="center">
          <WarningTwoIcon boxSize={10} color="red.500" />
          <Heading
            color="textPrimary"
            fontSize={typography.fontSize.xl}
            textAlign="center"
          >
            Oops! Something went wrong.
          </Heading>
          <Text
            color="textSecondary"
            fontSize={typography.fontSize.md}
            textAlign="center"
          >
            {error}
          </Text>
          <Text
            color="textSecondary"
            fontSize={typography.fontSize.sm}
            textAlign="center"
          >
            Please try again, or contact support if the issue persists.
          </Text>
          <Button
            onClick={onRetry}
            colorScheme="red"
            size="md"
            leftIcon={<AppIcon name="refresh" boxSize={5} />}
          >
            Retry
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default TaskError;
