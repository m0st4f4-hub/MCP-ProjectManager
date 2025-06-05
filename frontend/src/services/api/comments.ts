import { request } from "./request";
import { buildApiUrl, API_CONFIG } from "./config";
import type {
  Comment,
  CommentCreateData,
  CommentUpdateData,
  CommentResponse,
  CommentListResponse,
  CommentFilters,
} from "@/types/comment";

export const commentsApi = {
  // Create a new comment
  create: async (data: CommentCreateData): Promise<Comment> => {
    const response = await request<CommentResponse>(
      buildApiUrl(API_CONFIG.ENDPOINTS.COMMENTS),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  // Get a comment by ID
  get: async (commentId: string): Promise<Comment> => {
    const response = await request<CommentResponse>(
      buildApiUrl(API_CONFIG.ENDPOINTS.COMMENTS, `/${commentId}`)
    );
    return response.data;
  },

  // List comments with optional filters
  list: async (
    filters?: CommentFilters & { skip?: number; limit?: number }
  ): Promise<CommentListResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return await request<CommentListResponse>(
      buildApiUrl(API_CONFIG.ENDPOINTS.COMMENTS, `?${params.toString()}`)
    );
  },

  // Update a comment
  update: async (
    commentId: string,
    data: CommentUpdateData
  ): Promise<Comment> => {
    const response = await request<CommentResponse>(
      buildApiUrl(API_CONFIG.ENDPOINTS.COMMENTS, `/${commentId}`),
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  // Delete a comment
  delete: async (commentId: string): Promise<boolean> => {
    return request<boolean>(
      buildApiUrl(API_CONFIG.ENDPOINTS.COMMENTS, `/${commentId}`),
      {
        method: "DELETE",
      }
    );
  },

  // Get comments for a specific task
  getTaskComments: async (
    projectId: string,
    taskNumber: number
  ): Promise<Comment[]> => {
    const response = await request<CommentListResponse>(
      buildApiUrl(API_CONFIG.ENDPOINTS.COMMENTS, `/task/${projectId}/${taskNumber}`)
    );
    return response.data;
  },

  // Get comments for a specific project
  getProjectComments: async (projectId: string): Promise<Comment[]> => {
    const response = await request<CommentListResponse>(
      buildApiUrl(API_CONFIG.ENDPOINTS.COMMENTS, `/project/${projectId}`)
    );
    return response.data;
  },
};
