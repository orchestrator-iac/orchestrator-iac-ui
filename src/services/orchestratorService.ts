import apiService from "./apiService";
import {
  SaveOrchestratorRequest,
  SaveOrchestratorResponse,
  OrchestratorListItem,
  ListOrchestrationsResponse,
} from "../types/orchestrator";

type MetadataLike = {
  createdAt?: unknown;
  updatedAt?: unknown;
} & Record<string, unknown>;

const toIsoString = (value: unknown): string | undefined => {
  if (!value) {
    return undefined;
  }
  if (typeof value === "string") {
    return value;
  }
  const date = new Date(value as any);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const normalizeMetadataDates = (metadata?: MetadataLike) => {
  if (!metadata) {
    return metadata;
  }

  const { createdAt, updatedAt, ...rest } = metadata;
  const normalizedCreatedAt = toIsoString(createdAt);
  const normalizedUpdatedAt = toIsoString(updatedAt);

  return {
    ...rest,
    ...(normalizedCreatedAt ? { createdAt: normalizedCreatedAt } : {}),
    ...(normalizedUpdatedAt ? { updatedAt: normalizedUpdatedAt } : {}),
  };
};

const withNormalizedDates = <T extends Record<string, any>>(response: T) => ({
  ...response,
  createdAt: toIsoString(response.createdAt),
  updatedAt: toIsoString(response.updatedAt),
  metadata: normalizeMetadataDates(response.metadata),
});

/**
 * Service for managing orchestrator configurations (nodes, edges, metadata)
 * Handles CRUD operations for infrastructure templates
 */
export const orchestratorService = {
  /**
   * Save a new orchestrator configuration
   * @param data - Complete orchestrator state including nodes, edges, and metadata
   * @returns Saved configuration with generated ID
   */
  saveOrchestrator: async (
    data: SaveOrchestratorRequest
  ): Promise<SaveOrchestratorResponse> => {
    try {
      const response = await apiService.post("/orchestrators", data);
      return withNormalizedDates(response);
    } catch (error) {
      console.error("Failed to save orchestrator:", error);
      throw new Error("Failed to save orchestrator configuration");
    }
  },

  /**
   * Update an existing orchestrator configuration
   * @param id - Orchestrator ID
   * @param data - Updated orchestrator state
   * @returns Updated configuration
   */
  updateOrchestrator: async (
    id: string,
    data: Partial<SaveOrchestratorRequest>
  ): Promise<SaveOrchestratorResponse> => {
    try {
      const response = await apiService.put(`/orchestrators/${id}`, data);
      return withNormalizedDates(response);
    } catch (error) {
      console.error("Failed to update orchestrator:", error);
      throw new Error("Failed to update orchestrator configuration");
    }
  },

  /**
   * Get a specific orchestrator configuration by ID
   * @param id - Orchestrator ID
   * @returns Complete orchestrator configuration
   */
  getOrchestrator: async (id: string): Promise<SaveOrchestratorResponse> => {
    try {
      const response = await apiService.get(`/orchestrators/${id}`);
      return withNormalizedDates(response);
    } catch (error) {
      console.error("Failed to fetch orchestrator:", error);
      throw new Error("Failed to fetch orchestrator configuration");
    }
  },

  /**
   * List all orchestrator configurations for the authenticated user
   * @param page - Page number (default: 1)
   * @param size - Items per page (default: 10)
   * @returns Paginated list of orchestrations
   */
  listOrchestrators: async (
    page: number = 1,
    size: number = 10
  ): Promise<ListOrchestrationsResponse> => {
    try {
      const response = await apiService.get(
        `/orchestrators?page=${page}&size=${size}`
      );
      
      // Handle different response formats
      const orchestrations = response.orchestrators || response.data || response || [];
      const orchestrationsList = Array.isArray(orchestrations) ? orchestrations : [];
      
      const mappedOrchestrations = orchestrationsList.map((item: any) => ({
        _id: item.id || item._id,
        templateInfo: item.templateInfo,
        nodes: item.nodes || [],
        edges: item.edges || [],
        // Calculate counts from arrays if not provided
        nodeCount: item.nodeCount ?? item.nodes?.length ?? 0,
        edgeCount: item.edgeCount ?? item.edges?.length ?? 0,
        previewImageUrl: item?.previewImageUrl,
        createdAt: toIsoString(item.createdAt) ?? new Date().toISOString(),
        updatedAt: toIsoString(item.updatedAt) ?? new Date().toISOString(),
        metadata: normalizeMetadataDates(item.metadata),
      }));
      
      return {
        orchestrations: mappedOrchestrations,
        total: response.total || orchestrationsList.length,
        page: response.page || page,
        size: response.size || size,
        totalPages: response.totalPages || Math.ceil((response.total || orchestrationsList.length) / size),
      };
    } catch (error) {
      console.error("Failed to list orchestrators:", error);
      throw new Error("Failed to fetch orchestrator list");
    }
  },

  /**
   * Delete an orchestrator configuration
   * @param id - Orchestrator ID to delete
   */
  deleteOrchestrator: async (id: string): Promise<void> => {
    try {
      await apiService.delete(`/orchestrators/${id}`);
    } catch (error) {
      console.error("Failed to delete orchestrator:", error);
      throw new Error("Failed to delete orchestrator configuration");
    }
  },

  /**
   * Duplicate an existing orchestrator configuration
   * @param id - Orchestrator ID to duplicate
   * @param newName - Name for the duplicated configuration
   * @returns New orchestrator configuration
   */
  duplicateOrchestrator: async (
    id: string,
    newName: string
  ): Promise<SaveOrchestratorResponse> => {
    try {
      const response = await apiService.post(`/orchestrators/${id}/duplicate`, {
        name: newName,
      });
      return withNormalizedDates(response);
    } catch (error) {
      console.error("Failed to duplicate orchestrator:", error);
      throw new Error("Failed to duplicate orchestrator configuration");
    }
  },

  /**
   * Search orchestrators by name or tags
   * @param query - Search query string
   * @returns List of matching orchestrations
   */
  searchOrchestrators: async (
    query: string
  ): Promise<OrchestratorListItem[]> => {
    try {
      const response = await apiService.get(
        `/orchestrators/search?q=${encodeURIComponent(query)}`
      );
      const orchestrations = response.orchestrations || response;
      return orchestrations.map((item: any) => ({
        ...item,
        createdAt: toIsoString(item.createdAt),
        updatedAt: toIsoString(item.updatedAt),
        metadata: normalizeMetadataDates(item.metadata),
      }));
    } catch (error) {
      console.error("Failed to search orchestrators:", error);
      throw new Error("Failed to search orchestrator configurations");
    }
  },

  /**
   * Trigger IaC (e.g., Terraform) generation for a saved orchestrator
   * @param id - Orchestrator ID to generate IaC for
   * @returns Backend response (message, status, optional links)
   */
  generateIac: async (
    id: string
  ): Promise<{ status?: string; message?: string; downloadIaCUrl?: string; downloadUrl?: string; url?: string; link?: string }> => {
    try {
      // Adjust endpoint as needed to match backend
      const response = await apiService.post(`/orchestrators/${id}/generate`);
      return response;
    } catch (error) {
      console.error("Failed to generate IaC:", error);
      throw new Error("Failed to generate infrastructure as code");
    }
  },
};
