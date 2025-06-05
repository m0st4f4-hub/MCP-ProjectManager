"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { memoryApi } from "@/services/api";

const MemoryIngestForm: React.FC = () => {
  const toast = useToast();
  const [mode, setMode] = useState<"file" | "url" | "text">("file");
  const [filePath, setFilePath] = useState("");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === "file") {
        await memoryApi.ingestFile(filePath);
      } else if (mode === "url") {
        await memoryApi.ingestUrl(url);
      } else {
        await memoryApi.ingestText(text);
      }
      toast({
        title: "Ingestion successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setFilePath("");
      setUrl("");
      setText("");
    } catch (err) {
      toast({
        title: "Ingestion failed",
        description: err instanceof Error ? err.message : "Failed to ingest",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      p={4}
      borderWidth="1px"
      borderRadius="md"
      bg="bg.surface"
    >
      <VStack spacing={4} align="stretch">
        <RadioGroup value={mode} onChange={(v) => setMode(v as "file" | "url" | "text")}>
          <HStack spacing={4}>
            <Radio value="file">File</Radio>
            <Radio value="url">URL</Radio>
            <Radio value="text">Text</Radio>
          </HStack>
        </RadioGroup>

        {mode === "file" && (
          <FormControl>
            <FormLabel>File Path</FormLabel>
            <Input
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="/path/to/file.txt"
            />
          </FormControl>
        )}

        {mode === "url" && (
          <FormControl>
            <FormLabel>URL</FormLabel>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </FormControl>
        )}

        {mode === "text" && (
          <FormControl>
            <FormLabel>Text</FormLabel>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text"
            />
          </FormControl>
        )}

        <Button type="submit" colorScheme="blue" isLoading={isLoading}>
          Ingest
        </Button>
      </VStack>
    </Box>
  );
};

export default MemoryIngestForm;
