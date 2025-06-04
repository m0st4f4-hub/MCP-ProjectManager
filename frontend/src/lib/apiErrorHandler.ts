import { createStandaloneToast, UseToastOptions } from "@chakra-ui/react";

export class ApiError extends Error {
  status?: number;
  code?: string | number;
  constructor(message: string, status?: number, code?: string | number) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const { toast } = createStandaloneToast();

export function handleApiError(
  error: unknown,
  title = "API Error",
  options?: Partial<UseToastOptions>,
): void {
  let description = "An unexpected error occurred.";
  if (error instanceof ApiError) {
    description = error.message;
  } else if (error instanceof Error) {
    description = error.message;
  } else if (typeof error === "string") {
    description = error;
  }

  toast({
    title,
    description,
    status: "error",
    duration: 5000,
    isClosable: true,
    ...options,
  });
}
