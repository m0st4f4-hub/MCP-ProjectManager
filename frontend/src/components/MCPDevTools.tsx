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
import styles from './MCPDevTools.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type ToolParameters = Record<string, string | number | boolean | undefined>;

const MCPDevTools: React.FC = () => {
    const [selectedToolId, setSelectedToolId] = useState<string>('');
    const [parameters, setParameters] = useState<ToolParameters>({});
    const [response, setResponse] = useState<Record<string, unknown> | string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const toast = useToast();

    const selectedTool: ApiToolDefinition | undefined = mcpTools.find(tool => tool.id === selectedToolId);

    useEffect(() => {
        setParameters({});
        setResponse(null);
        setError(null);
        if (selectedTool) {
            const initialParams: ToolParameters = {};
            selectedTool.parameters.forEach(param => {
                if (param.type === 'json_object_string') {
                    initialParams[param.name] = '';
                } else if (param.type === 'boolean') {
                    initialParams[param.name] = false;
                } else {
                    initialParams[param.name] = '';
                }
            });
            setParameters(initialParams);
        }
    }, [selectedToolId, selectedTool]);

    const handleParameterChange = (paramName: string, value: string | HTMLInputElement, type: ApiToolParameter['type']) => {
        let paramValue: string | number | boolean | undefined;
        if (type === 'boolean') {
            paramValue = (value as HTMLInputElement).checked;
        } else {
            paramValue = value as string | number;
        }
        setParameters(prevParams => ({
            ...prevParams,
            [paramName]: paramValue
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
                            } catch {
                                throw new Error(`Invalid JSON for parameter '${param.name}'`);
                            }
                        } else {
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
                },
            };

            if (requestBody && (selectedTool.method === 'POST' || selectedTool.method === 'PUT')) {
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
        <Box className={styles.devToolsContainer}>
            <VStack spacing={6} align="stretch" className={styles.mainVStack}>
                <Heading as="h1" size="xl">MCP Dev Tools - API Tester</Heading>
                <FormControl>
                    <FormLabel htmlFor="tool-select">Select API Endpoint (Tool)</FormLabel>
                    <Select 
                        id="tool-select" 
                        placeholder="-- Select a tool --" 
                        value={selectedToolId}
                        onChange={(_) => setSelectedToolId(_.target.value)}
                    >
                        {mcpTools.map(tool => (
                            <option key={tool.id} value={tool.id}>{tool.label} ({tool.method} {tool.path})</option>
                        ))}
                    </Select>
                </FormControl>
                {selectedTool && (
                    <Box className={styles.toolDetailsBox}>
                        <Heading as="h2" size="lg" className={styles.toolDetailsHeading}>{selectedTool.label}</Heading>
                        <Text className={styles.toolPathText}>{selectedTool.method} {API_BASE_URL}{selectedTool.path}</Text>
                        {selectedTool.description && <Text className={styles.toolDescriptionText}>{selectedTool.description}</Text>}
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
                                            className={styles.jsonTextarea}
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
                                        />
                                    )}
                                    {param.description && param.type !== 'json_object_string' && param.type !== 'boolean' && (
                                        <Text className={styles.parameterDescriptionText}>{param.description}</Text>
                                    )}
                                </FormControl>
                            ))}
                            <Button
                                onClick={handleSubmit}
                                isLoading={isLoading}
                                isDisabled={!selectedToolId}
                                className={styles.executeButton}
                            >
                                Execute Call
                            </Button>
                        </VStack>
                    </Box>
                )}
                {(response || error) && (
                    <Box className={styles.responseBox}>
                        <Heading as="h3" size="md" className={styles.responseHeading}>Response</Heading>
                        {isLoading && <CircularProgress isIndeterminate color="icon.primary" />}
                        {error && (
                            <Code
                                className={styles.errorCodeBlock}
                            >
                                Error: {error}
                            </Code>
                        )}
                        {response && (
                            <Code
                                className={styles.responseCodeBlock}
                            >
                                {typeof response === 'string' ? response : JSON.stringify(response, null, 2)}
                            </Code>
                        )}
                    </Box>
                )}
            </VStack>
        </Box>
    );
};

export default MCPDevTools; 