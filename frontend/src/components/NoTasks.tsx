import React from "react";
import NextImage from "next/image"; // Renamed to avoid conflict if Chakra Image is used
import {
  Box,
  Button,
  Heading,
  Text,
  useColorMode,
  Flex,
  VStack,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { semanticColors } from "@/tokens/colors"; // Added import
import { typography } from "@/tokens/typography"; // Added import
import AppIcon from "./common/AppIcon";
// import styles from './NoTasks.module.css'; // Removed

interface NoTasksProps {
  onAddTask: () => void;
}

const NoTasks: React.FC<NoTasksProps> = ({ onAddTask }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Define colors based on theme and color mode
  const surfaceBg = isDark
    ? semanticColors.surface.dark
    : semanticColors.surface.DEFAULT;
  const decorativeBorderColor = isDark
    ? semanticColors.borderDecorative.dark
    : semanticColors.borderDecorative.DEFAULT;
  // Assuming text on this surface should use onSurface colors
  const primaryTextColor = isDark
    ? semanticColors.onSurface.dark
    : semanticColors.onSurface.DEFAULT;
  const secondaryTextColor = isDark
    ? semanticColors.textSecondary.dark
    : semanticColors.textSecondary.DEFAULT; // Or a variant of onSurface if available

  const buttonBg = isDark
    ? semanticColors.primary.dark
    : semanticColors.primary.DEFAULT;
  const buttonTextColor = isDark
    ? semanticColors.onPrimary.dark
    : semanticColors.onPrimary.DEFAULT;
  const buttonHoverBg = isDark
    ? semanticColors.primaryHover.dark
    : semanticColors.primaryHover.DEFAULT;

  return (
    <Flex
      align="center"
      justify="center"
      w="full"
      minH="70vh"
      py={{ base: 4, md: 12 }} // .noTasksContainer responsive padding
    >
      <VStack // Replaced Box with VStack for semantic layout and centering
        as={Box} // To retain Box props like maxW, bg, p, rounded etc. if needed, or apply them to VStack directly
        maxW="lg" // .noTasksBox (lg is 32rem, close to 500px)
        w="full"
        bg={surfaceBg} // Applied semantic color
        p={{ base: 4, md: 8 }} // .noTasksBox responsive padding
        rounded="2xl"
        shadow="2xl" // shadow="xl" from CSS, 2xl is more prominent
        borderWidth="DEFAULT"
        borderColor={decorativeBorderColor} // Applied semantic color
        mt={{ base: 8, md: 16 }} // .noTasksBox responsive margin
        textAlign="center"
        spacing={4} // Added spacing for VStack items
      >
        <Box mb="4" boxSize="16">
          {" "}
          {/* Wrapper for NextImage, .noTasksImage styles */}
          <NextImage
            src={
              isDark
                ? "/assets/images/icon_dark.png"
                : "/assets/images/icon_light.png"
            }
            alt="Project Manager Icon"
            width={64}
            height={64}
          />
        </Box>
        <Heading
          as="h2"
          size="lg"
          fontWeight={typography.fontWeight.semibold}
          color={primaryTextColor}
          mb="3"
          display="flex"
          alignItems="center"
        >
          <AppIcon name="listordered" boxSize={6} mr={2} />
          No Tasks Found
        </Heading>
        <Text
          color={secondaryTextColor}
          mb="4"
          maxW="80%"
          display="flex"
          alignItems="center"
        >
          <AppIcon name="infooutline" boxSize={4} mr={2} />
          There are no tasks matching your current filters, or no tasks have
          been created yet.
        </Text>
        <Button
          onClick={onAddTask}
          size="md"
          bg={buttonBg} // Applied semantic color
          color={buttonTextColor} // Applied semantic color
          _hover={{ bg: buttonHoverBg }} // Applied semantic color
          leftIcon={<AddIcon />} // Replaced AppIcon with AddIcon
        >
          Add Your First Task
        </Button>
      </VStack>
    </Flex>
  );
};

export default NoTasks;
