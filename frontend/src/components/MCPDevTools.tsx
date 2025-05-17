"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  Select,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Code,
  useToast,
  CircularProgress,
  Text,
  Checkbox,
  TabPanels,
  TabPanel,
  Tabs,
  TabList,
  Tab,
  Wrap,
  Flex,
  IconButton,
  Badge,
  HStack,
} from "@chakra-ui/react";
import { mcpTools, ApiToolDefinition, ApiToolParameter } from "@/lib/mcpTools";
import AppIcon from './common/AppIcon';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type ToolParameters = Record<string, string | number | boolean | undefined>;

const MCPDevTools: React.FC = () => {
  const [selectedToolId, setSelectedToolId] = useState<string>("");
  const [parameters, setParameters] = useState<ToolParameters>({});
  const [response, setResponse] = useState<
    Record<string, unknown> | string | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useToast();

  const selectedTool: ApiToolDefinition | undefined = mcpTools.find(
    (tool) => tool.id === selectedToolId,
  );

  useEffect(() => {
    setParameters({});
    setResponse(null);
    setError(null);
    if (selectedTool) {
      const initialParams: ToolParameters = {};
      selectedTool.parameters.forEach((param) => {
        if (param.type === "json_object_string") {
          initialParams[param.name] = "";
        } else if (param.type === "boolean") {
          initialParams[param.name] = false;
        } else {
          initialParams[param.name] = "";
        }
      });
      setParameters(initialParams);
    }
  }, [selectedToolId, selectedTool]);

  const handleParameterChange = (
    paramName: string,
    value: string | HTMLInputElement,
    type: ApiToolParameter["type"],
  ) => {
    let paramValue: string | number | boolean | undefined;
    if (type === "boolean") {
      paramValue = (value as HTMLInputElement).checked;
    } else {
      paramValue = value as string | number;
    }
    setParameters((prevParams) => ({
      ...prevParams,
      [paramName]: paramValue,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedTool) return;

    setIsLoading(true);
    setResponse(null);
    setError(null);

    let path = selectedTool.path;
    const queryParams = new URLSearchParams();
    let requestBody: Record<string, unknown> | string | null = null;

    try {
      for (const param of selectedTool.parameters) {
        const value = parameters[param.name];
        if (param.required && (value === undefined || value === "")) {
          throw new Error(`Parameter '${param.name}' is required.`);
        }

        if (value !== undefined && value !== "") {
          if (param.isPathParameter) {
            path = path.replace(
              `{${param.name}}`,
              encodeURIComponent(value as string),
            );
          }
          if (param.isQueryParameter) {
            queryParams.append(param.name, value as string);
          }
          if (param.isBodyParameter) {
            if (param.type === "json_object_string") {
              try {
                requestBody = JSON.parse(value as string);
              } catch {
                throw new Error(`Invalid JSON for parameter '${param.name}'`);
              }
            } else {
              requestBody = value as string;
            }
          }
        }
      }

      const url = `${API_BASE_URL}${path}${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

      const fetchOptions: RequestInit = {
        method: selectedTool.method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (
        requestBody &&
        (selectedTool.method === "POST" || selectedTool.method === "PUT")
      ) {
        fetchOptions.body = JSON.stringify(requestBody);
      }

      const res = await fetch(url, fetchOptions);
      const responseBody = await res.text();

      if (!res.ok) {
        let errorDetail = `HTTP error! status: ${res.status}`;
        try {
          const errorJson = JSON.parse(responseBody);
          errorDetail = errorJson.detail || JSON.stringify(errorJson);
        } catch {
          errorDetail = responseBody || errorDetail;
        }
        throw new Error(errorDetail);
      }

      if (responseBody) {
        try {
          setResponse(JSON.parse(responseBody));
        } catch {
          setResponse(responseBody);
        }
      } else {
        setResponse("No content returned (Status: " + res.status + ")");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      toast({
        title: "API Call Error",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p="8">
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl">
          MCP Dev Tools - API Tester
        </Heading>
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>API Tester</Tab>
            <Tab>Response</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <FormControl>
                <FormLabel htmlFor="tool-select">
                  Select API Endpoint (Tool)
                </FormLabel>
                <Select
                  id="tool-select"
                  placeholder="-- Select a tool --"
                  value={selectedToolId}
                  onChange={(_) => setSelectedToolId(_.target.value)}
                  focusBorderColor="borderFocused"
                >
                  {mcpTools.map((tool) => (
                    <option key={tool.id} value={tool.id}>
                      {tool.label} ({tool.method} {tool.path})
                    </option>
                  ))}
                </Select>
              </FormControl>
              {selectedTool && (
                <Box
                  borderWidth="DEFAULT"
                  borderRadius="lg"
                  p="6"
                  borderColor="borderDecorative"
                >
                  <Heading as="h2" size="lg" mb="4">
                    {selectedTool.label}
                  </Heading>
                  <Text fontSize="sm" color="textSecondary" mb="1">
                    {selectedTool.method} {API_BASE_URL}
                    {selectedTool.path}
                  </Text>
                  {selectedTool.description && (
                    <Text mb="4" fontStyle="italic">
                      {selectedTool.description}
                    </Text>
                  )}
                  <Wrap spacing={4} align="stretch">
                    {selectedTool.parameters.map((param) => (
                      <FormControl key={param.name} isRequired={param.required} minW="250px">
                        <FormLabel htmlFor={param.name}>
                          {param.name} ({param.type})
                          {param.isPathParameter ? " (Path)" : ""}
                          {param.isQueryParameter ? " (Query)" : ""}
                          {param.isBodyParameter ? " (Body)" : ""}
                        </FormLabel>
                        {param.type === "json_object_string" ? (
                          <Textarea
                            id={param.name}
                            value={(parameters[param.name] as string) || ""}
                            onChange={(e) =>
                              handleParameterChange(
                                param.name,
                                e.target.value,
                                param.type,
                              )
                            }
                            placeholder={
                              param.description || `Enter JSON for ${param.name}`
                            }
                            rows={5}
                            fontFamily="mono"
                            minH="calc(5 * 1.5em)"
                            focusBorderColor="borderFocused"
                          />
                        ) : param.type === "boolean" ? (
                          <Checkbox
                            id={param.name}
                            isChecked={(parameters[param.name] as boolean) || false}
                            onChange={(e) =>
                              handleParameterChange(param.name, e.target, param.type)
                            }
                            colorScheme="brandPrimaryScheme"
                          >
                            {param.description || param.name}
                          </Checkbox>
                        ) : (
                          <Input
                            id={param.name}
                            type={param.type === "number" ? "number" : "text"}
                            value={(parameters[param.name] as string) || ""}
                            onChange={(e) =>
                              handleParameterChange(
                                param.name,
                                e.target.value,
                                param.type,
                              )
                            }
                            placeholder={param.description || `Enter ${param.name}`}
                            focusBorderColor="borderFocused"
                          />
                        )}
                        {param.description &&
                          param.type !== "json_object_string" &&
                          param.type !== "boolean" && (
                            <Text fontSize="xs" color="textPlaceholder" mt="1">
                              {param.description}
                            </Text>
                          )}
                      </FormControl>
                    ))}
                  </Wrap>
                  <Button
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    isDisabled={!selectedToolId}
                    bg="bgInteractive"
                    color="textInverse"
                    mt="4"
                    _hover={{ bg: "bgInteractiveHover" }}
                  >
                    Execute Call
                  </Button>
                </Box>
              )}
            </TabPanel>
            <TabPanel>
              {(response || error) && (
                <Box
                  mt="6"
                  borderWidth="DEFAULT"
                  borderRadius="lg"
                  p="6"
                  borderColor="borderDecorative"
                >
                  <Heading as="h3" size="md" mb="4">
                    Response
                  </Heading>
                  {isLoading && (
                    <CircularProgress isIndeterminate color="iconInteractive" />
                  )}
                  {error && (
                    <Code
                      bg="errorBgSubtle"
                      color="textError"
                      p="4"
                      display="block"
                      whiteSpace="pre-wrap"
                    >
                      Error: {error}
                    </Code>
                  )}
                  {response && (
                    <Code
                      p="4"
                      display="block"
                      whiteSpace="pre-wrap"
                      maxH="xs"
                      overflowY="auto"
                      bg="bgSurfaceElevated"
                    >
                      {typeof response === "string"
                        ? response
                        : JSON.stringify(response, null, 2)}
                    </Code>
                  )}
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
        <Box
          position="fixed"
          bottom="0"
          right="0"
          width="400px"
          bg="bgSurface"
          borderTopLeftRadius="lg"
          shadow="lg"
          zIndex="overlay"
          borderWidth="1px"
          borderStyle="solid"
          borderColor="borderDecorative"
        >
          <Flex
            p="2"
            borderBottomWidth="1px"
            borderColor="borderDecorative"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="sm" display="flex" alignItems="center">
              <AppIcon name="tool" boxSize={4} mr={2} />
              MCP Dev Tools
            </Heading>
            <IconButton
              aria-label="Close dev tools"
              icon={<AppIcon name="close" boxSize={4} />}
              size="sm"
              variant="ghost"
              onClick={() => {}}
            />
          </Flex>
          <VStack p="4" spacing="4" align="stretch">
            <Box>
              <Heading size="xs" mb="2" display="flex" alignItems="center">
                <AppIcon name="info" boxSize={4} mr={2} />
                System Status
              </Heading>
              <HStack spacing="2">
                <Badge colorScheme={true ? "green" : "red"}>
                  <AppIcon 
                    name={true ? "checkcircle" : "error"} 
                    boxSize={3} 
                    mr={1} 
                  />
                  {true ? "Connected" : "Disconnected"}
                </Badge>
                {/* ... other badges ... */}
              </HStack>
            </Box>
            <Box>
              <Heading size="xs" mb="2" display="flex" alignItems="center">
                <AppIcon name="code" boxSize={4} mr={2} />
                Actions
              </Heading>
              <VStack spacing="2">
                <Button
                  size="sm"
                  width="full"
                  onClick={() => {}}
                  leftIcon={<AppIcon name="refresh" boxSize={4} />}
                >
                  Reconnect
                </Button>
                <Button
                  size="sm"
                  width="full"
                  onClick={() => {}}
                  leftIcon={<AppIcon name="delete" boxSize={4} />}
                >
                  Clear Cache
                </Button>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default MCPDevTools;
