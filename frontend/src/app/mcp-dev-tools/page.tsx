'use client';

import React, { useState, useEffect } from 'react';
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
    Checkbox
} from '@chakra-ui/react';
import { mcpTools, ApiToolDefinition, ApiToolParameter } from '@/lib/mcpTools';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Define a more specific type for parameters state
type ToolParameters = Record<string, string | number | boolean | undefined>;

const McpDevToolsPage: React.FC = () => {
    const [selectedToolId, setSelectedToolId] = useState<string>('');
    const [parameters, setParameters] = useState<ToolParameters>({});
    const [response, setResponse] = useState<Record<string, unknown> | string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const toast = useToast();

    const selectedTool: ApiToolDefinition | undefined = mcpTools.find(tool => tool.id === selectedToolId);

    useEffect(() => {
        // Reset parameters and response when tool changes
        setParameters({});
        setResponse(null);
        setError(null);
        if (selectedTool) {
            // Pre-fill parameters with default values if any (e.g., empty string for text)
            const initialParams: ToolParameters = {};
            selectedTool.parameters.forEach(param => {
                if (param.type === 'json_object_string') {
                    initialParams[param.name] = ''; // Default to empty string for textarea
                } else if (param.type === 'boolean') {
                    initialParams[param.name] = false; // Default boolean to false
                } else {
                    initialParams[param.name] = '';
                }
            });
            setParameters(initialParams);
        }
    }, [selectedToolId, selectedTool]);

    const handleParameterChange = (paramName: string, value: string | HTMLInputElement, type: ApiToolParameter['type']) => {
        setParameters(prevParams => ({
            ...prevParams,
            [paramName]: type === 'boolean' ? (value as HTMLInputElement).checked : value
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
                if (param.required && (value === undefined || value === '')) {
                    throw new Error(`Parameter '${param.name}' is required.`);
                }

                if (value !== undefined && value !== '') {
                    if (param.isPathParameter) {
                        path = path.replace(`{${param.name}}`, encodeURIComponent(value as string));
                    }
                    if (param.isQueryParameter) {
                        queryParams.append(param.name, value as string);
                    }
                    if (param.isBodyParameter) {
                        if (param.type === 'json_object_string') {
                            try {
                                requestBody = JSON.parse(value as string);
                            } catch (_e) {
                                throw new Error(`Invalid JSON for parameter \'${param.name}\': ${_e instanceof Error ? _e.message : String(_e)}`);
                            }
                        } else {
                            // Should not happen if type is json_object_string
                            requestBody = value as string; 
                        }
                    }
                }
            }

            const url = `${API_BASE_URL}${path}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

            const fetchOptions: RequestInit = {
                method: selectedTool.method,
                headers: {
                    'Content-Type': 'application/json',
                    // Add other headers like Authorization if needed
                },
            };

            if (requestBody && (selectedTool.method === 'POST' || selectedTool.method === 'PUT')) {
                fetchOptions.body = JSON.stringify(requestBody);
            }

            const res = await fetch(url, fetchOptions);
            
            const responseBody = await res.text(); // Get text first to handle empty or non-JSON responses

            if (!res.ok) {
                let errorDetail = `HTTP error! status: ${res.status}`;
                try {
                    const errorJson = JSON.parse(responseBody);
                    errorDetail = errorJson.detail || JSON.stringify(errorJson);
                } catch (_e) {
                    // If response is not JSON, use the text directly if available
                    errorDetail = responseBody || errorDetail;
                }
                throw new Error(errorDetail);
            }

            if (responseBody) {
                try {
                    setResponse(JSON.parse(responseBody));
                } catch (_e) { // Mark 'e' as unused
                    // If response isn't JSON but was OK (e.g. plain text)
                    setResponse(responseBody); 
                }
            } else {
                setResponse('No content returned (Status: ' + res.status + ')');
            }

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            toast({
                title: "API Call Error",
                description: message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box p={8}>
            <VStack spacing={6} align="stretch">
                <Heading as="h1" size="xl">MCP Dev Tools - API Tester</Heading>
                
                <FormControl>
                    <FormLabel htmlFor="tool-select">Select API Endpoint (Tool)</FormLabel>
                    <Select 
                        id="tool-select" 
                        placeholder="-- Select a tool --" 
                        value={selectedToolId}
                        onChange={(_e) => setSelectedToolId(_e.target.value)} // Mark 'e' as unused
                        focusBorderColor="blue.500"
                    >
                        {mcpTools.map(tool => (
                            <option key={tool.id} value={tool.id}>{tool.label} ({tool.method} {tool.path})</option>
                        ))}
                    </Select>
                </FormControl>

                {selectedTool && (
                    <Box borderWidth="1px" borderRadius="lg" p={6}>
                        <Heading as="h2" size="lg" mb={4}>{selectedTool.label}</Heading>
                        <Text fontSize="sm" color="gray.500" mb={1}>{selectedTool.method} {API_BASE_URL}{selectedTool.path}</Text>
                        {selectedTool.description && <Text mb={4} fontStyle="italic">{selectedTool.description}</Text>}
                        
                        <VStack spacing={4} align="stretch">
                            {selectedTool.parameters.map(param => (
                                <FormControl key={param.name} isRequired={param.required}>
                                    <FormLabel htmlFor={param.name}>
                                        {param.name} ({param.type})
                                        {param.isPathParameter ? ' (Path)' : ''}
                                        {param.isQueryParameter ? ' (Query)' : ''}
                                        {param.isBodyParameter ? ' (Body)' : ''}
                                    </FormLabel>
                                    {param.type === 'json_object_string' ? (
                                        <Textarea
                                            id={param.name}
                                            value={parameters[param.name] as string || ''}
                                            onChange={(e) => handleParameterChange(param.name, e.target.value, param.type)}
                                            placeholder={param.description || `Enter JSON for ${param.name}`}
                                            rows={5}
                                            fontFamily="monospace"
                                            focusBorderColor="blue.500"
                                        />
                                    ) : param.type === 'boolean' ? (
                                        <Checkbox
                                            id={param.name}
                                            isChecked={parameters[param.name] as boolean || false}
                                            onChange={(e) => handleParameterChange(param.name, e.target, param.type)}
                                        >
                                            {param.description || param.name}
                                        </Checkbox>
                                    ) : (
                                        <Input
                                            id={param.name}
                                            type={param.type === 'number' ? 'number' : 'text'}
                                            value={parameters[param.name] as string || ''}
                                            onChange={(e) => handleParameterChange(param.name, e.target.value, param.type)}
                                            placeholder={param.description || `Enter ${param.name}`}
                                            focusBorderColor="blue.500"
                                        />
                                    )}
                                    {param.description && param.type !== 'json_object_string' && param.type !== 'boolean' && (
                                        <Text fontSize="xs" color="gray.400" mt={1}>{param.description}</Text>
                                    )}
                                </FormControl>
                            ))}
                            <Button 
                                colorScheme="blue" 
                                onClick={handleSubmit} 
                                isLoading={isLoading}
                                mt={4}
                                isDisabled={!selectedToolId}
                            >
                                Execute Call
                            </Button>
                        </VStack>
                    </Box>
                )}

                {(response || error) && (
                    <Box mt={6} borderWidth="1px" borderRadius="lg" p={6}>
                        <Heading as="h3" size="md" mb={4}>Response</Heading>
                        {isLoading && <CircularProgress isIndeterminate color="blue.300" />}
                        {error && (
                            <Code colorScheme="red" p={4} display="block" whiteSpace="pre-wrap">
                                Error: {error}
                            </Code>
                        )}
                        {response && (
                            <Code p={4} display="block" whiteSpace="pre-wrap" overflowX="auto">
                                {typeof response === 'string' ? response : JSON.stringify(response, null, 2)}
                            </Code>
                        )}
                    </Box>
                )}
            </VStack>
        </Box>
    );
};

export default McpDevToolsPage; 