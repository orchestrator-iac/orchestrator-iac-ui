import apiService from "./apiService";
import {
  TemplateDetail,
  TemplatesListResponse,
  PublishTemplateRequest,
  UpdateTemplateRequest,
  ToggleLikeResponse,
  UseTemplateResponse,
} from "../types/template";

export interface ListTemplatesParams {
  page?: number;
  size?: number;
  search?: string;
  sort?: "popularity" | "newest";
}

const normalizeTemplate = <T extends Record<string, any>>(raw: T): T => ({
  ...raw,
  id: raw.id || raw._id,
});

/**
 * Service for Template API endpoints.
 * Mirrors the pattern of orchestratorService.ts.
 */
export const templateService = {
  /** GET /templates — public, no auth required */
  listTemplates: async (
    params: ListTemplatesParams = {},
  ): Promise<TemplatesListResponse> => {
    const { page = 1, size = 20, search, sort = "popularity" } = params;
    const queryParams = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort,
    });
    if (search) queryParams.set("search", search);

    const response = await apiService.get(`/templates?${queryParams.toString()}`);
    return {
      ...response,
      templates: (response.templates || []).map(normalizeTemplate),
    };
  },

  /** GET /templates/:id — public. Each call increments viewCount server-side. */
  getTemplate: async (id: string, signal?: AbortSignal): Promise<TemplateDetail> => {
    const response = await apiService.get(`/templates/${id}`, { signal });
    return normalizeTemplate(response);
  },

  /** POST /templates — requires auth */
  publishTemplate: async (
    data: PublishTemplateRequest,
  ): Promise<TemplateDetail> => {
    const response = await apiService.post("/templates", data);
    return normalizeTemplate(response);
  },

  /** PUT /templates/:id — requires auth (owner only) */
  updateTemplate: async (
    id: string,
    data: UpdateTemplateRequest,
  ): Promise<TemplateDetail> => {
    const response = await apiService.put(`/templates/${id}`, data);
    return normalizeTemplate(response);
  },

  /** DELETE /templates/:id — requires auth (owner only) */
  deleteTemplate: async (id: string): Promise<void> => {
    await apiService.delete(`/templates/${id}`);
  },

  /**
   * POST /templates/:id/like — requires auth.
   * Calling again toggles unlike.
   */
  toggleLike: async (id: string): Promise<ToggleLikeResponse> => {
    return apiService.post(`/templates/${id}/like`, {});
  },

  /**
   * POST /templates/:id/use — requires auth.
   * Forks the template into a new orchestrator for the caller.
   */
  useTemplate: async (id: string): Promise<UseTemplateResponse> => {
    return apiService.post(`/templates/${id}/use`, {});
  },

  /**
   * View is recorded server-side automatically on GET /templates/:id.
   * This method is intentionally a no-op to avoid double-counting.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  recordView: async (_id: string): Promise<void> => {
    // No-op: getTemplate already triggers the view increment on the backend.
  },
};
