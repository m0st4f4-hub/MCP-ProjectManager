import React from "react";
import {
  Flex,
  HStack,
  Checkbox,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Divider,
  Text,
} from "@chakra-ui/react";
import { ChevronDownIcon, DeleteIcon } from "@chakra-ui/icons";
import * as statusUtils from "@/lib/statusUtils";
import AppIcon from "./common/AppIcon";
import { typography } from "../tokens";

interface BulkActionsBarProps {
  selectedTaskIds: string[];
  allFilterableTaskIds: string[];
  areAllTasksSelected: boolean;
  onSelectAllToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteSelected: () => void;
  bulkSetStatusTasks: (statusId: string) => void;
  loading?: boolean;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedTaskIds,
  allFilterableTaskIds,
  areAllTasksSelected,
  onSelectAllToggle,
  onDeleteSelected,
  bulkSetStatusTasks,
  loading = false,
}) => {
  const availableStatuses = React.useMemo(() => {
    return statusUtils.getAllStatusIds().filter((id) => {
      const attrs = statusUtils.getStatusAttributes(id);
      return !attrs?.isTerminal && !attrs?.isDynamic;
    });
  }, []);

  if (selectedTaskIds.length === 0 && allFilterableTaskIds.length === 0) {
    return null;
  }

  return (
    <>
      <Divider borderColor="borderDecorative" />
      <Flex justify="space-between" align="center" wrap="wrap" gap="3">
        <HStack spacing="3">
          <AppIcon name="info" color="blue.400" mr={2} />
          <Checkbox
            isChecked={areAllTasksSelected}
            onChange={onSelectAllToggle}
            isDisabled={allFilterableTaskIds.length === 0}
            colorScheme="brandPrimaryScheme"
            size="sm"
          >
            <Text as="span" ml="2" fontSize={typography.fontSize.sm}>
              Select All ({allFilterableTaskIds.length})
            </Text>
          </Checkbox>
          {selectedTaskIds.length > 0 && (
            <Text fontSize={typography.fontSize.sm} color="textSecondary">
              {selectedTaskIds.length} selected
            </Text>
          )}
        </HStack>
        {selectedTaskIds.length > 0 && (
          <Menu>
            <MenuButton
              as={Button}
              variant="outline"
              colorScheme="brandPrimaryScheme"
              size="sm"
              rightIcon={<ChevronDownIcon />}
            >
              Bulk Actions
            </MenuButton>
            <MenuList
              bg="bgSurface"
              borderColor="borderDecorative"
              shadow="md"
              minW="menu"
              py="1"
              zIndex="popover"
            >
              <MenuItem
                icon={<DeleteIcon />}
                color="error"
                _hover={{ bg: "errorBgSubtle" }}
                onClick={onDeleteSelected}
                isDisabled={loading}
              >
                Delete Selected ({selectedTaskIds.length})
              </MenuItem>
              <MenuDivider borderColor="borderDecorative" />
              <MenuItem
                isDisabled
                _hover={{ bg: "transparent" }}
                cursor="default"
                color="textSecondary"
              >
                Set Status to...
              </MenuItem>
              {availableStatuses.map((statusId) => {
                const statusAttrs = statusUtils.getStatusAttributes(statusId);
                return (
                  <MenuItem
                    key={statusId}
                    onClick={() => bulkSetStatusTasks(statusId)}
                    pl="8"
                    _hover={{ bg: "gray.100", _dark: { bg: "gray.700" } }}
                  >
                    {statusAttrs?.displayName || statusId}
                  </MenuItem>
                );
              })}
            </MenuList>
          </Menu>
        )}
      </Flex>
    </>
  );
};

export default BulkActionsBar;
