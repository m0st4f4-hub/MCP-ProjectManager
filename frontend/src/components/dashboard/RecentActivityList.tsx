"use client"; // Added 'use client' as it's a client component

import React from "react";
import {
  Badge,
  Box, // Added
  Heading, // Added
  VStack, // Added for list
  Flex, // Added for list item content (supports wrap)
  Text, // Added for styled text elements
  // List, ListItem, HStack // Alternatives
} from "@chakra-ui/react";
import AppIcon from "../common/AppIcon";
// import styles from './RecentActivityList.module.css'; // To be removed

// Import tokens
import { sizing, shadows, typography } from "../../tokens";

interface ActivityItem {
  type: string;
  title: string;
  date?: string; // Made optional as in original data structure
  agent?: string;
  project?: string;
}

interface RecentActivityListProps {
  recentActivity: ActivityItem[];
}

const RecentActivityList: React.FC<RecentActivityListProps> = ({
  recentActivity,
}) => {
  return (
    <Box
      // className={styles.container} // Removed
      p={sizing.spacing[4]} // spacing.4
      bg="bgSurface"
      borderRadius={sizing.borderRadius.lg} // radii.lg
      boxShadow={shadows.md} // shadows.md
      borderWidth="DEFAULT"
      borderStyle="solid"
      borderColor="borderDecorative"
      minH={sizing.height.lg} // Use a token for min height if possible
    >
      <Heading
        as="h3"
        fontSize={typography.fontSize.h4} // h4 for section heading
        fontWeight={typography.fontWeight.semibold}
        lineHeight={typography.lineHeight.condensed}
        mb={sizing.spacing[4]}
        color="textPrimary"
        display="flex"
        alignItems="center"
      >
        <AppIcon name="history" boxSize={5} mr={2} />
        Recent Activity (All Active Projects)
      </Heading>
      <VStack
        as="ul" // Keep ul semantic element
        spacing={sizing.spacing[2]} // spacing.2
        align="stretch" // To make list items take full width
      >
        {recentActivity.length === 0 ? (
          <Box
            as="li" /* className={styles.noActivityText} - using Text props now */
          >
            <Text color="textSecondary">
              No recent activity for this selection.
            </Text>
          </Box>
        ) : (
          recentActivity.map((item, i) => (
            <Box as="li" key={i} /* className={styles.listItem} - no styles */>
              <Flex
                align="center"
                gap={sizing.spacing[2]} // spacing.2
                wrap="wrap"
              >
                <AppIcon
                  name={
                    item.type === "Completed"
                      ? "checkcircle"
                      : item.type === "Error"
                        ? "warning"
                        : "history"
                  }
                  boxSize={4}
                  mr={1}
                />
                <Badge
                  colorScheme={
                    item.type === "Completed"
                      ? "green"
                      : item.type === "Error"
                        ? "red"
                        : "gray"
                  }
                >
                  {item.type}
                </Badge>
                <Text as="span" fontWeight={typography.fontWeight.bold}>
                  {item.title}
                </Text>
                {item.agent && (
                  <Text
                    as="span"
                    fontSize={typography.fontSize.xs}
                    color="textSecondary"
                  >
                    Agent: {item.agent}
                  </Text>
                )}
                {item.project && (
                  <Text
                    as="span"
                    fontSize={typography.fontSize.xs}
                    color="textSecondary"
                  >
                    Project: {item.project}
                  </Text>
                )}
                <Text
                  as="span"
                  fontSize={typography.fontSize.xs}
                  color="textSecondary"
                >
                  {item.date ? new Date(item.date).toLocaleString() : ""}
                </Text>
              </Flex>
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
};

export default RecentActivityList;
