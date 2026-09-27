/**
 * TypeScript types for the Template feature.
 *
 * Templates are publicly-visible snapshots of Orchestrators.  Any user can
 * browse and fork (use) them; only the author can edit or un-publish them.
 */

export interface TemplateAnalytics {
  viewCount: number;
  likeCount: number;
  usageCount: number;
  /** True when the authenticated caller has liked this template. */
  isLikedByMe: boolean;
}

/** Lightweight item used in gallery / list views. */
export interface TemplateListItem {
  id: string;
  orchestratorId: string;
  userId: string;
  authorName?: string;
  templateName: string;
  description?: string;
  cloud?: string;
  region?: string;
  nodeCount: number;
  edgeCount: number;
  previewImageUrl?: string;
  analytics: TemplateAnalytics;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Full detail including readme markdown and raw canvas data. */
export interface TemplateDetail extends TemplateListItem {
  readme?: string;
  nodes?: any[];
  edges?: any[];
}

export interface TemplatesListResponse {
  templates: TemplateListItem[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

/** Body for POST /templates */
export interface PublishTemplateRequest {
  orchestratorId: string;
  readme?: string;
  templateName?: string;
  description?: string;
}

/** Body for PUT /templates/:id */
export interface UpdateTemplateRequest {
  readme?: string;
  templateName?: string;
  description?: string;
  isPublished?: boolean;
}

export interface ToggleLikeResponse {
  liked: boolean;
  likeCount: number;
}

export interface UseTemplateResponse {
  orchestratorId: string;
}
