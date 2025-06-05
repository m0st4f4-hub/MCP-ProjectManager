import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
} from '@chakra-ui/react';
import TaskPagination from '../task/TaskPagination';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  isNumeric?: boolean;
}

export interface Action<T> {
  label: string;
  render: (row: T) => React.ReactNode;
}

export interface PaginationProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  pagination?: PaginationProps;
  containerProps?: React.ComponentProps<typeof Box>;
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  actions,
  pagination,
  containerProps,
}: DataTableProps<T>) {
  return (
    <Box {...containerProps}>
      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              {columns.map((col) => (
                <Th key={col.header} isNumeric={col.isNumeric}>
                  {col.header}
                </Th>
              ))}
              {actions && <Th>Actions</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row, idx) => (
              <Tr key={row.id ?? idx} data-testid="table-row">
                {columns.map((col) => (
                  <Td key={String(col.header)} isNumeric={col.isNumeric}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : (row as any)[col.accessor]}
                  </Td>
                ))}
                {actions && (
                  <Td>
                    {actions.map((action) => (
                      <React.Fragment key={action.label}>
                        {action.render(row)}
                      </React.Fragment>
                    ))}
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      {pagination && (
        <TaskPagination
          currentPage={pagination.currentPage}
          itemsPerPage={pagination.itemsPerPage}
          totalItems={pagination.totalItems}
          onPrevious={pagination.onPrevious}
          onNext={pagination.onNext}
        />
      )}
    </Box>
  );
}

export default DataTable;
