import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Fade,
  IconButton,
  InputAdornment,
  Skeleton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector, useDispatch } from "react-redux";
import { useDebouncedCallback } from "use-debounce";
import { useNavigate } from "react-router-dom";

import { RootState, AppDispatch } from "../../store";
import {
  fetchTemplates,
  setSearchQuery,
  setSortBy,
  resetTemplates,
} from "../../store/templatesSlice";
import { TemplateListItem } from "../../types/template";
import { useGuidedTour } from "../shared/guidance/ProductGuidanceProvider";
import styles from "./Templates.module.css";

const PAGE_SIZE = 20;
const SHOW_WELCOME_BANNER = false;

interface TemplateListRowProps {
  template: TemplateListItem;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
}

const TemplateListRow: React.FC<TemplateListRowProps> = ({
  template,
  index,
  selected,
  onSelect,
}) => {
  const cloud = (template.cloud || "Cloud").toUpperCase();
  const region = template.region || "Global pattern";

  return (
    <Box
      component="li"
      className={styles.galleryRow}
      data-active={selected ? "true" : "false"}
    >
      <button
        type="button"
        className={styles.galleryRowButton}
        onClick={() => onSelect(template.id)}
        aria-pressed={selected}
        data-tour={index === 0 ? "templates-first-card" : undefined}
      >
        <span className={styles.galleryRowNumber}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className={styles.galleryRowContent}>
          <span className={styles.galleryRowMeta}>
            <span>{cloud}</span>
            <span aria-hidden="true">/</span>
            <span>{region}</span>
          </span>
          <span className={styles.galleryRowTitle}>
            {template.templateName}
          </span>
          <span className={styles.galleryRowDescription}>
            {template.description ||
              "A reusable infrastructure pattern ready to inspect."}
          </span>
          <span className={styles.galleryRowFacts}>
            <span>{template.nodeCount} resources</span>
            <span>{template.edgeCount} connections</span>
            {template.authorName ? <span>by {template.authorName}</span> : null}
          </span>
        </span>
        <span className={styles.galleryRowAction} aria-hidden="true">
          <FontAwesomeIcon icon="arrow-up-right" />
        </span>
      </button>
    </Box>
  );
};

interface TemplatePreviewPanelProps {
  template: TemplateListItem;
  onOpen: (id: string) => void;
}

const TemplatePreviewPanel: React.FC<TemplatePreviewPanelProps> = ({
  template,
  onOpen,
}) => {
  const cloud = (template.cloud || "Cloud").toUpperCase();

  return (
    <Box
      component="aside"
      className={styles.galleryPreview}
      aria-label={"Preview of " + template.templateName}
    >
      <Box className={styles.galleryPreviewHeader}>
        <span className={styles.galleryPreviewLabel}>Selected pattern</span>
        <span className={styles.galleryPreviewProvider}>{cloud}</span>
        <Button
          className={styles.galleryPreviewButton}
          variant="outlined"
          aria-label={"Inspect " + template.templateName}
          onClick={() => onOpen(template.id)}
          endIcon={<FontAwesomeIcon icon="arrow-up-right" aria-hidden="true" />}
        >
          Inspect
        </Button>
      </Box>

      <Box className={styles.galleryPreviewMedia}>
        {template.previewImageUrl ? (
          <img
            src={template.previewImageUrl}
            alt={"Architecture preview for " + template.templateName}
            className={styles.galleryPreviewImage}
          />
        ) : (
          <Box className={styles.galleryPreviewFallback} aria-hidden="true">
            <span className={styles.galleryPreviewFallbackLine} />
            <span className={styles.galleryPreviewFallbackLine} />
            <span className={styles.galleryPreviewFallbackLine} />
            <FontAwesomeIcon icon="sitemap" />
            <span className={styles.galleryPreviewFallbackCaption}>
              Architecture canvas
            </span>
          </Box>
        )}
      </Box>

      <Box className={styles.galleryPreviewFooter}>
        <Box className={styles.galleryPreviewCopy}>
          <Typography component="h2" className={styles.galleryPreviewTitle}>
            {template.templateName}
          </Typography>
          <Typography
            component="p"
            className={styles.galleryPreviewDescription}
          >
            {template.description ||
              "Inspect the connected resources before you make it your own."}
          </Typography>
        </Box>

        <Box
          className={styles.galleryPreviewStats}
          aria-label="Pattern details"
        >
          <span>
            <strong>{template.nodeCount}</strong>
            resources
          </span>
          <span>
            <strong>{template.edgeCount}</strong>
            connections
          </span>
          <span>
            <strong>{template.analytics.usageCount}</strong>
            uses
          </span>
        </Box>
      </Box>
    </Box>
  );
};

const TemplatesGallery: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState("");
  const [showContent, setShowContent] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { items, total, status, hasMore, page, searchQuery, sortBy } =
    useSelector((state: RootState) => state.templates);

  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  useGuidedTour(
    "templates",
    showContent && status === "succeeded" && items.length > 0,
  );

  useEffect(() => {
    const prevTitle = document.title;
    const title = "Infrastructure Templates | Orchestrator";
    const image = "https://orchestrator.next-zen.dev/og-templates.png";
    const desc =
      "Browse community infrastructure templates for AWS, Azure, and GCP. Deploy production-ready cloud architectures in one click.";
    const url = "https://orchestrator.next-zen.dev/templates";
    document.title = title;

    const set = (sel: string, attr: string, val: string) => {
      let el = document.querySelector<HTMLMetaElement | HTMLLinkElement>(sel);
      if (!el) {
        el = document.createElement(
          sel.startsWith("link") ? "link" : "meta",
        ) as HTMLMetaElement | HTMLLinkElement;
        document.head.appendChild(el);
      }
      el.setAttribute(attr, val);
    };

    set('meta[name="description"]', "content", desc);
    set('meta[name="robots"]', "content", "index, follow");
    set('meta[property="og:title"]', "content", title);
    set('meta[property="og:description"]', "content", desc);
    set('meta[property="og:url"]', "content", url);
    set('meta[property="og:type"]', "content", "website");
    set('meta[property="og:image"]', "content", image);
    set('meta[property="og:image:width"]', "content", "1200");
    set('meta[property="og:image:height"]', "content", "630");
    set('meta[name="twitter:card"]', "content", "summary_large_image");
    set('meta[name="twitter:title"]', "content", title);
    set('meta[name="twitter:description"]', "content", desc);
    set('meta[name="twitter:image"]', "content", image);
    set('link[rel="canonical"]', "href", url);

    return () => {
      document.title = prevTitle;
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    dispatch(resetTemplates());
    dispatch(fetchTemplates({ page: 1, size: PAGE_SIZE, sort: "popularity" }));
  }, [dispatch]);

  useEffect(() => {
    if (!selectedTemplateId && items[0]) {
      setSelectedTemplateId(items[0].id);
      return;
    }
    if (
      selectedTemplateId &&
      items.length > 0 &&
      !items.some((template) => template.id === selectedTemplateId)
    ) {
      setSelectedTemplateId(items[0].id);
    }
  }, [items, selectedTemplateId]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    dispatch(setSearchQuery(value));
    dispatch(
      fetchTemplates({
        page: 1,
        size: PAGE_SIZE,
        search: value || undefined,
        sort: sortBy,
      }),
    );
  }, 400);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalSearch(value);
    debouncedSearch(value);
  };

  const handleSortChange = (
    _: React.MouseEvent<HTMLElement>,
    newSort: "popularity" | "newest",
  ) => {
    if (!newSort) return;
    dispatch(setSortBy(newSort));
    dispatch(
      fetchTemplates({
        page: 1,
        size: PAGE_SIZE,
        search: searchQuery || undefined,
        sort: newSort,
      }),
    );
  };

  const handleQuickSearch = (term: string) => {
    setLocalSearch(term);
    debouncedSearch(term);
  };

  const loadMore = useCallback(() => {
    if (status !== "loading" && hasMore) {
      dispatch(
        fetchTemplates({
          page: page + 1,
          size: PAGE_SIZE,
          search: searchQuery || undefined,
          sort: sortBy,
          append: true,
        }),
      );
    }
  }, [dispatch, status, hasMore, page, searchQuery, sortBy]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const isLoading = status === "loading" && items.length === 0;
  const selectedTemplate =
    items.find((template) => template.id === selectedTemplateId) || items[0];

  const renderEmptyState = () => (
    <Fade in timeout={600}>
      <Box className={styles.galleryEmpty} role="status" aria-live="polite">
        <span className={styles.galleryEmptyIndex}>00</span>
        <FontAwesomeIcon
          icon={localSearch ? "search" : "layer-group"}
          aria-hidden="true"
        />
        <Typography component="h2">
          {localSearch
            ? 'No patterns match "' + localSearch + '".'
            : "The gallery is ready for its first pattern."}
        </Typography>
        <Typography component="p">
          {localSearch
            ? "Try a provider, service, or architecture keyword."
            : "Design an architecture on the canvas, then publish it as a reusable starting point for the community."}
        </Typography>
        {localSearch ? (
          <>
            <Box className={styles.gallerySearchSuggestions}>
              {["VPC", "EKS", "Lambda", "S3", "Aurora", "Terraform"].map(
                (term) => (
                  <Chip
                    key={term}
                    label={term}
                    size="small"
                    onClick={() => handleQuickSearch(term)}
                  />
                ),
              )}
            </Box>
            <Button variant="outlined" onClick={() => handleQuickSearch("")}>
              Clear search
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            endIcon={
              <FontAwesomeIcon icon="arrow-up-right" aria-hidden="true" />
            }
            onClick={() => navigate("/home")}
          >
            Start building
          </Button>
        )}
      </Box>
    </Fade>
  );

  const renderLoadingRows = (append = false) => (
    <Box
      className={append ? styles.galleryLoadingAppend : styles.galleryLoading}
    >
      {Array.from({ length: append ? 4 : 6 }).map((_, index) => (
        <Box
          className={styles.galleryLoadingRow}
          key={index}
          aria-hidden="true"
        >
          <Skeleton
            className={styles.galleryLoadingNumber}
            variant="text"
            animation="wave"
          />
          <Box className={styles.galleryLoadingCopy}>
            <Skeleton
              className={styles.galleryLoadingMeta}
              variant="text"
              animation="wave"
            />
            <Skeleton
              className={styles.galleryLoadingTitle}
              variant="text"
              animation="wave"
            />
            <Skeleton
              className={styles.galleryLoadingDescription}
              variant="text"
              animation="wave"
            />
            <Skeleton
              className={styles.galleryLoadingFacts}
              variant="text"
              animation="wave"
            />
          </Box>
          <Skeleton
            className={styles.galleryLoadingAction}
            variant="rounded"
            animation="wave"
          />
        </Box>
      ))}
    </Box>
  );

  const renderLoadingState = () => (
    <Box
      className={styles.galleryLoadingLayout}
      aria-busy="true"
      aria-label="Loading templates"
    >
      <Box className={styles.galleryLoadingIndex} aria-hidden="true">
        <Box className={styles.galleryLoadingSectionHeader}>
          <Skeleton
            className={styles.galleryLoadingHeading}
            variant="text"
            animation="wave"
          />
          <Skeleton
            className={styles.galleryLoadingCount}
            variant="text"
            animation="wave"
          />
        </Box>
        {renderLoadingRows()}
      </Box>
      <Box className={styles.galleryPreviewSkeleton} aria-hidden="true">
        <Box className={styles.galleryPreviewSkeletonHeader}>
          <Skeleton
            className={styles.galleryLoadingLabel}
            variant="text"
            animation="wave"
          />
          <Skeleton
            className={styles.galleryLoadingProvider}
            variant="text"
            animation="wave"
          />
          <Skeleton
            className={styles.galleryLoadingButton}
            variant="rounded"
            animation="wave"
          />
        </Box>
        <Skeleton
          className={styles.galleryPreviewSkeletonMedia}
          variant="rectangular"
          animation="wave"
        />
        <Box className={styles.galleryPreviewSkeletonFooter}>
          <Skeleton
            className={styles.galleryLoadingPreviewTitle}
            variant="text"
            animation="wave"
          />
          <Skeleton
            className={styles.galleryLoadingPreviewDescription}
            variant="text"
            animation="wave"
          />
          <Skeleton
            className={styles.galleryLoadingPreviewDescriptionShort}
            variant="text"
            animation="wave"
          />
          <Box className={styles.galleryPreviewSkeletonStats}>
            <Skeleton variant="text" animation="wave" />
            <Skeleton variant="text" animation="wave" />
            <Skeleton variant="text" animation="wave" />
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box className={styles.pageShell}>
      <Fade in={showContent} timeout={600}>
        <Box
          component="section"
          aria-labelledby="templates-heading"
          className={styles.pageHeader}
        >
          <Box className={styles.pageHeaderCopy}>
            <Typography
              id="templates-heading"
              component="h1"
              className={styles.pageHeaderTitle}
            >
              Start with a proven pattern.
            </Typography>
            <Typography component="p" className={styles.pageHeaderDescription}>
              Explore reusable infrastructure blueprints, inspect how they are
              connected, and fork the one that gives your next system a clear
              first shape.
            </Typography>
          </Box>
          <Typography className={styles.pageHeaderNote}>
            <FontAwesomeIcon icon="layer-group" aria-hidden="true" />
            Public infrastructure patterns
          </Typography>
        </Box>
      </Fade>

      {SHOW_WELCOME_BANNER && (
        <Collapse in={showWelcome} timeout={500}>
          <Box className={styles.welcomeBanner}>
            <IconButton
              aria-label="Dismiss welcome banner"
              size="small"
              onClick={() => setShowWelcome(false)}
              className={styles.welcomeDismiss}
            >
              <FontAwesomeIcon icon="xmark" />
            </IconButton>
            <Typography component="h2">
              A clearer way into infrastructure.
            </Typography>
            <Typography component="p">
              Browse a pattern, inspect its relationships, and make it your own.
            </Typography>
          </Box>
        </Collapse>
      )}

      <Fade in={showContent} timeout={700}>
        <Box
          component="form"
          className={styles.filterBar}
          aria-label="Filter templates"
          onSubmit={(event) => event.preventDefault()}
        >
          <TextField
            placeholder="Search templates, services, or providers"
            value={localSearch}
            onChange={handleSearchChange}
            size="small"
            data-tour="templates-search"
            className={styles.searchField}
            slotProps={{
              htmlInput: { "aria-label": "Search templates" },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <FontAwesomeIcon icon="search" aria-hidden="true" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <ToggleButtonGroup
            value={sortBy}
            exclusive
            onChange={handleSortChange}
            size="small"
            aria-label="Sort templates"
            data-tour="templates-sort"
            className={styles.sortGroup}
          >
            <ToggleButton value="popularity" aria-label="Sort by popularity">
              <FontAwesomeIcon icon="fire" aria-hidden="true" />
              Popular
            </ToggleButton>
            <ToggleButton value="newest" aria-label="Sort by newest">
              <FontAwesomeIcon icon="clock" aria-hidden="true" />
              Newest
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Fade>

      {isLoading ? (
        renderLoadingState()
      ) : items.length === 0 && status === "succeeded" ? (
        renderEmptyState()
      ) : (
        <Box className={styles.galleryLayout} aria-busy={status === "loading"}>
          <Box
            component="section"
            aria-labelledby="template-index-heading"
            className={styles.galleryIndex}
          >
            <Box className={styles.gallerySectionHeader}>
              <Typography component="h2" id="template-index-heading">
                Pattern index
              </Typography>
              <Typography component="span">
                {total > items.length
                  ? items.length + " of " + total
                  : total + " " + (total === 1 ? "pattern" : "patterns")}
              </Typography>
            </Box>
            <Box component="ol" className={styles.galleryList}>
              {items.map((template, index) => (
                <TemplateListRow
                  key={template.id}
                  template={template}
                  index={index}
                  selected={selectedTemplate?.id === template.id}
                  onSelect={setSelectedTemplateId}
                />
              ))}
            </Box>
            {status === "loading" && items.length > 0
              ? renderLoadingRows(true)
              : null}
            <Box
              ref={sentinelRef}
              className={styles.gallerySentinel}
              aria-hidden="true"
            />
          </Box>

          {selectedTemplate ? (
            <TemplatePreviewPanel
              template={selectedTemplate}
              onOpen={(templateId) => navigate("/templates/" + templateId)}
            />
          ) : null}
        </Box>
      )}
    </Box>
  );
};

export default TemplatesGallery;
