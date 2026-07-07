import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { driver, type Driver } from "driver.js";

import { useAuth } from "../../../context/AuthContext";
import type {
  GuidanceAnnouncementDefinition,
  GuidanceCatalog,
  GuidanceState,
  GuidanceTourDefinition,
  GuidanceTourId,
} from "./guidance";
import {
  createGuidanceCatalog,
  dismissAnnouncementInState,
  findTourForPath,
  getAnnouncementSpotlightsForPath,
  hasSeenTour,
  getGuidanceUserKey,
  getVisibleAnnouncements,
  loadGuidanceState,
  markTourSeenInState,
  isPublicEntryPath,
  saveGuidanceState,
} from "./guidance";

type ProductGuidanceContextValue = {
  currentTour: GuidanceTourDefinition | null;
  visibleAnnouncements: GuidanceAnnouncementDefinition[];
  unreadAnnouncementCount: number;
  startCurrentTour: () => boolean;
  startTour: (tourId: GuidanceTourId, options?: { auto?: boolean }) => boolean;
  requestAutoTour: (tourId: GuidanceTourId) => boolean;
  openAnnouncements: () => void;
  closeAnnouncements: () => void;
  dismissAnnouncement: (announcementId: string) => void;
  showAnnouncementSpotlight: (
    announcement: GuidanceAnnouncementDefinition,
  ) => boolean;
};

const ProductGuidanceContext = createContext<
  ProductGuidanceContextValue | undefined
>(undefined);

const announcementKey = (announcement: GuidanceAnnouncementDefinition) =>
  `${announcement.id}:${announcement.version}`;

const isRouteMatch = (pathname: string, routes: string[]) =>
  routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

const usePersistentGuidanceState = (
  userKey: string,
): [GuidanceState, React.Dispatch<React.SetStateAction<GuidanceState>>] => {
  const [state, setState] = useState<GuidanceState>(() =>
    loadGuidanceState(userKey),
  );
  const skipNextSaveRef = useRef(false);

  useEffect(() => {
    skipNextSaveRef.current = true;
    setState(loadGuidanceState(userKey));
  }, [userKey]);

  useEffect(() => {
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    saveGuidanceState(userKey, state);
  }, [userKey, state]);

  return [state, setState];
};

export const ProductGuidanceProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  const canCreateOrchestrators = hasPermission("create-orchestrators");
  const canCreateResources = hasPermission("create-resources");

  const catalog = useMemo<GuidanceCatalog>(
    () =>
      createGuidanceCatalog({
        canCreateOrchestrators,
        canCreateResources,
      }),
    [canCreateOrchestrators, canCreateResources],
  );

  const userKey = useMemo(() => getGuidanceUserKey(user), [user]);
  const [guidanceState, setGuidanceState] = usePersistentGuidanceState(userKey);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const driverRef = useRef<Driver | null>(null);
  const activeSessionRef = useRef<"tour" | "announcement" | null>(null);
  const activeTourIdRef = useRef<GuidanceTourId | null>(null);
  const sessionTokenRef = useRef(0);
  const sessionSeenAnnouncementsRef = useRef<Set<string>>(new Set());

  const currentTour = useMemo(
    () => findTourForPath(location.pathname, catalog.tours, location.search),
    [catalog.tours, location.pathname, location.search],
  );

  const visibleAnnouncements = useMemo(
    () => getVisibleAnnouncements(guidanceState, catalog.announcements),
    [catalog.announcements, guidanceState],
  );

  const visibleAnnouncementKeys = useMemo(
    () => visibleAnnouncements.map((announcement) => announcementKey(announcement)),
    [visibleAnnouncements],
  );
  const canShowAnnouncements = useMemo(
    () => !isPublicEntryPath(location.pathname),
    [location.pathname],
  );

  const unreadAnnouncementCount = visibleAnnouncements.length;

  const destroyDriver = useCallback(() => {
    driverRef.current?.destroy();
    driverRef.current = null;
  }, []);

  const finishDriverSession = useCallback(
    (token: number) => {
      if (sessionTokenRef.current !== token) return;
      const activeSession = activeSessionRef.current;
      const activeTourId = activeTourIdRef.current;
      driverRef.current = null;
      activeSessionRef.current = null;
      activeTourIdRef.current = null;

      if (activeSession === "tour" && activeTourId) {
        setGuidanceState((prev) => markTourSeenInState(prev, activeTourId));
      }
    },
    [setGuidanceState],
  );

  const startTour = useCallback(
    (tourId: GuidanceTourId, options?: { auto?: boolean }) => {
      const tour = catalog.tours[tourId];
      if (!tour) return false;
      if (currentTour?.id !== tour.id) return false;
      if (!tour.steps.length) return false;
      if (
        options?.auto &&
        activeSessionRef.current === "tour" &&
        driverRef.current?.isActive()
      ) {
        return true;
      }

      destroyDriver();

      const token = sessionTokenRef.current + 1;
      sessionTokenRef.current = token;
      activeSessionRef.current = "tour";
      activeTourIdRef.current = tourId;
      setAnnouncementDialogOpen(false);

      const instance = driver({
        animate: true,
        allowClose: true,
        allowKeyboardControl: true,
        allowScroll: true,
        smoothScroll: true,
        overlayColor: theme.palette.common.black,
        overlayOpacity: theme.palette.mode === "dark" ? 0.72 : 0.48,
        stagePadding: 8,
        stageRadius: 12,
        showProgress: true,
        popoverClass: `orchestrator-guidance-popover orchestrator-guidance-popover--${theme.palette.mode}`,
        onCloseClick: (_element, _step, { driver: activeDriver }) => {
          activeDriver.destroy();
        },
        onDoneClick: (_element, _step, { driver: activeDriver }) => {
          activeDriver.destroy();
        },
        onDestroyed: () => {
          finishDriverSession(token);
        },
      });

      driverRef.current = instance;
      instance.setSteps(tour.steps);
      instance.drive();

      return true;
    },
    [catalog.tours, currentTour?.id, destroyDriver, finishDriverSession],
  );

  const requestAutoTour = useCallback(
    (tourId: GuidanceTourId) => {
      const tour = catalog.tours[tourId];
      if (!tour || !tour.autoStart) return false;
      if (!currentTour || currentTour.id !== tour.id) return false;
      if (hasSeenTour(guidanceState, tourId)) return false;
      if (activeSessionRef.current) return false;
      return startTour(tourId, { auto: true });
    },
    [catalog.tours, currentTour, guidanceState, startTour],
  );

  const openAnnouncements = useCallback(() => {
    if (!canShowAnnouncements) return;
    destroyDriver();
    sessionSeenAnnouncementsRef.current = new Set([
      ...sessionSeenAnnouncementsRef.current,
      ...visibleAnnouncementKeys,
    ]);
    setAnnouncementDialogOpen(true);
  }, [canShowAnnouncements, destroyDriver, visibleAnnouncementKeys]);

  const closeAnnouncements = useCallback(() => {
    setAnnouncementDialogOpen(false);
  }, []);

  const dismissAnnouncement = useCallback(
    (announcementId: string) => {
      const announcement = visibleAnnouncements.find(
        (item) => item.id === announcementId,
      );
      if (!announcement) return;

      setGuidanceState((prev) =>
        dismissAnnouncementInState(prev, announcement.id, announcement.version),
      );

      if (visibleAnnouncements.length <= 1) {
        setAnnouncementDialogOpen(false);
      }
    },
    [setGuidanceState, visibleAnnouncements],
  );

  const showAnnouncementSpotlight = useCallback(
    (announcement: GuidanceAnnouncementDefinition) => {
      if (!canShowAnnouncements) return false;
      const spotlight = announcement.spotlight;
      if (!spotlight) return false;
      if (spotlight.routes && !isRouteMatch(location.pathname, spotlight.routes)) {
        return false;
      }

      const target = document.querySelector(spotlight.selector);
      if (!(target instanceof Element)) return false;

      destroyDriver();
      setAnnouncementDialogOpen(false);

      const token = sessionTokenRef.current + 1;
      sessionTokenRef.current = token;
      activeSessionRef.current = "announcement";
      activeTourIdRef.current = null;

      const instance = driver({
        animate: true,
        allowClose: true,
        allowKeyboardControl: true,
        allowScroll: true,
        smoothScroll: true,
        overlayColor: theme.palette.common.black,
        overlayOpacity: theme.palette.mode === "dark" ? 0.72 : 0.48,
        stagePadding: 8,
        stageRadius: 12,
        showButtons: ["close"],
        popoverClass: `orchestrator-guidance-popover orchestrator-guidance-popover--${theme.palette.mode}`,
        onCloseClick: (_element, _step, { driver: activeDriver }) => {
          activeDriver.destroy();
        },
        onDoneClick: (_element, _step, { driver: activeDriver }) => {
          activeDriver.destroy();
        },
        onDestroyed: () => {
          finishDriverSession(token);
        },
      });

      driverRef.current = instance;
      sessionSeenAnnouncementsRef.current.add(announcementKey(announcement));
      instance.highlight({
        element: target,
        popover: {
          title: spotlight.title,
          description: spotlight.description,
          side: spotlight.side ?? "bottom",
          align: spotlight.align ?? "center",
          showButtons: ["close"],
        },
      });

      return true;
    },
    [canShowAnnouncements, destroyDriver, finishDriverSession, location.pathname],
  );

  useEffect(() => {
    sessionTokenRef.current += 1;
    destroyDriver();
    activeSessionRef.current = null;
    activeTourIdRef.current = null;
    sessionSeenAnnouncementsRef.current = new Set();
    setAnnouncementDialogOpen(false);
  }, [destroyDriver, userKey]);

  useEffect(
    () => () => {
      sessionTokenRef.current += 1;
      driverRef.current?.destroy();
      driverRef.current = null;
      activeTourIdRef.current = null;
    },
    [],
  );

  useEffect(() => {
    if (!canShowAnnouncements) {
      destroyDriver();
      activeSessionRef.current = null;
      activeTourIdRef.current = null;
      setAnnouncementDialogOpen(false);
      return;
    }

    if (currentTour?.autoStart && !hasSeenTour(guidanceState, currentTour.id)) return;

    const spotlightAnnouncements = getAnnouncementSpotlightsForPath(
      location.pathname,
      visibleAnnouncements,
    );
    const nextSpotlight = spotlightAnnouncements.find(
      (announcement) =>
        !sessionSeenAnnouncementsRef.current.has(announcementKey(announcement)),
    );

    if (nextSpotlight && !activeSessionRef.current && !announcementDialogOpen) {
      const started = showAnnouncementSpotlight(nextSpotlight);
      if (started) return;

      sessionSeenAnnouncementsRef.current.add(announcementKey(nextSpotlight));
      setAnnouncementDialogOpen(true);
      return;
    }

    const nonSpotlightAnnouncements = visibleAnnouncements.filter(
      (announcement) => !announcement.spotlight,
    );

    const unseenAnnouncements = nonSpotlightAnnouncements.filter(
      (announcement) =>
        !sessionSeenAnnouncementsRef.current.has(announcementKey(announcement)),
    );

    if (unseenAnnouncements.length > 0 && !announcementDialogOpen) {
      sessionSeenAnnouncementsRef.current = new Set([
        ...sessionSeenAnnouncementsRef.current,
        ...unseenAnnouncements.map((announcement) =>
          announcementKey(announcement),
        ),
      ]);
      setAnnouncementDialogOpen(true);
    }
  }, [
    announcementDialogOpen,
    currentTour?.autoStart,
    guidanceState,
    location.pathname,
    showAnnouncementSpotlight,
    visibleAnnouncements,
    canShowAnnouncements,
    destroyDriver,
  ]);

  useEffect(() => {
    if (visibleAnnouncements.length === 0) {
      setAnnouncementDialogOpen(false);
    }
  }, [visibleAnnouncements.length]);

  const contextValue = useMemo<ProductGuidanceContextValue>(
    () => ({
      currentTour,
      visibleAnnouncements,
      unreadAnnouncementCount,
      startCurrentTour: () =>
        currentTour ? startTour(currentTour.id, { auto: false }) : false,
      startTour,
      requestAutoTour,
      openAnnouncements,
      closeAnnouncements,
      dismissAnnouncement,
      showAnnouncementSpotlight,
    }),
    [
      closeAnnouncements,
      currentTour,
      dismissAnnouncement,
      openAnnouncements,
      requestAutoTour,
      showAnnouncementSpotlight,
      startTour,
      unreadAnnouncementCount,
      visibleAnnouncements,
    ],
  );

  return (
    <ProductGuidanceContext.Provider value={contextValue}>
      {children}

      <Dialog
        open={announcementDialogOpen}
        onClose={closeAnnouncements}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 1,
              overflow: "hidden",
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                What&apos;s New
              </Typography>
              <Typography variant="body2" color="text.secondary">
                New product notes and feature updates live here.
              </Typography>
            </Box>
            <Box
              sx={{
                px: 1.25,
                py: 0.5,
                borderRadius: 999,
                fontSize: "0.75rem",
                fontWeight: 700,
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              }}
            >
              {visibleAnnouncements.length} update
              {visibleAnnouncements.length === 1 ? "" : "s"}
            </Box>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ py: 2.5 }}>
          <Stack spacing={1.5}>
            {visibleAnnouncements.length === 0 ? (
              <Alert severity="info" variant="outlined">
                You are all caught up.
              </Alert>
            ) : (
              visibleAnnouncements.map((announcement) => {
                const key = announcementKey(announcement);
                const hasSpotlight = Boolean(announcement.spotlight);
                const canReplayTour = Boolean(currentTour);

                return (
                  <Paper
                    key={key}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      backgroundColor: alpha(theme.palette.background.paper, 0.72),
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {announcement.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", fontWeight: 600 }}
                        >
                          Version {announcement.version}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", lineHeight: 1.7 }}
                      >
                        {announcement.body}
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {announcement.ctaLabel && announcement.ctaRoute && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => navigate(announcement.ctaRoute ?? "/")}
                            sx={{ borderRadius: 2, textTransform: "none" }}
                          >
                            {announcement.ctaLabel}
                          </Button>
                        )}

                        {hasSpotlight && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => showAnnouncementSpotlight(announcement)}
                            sx={{ borderRadius: 2, textTransform: "none" }}
                          >
                            Show me
                          </Button>
                        )}

                        {canReplayTour && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              if (currentTour) {
                                startTour(currentTour.id, { auto: false });
                              }
                            }}
                            sx={{ borderRadius: 2, textTransform: "none" }}
                          >
                            Replay tour
                          </Button>
                        )}

                        <Button
                          variant="text"
                          size="small"
                          onClick={() => dismissAnnouncement(announcement.id)}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            color: "text.secondary",
                          }}
                        >
                          Dismiss
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 0 }}>
          <Button
            onClick={closeAnnouncements}
            variant="contained"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </ProductGuidanceContext.Provider>
  );
};

export const useProductGuidance = () => {
  const context = useContext(ProductGuidanceContext);
  if (!context) {
    throw new Error(
      "useProductGuidance must be used within a ProductGuidanceProvider",
    );
  }
  return context;
};

export const useGuidedTour = (tourId: GuidanceTourId, enabled: boolean) => {
  const { requestAutoTour } = useProductGuidance();
  const requestedRef = useRef(false);

  useEffect(() => {
    if (!enabled || requestedRef.current) return;
    requestedRef.current = true;
    void requestAutoTour(tourId);
  }, [enabled, requestAutoTour, tourId]);
};
