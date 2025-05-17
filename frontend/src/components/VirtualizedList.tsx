"use client";

import React from "react";
import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Box, VStack, Text } from "@chakra-ui/react";
import AppIcon from './common/AppIcon';
import { typography } from '../tokens';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, style: React.CSSProperties) => React.ReactNode;
  overscanCount?: number;
  isLoading: boolean;
}

function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  overscanCount = 5,
  isLoading,
}: VirtualizedListProps<T>) {
  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    return <div style={style}>{renderItem(items[index], style)}</div>;
  };

  return (
    <Box height={`calc(100vh - 12.5rem)`} width="full">
      {items.length === 0 ? (
        <Box
          p="4"
          bg="bgSurface"
          borderRadius="lg"
          shadow="md"
          borderWidth="DEFAULT"
          borderStyle="solid"
          borderColor="borderDecorative"
        >
          <VStack spacing="4" align="center">
            <AppIcon name="inbox" boxSize={8} color="textSecondary" />
            <Text color="textSecondary" fontSize={typography.fontSize.lg}>
              No items to display
            </Text>
          </VStack>
        </Box>
      ) : isLoading ? (
        <Box
          p="4"
          bg="bgSurface"
          borderRadius="lg"
          shadow="md"
          borderWidth="DEFAULT"
          borderStyle="solid"
          borderColor="borderDecorative"
        >
          <VStack spacing="4" align="center">
            <AppIcon name="loading" boxSize={8} />
            <Text color="textSecondary" fontSize={typography.fontSize.lg}>
              Loading items...
            </Text>
          </VStack>
        </Box>
      ) : (
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeList
              height={height}
              width={width}
              itemCount={items.length}
              itemSize={itemHeight}
              overscanCount={overscanCount}
            >
              {Row}
            </FixedSizeList>
          )}
        </AutoSizer>
      )}
    </Box>
  );
}

export default React.memo(VirtualizedList);
