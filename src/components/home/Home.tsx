import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Box, 
  useTheme, 
  Typography, 
  Skeleton, 
  Fade, 
  Chip,
  InputAdornment,
  TextField,
  alpha
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";

import { fetchResources } from "../../store/resourcesSlice";
import { fetchOrchestrators } from "../../store/orchestratorsSlice";

import styles from "./Home.module.css";
import awsLogo from "./../../assets/aws_logo.svg";
import azLogo from "./../../assets/az_logo.svg";
import gcpLogo from "./../../assets/gcp_logo.svg";

const logoMap: Record<string, string> = {
  aws: awsLogo,
  azure: azLogo,
  gcp: gcpLogo,
};

interface CardLogoProps {
  cloudType: string;
  className?: string;
}

const CardLogo: React.FC<CardLogoProps> = ({ cloudType, className }) => {
  const logoSrc = logoMap[cloudType];
  return <img src={logoSrc} alt={`${cloudType} logo`} className={className} />;
};

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState("");
  const [showContent, setShowContent] = useState(false);

  const { data: resources, status: resourcesStatus } = useSelector(
    (state: RootState) => state.resources
  );
  const { data: orchestrators, status: orchestratorsStatus } = useSelector(
    (state: RootState) => state.orchestrators
  );

  useEffect(() => {
    if (resourcesStatus === "idle") dispatch(fetchResources());
    if (orchestratorsStatus === "idle") dispatch(fetchOrchestrators({}));
  }, [dispatch, resourcesStatus, orchestratorsStatus]);

  useEffect(() => {
    document.body.dataset.theme = theme.palette.mode;
  }, [theme.palette.mode]);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Filter function
  const filteredOrchestrators = useMemo(() => {
    if (!orchestrators) return [];
    if (!searchQuery) return orchestrators;
    return orchestrators.filter(o => 
      o.templateInfo?.templateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.templateInfo?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orchestrators, searchQuery]);

  const filteredResources = useMemo(() => {
    if (!resources) return [];
    if (!searchQuery) return resources;
    return resources.filter(r =>
      r.resourceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.resourceDescription?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [resources, searchQuery]);

  const navigateResource = (resourceId: string | undefined) => {
    navigate(`/resources/${resourceId ?? "new"}`);
  };

  const navigateOrchestrator = (orchestratorId: string | undefined) => {
    navigate(`/orchestrator/${orchestratorId ?? "new"}?template_type=custom`);
  };

  const isLoading = resourcesStatus === 'loading' || orchestratorsStatus === 'loading';

  return (
    <Box sx={{ 
      maxWidth: '1600px', 
      margin: '0 auto', 
      px: { xs: 2, sm: 3, md: 4 },
      py: 4
    }}>
      {/* Search and Stats Bar */}
      <Fade in={showContent} timeout={600}>
        <Box sx={{ 
          mb: 4, 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between'
        }}>
          <TextField
            placeholder="Search orchestrators and resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              flex: { xs: '1', md: '0 1 400px' },
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? alpha('#fff', 0.03) 
                  : alpha('#000', 0.02),
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha('#fff', 0.05) 
                    : alpha('#000', 0.04),
                },
                '&.Mui-focused': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha('#fff', 0.07) 
                    : alpha('#fff', 1),
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 0 0 3px rgba(136, 207, 207, 0.1)'
                    : '0 0 0 3px rgba(32, 90, 90, 0.08)',
                }
              }
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <FontAwesomeIcon icon="search" style={{ fontSize: '0.9rem', opacity: 0.5 }} />
                  </InputAdornment>
                ),
              }
            }}
          />
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip 
              icon={<FontAwesomeIcon icon="sitemap" style={{ fontSize: '0.85rem' }} />}
              label={`${filteredOrchestrators.length} Orchestrators`}
              size="small"
              sx={{ 
                fontWeight: 500,
                px: 0.5,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? alpha('#4bbebe', 0.15) 
                  : alpha('#1a5757', 0.08),
                color: theme.palette.mode === 'dark' ? '#7dd3d3' : '#1a5757',
              }}
            />
            <Chip 
              icon={<FontAwesomeIcon icon="cube" style={{ fontSize: '0.85rem' }} />}
              label={`${filteredResources.length} Resources`}
              size="small"
              sx={{ 
                fontWeight: 500,
                px: 0.5,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? alpha('#4bbebe', 0.15) 
                  : alpha('#1a5757', 0.08),
                color: theme.palette.mode === 'dark' ? '#7dd3d3' : '#1a5757',
              }}
            />
          </Box>
        </Box>
      </Fade>
      {/* ===== ORCHESTRATORS ===== */}
      <Fade in={showContent} timeout={800}>
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h4" 
            className={styles.wrapperHeader}
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              fontWeight: 600,
              letterSpacing: '-0.02em',
              mb: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' 
                ? alpha('#4bbebe', 0.12) 
                : alpha('#1a5757', 0.08),
              color: theme.palette.mode === 'dark' ? '#7dd3d3' : '#1a5757',
            }}>
              <FontAwesomeIcon icon="sitemap" style={{ fontSize: '1rem' }} />
            </Box>
            Orchestrators
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.925rem',
              ml: 7
            }}
          >
            Manage your infrastructure orchestration workflows
          </Typography>
        </Box>
      </Fade>
      <Grid
        container
        columns={{ xs: 4, sm: 8, md: 12 }}
        spacing={{ xs: 2, sm: 2.5, md: 3 }}
        alignItems="stretch"
      >
        {isLoading ? (
          // Loading Skeletons
          Array.from({ length: 4 }).map((_, index) => (
            <Grid key={`skeleton-orch-${index}`} size={{ xs: 12, sm: 6, md: 4, lg: 3 }} display="flex">
              <Box sx={{ width: '100%', p: 2.5, borderRadius: 3 }}>
                <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2, mb: 2 }} />
                <Skeleton variant="text" width="70%" height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1.5 }} />
                <Skeleton variant="rounded" width={150} height={28} />
              </Box>
            </Grid>
          ))
        ) : (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} display="flex">
              <Fade in={showContent} timeout={1000}>
                <Box 
                  className={styles.card} 
                  onClick={() => navigateOrchestrator('new')}
                  sx={{
                    border: '2px dashed',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(136, 207, 207, 0.3)' : 'rgba(32, 90, 90, 0.2)',
                    backgroundColor: 'transparent !important',
                    '&:hover': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(136, 207, 207, 0.6)' : 'rgba(32, 90, 90, 0.4)',
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(136, 207, 207, 0.05) !important' : 'rgba(32, 90, 90, 0.02) !important',
                    }
                  }}
                >
                  <div className={styles.cardBlank}>
                    <FontAwesomeIcon 
                      icon="plus" 
                      size="3x"
                      style={{ 
                        color: theme.palette.mode === 'dark' ? '#88cfcf' : '#4bbebe',
                        opacity: 0.7 
                      }} 
                    />
                    <Typography 
                      sx={{ 
                        mt: 2, 
                        fontWeight: 500, 
                        color: 'text.secondary',
                        fontSize: '0.95rem'
                      }}
                    >
                      New Orchestrator
                    </Typography>
                  </div>
                </Box>
              </Fade>
            </Grid>

            {filteredOrchestrators && filteredOrchestrators.length > 0 ? (
          filteredOrchestrators.map((orchestrator, index) => (
            <Grid
              key={orchestrator._id}
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              display="flex"
            >
              <Fade in={showContent} timeout={1000 + index * 100}>
              <Box
                className={styles.card}
                onClick={() => navigateOrchestrator(orchestrator._id)}
              >
                <CardLogo
                  cloudType={orchestrator.templateInfo?.cloud || "aws"}
                  className={styles.cloudTypeLogo}
                />
                {orchestrator.previewImageUrl ? (
                  <img
                    src={orchestrator.previewImageUrl}
                    alt={orchestrator.templateInfo?.templateName || "Orchestrator"}
                    className={styles.orchestratorCardImage}
                  />
                ) : (
                  <Box className={styles.orchestratorCardImage} sx={{
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    color: theme.palette.mode === 'dark' ? 'rgba(136, 207, 207, 0.5)' : 'rgba(32, 90, 90, 0.4)',
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(136, 207, 207, 0.05)' : 'rgba(32, 90, 90, 0.03)',
                  }}>
                    <FontAwesomeIcon icon="sitemap" />
                  </Box>
                )}
                <Typography 
                  variant="h6" 
                  className={styles.cardTitle}
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: '1.1rem',
                    mt: 1.5,
                    mb: 0.75
                  }}
                >
                  <Link
                    to={`/orchestrator/${orchestrator._id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                    aria-label={`View orchestrator ${orchestrator.templateInfo?.templateName || "Orchestrator"}`}
                  >
                    {orchestrator.templateInfo?.templateName || "Unnamed Orchestrator"}
                  </Link>
                </Typography>
                <Typography 
                  variant="body2" 
                  className={styles.cardDescription}
                  sx={{ mb: 1.5, lineHeight: 1.5 }}
                >
                  {orchestrator.templateInfo?.description || "No description"}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Box 
                    component="code" 
                    sx={{ 
                      fontSize: '0.8rem',
                      color: 'text.secondary',
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <FontAwesomeIcon icon="circle-nodes" style={{ fontSize: '0.75rem' }} />
                    {orchestrator.nodeCount} nodes • {orchestrator.edgeCount} edges
                  </Box>
                </Box>
              </Box>
              </Fade>
            </Grid>
          ))
            ) : (
              <Grid size={12}>
                <Fade in={showContent} timeout={1200}>
                  <Box sx={{ 
                    p: 6, 
                    textAlign: 'center', 
                    color: 'text.secondary',
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? alpha('#fff', 0.02) 
                      : alpha('#000', 0.02),
                    borderRadius: 3,
                    border: '1px dashed',
                    borderColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.1)',
                  }}>
                    <FontAwesomeIcon 
                      icon="sitemap" 
                      size="3x" 
                      style={{ 
                        opacity: 0.3,
                        marginBottom: '16px',
                        color: theme.palette.mode === 'dark' ? '#88cfcf' : '#4bbebe'
                      }} 
                    />
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                      {searchQuery ? 'No orchestrators found' : 'No orchestrators yet'}
                    </Typography>
                    <Typography variant="body2">
                      {searchQuery 
                        ? 'Try adjusting your search query'
                        : 'Click "New Orchestrator" to create your first infrastructure workflow!'}
                    </Typography>
                  </Box>
                </Fade>
              </Grid>
            )}
          </>
        )}
      </Grid>

      {/* ===== RESOURCES ===== */}
      <Fade in={showContent} timeout={1000}>
        <Box sx={{ mb: 3, mt: 6 }}>
          <Typography 
            variant="h4" 
            className={styles.wrapperHeader}
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              fontWeight: 600,
              letterSpacing: '-0.02em',
              mb: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' 
                ? alpha('#4bbebe', 0.12) 
                : alpha('#1a5757', 0.08),
              color: theme.palette.mode === 'dark' ? '#7dd3d3' : '#1a5757',
            }}>
              <FontAwesomeIcon icon="cube" style={{ fontSize: '1rem' }} />
            </Box>
            Resources
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.925rem',
              ml: 7
            }}
          >
            Cloud resources and templates for your projects
          </Typography>
        </Box>
      </Fade>
      <Grid
        container
        columns={{ xs: 4, sm: 8, md: 12 }}
        spacing={{ xs: 2, sm: 2.5, md: 3 }}
        alignItems="stretch"
        sx={{ pb: 4 }}
      >
        {isLoading ? (
          // Loading Skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <Grid key={`skeleton-res-${index}`} size={{ xs: 12, sm: 6, md: 4, lg: 2 }} display="flex">
              <Box sx={{ width: '100%', p: 2.5, borderRadius: 3 }}>
                <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2, mb: 2 }} />
                <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="100%" height={18} />
                <Skeleton variant="text" width="60%" height={18} sx={{ mb: 1.5 }} />
                <Skeleton variant="rounded" width={100} height={24} />
              </Box>
            </Grid>
          ))
        ) : (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} display="flex">
              <Fade in={showContent} timeout={1200}>
                <Box 
                  className={styles.card} 
                  onClick={() => navigateResource(undefined)}
                  sx={{
                    border: '2px dashed',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(136, 207, 207, 0.3)' : 'rgba(32, 90, 90, 0.2)',
                    backgroundColor: 'transparent !important',
                    '&:hover': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(136, 207, 207, 0.6)' : 'rgba(32, 90, 90, 0.4)',
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(136, 207, 207, 0.05) !important' : 'rgba(32, 90, 90, 0.02) !important',
                    }
                  }}
                >
                  <div className={styles.cardBlank}>
                    <FontAwesomeIcon 
                      icon="plus" 
                      size="3x"
                      style={{ 
                        color: theme.palette.mode === 'dark' ? '#88cfcf' : '#4bbebe',
                        opacity: 0.7 
                      }} 
                    />
                    <Typography 
                      sx={{ 
                        mt: 2, 
                        fontWeight: 500, 
                        color: 'text.secondary',
                        fontSize: '0.95rem'
                      }}
                    >
                      New Resource
                    </Typography>
                  </div>
                </Box>
              </Fade>
            </Grid>

            {filteredResources.map((resource, index) => (
              <Grid
                key={resource._id}
                size={{ xs: 12, sm: 6, md: 4, lg: 2 }}
                display="flex"
              >
                <Fade in={showContent} timeout={1200 + index * 80}>
                  <Box
                    className={styles.card}
                    onClick={() => navigateResource(resource._id)}
                  >
              <CardLogo
                cloudType={resource.cloudProvider}
                className={styles.cloudTypeLogo}
              />
              <img
                src={resource?.resourceIcon?.url}
                alt={resource.resourceName}
                className={styles.cardImage}
              />
              <Typography 
                variant="h6" 
                className={styles.cardTitle}
                sx={{ 
                  fontWeight: 600, 
                  fontSize: '1rem',
                  mt: 1.5,
                  mb: 0.75
                }}
              >
                <Link
                  to={`/resources/${resource._id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                  aria-label={`View details for ${resource.resourceName}`}
                >
                  {resource.resourceName}
                </Link>
              </Typography>
              <Typography 
                variant="body2" 
                className={styles.cardDescription}
                sx={{ mb: 1.5, lineHeight: 1.5 }}
              >
                {resource.resourceDescription}
              </Typography>
                  <Box 
                    component="code" 
                    sx={{ 
                      fontSize: '0.8rem',
                      color: 'text.secondary',
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <FontAwesomeIcon icon="tag" style={{ fontSize: '0.7rem' }} />
                    v{resource.resourceVersion}
                  </Box>
                </Box>
                </Fade>
              </Grid>
            ))}

            {filteredResources.length === 0 && (
              <Grid size={12}>
                <Fade in={showContent} timeout={1400}>
                  <Box sx={{ 
                    p: 6, 
                    textAlign: 'center', 
                    color: 'text.secondary',
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? alpha('#fff', 0.02) 
                      : alpha('#000', 0.02),
                    borderRadius: 3,
                    border: '1px dashed',
                    borderColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.1)',
                  }}>
                    <FontAwesomeIcon 
                      icon="cube" 
                      size="3x" 
                      style={{ 
                        opacity: 0.3,
                        marginBottom: '16px',
                        color: theme.palette.mode === 'dark' ? '#88cfcf' : '#4bbebe'
                      }} 
                    />
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                      {searchQuery ? 'No resources found' : 'No resources yet'}
                    </Typography>
                    <Typography variant="body2">
                      {searchQuery 
                        ? 'Try adjusting your search query'
                        : 'Click "New Resource" to add your first cloud resource!'}
                    </Typography>
                  </Box>
                </Fade>
              </Grid>
            )}
          </>
        )}
      </Grid>
    </Box>
  );
};

export default Home;
