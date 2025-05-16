'use client';

import React from 'react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box } from '@chakra-ui/react';

interface VirtualizedListProps<T> {
    items: T[];
    itemHeight: number;
    renderItem: (item: T, style: React.CSSProperties) => React.ReactNode;
    overscanCount?: number;
}

function VirtualizedList<T>({ 
    items, 
    itemHeight, 
    renderItem, 
    overscanCount = 5 
}: VirtualizedListProps<T>) {
    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        return <div style={style}>{renderItem(items[index], style)}</div>;
    };

    return (
        <Box height="calc(100vh - 200px)" width="100%">
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
        </Box>
    );
}

export default React.memo(VirtualizedList); 