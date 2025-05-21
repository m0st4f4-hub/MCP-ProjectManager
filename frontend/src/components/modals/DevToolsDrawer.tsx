import React from "react";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Flex,
  Image,
  Text,
} from "@chakra-ui/react";
import MCPDevTools from "../MCPDevTools";

type DevToolsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  colorMode: string;
};

const DevToolsDrawer: React.FC<DevToolsDrawerProps> = ({
  isOpen,
  onClose,
  colorMode,
}) => {
  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
      <DrawerOverlay bg="overlayDefault" />
      <DrawerContent bg="surface">
        <DrawerHeader borderBottomWidth="1px" borderColor="borderDecorative">
          <Flex align="center">
            <Image
              src={
                colorMode === "dark"
                  ? "/assets/images/icon_dark.png"
                  : "/assets/images/icon_light.png"
              }
              alt="Project Manager Icon"
              boxSize="6"
              mr="2"
            />
            <Text>MCP Dev Tools</Text>
          </Flex>
        </DrawerHeader>
        <DrawerBody>
          <MCPDevTools />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default DevToolsDrawer;
