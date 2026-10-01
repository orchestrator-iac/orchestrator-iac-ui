import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  useTheme,
  Typography,
  Skeleton,
  Fade,
  InputAdornment,
  TextField,
  Tooltip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";

import { fetchOrchestrators } from "../../store/orchestratorsSlice";
import { templateService } from "../../services/templateService";
import apiService from "../../services/apiService";
import PublishTemplateDialog from "../orchestrator/publish-template/PublishTemplateDialog";
import { useAuth } from "../../context/AuthContext";
import { useGuidedTour } from "../shared/guidance/ProductGuidanceProvider";
import ResourceIconView from "../shared/ResourceIconView";
import { hasRenderableResourceIcon } from "@/types/resourceIcon";
import type { OrchestratorListItem } from "@/types/orchestrator";

import styles from "./Home.module.css";
import awsLogo from "./../../assets/aws_logo.svg";
import awsLogoLight from "./../../assets/aws_logo_light.svg";
import awsLogoDark from "./../../assets/aws_logo_dark.svg";
import azLogo from "./../../assets/az_logo.svg";
import gcpLogo from "./../../assets/gcp_logo.svg";

const logoMap: Record<
  string,
  { light: string; dark: string; default: string }
> = {
  aws: {
    light: awsLogoLight,
    dark: awsLogoDark,
    default: awsLogo,
  },
  azure: {
    light: azLogo,
    dark: azLogo,
    default: azLogo,
  },
  gcp: {
    light: gcpLogo,
    dark: gcpLogo,
    default: gcpLogo,
  },
};

interface CardLogoProps {
  cloudType: string;
  className?: string;
  mode: "light" | "dark";
}

const CardLogo: React.FC<CardLogoProps> = ({ cloudType, className, mode }) => {
  const logoSrc =
    logoMap[cloudType]?.[mode] || logoMap[cloudType]?.default || awsLogo;
  return <img src={logoSrc} alt={`${cloudType} logo`} className={className} />;
};

// ── Data shapes for the "Top Templates" / "Top Resources" insight carousels.
// The backing state on Home stays untyped (existing `any[]`) so these
// interfaces only describe the fields the presentational carousels read. ──

interface TopTemplateItem {
  id: string;
  templateName: string;
  previewImageUrl?: string;
  cloud?: string;
  nodeCount?: number;
  analytics?: {
    usageCount?: number;
    viewCount?: number;
  };
}

interface TopResourceItem {
  resourceId: string;
  _id?: string;
  resourceName?: string;
  resourceIcon?: unknown;
  count?: number;
}

// ── Presentational subcomponents extracted from Home's JSX to keep the
// main component's cognitive complexity down. Each owns its own hooks
// (useTheme/useNavigate) rather than receiving every value via props,
// matching the pattern used in ResourcesGallery.tsx / TemplateDetail.tsx. ──

interface HomeSearchBarProps {
  showContent: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  orchestratorsCount: number;
  canViewOrchestrators: boolean;
  canViewTemplates: boolean;
  canViewResources: boolean;
}

const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
  showContent,
  searchQuery,
  onSearchChange,
  orchestratorsCount,
  canViewOrchestrators,
  canViewTemplates,
  canViewResources,
}) => {
  const navigate = useNavigate();

  return (
    <Fade in={showContent} timeout={600}>
      <Box
        component="search"
        className={styles.workspaceSearch}
        aria-label="Search orchestrators"
      >
        <TextField
          placeholder="Search orchestrators…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          variant="outlined"
          size="small"
          data-tour="home-search"
          className={styles.workspaceSearchInput}
          slotProps={{
            htmlInput: {
              "aria-label": "Search orchestrators",
            },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <FontAwesomeIcon
                    icon="search"
                    aria-hidden="true"
                    style={{ fontSize: "0.9rem", opacity: 0.45 }}
                  />
                </InputAdornment>
              ),
            },
          }}
        />
        <Box
          component="nav"
          aria-label="Workspace areas"
          className={styles.workspaceLinks}
        >
          {canViewOrchestrators && (
            <span className={styles.workspaceCount}>
              <FontAwesomeIcon icon="sitemap" aria-hidden="true" />
              {orchestratorsCount} orchestrators
            </span>
          )}
          {canViewTemplates && (
            <button
              type="button"
              className={styles.workspaceLink}
              onClick={() => navigate("/templates")}
              data-tour="home-templates-chip"
            >
              <FontAwesomeIcon icon="layer-group" aria-hidden="true" />
              Templates
            </button>
          )}
          {canViewResources && (
            <button
              type="button"
              className={styles.workspaceLink}
              onClick={() => navigate("/resources")}
              data-tour="home-resources-chip"
            >
              <FontAwesomeIcon icon="cube" aria-hidden="true" />
              Resources
            </button>
          )}
        </Box>
      </Box>
    </Fade>
  );
};

interface HomeTopTemplatesCarouselProps {
  templates: TopTemplateItem[];
  loading: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
  onSelect: (id: string) => void;
}

const HomeTopTemplatesCarousel: React.FC<HomeTopTemplatesCarouselProps> = ({
  templates,
  loading,
  scrollRef,
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
  onSelect,
}) => {
  return (
    <Box
      component="section"
      className={`${styles.templateInsight} ${styles.insightRail}`}
      data-tour="home-top-templates"
      aria-labelledby="home-top-templates-heading"
    >
      <Box className={styles.insightHeader}>
        <Box>
          <Typography
            id="home-top-templates-heading"
            variant="h5"
            className={styles.insightHeading}
          >
            Start from a template
          </Typography>
          <Typography component="p" className={styles.insightSupportingText}>
            Begin with a proven infrastructure pattern.
          </Typography>
        </Box>
        <Box className={styles.insightControls}>
          <Typography component="span" className={styles.insightCount}>
            {loading ? "Loading patterns" : `${templates.length} patterns`}
          </Typography>
          {!loading && templates.length > 4 && (
            <>
              <IconButton
                aria-label="Previous templates"
                size="small"
                onClick={onScrollLeft}
                disabled={!canScrollLeft}
                className={styles.insightControl}
              >
                <FontAwesomeIcon icon="chevron-left" aria-hidden="true" />
              </IconButton>
              <IconButton
                aria-label="Next templates"
                size="small"
                onClick={onScrollRight}
                disabled={!canScrollRight}
                className={styles.insightControl}
              >
                <FontAwesomeIcon icon="chevron-right" aria-hidden="true" />
              </IconButton>
            </>
          )}
        </Box>
      </Box>
      <Box className={styles.carouselFrame}>
        <Box ref={scrollRef} className={styles.carouselViewport}>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Box
                  key={`tmpl-skel-${i}`}
                  className={styles.templateInsightSkeleton}
                  aria-hidden="true"
                >
                  <Skeleton
                    className={styles.templateSkeletonMedia}
                    variant="rectangular"
                    animation="wave"
                  />
                  <Skeleton
                    className={styles.skeletonTitleLine}
                    variant="text"
                    animation="wave"
                  />
                  <Skeleton
                    className={styles.skeletonMetaLine}
                    variant="text"
                    animation="wave"
                  />
                </Box>
              ))
            : templates.map((t) => (
                <Box
                  key={t.id}
                  onClick={() => onSelect(t.id)}
                  className={styles.templateInsightCard}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(t.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {t.previewImageUrl ? (
                    <img
                      src={t.previewImageUrl}
                      alt={`Preview of ${t.templateName}`}
                      className={styles.templateInsightImage}
                    />
                  ) : (
                    <Box
                      className={styles.templateInsightPlaceholder}
                      aria-hidden="true"
                    >
                      <FontAwesomeIcon icon="sitemap" />
                    </Box>
                  )}
                  <Typography
                    variant="body2"
                    className={styles.templateInsightTitle}
                  >
                    {t.templateName}
                  </Typography>
                  <Typography
                    variant="caption"
                    className={styles.templateInsightMeta}
                  >
                    {(t.cloud || "Cloud").toUpperCase()} · {t.nodeCount || 0}{" "}
                    resources ·{" "}
                    {t.analytics?.usageCount || t.analytics?.viewCount || 0}{" "}
                    uses
                  </Typography>
                </Box>
              ))}
        </Box>
      </Box>
    </Box>
  );
};

interface HomeTopResourcesCarouselProps {
  resources: TopResourceItem[];
  loading: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
  onSelect: (id: string) => void;
}

const HomeTopResourcesCarousel: React.FC<HomeTopResourcesCarouselProps> = ({
  resources,
  loading,
  scrollRef,
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
  onSelect,
}) => {
  return (
    <Box
      component="section"
      className={styles.insightRail}
      data-tour="home-top-resources"
      aria-labelledby="home-top-resources-heading"
    >
      <Box className={styles.insightHeader}>
        <Box>
          <Typography
            id="home-top-resources-heading"
            variant="h5"
            className={styles.insightHeading}
          >
            Top Resources
          </Typography>
          <Typography component="p" className={styles.insightSupportingText}>
            The building blocks most used across your workspace.
          </Typography>
        </Box>
        <Box className={styles.insightControls}>
          <Typography component="span" className={styles.insightCount}>
            {loading ? "Loading resources" : `${resources.length} resources`}
          </Typography>
          {!loading && resources.length > 4 && (
            <>
              <IconButton
                aria-label="Previous resources"
                size="small"
                onClick={onScrollLeft}
                disabled={!canScrollLeft}
                className={styles.insightControl}
              >
                <FontAwesomeIcon icon="chevron-left" aria-hidden="true" />
              </IconButton>
              <IconButton
                aria-label="Next resources"
                size="small"
                onClick={onScrollRight}
                disabled={!canScrollRight}
                className={styles.insightControl}
              >
                <FontAwesomeIcon icon="chevron-right" aria-hidden="true" />
              </IconButton>
            </>
          )}
        </Box>
      </Box>
      <Box className={styles.carouselFrame}>
        <Box ref={scrollRef} className={styles.carouselViewport}>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Box
                  key={`res-skel-${i}`}
                  className={styles.resourceInsightSkeleton}
                  aria-hidden="true"
                >
                  <Skeleton
                    className={styles.resourceSkeletonIcon}
                    variant="rounded"
                    animation="wave"
                  />
                  <Box className={styles.resourceSkeletonCopy}>
                    <Skeleton
                      className={styles.skeletonTitleLine}
                      variant="text"
                      animation="wave"
                    />
                    <Skeleton
                      className={styles.skeletonMetaLine}
                      variant="text"
                      animation="wave"
                    />
                  </Box>
                </Box>
              ))
            : resources.map((r) => (
                <Box
                  key={r.resourceId}
                  onClick={() => onSelect(r._id || r.resourceId)}
                  className={styles.resourceInsightCard}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(r._id || r.resourceId);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <Box className={styles.resourceInsightMedia}>
                    {hasRenderableResourceIcon(r.resourceIcon) ? (
                      <ResourceIconView
                        icon={r.resourceIcon}
                        alt={r.resourceName || r.resourceId}
                        className={styles.resourceInsightImage}
                      />
                    ) : (
                      <Box className={styles.resourceInsightPlaceholder} />
                    )}
                  </Box>
                  <Box className={styles.resourceInsightContent}>
                    <Typography
                      variant="body2"
                      className={styles.resourceInsightTitle}
                    >
                      {r.resourceName || r.resourceId}
                    </Typography>
                    <Typography
                      variant="caption"
                      className={styles.resourceInsightMeta}
                    >
                      {r.count} uses
                    </Typography>
                  </Box>
                </Box>
              ))}
        </Box>
      </Box>
    </Box>
  );
};

interface HomeInsightsSectionProps {
  showContent: boolean;
  canViewOrchestrators: boolean;
  canViewResources: boolean;
  loadingInsights: boolean;
  topTemplates: TopTemplateItem[];
  topResources: TopResourceItem[];
  templatesScrollRef: React.RefObject<HTMLDivElement | null>;
  resourcesScrollRef: React.RefObject<HTMLDivElement | null>;
  tmplCanLeft: boolean;
  tmplCanRight: boolean;
  resCanLeft: boolean;
  resCanRight: boolean;
  onScrollTemplates: (dir: number) => void;
  onScrollResources: (dir: number) => void;
  onSelectTemplate: (id: string) => void;
  onSelectResource: (id: string) => void;
}

const HomeInsightsSection: React.FC<HomeInsightsSectionProps> = ({
  showContent,
  canViewOrchestrators,
  canViewResources,
  loadingInsights,
  topTemplates,
  topResources,
  templatesScrollRef,
  resourcesScrollRef,
  tmplCanLeft,
  tmplCanRight,
  resCanLeft,
  resCanRight,
  onScrollTemplates,
  onScrollResources,
  onSelectTemplate,
  onSelectResource,
}) => {
  const showSection =
    (canViewOrchestrators || canViewResources) &&
    (loadingInsights || topTemplates.length > 0 || topResources.length > 0);

  if (!showSection) return null;

  return (
    <Fade in={showContent} timeout={700}>
      <Box
        component="section"
        data-tour="home-top-sections"
        className={styles.insightsSection}
        aria-busy={loadingInsights}
      >
        <Box className={styles.insightsGrid}>
          {(loadingInsights || topTemplates.length > 0) && (
            <Box>
              <HomeTopTemplatesCarousel
                templates={topTemplates}
                loading={loadingInsights}
                scrollRef={templatesScrollRef}
                canScrollLeft={tmplCanLeft}
                canScrollRight={tmplCanRight}
                onScrollLeft={() => onScrollTemplates(-1)}
                onScrollRight={() => onScrollTemplates(1)}
                onSelect={onSelectTemplate}
              />
            </Box>
          )}
          {(loadingInsights || topResources.length > 0) && (
            <Box>
              <HomeTopResourcesCarousel
                resources={topResources}
                loading={loadingInsights}
                scrollRef={resourcesScrollRef}
                canScrollLeft={resCanLeft}
                canScrollRight={resCanRight}
                onScrollLeft={() => onScrollResources(-1)}
                onScrollRight={() => onScrollResources(1)}
                onSelect={onSelectResource}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Fade>
  );
};

interface OrchestratorCardProps {
  orchestrator: OrchestratorListItem;
  index: number;
  showContent: boolean;
  onOpen: (id: string | undefined) => void;
  onPublishClick: (orchestrator: OrchestratorListItem) => void;
  onUnpublishClick: (orchestrator: OrchestratorListItem) => void;
}

const OrchestratorCard: React.FC<OrchestratorCardProps> = ({
  orchestrator,
  index,
  showContent,
  onOpen,
  onPublishClick,
  onUnpublishClick,
}) => {
  const theme = useTheme();

  return (
    <Box className={styles.orchestratorCardShell}>
      <Fade in={showContent} timeout={1000 + index * 100}>
        <Box
          className={styles.card}
          onClick={() => onOpen(orchestrator._id)}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpen(orchestrator._id);
            }
          }}
          role="link"
          tabIndex={0}
          aria-label={
            "Open " +
            (orchestrator.templateInfo?.templateName || "orchestrator")
          }
        >
          <CardLogo
            cloudType={orchestrator.templateInfo?.cloud || "aws"}
            className={styles.cloudTypeLogo}
            mode={theme.palette.mode}
          />
          {orchestrator.previewImageUrl ? (
            <img
              src={orchestrator.previewImageUrl}
              alt={orchestrator.templateInfo?.templateName || "Orchestrator"}
              className={styles.orchestratorCardImage}
            />
          ) : (
            <Box className={styles.orchestratorCardImage} aria-hidden="true">
              <FontAwesomeIcon icon="sitemap" />
            </Box>
          )}
          <Box className={styles.cardHeader}>
            <Typography variant="h6" className={styles.cardTitle}>
              <Link
                to={`/orchestrator/${orchestrator._id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
                aria-label={`View orchestrator ${orchestrator.templateInfo?.templateName || "Orchestrator"}`}
              >
                {orchestrator.templateInfo?.templateName ||
                  "Unnamed Orchestrator"}
              </Link>
            </Typography>
            <Box className={styles.cardActions}>
              <Tooltip
                title={
                  orchestrator.templateId
                    ? "Manage Template"
                    : "Publish as Template"
                }
              >
                <span>
                  <IconButton
                    size="small"
                    aria-label={
                      orchestrator.templateId
                        ? `Manage template for ${orchestrator.templateInfo?.templateName || "orchestrator"}`
                        : `Publish ${orchestrator.templateInfo?.templateName || "orchestrator"} as template`
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      onPublishClick(orchestrator);
                    }}
                    className={styles.cardAction}
                  >
                    <FontAwesomeIcon
                      aria-hidden="true"
                      icon={orchestrator.templateId ? "pen" : "layer-group"}
                    />
                  </IconButton>
                </span>
              </Tooltip>
              {orchestrator.templateId && (
                <Tooltip title="Unpublish Template">
                  <span>
                    <IconButton
                      size="small"
                      aria-label={`Unpublish template for ${orchestrator.templateInfo?.templateName || "orchestrator"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnpublishClick(orchestrator);
                      }}
                      className={`${styles.cardAction} ${styles.cardActionDanger}`}
                    >
                      <FontAwesomeIcon aria-hidden="true" icon="eye-slash" />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Box>
          </Box>
          <Typography variant="body2" className={styles.cardDescription}>
            {orchestrator.templateInfo?.description || "No description"}
          </Typography>
          <Box component="code" className={styles.cardMeta}>
            <Box className={styles.cardMetaItem}>
              <FontAwesomeIcon
                icon="circle-nodes"
                style={{ fontSize: "0.75rem" }}
              />
              {orchestrator.nodeCount} resources
            </Box>
            <Tooltip
              title={
                orchestrator.updatedAt
                  ? new Date(orchestrator.updatedAt).toLocaleDateString(
                      undefined,
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )
                  : "No last modified date"
              }
              arrow
            >
              <Box className={styles.cardMetaItem}>
                {orchestrator.updatedAt
                  ? new Date(orchestrator.updatedAt).toLocaleDateString(
                      undefined,
                      {
                        month: "2-digit",
                        day: "2-digit",
                        year: "2-digit",
                      },
                    )
                  : "N/A"}
              </Box>
            </Tooltip>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
};

interface OrchestratorsEmptyStateProps {
  showContent: boolean;
  searchQuery: string;
  canCreateOrchestrators: boolean;
  onCreateNew: () => void;
}

const OrchestratorsEmptyState: React.FC<OrchestratorsEmptyStateProps> = ({
  showContent,
  searchQuery,
  canCreateOrchestrators,
  onCreateNew,
}) => {
  return (
    <Box className={styles.emptyStateShell}>
      <Fade in={showContent} timeout={1200}>
        <Box role="status" aria-live="polite" className={styles.emptyState}>
          <FontAwesomeIcon
            icon="sitemap"
            size="3x"
            aria-hidden="true"
            className={styles.emptyStateIcon}
          />
          <Typography variant="h6" className={styles.emptyStateTitle}>
            {searchQuery ? "No orchestrators found" : "No orchestrators yet"}
          </Typography>
          <Typography variant="body2" className={styles.emptyStateDescription}>
            {searchQuery
              ? "Try adjusting your search query"
              : 'Click "New Orchestrator" to create your first infrastructure workflow!'}
          </Typography>
          {!searchQuery && canCreateOrchestrators && (
            <Button
              className={styles.emptyStateAction}
              variant="contained"
              endIcon={
                <FontAwesomeIcon icon="arrow-up-right" aria-hidden="true" />
              }
              onClick={onCreateNew}
            >
              New orchestrator
            </Button>
          )}
        </Box>
      </Fade>
    </Box>
  );
};

interface HomeOrchestratorsSectionProps {
  showContent: boolean;
  isLoading: boolean;
  canCreateOrchestrators: boolean;
  filteredOrchestrators: OrchestratorListItem[];
  searchQuery: string;
  onCreateNew: () => void;
  onOpenOrchestrator: (id: string | undefined) => void;
  onPublishClick: (orchestrator: OrchestratorListItem) => void;
  onUnpublishClick: (orchestrator: OrchestratorListItem) => void;
}

const HomeOrchestratorsSection: React.FC<HomeOrchestratorsSectionProps> = ({
  showContent,
  isLoading,
  canCreateOrchestrators,
  filteredOrchestrators,
  searchQuery,
  onCreateNew,
  onOpenOrchestrator,
  onPublishClick,
  onUnpublishClick,
}) => {
  const hasOrchestrators = filteredOrchestrators.length > 0;

  return (
    <>
      <Fade in={showContent} timeout={800}>
        <Box
          component="section"
          aria-labelledby="orchestrators-heading"
          className={styles.orchestratorSectionHeader}
        >
          <Box className={styles.orchestratorSectionCopy}>
            <Typography
              id="orchestrators-heading"
              component="h2"
              className={styles.sectionTitle}
            >
              Orchestrators
            </Typography>
            <Typography component="p" className={styles.sectionDescription}>
              Manage your infrastructure orchestration workflows.
            </Typography>
          </Box>
          <Box className={styles.orchestratorSectionTools}>
            <Typography component="span" className={styles.orchestratorCount}>
              {filteredOrchestrators.length}{" "}
              {filteredOrchestrators.length === 1
                ? "orchestrator"
                : "orchestrators"}
            </Typography>
            {canCreateOrchestrators && (
              <Button
                className={styles.orchestratorCreateButton}
                variant="contained"
                endIcon={
                  <FontAwesomeIcon icon="arrow-up-right" aria-hidden="true" />
                }
                onClick={onCreateNew}
                data-tour="home-new-orchestrator"
              >
                New orchestrator
              </Button>
            )}
          </Box>
        </Box>
      </Fade>
      <Box
        className={styles.orchestratorGrid}
        aria-busy={isLoading}
        aria-label={isLoading ? "Loading orchestrators" : undefined}
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Box
              key={`skeleton-orch-${index}`}
              className={styles.orchestratorSkeleton}
              aria-hidden="true"
            >
              <Skeleton
                className={styles.orchestratorSkeletonMedia}
                variant="rectangular"
                animation="wave"
              />
              <Box className={styles.orchestratorSkeletonCopy}>
                <Skeleton
                  className={styles.skeletonTitleLine}
                  variant="text"
                  animation="wave"
                />
                <Skeleton
                  className={styles.skeletonDescriptionLine}
                  variant="text"
                  animation="wave"
                />
                <Skeleton
                  className={styles.skeletonDescriptionLine}
                  variant="text"
                  animation="wave"
                />
              </Box>
              <Box className={styles.orchestratorSkeletonMeta}>
                <Skeleton
                  className={styles.skeletonMetaLine}
                  variant="text"
                  animation="wave"
                />
                <Skeleton
                  className={styles.skeletonActionLine}
                  variant="rounded"
                  animation="wave"
                />
              </Box>
            </Box>
          ))
        ) : (
          <>
            {hasOrchestrators ? (
              filteredOrchestrators.map((orchestrator, index) => (
                <OrchestratorCard
                  key={orchestrator._id}
                  orchestrator={orchestrator}
                  index={index}
                  showContent={showContent}
                  onOpen={onOpenOrchestrator}
                  onPublishClick={onPublishClick}
                  onUnpublishClick={onUnpublishClick}
                />
              ))
            ) : (
              <OrchestratorsEmptyState
                showContent={showContent}
                searchQuery={searchQuery}
                canCreateOrchestrators={canCreateOrchestrators}
                onCreateNew={onCreateNew}
              />
            )}
          </>
        )}
      </Box>
    </>
  );
};

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { hasPermission } = useAuth();
  const canViewOrchestrators = hasPermission("view-orchestrators");
  const canViewResources = hasPermission("view-resources");
  const canViewTemplates = hasPermission("view-templates");
  const canCreateOrchestrators = hasPermission("create-orchestrators");
  const [searchQuery, setSearchQuery] = useState("");
  const [showContent, setShowContent] = useState(false);
  const [publishTarget, setPublishTarget] = useState<{
    orchestratorId: string;
    orchestratorName?: string;
    templateId?: string;
  } | null>(null);
  const [unpublishTarget, setUnpublishTarget] = useState<{
    templateId: string;
    name: string;
  } | null>(null);
  const [unpublishLoading, setUnpublishLoading] = useState(false);
  const [topTemplates, setTopTemplates] = useState<any[]>([]);
  const [topResources, setTopResources] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Carousel refs / state for INSIGHTS lists (templates + resources)
  const templatesRef = useRef<HTMLDivElement | null>(null);
  const resourcesRef = useRef<HTMLDivElement | null>(null);
  const [tmplCanLeft, setTmplCanLeft] = useState(false);
  const [tmplCanRight, setTmplCanRight] = useState(false);
  const [resCanLeft, setResCanLeft] = useState(false);
  const [resCanRight, setResCanRight] = useState(false);

  const { data: orchestrators, status: orchestratorsStatus } = useSelector(
    (state: RootState) => state.orchestrators,
  );

  useEffect(() => {
    if (orchestratorsStatus === "idle" && canViewOrchestrators)
      dispatch(fetchOrchestrators({}));
  }, [dispatch, orchestratorsStatus, canViewOrchestrators]);

  useEffect(() => {
    document.body.dataset.theme = theme.palette.mode;
    // Restore body scroll for Home page
    document.body.style.overflow = "auto";
  }, [theme.palette.mode]);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useGuidedTour("home", showContent);

  useEffect(() => {
    let mounted = true;
    const loadInsights = async () => {
      setLoadingInsights(true);
      try {
        if (canViewOrchestrators) {
          const tplResp = await templateService.listTemplates({
            page: 1,
            size: 10,
            sort: "popularity",
          });
          if (mounted) setTopTemplates(tplResp.templates || []);
        }
        if (canViewResources) {
          const res = await apiService.get(
            `/orchestrators/analytics/top-resources?size=10`,
          );
          if (mounted) setTopResources(res || []);
        }
      } catch (err) {
        console.error("Failed to load insights:", err);
      } finally {
        if (mounted) setLoadingInsights(false);
      }
    };

    if (canViewOrchestrators || canViewResources) {
      loadInsights();
    }

    return () => {
      mounted = false;
    };
  }, [canViewOrchestrators, canViewResources]);

  // Watch templates scroll state
  useEffect(() => {
    const el = templatesRef.current;
    if (!el) {
      setTmplCanLeft(false);
      setTmplCanRight(false);
      return;
    }
    const update = () => {
      setTmplCanLeft(el.scrollLeft > 0);
      setTmplCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [topTemplates, loadingInsights]);

  // Watch resources scroll state
  useEffect(() => {
    const el = resourcesRef.current;
    if (!el) {
      setResCanLeft(false);
      setResCanRight(false);
      return;
    }
    const update = () => {
      setResCanLeft(el.scrollLeft > 0);
      setResCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [topResources, loadingInsights]);

  const scrollTemplatesByPage = (dir: number) => {
    const el = templatesRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  const scrollResourcesByPage = (dir: number) => {
    const el = resourcesRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  // Filter function
  const filteredOrchestrators = useMemo(() => {
    if (!orchestrators) return [];
    if (!searchQuery) return orchestrators;
    return orchestrators.filter(
      (o) =>
        o.templateInfo?.templateName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        o.templateInfo?.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );
  }, [orchestrators, searchQuery]);

  const navigateOrchestrator = (orchestratorId: string | undefined) => {
    navigate(`/orchestrator/${orchestratorId ?? "new"}?template_type=custom`);
  };

  const handleUnpublishConfirm = async () => {
    if (!unpublishTarget || unpublishLoading) return;
    setUnpublishLoading(true);
    try {
      await templateService.deleteTemplate(unpublishTarget.templateId);
      setUnpublishTarget(null);
      dispatch(fetchOrchestrators({}));
    } catch {
      // keep dialog open on error
    } finally {
      setUnpublishLoading(false);
    }
  };

  const isLoading = orchestratorsStatus === "loading";

  return (
    <Box className={styles.workspaceShell}>
      <Fade in={showContent} timeout={500}>
        <Box component="section" className={styles.workspaceIntro}>
          <Box>
            <Typography component="h1" className={styles.workspaceTitle}>
              Keep your systems visible.
            </Typography>
            <Typography component="p" className={styles.workspaceDescription}>
              Continue shaping your orchestrators, start from a proven template,
              and keep the path from architecture to Terraform in one workspace.
            </Typography>
          </Box>
          {canCreateOrchestrators && (
            <Button
              variant="contained"
              className={styles.workspaceIntroAction}
              startIcon={<FontAwesomeIcon icon="plus" aria-hidden="true" />}
              onClick={() => navigateOrchestrator("new")}
            >
              New orchestrator
            </Button>
          )}
        </Box>
      </Fade>

      {/* Search and Stats Bar */}
      <HomeSearchBar
        showContent={showContent}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        orchestratorsCount={filteredOrchestrators.length}
        canViewOrchestrators={canViewOrchestrators}
        canViewTemplates={canViewTemplates}
        canViewResources={canViewResources}
      />

      {/* ===== INSIGHTS (Top Templates / Top Resources) ===== */}
      <HomeInsightsSection
        showContent={showContent}
        canViewOrchestrators={canViewOrchestrators}
        canViewResources={canViewResources}
        loadingInsights={loadingInsights}
        topTemplates={topTemplates}
        topResources={topResources}
        templatesScrollRef={templatesRef}
        resourcesScrollRef={resourcesRef}
        tmplCanLeft={tmplCanLeft}
        tmplCanRight={tmplCanRight}
        resCanLeft={resCanLeft}
        resCanRight={resCanRight}
        onScrollTemplates={scrollTemplatesByPage}
        onScrollResources={scrollResourcesByPage}
        onSelectTemplate={(id) => navigate(`/templates/${id}`)}
        onSelectResource={(id) => navigate(`/resources/${id}`)}
      />

      {/* ===== ORCHESTRATORS ===== */}
      {canViewOrchestrators && (
        <HomeOrchestratorsSection
          showContent={showContent}
          isLoading={isLoading}
          canCreateOrchestrators={canCreateOrchestrators}
          filteredOrchestrators={filteredOrchestrators}
          searchQuery={searchQuery}
          onCreateNew={() => navigateOrchestrator("new")}
          onOpenOrchestrator={navigateOrchestrator}
          onPublishClick={(orchestrator) =>
            setPublishTarget({
              orchestratorId: orchestrator._id || "",
              orchestratorName: orchestrator.templateInfo?.templateName,
              templateId: orchestrator.templateId,
            })
          }
          onUnpublishClick={(orchestrator) =>
            setUnpublishTarget({
              templateId: orchestrator.templateId!,
              name: orchestrator.templateInfo?.templateName || "this template",
            })
          }
        />
      )}

      {/* Publish as Template dialog */}
      {publishTarget && (
        <PublishTemplateDialog
          open={!!publishTarget}
          onClose={() => setPublishTarget(null)}
          orchestratorId={publishTarget.orchestratorId}
          orchestratorName={publishTarget.orchestratorName}
          onSuccess={() => setPublishTarget(null)}
        />
      )}

      {/* Unpublish confirmation dialog */}
      <Dialog
        open={!!unpublishTarget}
        onClose={() => !unpublishLoading && setUnpublishTarget(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
          Unpublish Template?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            This will remove <strong>{unpublishTarget?.name}</strong> from the
            public gallery. Your orchestrator won't be affected — you can
            re-publish it any time.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setUnpublishTarget(null)}
            disabled={unpublishLoading}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleUnpublishConfirm}
            disabled={unpublishLoading}
            startIcon={
              unpublishLoading ? (
                <FontAwesomeIcon
                  icon="spinner"
                  spin
                  style={{ fontSize: "0.75rem" }}
                />
              ) : (
                <FontAwesomeIcon icon="trash" style={{ fontSize: "0.75rem" }} />
              )
            }
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
          >
            {unpublishLoading ? "Removing..." : "Yes, Unpublish"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Home;
