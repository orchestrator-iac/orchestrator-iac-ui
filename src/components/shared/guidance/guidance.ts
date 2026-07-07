import type { Alignment, DriveStep, Side } from "driver.js";

import type { UserProfile } from "../../../types/auth";

export type GuidanceTourId =
  | "home"
  | "templates"
  | "resources"
  | "resourceDetail"
  | "orchestrator";

export interface GuidanceRoute {
  pathname: string;
  search: string;
}

export interface GuidanceTourDefinition {
  id: GuidanceTourId;
  title: string;
  matches: (route: GuidanceRoute) => boolean;
  autoStart: boolean;
  steps: DriveStep[];
}

export interface GuidanceSpotlightDefinition {
  selector: string;
  title: string;
  description: string;
  side?: Side;
  align?: Alignment;
  routes?: string[];
}

export interface GuidanceAnnouncementDefinition {
  id: string;
  version: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaRoute?: string;
  spotlight?: GuidanceSpotlightDefinition;
}

export interface GuidanceState {
  introTourSeen: boolean;
  seenTours: Record<string, boolean>;
  dismissedAnnouncements: Record<string, string>;
}

export interface GuidanceCatalog {
  tours: Record<GuidanceTourId, GuidanceTourDefinition>;
  announcements: GuidanceAnnouncementDefinition[];
}

export interface GuidancePermissions {
  canCreateOrchestrators: boolean;
  canCreateResources: boolean;
}

const GUIDANCE_STORAGE_PREFIX = "orchestrator-guidance";
const GUIDANCE_STATE_VERSION = "v1";

const DEFAULT_STATE: GuidanceState = {
  introTourSeen: false,
  seenTours: {},
  dismissedAnnouncements: {},
};

const cloneDefaultState = (): GuidanceState => ({
  introTourSeen: DEFAULT_STATE.introTourSeen,
  seenTours: { ...DEFAULT_STATE.seenTours },
  dismissedAnnouncements: { ...DEFAULT_STATE.dismissedAnnouncements },
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getStorageKey = (userKey: string) =>
  `${GUIDANCE_STORAGE_PREFIX}:${GUIDANCE_STATE_VERSION}:${userKey}`;

export const getGuidanceUserKey = (
  user: UserProfile | null | undefined,
): string => {
  const raw = user?.email || user?._id || "guest";
  return raw.trim().toLowerCase();
};

export const loadGuidanceState = (userKey: string): GuidanceState => {
  try {
    const raw = localStorage.getItem(getStorageKey(userKey));
    if (!raw) return cloneDefaultState();

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return cloneDefaultState();

    const seenTours = isRecord(parsed.seenTours)
      ? Object.entries(parsed.seenTours).reduce<Record<string, boolean>>(
          (acc, [tourId, seen]) => {
            if (seen === true && tourId.trim()) {
              acc[tourId] = true;
            }
            return acc;
          },
          {},
        )
      : {};

    if (parsed.introTourSeen === true) {
      seenTours.home = true;
    }

    const dismissedAnnouncements = isRecord(parsed.dismissedAnnouncements)
      ? Object.entries(parsed.dismissedAnnouncements).reduce<Record<string, string>>(
          (acc, [announcementId, version]) => {
            if (typeof version === "string" && announcementId.trim()) {
              acc[announcementId] = version;
            }
            return acc;
          },
          {},
        )
      : {};

    return {
      introTourSeen: parsed.introTourSeen === true,
      seenTours,
      dismissedAnnouncements,
    };
  } catch {
    return cloneDefaultState();
  }
};

export const saveGuidanceState = (
  userKey: string,
  state: GuidanceState,
): void => {
  try {
    localStorage.setItem(getStorageKey(userKey), JSON.stringify(state));
  } catch {
    // Best-effort only. Guidance should degrade gracefully if storage is unavailable.
  }
};

export const dismissAnnouncementInState = (
  state: GuidanceState,
  announcementId: string,
  version: string,
): GuidanceState => ({
  ...state,
  dismissedAnnouncements: {
    ...state.dismissedAnnouncements,
    [announcementId]: version,
  },
});

export const markIntroTourSeenInState = (state: GuidanceState): GuidanceState => ({
  ...state,
  introTourSeen: true,
  seenTours: {
    ...state.seenTours,
    home: true,
  },
});

export const markTourSeenInState = (
  state: GuidanceState,
  tourId: GuidanceTourId,
): GuidanceState => ({
  ...state,
  introTourSeen: state.introTourSeen || tourId === "home",
  seenTours: {
    ...state.seenTours,
    [tourId]: true,
  },
});

export const hasSeenTour = (
  state: GuidanceState,
  tourId: GuidanceTourId,
): boolean => Boolean(state.seenTours[tourId]) || (tourId === "home" && state.introTourSeen);

export const isAnnouncementDismissed = (
  state: GuidanceState,
  announcement: GuidanceAnnouncementDefinition,
): boolean =>
  state.dismissedAnnouncements[announcement.id] === announcement.version;

export const getVisibleAnnouncements = (
  state: GuidanceState,
  announcements: GuidanceAnnouncementDefinition[],
): GuidanceAnnouncementDefinition[] =>
  announcements.filter((announcement) => !isAnnouncementDismissed(state, announcement));

const homeTour = (canCreateOrchestrators: boolean): GuidanceTourDefinition => ({
  id: "home",
  title: "Home",
  matches: ({ pathname }) => pathname === "/home" || pathname === "/dashboard",
  autoStart: true,
  steps: [
    {
      element: '[data-tour="home-search"]',
      popover: {
        title: "Search the workspace",
        description:
          "Find orchestrators quickly by template name or description.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: '[data-tour="home-templates-chip"]',
      popover: {
        title: "Browse templates",
        description:
          "Open the template gallery when you want a reusable starting point.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: '[data-tour="home-resources-chip"]',
      popover: {
        title: "Inspect resources",
        description:
          "Jump to the resource catalog to review or edit Terraform-backed building blocks.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: '[data-tour="home-top-templates"]',
      popover: {
        title: "Top Templates",
        description:
          "Review the most-used templates on the home screen before opening the full gallery.",
        side: "top",
        align: "start",
      },
    },
    {
      element: '[data-tour="home-top-resources"]',
      popover: {
        title: "Top Resources",
        description:
          "Scan the most popular resources and open one when you need a closer look.",
        side: "top",
        align: "start",
      },
    },
    ...(canCreateOrchestrators
      ? [
          {
            element: '[data-tour="home-new-orchestrator"]',
            popover: {
              title: "Start a workflow",
              description:
                "Create a new orchestrator when you are ready to wire resources together.",
              side: "left",
              align: "start",
            },
          } satisfies DriveStep,
        ]
      : []),
  ],
});

const templatesTour = (): GuidanceTourDefinition => ({
  id: "templates",
  title: "Templates",
  matches: ({ pathname }) => pathname === "/templates",
  autoStart: true,
  steps: [
    {
      element: '[data-tour="templates-search"]',
      popover: {
        title: "Search templates",
        description:
          "Filter the gallery by architecture, cloud provider, or keyword.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: '[data-tour="templates-sort"]',
      popover: {
        title: "Sort the gallery",
        description:
          "Switch between popular and newest templates depending on what you need.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="templates-first-card"]',
      popover: {
        title: "Open a template",
        description:
          "Inspect the details of any card and fork it into your own orchestrator.",
        side: "right",
        align: "start",
      },
    },
  ],
});

const resourcesTour = (
  canCreateResources: boolean,
): GuidanceTourDefinition => ({
  id: "resources",
  title: "Resources",
  matches: ({ pathname }) => pathname === "/resources",
  autoStart: true,
  steps: [
    {
      element: '[data-tour="resources-search"]',
      popover: {
        title: "Find a resource",
        description:
          "Search by resource name, description, or resourceId before you open a card.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: '[data-tour="resources-cloud-filter"]',
      popover: {
        title: "Filter by cloud",
        description:
          "Focus the catalog on AWS, Azure, or GCP to reduce the list quickly.",
        side: "bottom",
        align: "center",
      },
    },
    ...(canCreateResources
      ? [
          {
            element: '[data-tour="resources-new-resource"]',
            popover: {
              title: "Create a resource",
              description:
                "Start a new resource definition when you are ready to add it to the catalog.",
              side: "left",
              align: "start",
            },
          } satisfies DriveStep,
        ]
      : []),
    {
      element: '[data-tour="resources-first-card"]',
      popover: {
        title: "Open a resource",
        description:
          "Choose any card to inspect the Terraform core, template, and metadata.",
        side: "right",
        align: "start",
      },
    },
  ],
});

const resourceDetailTour = (): GuidanceTourDefinition => ({
  id: "resourceDetail",
  title: "Resource detail",
  matches: ({ pathname }) =>
    pathname.startsWith("/resources/") && pathname !== "/resources/new",
  autoStart: true,
  steps: [
    {
      element: '[data-tour="resource-detail-stepper"]',
      popover: {
        title: "Follow the setup flow",
        description:
          "This editor walks through Basic Info, Node Info, Terraform Core, and Terraform Template in order.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="resource-detail-step-panel"]',
      popover: {
        title: "Edit the active step",
        description:
          "Complete the section currently shown on the page before moving on.",
        side: "top",
        align: "start",
      },
    },
    {
      element: '[data-tour="resource-detail-next"]',
      popover: {
        title: "Advance the editor",
        description:
          "Use Next to move through the remaining steps once this section is valid.",
        side: "left",
        align: "center",
      },
    },
  ],
});

const orchestratorTour = (): GuidanceTourDefinition => ({
  id: "orchestrator",
  title: "Orchestrator",
  matches: ({ pathname, search }) => {
    if (!pathname.startsWith("/orchestrator/")) return false;
    const searchParams = new URLSearchParams(search);
    return searchParams.get("template_type") === "custom";
  },
  autoStart: true,
  steps: [
    {
      element: '[data-tour="orchestrator-sidebar-search"]',
      popover: {
        title: "Search the palette",
        description:
          "Find provider-scoped resources from the sidebar before you drag them into the canvas.",
        side: "right",
        align: "start",
      },
    },
    {
      element: '[data-tour="orchestrator-canvas"]',
      popover: {
        title: "Build the graph",
        description:
          "Drop resources onto the canvas, connect them, and reshape the architecture visually.",
        side: "top",
        align: "center",
      },
    },
    {
      element: '[data-tour="orchestrator-menu"]',
      popover: {
        title: "Save and export",
        description:
          "Use the menu to save, publish, or generate IaC once the design is ready.",
        side: "left",
        align: "start",
      },
    },
  ],
});

export const createGuidanceCatalog = (
  permissions: GuidancePermissions,
): GuidanceCatalog => ({
  tours: {
    home: homeTour(permissions.canCreateOrchestrators),
    templates: templatesTour(),
    resources: resourcesTour(permissions.canCreateResources),
    resourceDetail: resourceDetailTour(),
    orchestrator: orchestratorTour(),
  },
  announcements: [
    {
      id: "guidance-center",
      version: "2026.07.07",
      title: "Guided onboarding is now available",
      body:
        "Use the Help menu in the header to replay page tours and review feature announcements whenever you need a refresher.",
    },
  ],
});

export const findTourForPath = (
  pathname: string,
  tours: Record<GuidanceTourId, GuidanceTourDefinition>,
  search = "",
): GuidanceTourDefinition | null => {
  const orderedTours = [
    tours.home,
    tours.templates,
    tours.resources,
    tours.resourceDetail,
    tours.orchestrator,
  ];
  const route = { pathname, search };
  return orderedTours.find((tour) => tour.matches(route)) ?? null;
};

export const getAnnouncementSpotlightsForPath = (
  pathname: string,
  announcements: GuidanceAnnouncementDefinition[],
): GuidanceAnnouncementDefinition[] =>
  announcements.filter((announcement) => {
    const routes = announcement.spotlight?.routes;
    return !routes || routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  });

const PUBLIC_ENTRY_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/register-success",
  "/confirm",
  "/night-sky",
  "/black-hole",
  "/update-password",
]);

export const isPublicEntryPath = (pathname: string): boolean =>
  PUBLIC_ENTRY_PATHS.has(pathname) || pathname.startsWith("/email-verification/");
