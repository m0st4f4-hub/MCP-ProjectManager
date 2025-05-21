import React from "react";
import {
  // Box,
  Text,
  VStack,
  Flex,
  // Skeleton,
  // HStack,
} from "@chakra-ui/react";
import AppIcon from "./common/AppIcon";
import { typography } from "../tokens";
// import styles from './TaskLoading.module.css';

const TaskLoading: React.FC = () => {
  return (
    <Flex
      // className="loadingContainer-replacement"
      w="full"
      minH="70vh"
      alignItems="center"
      justifyContent="center"
      py={{ base: "4", md: "12" }}
    >
      <Flex
        // className="loadingBox-replacement"
        maxW="lg"
        w="full"
        bg="surfaceElevated"
        rounded="2xl"
        shadow="2xl"
        borderWidth="DEFAULT"
        borderStyle="solid"
        borderColor="borderDecorative"
        alignItems="center"
        justifyContent="center"
        p={{ base: "4", md: "8" }}
        mt={{ base: "8", md: "16" }}
      >
        <VStack
          // className="loadingContentStack-replacement"
          spacing="6"
          w="full"
          alignItems="center"
        >
          <AppIcon name="loading" boxSize={8} />
          <Text
            // className="loadingText-replacement"
            color="textSecondary"
            fontSize={typography.fontSize.lg}
          >
            Loading tasks...
          </Text>
        </VStack>
      </Flex>
    </Flex>
  );
};

export default TaskLoading;
