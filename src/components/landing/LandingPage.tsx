import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  AccountTree as DiagramIcon,
  Checklist as ChecklistIcon,
  CloudQueue as CloudIcon,
  Code as CodeIcon,
  Dns as DnsIcon,
  Download as DownloadIcon,
  Hub as HubIcon,
  Inventory2 as TemplateIcon,
  OpenInNew as OpenIcon,
  PlayArrow as PlayIcon,
  Rule as RuleIcon,
  SettingsEthernet as ConnectIcon,
  ShieldOutlined as ShieldIcon,
  Storage as StorageIcon,
  Terminal as TerminalIcon,
  VerifiedUser as VerifiedIcon,
  VpnLock as NetworkIcon,
} from "@mui/icons-material";
import MaestroRobot, {
  type MaestroRobotState,
} from "@/components/chatbot/MaestroRobot";

const SITE_URL = "https://orchestrator.next-zen.dev";

interface ProductNode {
  icon: React.ReactNode;
  label: string;
  meta: string;
  x: string;
  y: string;
}

interface ProductLoopItem {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  highlights: string[];
  visual: "templates" | "canvas" | "validation" | "terraform";
}

interface CapabilityItem {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
}

interface TemplateItem {
  name: string;
  detail: string;
  cloud: string;
  nodes: string;
  status: string;
}

interface ArtifactItem {
  label: string;
  title: string;
  description: string;
}

interface MaestroJourneyStep {
  step: string;
  label: string;
  title: string;
  description: string;
  mascotState: MaestroRobotState;
  detail: string;
}

const templateRows: TemplateItem[] = [
  {
    name: "AWS VPC Landing Zone",
    detail: "Networking, subnets, NAT, routing",
    cloud: "AWS",
    nodes: "12 nodes",
    status: "Ready to fork",
  },
  {
    name: "Kubernetes Platform Base",
    detail: "Cluster, node groups, IAM, observability",
    cloud: "AWS",
    nodes: "18 nodes",
    status: "Popular pattern",
  },
  {
    name: "Azure App Baseline",
    detail: "VNet, app service, storage, private endpoints",
    cloud: "Azure",
    nodes: "14 nodes",
    status: "Review ready",
  },
];

const architectureNodes: ProductNode[] = [
  {
    icon: <NetworkIcon fontSize="small" />,
    label: "VPC",
    meta: "10.0.0.0/16",
    x: "9%",
    y: "18%",
  },
  {
    icon: <DnsIcon fontSize="small" />,
    label: "Public subnet",
    meta: "2 zones",
    x: "36%",
    y: "10%",
  },
  {
    icon: <StorageIcon fontSize="small" />,
    label: "RDS",
    meta: "private",
    x: "60%",
    y: "30%",
  },
  {
    icon: <HubIcon fontSize="small" />,
    label: "Gateway",
    meta: "egress",
    x: "30%",
    y: "54%",
  },
  {
    icon: <VerifiedIcon fontSize="small" />,
    label: "Policy",
    meta: "validated",
    x: "67%",
    y: "67%",
  },
];

const terraformLines = [
  'module "network" {',
  '  source = "./modules/vpc"',
  '  cidr   = "10.0.0.0/16"',
  "}",
  "",
  'module "database" {',
  '  source     = "./modules/rds"',
  "  subnet_ids = module.network.private_subnets",
  "}",
];

const productLoop: ProductLoopItem[] = [
  {
    step: "01",
    icon: <TemplateIcon />,
    title: "Choose the closest blueprint",
    description:
      "Start with a published landing-zone pattern instead of a blank Terraform folder.",
    highlights: ["AWS and Azure patterns", "Forkable starting point"],
    visual: "templates",
  },
  {
    step: "02",
    icon: <DiagramIcon />,
    title: "Fork it into the canvas",
    description:
      "Move from gallery to editable architecture, keeping relationships visible as nodes change.",
    highlights: ["Relationships stay visible", "Nodes become editable"],
    visual: "canvas",
  },
  {
    step: "03",
    icon: <ChecklistIcon />,
    title: "Configure with guardrails",
    description:
      "Collect provider-specific inputs in forms and flag missing configuration before export.",
    highlights: ["Schema-backed forms", "Warnings before export"],
    visual: "validation",
  },
  {
    step: "04",
    icon: <TerminalIcon />,
    title: "Generate reviewable IaC",
    description:
      "Produce Terraform artifacts that can be downloaded, reviewed, and moved into your delivery flow.",
    highlights: ["Module output preview", "Bundle ready for review"],
    visual: "terraform",
  },
];

const artifactItems: ArtifactItem[] = [
  {
    label: "Canvas",
    title: "Architecture as a working model",
    description:
      "Nodes, edges, cloud metadata, and resource settings stay connected as the design evolves.",
  },
  {
    label: "Validation",
    title: "Configuration issues surfaced early",
    description:
      "Schema-backed fields make incomplete values obvious before they become Terraform problems.",
  },
  {
    label: "Export",
    title: "Terraform packaged for review",
    description:
      "The output is meant for your team process: inspect, commit, and run through existing checks.",
  },
];

const capabilityItems: CapabilityItem[] = [
  {
    icon: <TemplateIcon />,
    label: "Reusable",
    title: "Template gallery",
    description:
      "Publish orchestrators as reusable blueprints and let teams fork proven patterns.",
  },
  {
    icon: <ConnectIcon />,
    label: "Visual",
    title: "Connected resource graph",
    description:
      "See networks, gateways, databases, policies, and dependencies in one architecture surface.",
  },
  {
    icon: <RuleIcon />,
    label: "Structured",
    title: "Schema-backed forms",
    description:
      "Replace scattered variables with guided resource configuration and validation feedback.",
  },
  {
    icon: <CloudIcon />,
    label: "Cloud aware",
    title: "AWS, Azure, and GCP context",
    description:
      "Keep provider-specific resources organized while preserving one consistent workflow.",
  },
  {
    icon: <ShieldIcon />,
    label: "Reviewable",
    title: "Validation-first output",
    description:
      "Expose warnings and missing configuration before generated code reaches a pipeline.",
  },
  {
    icon: <DownloadIcon />,
    label: "Portable",
    title: "Terraform bundle export",
    description:
      "Download generated infrastructure code without locking teams into an opaque deployment path.",
  },
];

const capabilitySignals = [
  "Template-first infrastructure",
  "Reusable landing-zone blueprints",
  "Visual resource relationships",
  "Schema-backed configuration",
  "AWS, Azure, and GCP context",
  "Validation before export",
  "Reviewable Terraform output",
  "Forkable architecture models",
  "Cloud-aware orchestration",
  "Connected infrastructure graphs",
  "Structured forms for resources",
  "Portable IaC bundles",
];

const MAESTRO_CAROUSEL_INTERVAL_MS = 10000;

const maestroJourney: MaestroJourneyStep[] = [
  {
    step: "01",
    label: "Goal",
    title: "Tell Maestro what you want to build.",
    description:
      "Start with the infrastructure outcome, such as a landing zone, platform, or service stack.",
    mascotState: "idea",
    detail:
      "Maestro uses your goal to shape the first version of the architecture.",
  },
  {
    step: "02",
    label: "Constraints",
    title: "Add the rules it needs to follow.",
    description:
      "Include cloud preferences, security requirements, networking limits, and team standards.",
    mascotState: "listening",
    detail:
      "Maestro listens for the guardrails that make the design fit your environment.",
  },
  {
    step: "03",
    label: "Draft",
    title: "Review the starter architecture.",
    description:
      "Maestro turns your request into a structured first draft you can inspect and refine.",
    mascotState: "thinking",
    detail:
      "You get an architecture that is ready to edit, validate, and move forward.",
  },
];

const setHeadAttribute = (
  selector: string,
  tagName: "meta" | "link",
  seedAttributes: Record<string, string>,
  attribute: string,
  value: string,
) => {
  let element = document.querySelector<HTMLMetaElement | HTMLLinkElement>(
    selector,
  );

  if (!element) {
    element = document.createElement(tagName) as
      | HTMLMetaElement
      | HTMLLinkElement;
    Object.entries(seedAttributes).forEach(([name, seedValue]) => {
      element?.setAttribute(name, seedValue);
    });
    document.head.appendChild(element);
  }

  element.setAttribute(attribute, value);
};

const SurfaceBox: React.FC<{
  children: React.ReactNode;
  sx?: object;
}> = ({ children, sx }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        borderRadius: 1,
        border: `1px solid ${alpha(
          theme.palette.mode === "dark"
            ? theme.palette.common.white
            : theme.palette.common.black,
          theme.palette.mode === "dark" ? 0.12 : 0.08,
        )}`,
        backgroundColor:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.background.paper, 0.82)
            : alpha(theme.palette.common.white, 0.9),
        boxShadow:
          theme.palette.mode === "dark"
            ? `0 18px 50px ${alpha(theme.palette.common.black, 0.22)}`
            : `0 18px 50px ${alpha(theme.palette.common.black, 0.08)}`,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

const SectionIntro: React.FC<{
  label: string;
  title: string;
  description: string;
  align?: "left" | "center";
}> = ({ label, title, description, align = "left" }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: { xs: "100%", sm: "auto" },
        maxWidth: { xs: "100%", sm: 760 },
        mx: align === "center" ? "auto" : 0,
        textAlign: align,
        minWidth: 0,
      }}
    >
      <Typography
        variant="overline"
        sx={{
          color: theme.palette.secondary.main,
          fontWeight: 800,
          letterSpacing: "0.14em",
          lineHeight: 1.6,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="h2"
        sx={{
          mt: 1,
          color: "text.primary",
          fontSize: { xs: "1.88rem", sm: "2.45rem", md: "3.2rem" },
          fontWeight: 850,
          letterSpacing: 0,
          lineHeight: 1.02,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          mt: 2,
          color: "text.secondary",
          fontSize: { xs: "1rem", md: "1.08rem" },
          lineHeight: 1.8,
        }}
      >
        {description}
      </Typography>
    </Box>
  );
};

const ProductNodeCard: React.FC<ProductNode> = ({
  icon,
  label,
  meta,
  x,
  y,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width: { xs: 128, md: 150 },
        minHeight: 68,
        p: 1.5,
        borderRadius: 1,
        border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
        backgroundColor:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.background.paper, 0.94)
            : alpha(theme.palette.common.white, 0.96),
        boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.1)}`,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.palette.secondary.main,
            backgroundColor: alpha(theme.palette.tertiary.main, 0.26),
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "text.primary",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.68rem",
              color: "text.secondary",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {meta}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

const HeroProductScene: React.FC = () => {
  const theme = useTheme();
  const [sceneRotation, setSceneRotation] = useState({ rx: 0, ry: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const accent = theme.palette.secondary.main;
  const canvasBg =
    theme.palette.mode === "dark"
      ? "rgba(15,23,26,0.94)"
      : "rgba(250, 253, 253, 0.96)";
  const panelBg =
    theme.palette.mode === "dark"
      ? "rgba(26,36,40,0.92)"
      : "rgba(255,255,255,0.94)";
  const codePanelBg =
    theme.palette.mode === "dark"
      ? "rgba(15,20,23,0.97)"
      : "rgba(14, 28, 33, 0.96)";
  const shellBorder =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.common.white, 0.08)
      : alpha(theme.palette.primary.dark, 0.14);
  const shellDivider =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.common.white, 0.07)
      : alpha(theme.palette.primary.dark, 0.1);
  const shellText =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.common.white, 0.55)
      : alpha(theme.palette.primary.dark, 0.58);
  const sceneTitleColor =
    theme.palette.mode === "dark" ? "#EAFBFA" : theme.palette.primary.dark;
  const sceneSubtleText =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.common.white, 0.5)
      : alpha(theme.palette.primary.dark, 0.52);
  const sceneTokenText = theme.palette.mode === "dark" ? "#EAFBFA" : "#D7F4F3";
  const sceneTokenMuted =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.common.white, 0.45)
      : alpha("#D7F4F3", 0.55);
  const sceneCardBorder =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.common.white, 0.09)
      : alpha(theme.palette.primary.dark, 0.12);
  const sceneCardShadow =
    theme.palette.mode === "dark"
      ? "0 14px 28px -12px rgba(0,0,0,0.5)"
      : "0 18px 36px -18px rgba(16, 44, 48, 0.22)";
  const scenePanelShadow =
    theme.palette.mode === "dark"
      ? "0 30px 60px -24px rgba(0,0,0,0.55)"
      : "0 28px 56px -26px rgba(16, 44, 48, 0.18)";
  const sceneCodeShadow =
    theme.palette.mode === "dark"
      ? "0 34px 70px -26px rgba(0,0,0,0.6)"
      : "0 34px 70px -28px rgba(9, 38, 43, 0.26)";
  const sceneItems = [
    {
      label: "VPC",
      sub: "10.0.0.0/16",
      left: 340,
      top: 210,
      depth: 40,
      delay: "120ms",
      duration: "5.2s",
      offset: "0s",
      icon: <NetworkIcon sx={{ color: accent, fontSize: 18 }} />,
    },
    {
      label: "Public subnet",
      sub: "2 zones",
      left: 560,
      top: 148,
      depth: 46,
      delay: "220ms",
      duration: "4.6s",
      offset: "0.4s",
      icon: <DnsIcon sx={{ color: accent, fontSize: 18 }} />,
    },
    {
      label: "RDS",
      sub: "private",
      left: 790,
      top: 246,
      depth: 52,
      delay: "320ms",
      duration: "5.6s",
      offset: "0.8s",
      icon: <StorageIcon sx={{ color: accent, fontSize: 18 }} />,
    },
    {
      label: "Gateway",
      sub: "egress",
      left: 400,
      top: 380,
      depth: 44,
      delay: "420ms",
      duration: "4.9s",
      offset: "1.1s",
      icon: <ConnectIcon sx={{ color: accent, fontSize: 18 }} />,
    },
  ] as const;
  const galleryItems = [
    { label: "AWS VPC Landing Zone", sub: "12 nodes - AWS" },
    { label: "Kubernetes Platform Base", sub: "18 nodes - AWS" },
  ] as const;
  const codeTokens = [
    [
      { text: "module ", color: accent },
      { text: '"network" ', color: "#FCD34D" },
      { text: "{", color: sceneTokenMuted },
    ],
    [
      { text: "  source", color: sceneTokenText },
      { text: " = ", color: sceneTokenMuted },
      { text: '"./modules/vpc"', color: "#FCD34D" },
    ],
    [
      { text: "  cidr", color: sceneTokenText },
      { text: "   = ", color: sceneTokenMuted },
      { text: '"10.0.0.0/16"', color: "#FCD34D" },
    ],
    [{ text: "}", color: sceneTokenMuted }],
    [{ text: "", color: sceneTokenMuted }],
    [
      { text: "module ", color: accent },
      { text: '"database" ', color: "#FCD34D" },
      { text: "{", color: sceneTokenMuted },
    ],
    [
      { text: "  source", color: sceneTokenText },
      { text: "    = ", color: sceneTokenMuted },
      { text: '"./modules/rds"', color: "#FCD34D" },
    ],
    [
      { text: "  subnet_ids", color: sceneTokenText },
      { text: " = ", color: sceneTokenMuted },
      { text: "module.network.private_subnets", color: sceneTokenText },
    ],
    [{ text: "}", color: sceneTokenMuted }],
  ] as const;

  const handleSceneMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    setSceneRotation({
      ry: (px - 0.5) * 16,
      rx: (0.5 - py) * 11,
    });
    setIsHovering(true);
  };

  const handleSceneLeave = () => {
    setSceneRotation({ rx: 0, ry: 0 });
    setIsHovering(false);
  };

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "absolute",
        inset: 0,
        display: { xs: "none", sm: "block" },
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          maskImage:
            "linear-gradient(90deg, transparent 0%, black 18%, black 100%)",
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(90deg, ${theme.palette.background.default} 0%, ${alpha(
                  theme.palette.background.default,
                  0.92,
                )} 32%, ${alpha(theme.palette.background.default, 0.18)} 72%, ${alpha(theme.palette.background.default, 0.04)} 100%)`
              : `linear-gradient(90deg, ${theme.palette.background.default} 0%, ${alpha(
                  theme.palette.background.default,
                  0.94,
                )} 34%, ${alpha(theme.palette.background.default, 0.18)} 72%, ${alpha(theme.palette.background.default, 0.04)} 100%)`,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: { sm: 860, md: 980 },
          height: { sm: 560, md: 640 },
          right: { sm: -300, md: -180, lg: -40, xl: 40 },
          top: { sm: 72, md: 36 },
          opacity: { sm: 0.52, md: 1 },
          pointerEvents: "auto",
        }}
        onMouseMove={handleSceneMove}
        onMouseLeave={handleSceneLeave}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            perspective: 1800,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              transformStyle: "preserve-3d",
              transform: `rotateX(${sceneRotation.rx}deg) rotateY(${sceneRotation.ry}deg)`,
              transition: isHovering
                ? "transform 150ms ease-out"
                : "transform 600ms ease-out",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: 190,
                top: 50,
                width: 760,
                height: 460,
                transform: "translateZ(0px)",
                borderRadius: 2,
                overflow: "hidden",
                background: canvasBg,
                border: `1px solid ${shellBorder}`,
                boxShadow: "0 40px 80px -30px rgba(0,0,0,0.55)",
                animation: "heroFadeUp 700ms cubic-bezier(0.16,1,0.3,1) both",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.25}
                sx={{
                  px: 2.25,
                  py: 1.6,
                  borderBottom: `1px solid ${shellDivider}`,
                }}
              >
                {["#EF4444", "#F59E0B", "#22C55E"].map((color) => (
                  <Box
                    key={color}
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: color,
                    }}
                  />
                ))}
                <Typography
                  sx={{
                    ml: 1,
                    color: shellText,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 0.2,
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  }}
                >
                  Orchestrator canvas
                </Typography>
              </Stack>

              <Box
                sx={{
                  position: "absolute",
                  inset: "42px 0 0 0",
                  backgroundImage: `radial-gradient(circle, ${theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.055) : alpha(theme.palette.primary.dark, 0.08)} 1px, transparent 1px)`,
                  backgroundSize: "26px 26px",
                }}
              />
            </Box>

            <Box
              component="svg"
              viewBox="0 0 760 460"
              sx={{
                position: "absolute",
                left: 190,
                top: 50,
                width: 760,
                height: 460,
                transform: "translateZ(26px)",
                overflow: "visible",
              }}
            >
              {[
                ["VPC", "Public subnet"],
                ["VPC", "RDS"],
                ["Public subnet", "Gateway"],
                ["Gateway", "RDS"],
              ].map(([from, to], index) => {
                const a = sceneItems.find((item) => item.label === from)!;
                const b = sceneItems.find((item) => item.label === to)!;
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={a.left - 190}
                    y1={a.top - 50}
                    x2={b.left - 190}
                    y2={b.top - 50}
                    stroke={accent}
                    strokeWidth="1.6"
                    strokeDasharray="6 8"
                    style={{
                      animation: `heroDash 4.5s linear infinite, heroFadeUp 600ms ease-out ${500 + index * 90}ms both`,
                    }}
                  />
                );
              })}
            </Box>

            {sceneItems.map((item) => (
              <Box
                key={item.label}
                sx={{
                  position: "absolute",
                  left: item.left,
                  top: item.top,
                  transform: `translate3d(-50%, -50%, ${item.depth}px)`,
                }}
              >
                <Box
                  sx={{
                    animation: `heroFloat ${item.duration} ease-in-out ${item.offset} infinite`,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{
                      px: 2.25,
                      py: 1.65,
                      borderRadius: 1.5,
                      background: panelBg,
                      border: `1px solid ${sceneCardBorder}`,
                      boxShadow: sceneCardShadow,
                      whiteSpace: "nowrap",
                      animation: `heroFadeUp 600ms cubic-bezier(0.16,1,0.3,1) ${item.delay} both`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1,
                        backgroundColor: alpha(accent, 0.14),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: "0 0 auto",
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: sceneTitleColor,
                          lineHeight: 1.2,
                        }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.25,
                          fontSize: 11,
                          color: sceneSubtleText,
                          fontFamily:
                            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        }}
                      >
                        {item.sub}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            ))}

            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 78,
                width: 240,
                transform: "translateZ(64px)",
              }}
            >
              <Box
                sx={{
                  p: 2.25,
                  borderRadius: 2,
                  background:
                    theme.palette.mode === "dark"
                      ? alpha("#141c1f", 0.95)
                      : "rgba(255,255,255,0.95)",
                  border: `1px solid ${shellBorder}`,
                  boxShadow: scenePanelShadow,
                  animation:
                    "heroFadeUp 700ms cubic-bezier(0.16,1,0.3,1) 60ms both",
                }}
              >
                <Typography
                  sx={{
                    mb: 1.75,
                    fontSize: 13,
                    fontWeight: 800,
                    color: sceneTitleColor,
                  }}
                >
                  Template gallery
                </Typography>
                <Stack spacing={1.25}>
                  {galleryItems.map((item) => (
                    <Stack
                      key={item.label}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{
                        p: 1.5,
                        borderRadius: 1.25,
                        border: `1px solid ${theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.07) : alpha(theme.palette.primary.dark, 0.08)}`,
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? alpha(theme.palette.common.white, 0.02)
                            : alpha(theme.palette.tertiary.main, 0.14),
                      }}
                    >
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: 1,
                          backgroundColor: alpha(accent, 0.14),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flex: "0 0 auto",
                        }}
                      >
                        <TemplateIcon sx={{ color: accent, fontSize: 15 }} />
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: sceneTitleColor,
                            lineHeight: 1.2,
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.35,
                            fontSize: 10,
                            color: sceneSubtleText,
                            fontFamily:
                              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                          }}
                        >
                          {item.sub}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Box>

            <Box
              sx={{
                position: "absolute",
                left: 540,
                top: 322,
                width: 440,
                transform: "translateZ(78px)",
              }}
            >
              <Box
                sx={{
                  overflow: "hidden",
                  borderRadius: 2,
                  background: codePanelBg,
                  border: `1px solid ${sceneCardBorder}`,
                  boxShadow: sceneCodeShadow,
                  animation:
                    "heroFadeUp 700ms cubic-bezier(0.16,1,0.3,1) 420ms both",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    px: 2.25,
                    py: 1.6,
                    borderBottom: `1px solid ${shellDivider}`,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.15}
                    alignItems="center"
                    sx={{ minWidth: 0 }}
                  >
                    <CodeIcon sx={{ color: accent, fontSize: 14 }} />
                    <Typography
                      sx={{
                        fontSize: 12.5,
                        fontWeight: 800,
                        color: sceneTokenText,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Generated Terraform
                    </Typography>
                  </Stack>
                  <Typography
                    sx={{
                      px: 1.25,
                      py: 0.35,
                      borderRadius: 999,
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: "#4ADE80",
                      backgroundColor: alpha("#4ADE80", 0.12),
                      boxShadow: "0 0 0 0 rgba(45,212,191,0.45)",
                      animation: "heroGlow 2400ms ease-in-out infinite",
                    }}
                  >
                    Valid
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    px: 2.25,
                    pt: 2,
                    pb: 2.5,
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    fontSize: 12,
                    lineHeight: 1.75,
                  }}
                >
                  {codeTokens.map((line, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        minHeight: "1.2em",
                        animation: `heroLineIn 350ms ease-out ${620 + index * 55}ms both`,
                      }}
                    >
                      {line.map((token, tokenIndex) => (
                        <Box
                          key={`${index}-${tokenIndex}`}
                          component="span"
                          sx={{ color: token.color, whiteSpace: "pre" }}
                        >
                          {token.text}
                        </Box>
                      ))}
                    </Box>
                  ))}
                  <Box
                    component="span"
                    sx={{
                      display: "inline-block",
                      width: 7,
                      height: 13,
                      backgroundColor: accent,
                      verticalAlign: "-2px",
                      animation: "heroBlink 1s step-end infinite",
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            "@keyframes heroFadeUp": {
              from: {
                opacity: 0,
                transform: "translateY(16px) scale(0.95)",
              },
              to: {
                opacity: 1,
                transform: "translateY(0) scale(1)",
              },
            },
            "@keyframes heroFloat": {
              "0%, 100%": { transform: "translateY(0px)" },
              "50%": { transform: "translateY(-7px)" },
            },
            "@keyframes heroDash": {
              to: { strokeDashoffset: -140 },
            },
            "@keyframes heroGlow": {
              "0%, 100%": {
                boxShadow: "0 0 0 0 rgba(45,212,191,0.45)",
              },
              "50%": {
                boxShadow: "0 0 0 5px rgba(45,212,191,0)",
              },
            },
            "@keyframes heroBlink": {
              "0%, 49%": { opacity: 1 },
              "50%, 100%": { opacity: 0 },
            },
            "@keyframes heroLineIn": {
              from: { opacity: 0, transform: "translateX(-8px)" },
              to: { opacity: 1, transform: "translateX(0)" },
            },
          }}
        />
      </Box>
    </Box>
  );
};

const MobileProductPreview: React.FC = () => {
  const theme = useTheme();

  return (
    <SurfaceBox
      sx={{
        display: { xs: "block", sm: "none" },
        mt: 4,
        width: "100%",
        maxWidth: 358,
        overflow: "hidden",
        boxShadow: `0 12px 36px ${alpha(theme.palette.common.black, 0.18)}`,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          px: 1.6,
          py: 1.2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TemplateIcon
            sx={{ color: theme.palette.secondary.main, fontSize: 18 }}
          />
          <Typography sx={{ fontSize: "0.78rem", fontWeight: 850 }}>
            Template to Terraform
          </Typography>
        </Stack>
        <Chip
          label="Valid"
          size="small"
          sx={{
            height: 22,
            borderRadius: 1,
            fontSize: "0.66rem",
            fontWeight: 800,
            color: "#15803d",
            backgroundColor: alpha("#22c55e", 0.12),
          }}
        />
      </Stack>
      <Box sx={{ p: 1.6 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 1,
            mb: 1.5,
          }}
        >
          {["Template", "Canvas", "Code"].map((label, index) => (
            <Box
              key={label}
              sx={{
                p: 1,
                minWidth: 0,
                minHeight: 58,
                overflow: "hidden",
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.24)}`,
                backgroundColor: alpha(
                  theme.palette.tertiary.main,
                  index === 1 ? 0.3 : 0.2,
                ),
              }}
            >
              <Typography
                sx={{
                  color: "text.primary",
                  fontSize: "0.72rem",
                  fontWeight: 850,
                  lineHeight: 1.2,
                }}
              >
                {label}
              </Typography>
              <Typography
                sx={{
                  mt: 0.4,
                  color: "text.secondary",
                  fontSize: "0.64rem",
                  lineHeight: 1.25,
                }}
              >
                {index === 0 ? "AWS VPC" : index === 1 ? "5 nodes" : "tf plan"}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 1.25,
            borderRadius: 1,
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.common.black, 0.22)
                : alpha("#0f172a", 0.04),
            color:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.common.white, 0.84)
                : "#334155",
            whiteSpace: "pre-wrap",
            fontSize: "0.64rem",
            lineHeight: 1.55,
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        >
          {terraformLines.slice(0, 4).join("\n")}
        </Box>
      </Box>
    </SurfaceBox>
  );
};

const ProductLoopMockup: React.FC<{
  visual: ProductLoopItem["visual"];
  reverseLayout?: boolean;
}> = ({ visual, reverseLayout = false }) => {
  const theme = useTheme();

  const renderMainContent = () => {
    if (visual === "templates") {
      return (
        <Stack spacing={1.15} sx={{ p: { xs: 1.6, sm: 2 } }}>
          {templateRows.map((template, index) => (
            <Box
              key={template.name}
              sx={{
                p: 1.25,
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.58)}`,
                backgroundColor: alpha(
                  theme.palette.tertiary.main,
                  index === 0 ? 0.28 : 0.18,
                ),
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                spacing={1.5}
                alignItems="flex-start"
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      color: "text.primary",
                      fontSize: "0.82rem",
                      fontWeight: 800,
                    }}
                  >
                    {template.name}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.45,
                      color: "text.secondary",
                      fontSize: "0.7rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {template.detail}
                  </Typography>
                </Box>
                <Chip
                  label={template.cloud}
                  size="small"
                  sx={{
                    height: 24,
                    borderRadius: 1,
                    fontWeight: 800,
                    color: theme.palette.secondary.main,
                    backgroundColor: alpha(theme.palette.tertiary.main, 0.24),
                    border: `1px solid ${alpha(theme.palette.tertiary.main, 0.46)}`,
                  }}
                />
              </Stack>
            </Box>
          ))}
          <Box
            sx={{
              p: 1.2,
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.tertiary.main, 0.18)
                  : alpha(theme.palette.tertiary.main, 0.14),
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: "wrap", gap: 1, justifyContent: "center" }}
            >
              {["3 starter patterns", "Multi-cloud cues", "Ready to fork"].map(
                (item) => (
                  <Chip
                    key={item}
                    label={item}
                    size="small"
                    sx={{
                      height: 24,
                      borderRadius: 1,
                      fontWeight: 800,
                      color: "text.primary",
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.common.white, 0.04)
                          : alpha(theme.palette.common.white, 0.66),
                      border: `1px solid ${alpha(theme.palette.divider, 0.48)}`,
                    }}
                  />
                ),
              )}
            </Stack>
          </Box>
        </Stack>
      );
    }

    if (visual === "canvas") {
      return (
        <Box
          sx={{
            position: "relative",
            height: "100%",
            minHeight: 290,
            backgroundImage: `linear-gradient(${alpha(theme.palette.divider, 0.26)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(theme.palette.divider, 0.26)} 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              left: "20%",
              top: "26%",
              width: "48%",
              height: "34%",
              borderTop: `2px solid ${alpha(theme.palette.secondary.main, 0.34)}`,
              borderRight: `2px solid ${alpha(theme.palette.secondary.main, 0.24)}`,
              transform: "skewY(-10deg)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: "16%",
              top: "52%",
              width: "56%",
              borderTop: `2px solid ${alpha("#64748b", 0.34)}`,
              transform: "rotate(14deg)",
            }}
          />
          {architectureNodes.map((node) => (
            <ProductNodeCard key={node.label} {...node} />
          ))}
        </Box>
      );
    }

    if (visual === "validation") {
      return (
        <Stack spacing={1.1} sx={{ p: { xs: 1.6, sm: 2 } }}>
          <Stack spacing={0.7}>
            {[
              ["CIDR block", "10.0.0.0/16", "Complete"],
              ["Availability zones", "2 selected", "Complete"],
              ["NAT strategy", "Missing", "Required"],
            ].map(([label, value, state]) => (
              <Box
                key={label}
                sx={{
                  p: 1.15,
                  borderRadius: 1,
                  border: `1px solid ${alpha(theme.palette.divider, 0.56)}`,
                  backgroundColor:
                    state === "Required"
                      ? alpha("#f59e0b", 0.08)
                      : alpha(theme.palette.tertiary.main, 0.18),
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={1}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: "text.primary",
                        fontSize: "0.8rem",
                        fontWeight: 800,
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.3,
                        color: "text.secondary",
                        fontSize: "0.7rem",
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                  <Chip
                    label={state}
                    size="small"
                    sx={{
                      height: 23,
                      borderRadius: 1,
                      fontWeight: 800,
                      color:
                        state === "Required"
                          ? "#b45309"
                          : theme.palette.secondary.main,
                      backgroundColor:
                        state === "Required"
                          ? alpha("#f59e0b", 0.14)
                          : alpha(theme.palette.tertiary.main, 0.24),
                    }}
                  />
                </Stack>
              </Box>
            ))}
          </Stack>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 1,
              border: `1px dashed ${alpha(theme.palette.secondary.main, 0.34)}`,
              backgroundColor: alpha(theme.palette.tertiary.main, 0.18),
            }}
          >
            <Typography
              sx={{
                color: "text.primary",
                fontSize: "0.78rem",
                fontWeight: 800,
              }}
            >
              Validation summary
            </Typography>
            <Typography
              sx={{
                mt: 0.45,
                color: "text.secondary",
                fontSize: "0.7rem",
                lineHeight: 1.55,
              }}
            >
              Two inputs are valid. One required network decision still needs
              confirmation before code generation.
            </Typography>
            <Box
              sx={{
                mt: 1,
                width: "100%",
                height: 6,
                borderRadius: 999,
                backgroundColor: alpha(theme.palette.divider, 0.48),
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: "72%",
                  height: "100%",
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${alpha(
                    theme.palette.secondary.main,
                    0.95,
                  )}, ${alpha("#f59e0b", 0.82)})`,
                }}
              />
            </Box>
          </Box>
        </Stack>
      );
    }

    return (
      <Box
        sx={{
          height: "100%",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "0.95fr 1.05fr" },
        }}
      >
        <Box
          component="pre"
          sx={{
            m: 0,
            p: { xs: 1.6, sm: 2 },
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.common.black, 0.18)
                : alpha("#0f172a", 0.035),
            color:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.common.white, 0.84)
                : "#334155",
            whiteSpace: "pre-wrap",
            fontSize: "0.72rem",
            lineHeight: 1.7,
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        >
          {terraformLines.join("\n")}
        </Box>
        <Stack spacing={1} sx={{ p: { xs: 1.6, sm: 2 } }}>
          {[
            ["Bundle", "network.tf, outputs.tf, variables.tf"],
            ["Status", "Validated and packaged for review"],
            ["Next step", "Download and commit to your workflow"],
          ].map(([label, value]) => (
            <Box
              key={label}
              sx={{
                p: 1.1,
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.56)}`,
                backgroundColor: alpha(theme.palette.tertiary.main, 0.18),
              }}
            >
              <Typography
                sx={{
                  color: theme.palette.secondary.main,
                  fontSize: "0.68rem",
                  fontWeight: 850,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {label}
              </Typography>
              <Typography
                sx={{
                  mt: 0.45,
                  color: "text.primary",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  lineHeight: 1.5,
                }}
              >
                {value}
              </Typography>
            </Box>
          ))}
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {["ZIP Bundle", "Module Outputs", "Review Ready"].map((item) => (
              <Chip
                key={item}
                label={item}
                size="small"
                sx={{
                  height: 24,
                  borderRadius: 1,
                  fontWeight: 800,
                  color: theme.palette.secondary.main,
                  backgroundColor: alpha(theme.palette.tertiary.main, 0.22),
                  border: `1px solid ${alpha(theme.palette.tertiary.main, 0.42)}`,
                }}
              />
            ))}
          </Stack>
        </Stack>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: { xs: 520, md: 540 },
        mx: "auto",
        pt: { xs: 2.2, md: 2.6 },
        pb: { xs: 1, md: 1.4 },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: reverseLayout
            ? { xs: "0 14px 22px 42px", md: "10px 18px 30px 74px" }
            : { xs: "0 42px 22px 14px", md: "10px 74px 30px 18px" },
          borderRadius: 1,
          background:
            visual === "canvas"
              ? `radial-gradient(circle at ${reverseLayout ? "30%" : "70%"} 30%, ${alpha(
                  theme.palette.secondary.main,
                  0.2,
                )} 0%, transparent 56%)`
              : `radial-gradient(circle at ${reverseLayout ? "35%" : "65%"} 35%, ${alpha(
                  theme.palette.tertiary.main,
                  0.14,
                )} 0%, transparent 58%)`,
          filter: "blur(16px)",
          opacity: theme.palette.mode === "dark" ? 0.7 : 0.85,
        }}
      />
      <SurfaceBox
        sx={{
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
          boxShadow:
            theme.palette.mode === "dark"
              ? `0 18px 48px ${alpha(theme.palette.common.black, 0.28)}`
              : `0 18px 48px ${alpha(theme.palette.common.black, 0.09)}`,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            px: 2,
            py: 1.25,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.58)}`,
          }}
        >
          <Box sx={{ display: "flex", gap: 0.8 }}>
            {["#ef4444", "#f59e0b", "#22c55e"].map((color) => (
              <Box
                key={color}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: color,
                }}
              />
            ))}
          </Box>
          <Typography
            sx={{
              ml: 0.8,
              color: "text.secondary",
              fontSize: "0.76rem",
              fontWeight: 800,
            }}
          >
            {visual === "templates"
              ? "Template gallery"
              : visual === "canvas"
                ? "Editable architecture"
                : visual === "validation"
                  ? "Configuration review"
                  : "Terraform bundle"}
          </Typography>
        </Stack>
        <Box
          sx={{
            minHeight: {
              xs:
                visual === "canvas"
                  ? 276
                  : visual === "terraform"
                    ? 250
                    : "auto",
              md:
                visual === "canvas"
                  ? 316
                  : visual === "terraform"
                    ? 292
                    : "auto",
            },
          }}
        >
          {renderMainContent()}
        </Box>
      </SurfaceBox>
    </Box>
  );
};

const MaestroSection: React.FC = () => {
  const theme = useTheme();
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = maestroJourney[activeStepIndex] ?? maestroJourney[0];

  useEffect(() => {
    if (prefersReducedMotion) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveStepIndex((currentIndex) => {
        return (currentIndex + 1) % maestroJourney.length;
      });
    }, MAESTRO_CAROUSEL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [prefersReducedMotion]);

  return (
    <Box
      component="section"
      aria-labelledby="maestro-heading"
      sx={{
        py: { xs: 9, md: 13 },
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.68)}`,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.68)}`,
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(180deg, ${alpha(theme.palette.secondary.main, 0.07)} 0%, transparent 100%)`
            : `linear-gradient(180deg, ${alpha(theme.palette.tertiary.main, 0.24)} 0%, ${alpha(theme.palette.common.white, 0.18)} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 7 }} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionIntro
              label="Meet Maestro"
              title="Maestro turns an infrastructure idea into Architecture."
              description="Share what you want to build, add the constraints that matter, and Maestro hands back a structured draft you can review and refine."
            />
            <SurfaceBox
              sx={{
                mt: 3,
                p: { xs: 1.35, sm: 1.6 },
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.background.paper, 0.68)
                    : alpha(theme.palette.common.white, 0.88),
              }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ flexWrap: "wrap", gap: 1, justifyContent: "center" }}
                >
                  {maestroJourney.map((step, index) => {
                    const isActive = index === activeStepIndex;

                    return (
                      <Box
                        key={step.step}
                        component="button"
                        type="button"
                        onClick={() => setActiveStepIndex(index)}
                        aria-pressed={isActive}
                        sx={{
                          px: 1.15,
                          py: 1,
                          borderRadius: 1.1,
                          textTransform: "uppercase",
                          border: `1px solid ${alpha(
                            isActive
                              ? theme.palette.secondary.main
                              : theme.palette.divider,
                            isActive ? 0.46 : 0.72,
                          )}`,
                          backgroundColor: isActive
                            ? alpha(
                                theme.palette.secondary.main,
                                theme.palette.mode === "dark" ? 0.16 : 0.08,
                              )
                            : "transparent",
                          color: isActive
                            ? theme.palette.secondary.main
                            : theme.palette.text.secondary,
                          cursor: "pointer",
                          textAlign: "left",
                          transition:
                            "border-color 180ms ease, background-color 180ms ease, color 180ms ease",
                          appearance: "none",
                          "&:focus-visible": {
                            outline: `2px solid ${alpha(theme.palette.secondary.main, 0.65)}`,
                            outlineOffset: 2,
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            mt: 0.35,
                            fontSize: "0.92rem",
                            fontWeight: 800,
                            lineHeight: 1.2,
                          }}
                        >
                          {step.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>

                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      color: theme.palette.secondary.main,
                      fontWeight: 850,
                      letterSpacing: "0.12em",
                    }}
                  >
                    Step {activeStep.step}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.5,
                      color: "text.primary",
                      fontWeight: 850,
                      fontSize: { xs: "1.2rem", md: "1.35rem" },
                      lineHeight: 1.15,
                    }}
                  >
                    {activeStep.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.9,
                      color: "text.secondary",
                      lineHeight: 1.7,
                      maxWidth: 420,
                    }}
                  >
                    {activeStep.description}
                  </Typography>
                </Box>

                <Box>
                  <Box
                    sx={{
                      height: 6,
                      borderRadius: 999,
                      overflow: "hidden",
                      backgroundColor: alpha(
                        theme.palette.divider,
                        theme.palette.mode === "dark" ? 0.55 : 0.7,
                      ),
                    }}
                  >
                    <Box
                      sx={{
                        width: `${((activeStepIndex + 1) / maestroJourney.length) * 100}%`,
                        height: "100%",
                        borderRadius: 999,
                        backgroundColor: theme.palette.secondary.main,
                        transition: "width 320ms ease",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.85,
                      display: "block",
                      color: "text.secondary",
                      fontWeight: 700,
                    }}
                  >
                    {prefersReducedMotion
                      ? "Select a step to preview Maestro."
                      : "The carousel moves to the next step automatically."}
                  </Typography>
                </Box>
              </Stack>
            </SurfaceBox>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SurfaceBox
              sx={{
                border: "none",
                overflow: "hidden",
                position: "relative",
                minHeight: { xs: 420, md: 520 },
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.background.paper, 0.74)
                    : alpha(theme.palette.common.white, 0.95),
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: "10% -10% auto auto",
                  width: { xs: 220, md: 300 },
                  height: { xs: 220, md: 300 },
                  borderRadius: "50%",
                  background:
                    theme.palette.mode === "dark"
                      ? `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.28)} 0%, transparent 72%)`
                      : `radial-gradient(circle, ${alpha(theme.palette.tertiary.main, 0.32)} 0%, transparent 72%)`,
                  pointerEvents: "none",
                },
              }}
            >
              <Stack
                alignItems="center"
                justifyContent="center"
                spacing={2.2}
                sx={{
                  minHeight: "100%",
                  textAlign: "center",
                  p: { xs: 2.6, sm: 3.2, md: 4 },
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Box
                  sx={{
                    width: { xs: 260, sm: 320, md: 380 },
                    height: { xs: 260, sm: 320, md: 380 },
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      theme.palette.mode === "dark"
                        ? `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.24)} 0%, ${alpha(theme.palette.background.paper, 0)} 68%)`
                        : `radial-gradient(circle, ${alpha(theme.palette.tertiary.main, 0.28)} 0%, ${alpha(theme.palette.common.white, 0)} 70%)`,
                  }}
                >
                  <MaestroRobot
                    state={activeStep.mascotState}
                    size={260}
                    decorative
                    robotColor={
                      theme.palette.mode === "dark"
                        ? theme.palette.secondary.light
                        : theme.palette.primary.dark
                    }
                  />
                </Box>

                <Box>
                  <Typography
                    id="maestro-heading"
                    sx={{
                      color: "text.primary",
                      fontWeight: 850,
                      fontSize: { xs: "1.2rem", md: "1.4rem" },
                      lineHeight: 1.1,
                    }}
                  >
                    {activeStep.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      color: "text.secondary",
                      lineHeight: 1.7,
                    }}
                  >
                    {activeStep.detail}
                  </Typography>
                </Box>
              </Stack>
            </SurfaceBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const ProductLoopSection: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      component="section"
      aria-labelledby="product-loop-heading"
      sx={{
        py: { xs: 9, md: 13 },
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(180deg, ${alpha(theme.palette.common.white, 0.02)} 0%, transparent 100%)`
            : `linear-gradient(180deg, ${alpha(theme.palette.tertiary.main, 0.22)} 0%, transparent 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: { xs: 4.5, md: 6.5 } }}>
          <SectionIntro
            label="Product loop"
            title="A landing zone workflow that reads like the product itself."
            description="The loop now follows one clear motion: browse a blueprint, fork it into the architecture canvas, tighten configuration with guardrails, and export Terraform when the model is ready."
          />
          <Stack
            direction="row"
            spacing={1}
            sx={{ mt: 3, flexWrap: "wrap", gap: 1 }}
          >
            {["Templates", "Canvas", "Validation", "Terraform"].map((item) => (
              <Chip
                key={item}
                label={item}
                size="small"
                sx={{
                  borderRadius: 1,
                  fontWeight: 700,
                  color: theme.palette.secondary.main,
                  backgroundColor: alpha(theme.palette.tertiary.main, 0.28),
                  border: `1px solid ${alpha(theme.palette.tertiary.main, 0.46)}`,
                }}
              />
            ))}
          </Stack>
        </Box>

        <Stack spacing={{ xs: 3, md: 3.5 }}>
          {productLoop.map((item, index) => {
            const reverseLayout = index % 2 === 1;

            return (
              <SurfaceBox
                key={item.step}
                sx={{
                  p: { xs: 2, sm: 2.5, md: 2.75 },
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.background.paper, 0.72)
                      : alpha(theme.palette.common.white, 0.92),
                }}
              >
                <Grid
                  container
                  spacing={{ xs: 2.5, md: 4.5 }}
                  alignItems="center"
                >
                  <Grid
                    size={{ xs: 12, md: 6 }}
                    sx={{ order: { xs: 1, md: reverseLayout ? 2 : 1 } }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: 500,
                        mx: reverseLayout ? { md: "auto" } : 0,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.2}
                        alignItems="center"
                        sx={{ mb: 1.8 }}
                      >
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: theme.palette.secondary.main,
                            backgroundColor: alpha(
                              theme.palette.tertiary.main,
                              0.28,
                            ),
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Typography
                          sx={{
                            color: theme.palette.secondary.main,
                            fontSize: "0.76rem",
                            fontWeight: 850,
                            letterSpacing: "0.12em",
                          }}
                        >
                          STEP {item.step}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="h3"
                        sx={{
                          color: "text.primary",
                          fontSize: {
                            xs: "1.5rem",
                            sm: "1.85rem",
                            md: "2.08rem",
                          },
                          fontWeight: 850,
                          lineHeight: 1.1,
                          letterSpacing: 0,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          mt: 1.35,
                          color: "text.secondary",
                          fontSize: { xs: "0.98rem", md: "1.02rem" },
                          lineHeight: 1.72,
                          maxWidth: 470,
                        }}
                      >
                        {item.description}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mt: 2.5, flexWrap: "wrap", gap: 1 }}
                      >
                        {item.highlights.map((highlight) => (
                          <Chip
                            key={highlight}
                            label={highlight}
                            size="small"
                            sx={{
                              height: 28,
                              borderRadius: 1,
                              fontWeight: 800,
                              color: "text.primary",
                              backgroundColor:
                                theme.palette.mode === "dark"
                                  ? alpha(theme.palette.tertiary.main, 0.3)
                                  : alpha(theme.palette.tertiary.main, 0.24),
                              border: `1px solid ${alpha(
                                theme.palette.divider,
                                0.58,
                              )}`,
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  </Grid>
                  <Grid
                    size={{ xs: 12, md: 6 }}
                    sx={{ order: { xs: 2, md: reverseLayout ? 1 : 2 } }}
                  >
                    <ProductLoopMockup
                      visual={item.visual}
                      reverseLayout={reverseLayout}
                    />
                  </Grid>
                </Grid>
              </SurfaceBox>
            );
          })}
        </Stack>
      </Container>
    </Box>
  );
};

const CapabilitySignalRail: React.FC<{
  items: string[];
  reverse?: boolean;
}> = ({ items, reverse = false }) => {
  const theme = useTheme();
  const loopItems = [...items, ...items, ...items];

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        py: 0.6,
        "&::before, &::after": {
          content: '""',
          position: "absolute",
          top: 0,
          bottom: 0,
          width: { xs: 34, md: 72 },
          zIndex: 2,
          pointerEvents: "none",
        },
        "&::before": {
          left: 0,
          background: `linear-gradient(90deg, ${theme.palette.background.default} 0%, ${alpha(
            theme.palette.background.default,
            0,
          )} 100%)`,
        },
        "&::after": {
          right: 0,
          background: `linear-gradient(270deg, ${theme.palette.background.default} 0%, ${alpha(
            theme.palette.background.default,
            0,
          )} 100%)`,
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          width: "max-content",
          willChange: "transform",
          animation: `${reverse ? "capabilityMarqueeReverse" : "capabilityMarquee"} ${reverse ? 52 : 48}s linear infinite`,
          "@keyframes capabilityMarquee": {
            from: { transform: "translateX(-33.333%)" },
            to: { transform: "translateX(-66.666%)" },
          },
          "@keyframes capabilityMarqueeReverse": {
            from: { transform: "translateX(-66.666%)" },
            to: { transform: "translateX(-33.333%)" },
          },
        }}
      >
        {loopItems.map((item, index) => (
          <Chip
            key={`${item}-${index}`}
            label={item}
            size="small"
            sx={{
              flexShrink: 0,
              height: 30,
              borderRadius: 1,
              fontWeight: 800,
              color: "text.primary",
              backgroundColor:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.tertiary.main, 0.32)
                  : alpha(theme.palette.tertiary.main, 0.22),
              border: `1px solid ${alpha(theme.palette.divider, 0.58)}`,
              whiteSpace: "nowrap",
              "& .MuiChip-label": {
                px: 1.3,
              },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

const ArtifactSection: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      component="section"
      aria-labelledby="artifact-heading"
      sx={{
        py: { xs: 9, md: 13 },
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.68)}`,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.68)}`,
        backgroundColor:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.common.white, 0.025)
            : alpha(theme.palette.common.white, 0.38),
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }}>
            <SectionIntro
              label="What changes"
              title="The architecture is no longer separate from the code."
              description="Orchestrator makes the useful artifact visible at each step: a template, a canvas model, validation state, and Terraform output."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <SurfaceBox sx={{ overflow: "hidden" }}>
              <Box
                sx={{
                  px: { xs: 2, sm: 2.5 },
                  py: 1.5,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <TerminalIcon
                    sx={{ color: theme.palette.secondary.main, fontSize: 20 }}
                  />
                  <Typography sx={{ fontWeight: 800, color: "text.primary" }}>
                    Terraform preview
                  </Typography>
                </Stack>
                <Chip
                  label="Generated"
                  size="small"
                  sx={{
                    borderRadius: 1,
                    fontWeight: 700,
                    color: theme.palette.secondary.main,
                    backgroundColor: alpha(theme.palette.tertiary.main, 0.22),
                    border: `1px solid ${alpha(theme.palette.tertiary.main, 0.42)}`,
                  }}
                />
              </Box>
              <Grid container>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: { xs: 2, sm: 2.5 },
                      minHeight: "100%",
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.common.black, 0.22)
                          : alpha("#0f172a", 0.035),
                      color:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.common.white, 0.86)
                          : "#334155",
                      whiteSpace: "pre-wrap",
                      fontSize: "0.8rem",
                      lineHeight: 1.75,
                      fontFamily:
                        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    }}
                  >
                    {terraformLines.join("\n")}
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack sx={{ p: { xs: 2, sm: 2.5 } }} spacing={2.4}>
                    {artifactItems.map((item) => (
                      <Box key={item.label}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mb: 0.8 }}
                        >
                          <Typography
                            sx={{
                              width: 72,
                              fontSize: "0.72rem",
                              fontWeight: 850,
                              color: theme.palette.secondary.main,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            {item.label}
                          </Typography>
                          <Box
                            sx={{
                              height: 1,
                              flex: 1,
                              backgroundColor: alpha(
                                theme.palette.divider,
                                0.72,
                              ),
                            }}
                          />
                        </Stack>
                        <Typography
                          sx={{
                            color: "text.primary",
                            fontWeight: 800,
                            mb: 0.5,
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", lineHeight: 1.65 }}
                        >
                          {item.description}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </SurfaceBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const TemplateShowcaseSection: React.FC<{
  onBrowseTemplates: () => void;
}> = ({ onBrowseTemplates }) => {
  const theme = useTheme();
  const primaryTemplate = templateRows[0];
  const secondaryTemplates = templateRows.slice(1);

  return (
    <Box
      component="section"
      aria-labelledby="templates-heading"
      sx={{
        py: { xs: 9, md: 13 },
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(180deg, ${alpha(theme.palette.common.white, 0.018)} 0%, transparent 100%)`
            : `linear-gradient(180deg, ${alpha(theme.palette.tertiary.main, 0.18)} 0%, transparent 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={3}
          sx={{ mb: { xs: 4, md: 6 } }}
        >
          <SectionIntro
            label="Templates"
            title="A catalog that feels inspectable, not decorative."
            description="The page now treats templates as the product's front door. Each pattern hints at cloud, scope, and readiness before users open the full gallery."
          />
          <Button
            variant="contained"
            onClick={onBrowseTemplates}
            endIcon={<OpenIcon />}
            sx={{
              borderRadius: 1,
              px: 2.5,
              py: 1.2,
              textTransform: "none",
              fontWeight: 800,
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
            }}
          >
            Browse Templates
          </Button>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.18fr 0.82fr 0.82fr",
            },
            gridTemplateRows: {
              md: "repeat(3, minmax(160px, auto))",
            },
          }}
        >
          <SurfaceBox
            sx={{
              p: { xs: 2.2, md: 2.5 },
              gridColumn: { md: "1 / 2" },
              gridRow: { md: "1 / 4" },
              display: "flex",
              flexDirection: "column",
              minHeight: { xs: "auto", md: 560 },
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={2}
              sx={{ mb: 2.2 }}
            >
              <Box>
                <Typography
                  sx={{
                    color: theme.palette.secondary.main,
                    fontWeight: 850,
                    fontSize: "0.76rem",
                    letterSpacing: "0.12em",
                  }}
                >
                  FEATURED BLUEPRINT
                </Typography>
                <Typography
                  sx={{
                    mt: 0.8,
                    color: "text.primary",
                    fontSize: { xs: "1.45rem", md: "1.8rem" },
                    fontWeight: 850,
                    lineHeight: 1.1,
                  }}
                >
                  {primaryTemplate.name}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.9,
                    color: "text.secondary",
                    maxWidth: 520,
                    lineHeight: 1.72,
                  }}
                >
                  {primaryTemplate.detail}. This is the kind of starting point
                  teams can inspect before they ever fork into the canvas.
                </Typography>
              </Box>
              <Chip
                label={primaryTemplate.status}
                size="small"
                sx={{
                  borderRadius: 1,
                  fontWeight: 800,
                  color: theme.palette.secondary.main,
                  backgroundColor: alpha(theme.palette.tertiary.main, 0.24),
                  border: `1px solid ${alpha(theme.palette.tertiary.main, 0.44)}`,
                }}
              />
            </Stack>

            <Box
              sx={{
                position: "relative",
                flex: 1,
                minHeight: 300,
                overflow: "hidden",
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.62)}`,
                background:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.common.white, 0.02)
                    : alpha(theme.palette.common.white, 0.68),
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `linear-gradient(${alpha(theme.palette.divider, 0.24)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(theme.palette.divider, 0.24)} 1px, transparent 1px)`,
                  backgroundSize: "28px 28px",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: "12%",
                  top: "22%",
                  width: "56%",
                  height: "34%",
                  borderTop: `2px solid ${alpha(theme.palette.secondary.main, 0.28)}`,
                  borderRight: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                  transform: "skewY(-9deg)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: "18%",
                  top: "58%",
                  width: "54%",
                  borderTop: `2px solid ${alpha("#64748b", 0.28)}`,
                  transform: "rotate(12deg)",
                }}
              />
              {architectureNodes.map((node) => (
                <Box
                  key={`template-showcase-${node.label}`}
                  sx={{
                    position: "absolute",
                    left: node.x,
                    top: node.y,
                    width: { xs: 126, md: 144 },
                    p: 1.35,
                    borderRadius: 1,
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.28)}`,
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.background.paper, 0.95)
                        : alpha(theme.palette.common.white, 0.96),
                    boxShadow: `0 10px 28px ${alpha(theme.palette.common.black, 0.08)}`,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: theme.palette.secondary.main,
                        backgroundColor: alpha(
                          theme.palette.tertiary.main,
                          0.22,
                        ),
                      }}
                    >
                      {node.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          color: "text.primary",
                          fontSize: "0.74rem",
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {node.label}
                      </Typography>
                      <Typography
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.66rem",
                        }}
                      >
                        {node.meta}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
              <Box
                sx={{
                  position: "absolute",
                  right: { xs: 14, md: 18 },
                  bottom: { xs: 14, md: 18 },
                  width: { xs: 236, md: 258 },
                  borderRadius: 1,
                  overflow: "hidden",
                  border: `1px solid ${alpha(theme.palette.divider, 0.62)}`,
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.background.paper, 0.95)
                      : alpha(theme.palette.common.white, 0.96),
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    px: 1.4,
                    py: 1,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
                  }}
                >
                  <Typography
                    sx={{
                      color: "text.primary",
                      fontSize: "0.74rem",
                      fontWeight: 800,
                    }}
                  >
                    Terraform preview
                  </Typography>
                  <Chip
                    label="Ready"
                    size="small"
                    sx={{
                      height: 22,
                      borderRadius: 1,
                      fontWeight: 800,
                      color: theme.palette.secondary.main,
                      backgroundColor: alpha(theme.palette.tertiary.main, 0.22),
                      border: `1px solid ${alpha(theme.palette.tertiary.main, 0.42)}`,
                    }}
                  />
                </Stack>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.4,
                    whiteSpace: "pre-wrap",
                    color:
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.common.white, 0.84)
                        : "#334155",
                    fontSize: "0.68rem",
                    lineHeight: 1.65,
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.common.black, 0.16)
                        : alpha("#0f172a", 0.04),
                  }}
                >
                  {terraformLines.slice(0, 4).join("\n")}
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                mt: 2.1,
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(4, 1fr)",
                },
                gap: 1.1,
              }}
            >
              {[
                ["Cloud", primaryTemplate.cloud],
                ["Nodes", primaryTemplate.nodes],
                ["Surface", "Canvas + forms"],
                ["Export", "Terraform"],
              ].map(([label, value]) => (
                <Box
                  key={label}
                  sx={{
                    p: 1.1,
                    borderRadius: 1,
                    border: `1px solid ${alpha(theme.palette.divider, 0.58)}`,
                    backgroundColor: alpha(theme.palette.tertiary.main, 0.18),
                  }}
                >
                  <Typography
                    sx={{
                      color: theme.palette.secondary.main,
                      fontSize: "0.66rem",
                      fontWeight: 850,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.45,
                      color: "text.primary",
                      fontWeight: 800,
                      fontSize: "0.84rem",
                    }}
                  >
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </SurfaceBox>

          <SurfaceBox
            sx={{
              p: { xs: 2.1, md: 2.3 },
              gridColumn: { md: "2 / 3" },
              gridRow: { md: "1 / 2" },
            }}
          >
            <Typography
              sx={{
                color: theme.palette.secondary.main,
                fontWeight: 850,
                fontSize: "0.74rem",
                letterSpacing: "0.1em",
              }}
            >
              GALLERY SIGNALS
            </Typography>
            <Typography
              sx={{
                mt: 0.8,
                color: "text.primary",
                fontSize: { xs: "1.15rem", md: "1.24rem" },
                fontWeight: 850,
                lineHeight: 1.16,
              }}
            >
              Templates should communicate architecture, not just names.
            </Typography>
            <Typography
              sx={{
                mt: 1,
                color: "text.secondary",
                lineHeight: 1.68,
              }}
            >
              Users should be able to spot cloud, scope, readiness, and likely
              output before opening the full gallery.
            </Typography>
          </SurfaceBox>

          <SurfaceBox
            sx={{
              p: { xs: 2.1, md: 2.3 },
              gridColumn: { md: "3 / 4" },
              gridRow: { md: "1 / 2" },
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              sx={{
                color: theme.palette.secondary.main,
                fontWeight: 850,
                fontSize: "0.74rem",
                letterSpacing: "0.1em",
              }}
            >
              COVERAGE
            </Typography>
            <Stack spacing={1} sx={{ mt: 1.2 }}>
              {[
                ["AWS", "networking, platform, data"],
                ["Azure", "app baseline and private endpoints"],
                ["Terraform", "reviewable bundle output"],
              ].map(([label, value]) => (
                <Box
                  key={label}
                  sx={{
                    p: 1.05,
                    borderRadius: 1,
                    border: `1px solid ${alpha(theme.palette.divider, 0.56)}`,
                    backgroundColor: alpha(theme.palette.tertiary.main, 0.18),
                  }}
                >
                  <Typography
                    sx={{
                      color: "text.primary",
                      fontWeight: 800,
                      fontSize: "0.82rem",
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.35,
                      color: "text.secondary",
                      fontSize: "0.73rem",
                      lineHeight: 1.55,
                    }}
                  >
                    {value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </SurfaceBox>

          <SurfaceBox
            sx={{
              p: { xs: 2.1, md: 2.3 },
              gridColumn: { md: "2 / 4" },
              gridRow: { md: "2 / 3" },
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 1.8 }}
            >
              <Box>
                <Typography
                  sx={{
                    color: theme.palette.secondary.main,
                    fontWeight: 850,
                    fontSize: "0.74rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  SECONDARY PATTERNS
                </Typography>
                <Typography
                  sx={{
                    mt: 0.8,
                    color: "text.primary",
                    fontSize: { xs: "1.15rem", md: "1.24rem" },
                    fontWeight: 850,
                    lineHeight: 1.16,
                  }}
                >
                  A catalog that feels inspectable, not decorative.
                </Typography>
              </Box>
              <Chip
                label={`${templateRows.length} public starters`}
                size="small"
                sx={{
                  alignSelf: { xs: "flex-start", sm: "center" },
                  borderRadius: 1,
                  fontWeight: 800,
                  color: theme.palette.secondary.main,
                  backgroundColor: alpha(theme.palette.tertiary.main, 0.22),
                  border: `1px solid ${alpha(theme.palette.tertiary.main, 0.42)}`,
                }}
              />
            </Stack>
            <Grid container spacing={1.3}>
              {secondaryTemplates.map((template) => (
                <Grid key={template.name} size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: 1.3,
                      borderRadius: 1,
                      border: `1px solid ${alpha(theme.palette.divider, 0.56)}`,
                      backgroundColor: alpha(theme.palette.tertiary.main, 0.18),
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={1}
                      alignItems="flex-start"
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            color: "text.primary",
                            fontWeight: 800,
                            fontSize: "0.86rem",
                          }}
                        >
                          {template.name}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.45,
                            color: "text.secondary",
                            fontSize: "0.73rem",
                            lineHeight: 1.55,
                          }}
                        >
                          {template.detail}
                        </Typography>
                      </Box>
                      <Chip
                        label={template.cloud}
                        size="small"
                        sx={{
                          height: 22,
                          borderRadius: 1,
                          fontWeight: 800,
                          color: theme.palette.secondary.main,
                          backgroundColor: alpha(
                            theme.palette.tertiary.main,
                            0.22,
                          ),
                          border: `1px solid ${alpha(theme.palette.tertiary.main, 0.42)}`,
                        }}
                      />
                    </Stack>
                    <Box
                      sx={{
                        mt: 1.2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: "0.7rem",
                          fontWeight: 700,
                        }}
                      >
                        {template.status}
                      </Typography>
                      <Typography
                        sx={{
                          color: "text.primary",
                          fontSize: "0.7rem",
                          fontWeight: 800,
                        }}
                      >
                        {template.nodes}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </SurfaceBox>

          <SurfaceBox
            sx={{
              p: { xs: 2.1, md: 2.3 },
              gridColumn: { md: "2 / 4" },
              gridRow: { md: "3 / 4" },
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "flex-start" }}
              spacing={2}
            >
              <Box>
                <Typography
                  sx={{
                    color: theme.palette.secondary.main,
                    fontWeight: 850,
                    fontSize: "0.74rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  BEFORE YOU FORK
                </Typography>
                <Typography
                  sx={{
                    mt: 0.8,
                    color: "text.primary",
                    fontSize: { xs: "1.15rem", md: "1.24rem" },
                    fontWeight: 850,
                    lineHeight: 1.16,
                  }}
                >
                  The public gallery should answer the first evaluation pass.
                </Typography>
                <Typography
                  sx={{
                    mt: 1,
                    color: "text.secondary",
                    lineHeight: 1.68,
                    maxWidth: 520,
                  }}
                >
                  Show the pattern, the cloud context, the likely architecture
                  surface, and the Terraform outcome before the user commits to
                  editing.
                </Typography>
              </Box>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  flexWrap: "wrap",
                  gap: 1,
                  maxWidth: { xs: "100%", sm: 240 },
                  justifyContent: { xs: "flex-start", sm: "flex-end" },
                  alignSelf: { xs: "flex-start", sm: "flex-start" },
                  mt: { xs: 0.5, sm: 0.2 },
                }}
              >
                {["cloud", "nodes", "relationships", "output"].map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    size="small"
                    sx={{
                      height: 24,
                      borderRadius: 1,
                      fontWeight: 800,
                      color: "text.primary",
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.tertiary.main, 0.24)
                          : alpha(theme.palette.tertiary.main, 0.18),
                      border: `1px solid ${alpha(theme.palette.divider, 0.52)}`,
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          </SurfaceBox>
        </Box>
      </Container>
    </Box>
  );
};

const CapabilityMatrixSection: React.FC = () => {
  const theme = useTheme();
  const signalRows = [
    capabilitySignals,
    [...capabilitySignals.slice(4), ...capabilitySignals.slice(0, 4)],
    [...capabilitySignals.slice(8), ...capabilitySignals.slice(0, 8)],
  ];

  return (
    <Box
      component="section"
      aria-labelledby="capabilities-heading"
      sx={{
        py: { xs: 9, md: 13 },
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.68)}`,
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(180deg, ${alpha(theme.palette.common.white, 0.018)} 0%, transparent 100%)`
            : `linear-gradient(180deg, ${alpha(theme.palette.tertiary.main, 0.18)} 0%, transparent 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: theme.palette.secondary.main,
              fontWeight: 850,
              letterSpacing: "0.14em",
              lineHeight: 1.6,
            }}
          >
            Capabilities
          </Typography>
          <Typography
            id="capabilities-heading"
            variant="h2"
            sx={{
              mt: 1.2,
              color: "text.primary",
              fontSize: { xs: "2.2rem", sm: "3.1rem", md: "4.2rem" },
              fontWeight: 850,
              letterSpacing: 0,
              lineHeight: 0.98,
            }}
          >
            Remove Orchestration Guesswork.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mt: 2.2,
              color: "text.secondary",
              fontSize: { xs: "1rem", md: "1.08rem" },
              lineHeight: 1.75,
            }}
          >
            Show the core value clearly: reusable templates, visible resource
            relationships, structured configuration, validation before export,
            and Terraform output that is ready for review.
          </Typography>
        </Box>
        <Box sx={{ mt: { xs: 4, md: 5 }, display: "grid", gap: 1 }}>
          {signalRows.map((row, index) => (
            <CapabilitySignalRail
              key={index}
              items={row}
              reverse={index % 2 === 1}
            />
          ))}
        </Box>
        <Box
          sx={{
            mt: { xs: 4, md: 6 },
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              xl: "repeat(3, 1fr)",
            },
            gap: { xs: 1.5, md: 0 },
            borderTop: {
              md: `1px solid ${alpha(theme.palette.divider, 0.68)}`,
            },
            borderLeft: {
              md: `1px solid ${alpha(theme.palette.divider, 0.68)}`,
            },
          }}
        >
          {capabilityItems.map((item) => (
            <Box
              key={item.title}
              sx={{
                position: "relative",
                p: { xs: 2.1, sm: 2.3, md: 2.55 },
                minHeight: { xs: "auto", md: 220 },
                borderRight: {
                  md: `1px solid ${alpha(theme.palette.divider, 0.68)}`,
                },
                borderBottom: {
                  md: `1px solid ${alpha(theme.palette.divider, 0.68)}`,
                },
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.background.paper, 0.68)
                    : alpha(theme.palette.common.white, 0.88),
                backdropFilter: "blur(10px)",
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="flex-start"
                sx={{ height: "100%" }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: theme.palette.secondary.main,
                    backgroundColor: alpha(theme.palette.tertiary.main, 0.22),
                  }}
                >
                  {item.icon}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100%",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.secondary.main,
                      fontWeight: 850,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      mt: 0.45,
                      mb: 0.65,
                      color: "text.primary",
                      fontSize: { xs: "1.16rem", md: "1.22rem" },
                      fontWeight: 850,
                      letterSpacing: 0,
                      lineHeight: 1.18,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.72,
                      fontSize: "0.95rem",
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

const FinalCta: React.FC<{
  onBrowseTemplates: () => void;
  onStartDesigning: () => void;
}> = ({ onBrowseTemplates, onStartDesigning }) => {
  const theme = useTheme();

  return (
    <Box
      component="section"
      aria-labelledby="final-cta-heading"
      sx={{
        py: { xs: 8, md: 11 },
        backgroundColor:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.common.white, 0.03)
            : alpha(theme.palette.common.black, 0.035),
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.68)}`,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) auto" },
            gap: { xs: 3, md: 5 },
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              id="final-cta-heading"
              variant="h2"
              sx={{
                color: "text.primary",
                fontSize: { xs: "2rem", md: "3rem" },
                fontWeight: 850,
                letterSpacing: 0,
                lineHeight: 1.06,
              }}
            >
              Start with a blueprint. Leave with Terraform.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: 2,
                maxWidth: 660,
                color: "text.secondary",
                lineHeight: 1.75,
                fontSize: { xs: "1rem", md: "1.08rem" },
              }}
            >
              Browse public templates first, then open the canvas when you are
              ready to make the infrastructure model your own.
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="contained"
              size="large"
              onClick={onBrowseTemplates}
              endIcon={<OpenIcon />}
              sx={{
                borderRadius: 1,
                px: 3,
                py: 1.35,
                textTransform: "none",
                fontWeight: 850,
                boxShadow: "none",
                "&:hover": { boxShadow: "none" },
              }}
            >
              Browse Templates
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={onStartDesigning}
              startIcon={<DiagramIcon />}
              sx={{
                borderRadius: 1,
                px: 3,
                py: 1.35,
                textTransform: "none",
                fontWeight: 850,
                color: "text.primary",
                borderColor: alpha(theme.palette.secondary.main, 0.42),
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.common.white, 0.02)
                    : alpha(theme.palette.common.white, 0.48),
                "&:hover": {
                  borderColor: theme.palette.secondary.main,
                  backgroundColor: alpha(theme.palette.tertiary.main, 0.24),
                },
              }}
            >
              Open Canvas
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const previousTitle = document.title;
    const title = "Orchestrator | Reusable IaC Templates";
    const description =
      "Browse reusable cloud infrastructure templates, shape them visually, and generate IaC with Orchestrator.";
    const url = `${SITE_URL}/`;
    const image = `${SITE_URL}/og-landing.png`;

    document.title = title;
    setHeadAttribute(
      'meta[name="description"]',
      "meta",
      { name: "description" },
      "content",
      description,
    );
    setHeadAttribute(
      'meta[name="robots"]',
      "meta",
      { name: "robots" },
      "content",
      "index, follow",
    );
    setHeadAttribute(
      'meta[property="og:title"]',
      "meta",
      { property: "og:title" },
      "content",
      title,
    );
    setHeadAttribute(
      'meta[property="og:description"]',
      "meta",
      { property: "og:description" },
      "content",
      description,
    );
    setHeadAttribute(
      'meta[property="og:url"]',
      "meta",
      { property: "og:url" },
      "content",
      url,
    );
    setHeadAttribute(
      'meta[property="og:type"]',
      "meta",
      { property: "og:type" },
      "content",
      "website",
    );
    setHeadAttribute(
      'meta[property="og:image"]',
      "meta",
      { property: "og:image" },
      "content",
      image,
    );
    setHeadAttribute(
      'meta[property="og:image:width"]',
      "meta",
      { property: "og:image:width" },
      "content",
      "1200",
    );
    setHeadAttribute(
      'meta[property="og:image:height"]',
      "meta",
      { property: "og:image:height" },
      "content",
      "630",
    );
    setHeadAttribute(
      'meta[name="twitter:card"]',
      "meta",
      { name: "twitter:card" },
      "content",
      "summary_large_image",
    );
    setHeadAttribute(
      'meta[name="twitter:title"]',
      "meta",
      { name: "twitter:title" },
      "content",
      title,
    );
    setHeadAttribute(
      'meta[name="twitter:description"]',
      "meta",
      { name: "twitter:description" },
      "content",
      description,
    );
    setHeadAttribute(
      'meta[name="twitter:image"]',
      "meta",
      { name: "twitter:image" },
      "content",
      image,
    );
    setHeadAttribute(
      'link[rel="canonical"]',
      "link",
      { rel: "canonical" },
      "href",
      url,
    );

    return () => {
      document.title = previousTitle;
    };
  }, []);

  const goToTemplates = () => navigate("/templates");
  const goToCanvas = () => navigate("/home");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        maxWidth: "100vw",
        overflowX: "clip",
        boxSizing: "border-box",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        "& *, & *::before, & *::after": {
          boxSizing: "border-box",
        },
        "& .MuiContainer-root": {
          boxSizing: "border-box",
          "@media (max-width: 599.95px)": {
            width: "100%",
            maxWidth: "100%",
            marginLeft: 0,
            marginRight: 0,
            paddingLeft: "16px",
            paddingRight: "16px",
          },
        },
      }}
    >
      <Box
        component="section"
        aria-labelledby="landing-hero-title"
        sx={{
          position: "relative",
          minHeight: {
            xs: "auto",
            md: "min(820px, calc(100vh - 120px))",
          },
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.68)}`,
          py: { xs: 5.5, md: 8 },
        }}
      >
        <HeroProductScene />

        <Container
          maxWidth={false}
          sx={{
            position: "relative",
            zIndex: 1,
            px: { xs: 2, sm: 3, md: 6, lg: 8, xl: 10 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: { xs: 358, sm: 620, md: 640, lg: 680 },
              minWidth: 0,
            }}
          >
            <Chip
              icon={<TemplateIcon />}
              label="Template-first infrastructure as code"
              sx={{
                mb: 3,
                borderRadius: 1,
                height: 34,
                px: 0.5,
                fontWeight: 800,
                color: theme.palette.secondary.main,
                backgroundColor: alpha(theme.palette.tertiary.main, 0.28),
                border: `1px solid ${alpha(theme.palette.tertiary.main, 0.46)}`,
                "& .MuiChip-icon": {
                  color: theme.palette.secondary.main,
                },
              }}
            />
            <Typography
              id="landing-hero-title"
              variant="h1"
              sx={{
                color: theme.palette.primary.main,
                fontSize: { xs: "2.55rem", sm: "3.2rem", md: "4rem" },
                fontWeight: 850,
                lineHeight: 0.96,
                maxWidth: 720,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Orchestrator
            </Typography>
            <Typography
              variant="h2"
              sx={{
                mt: 2,
                mb: 2.5,
                maxWidth: 640,
                color: "text.primary",
                fontSize: { xs: "1.43rem", sm: "2.25rem", md: "3rem" },
                fontWeight: 750,
                lineHeight: 1.12,
                letterSpacing: 0,
              }}
            >
              Reusable cloud templates that become Terraform.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                maxWidth: 650,
                color: "text.secondary",
                fontSize: { xs: "1.02rem", md: "1.15rem" },
                lineHeight: 1.8,
              }}
            >
              Browse infrastructure patterns, fork them into a visual canvas,
              configure cloud resources with structured forms, and export the
              generated Terraform for review.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ mt: 4, mb: 4, width: { xs: "100%", sm: "auto" } }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={goToTemplates}
                endIcon={<OpenIcon />}
                aria-label="Browse infrastructure templates"
                sx={{
                  alignSelf: { xs: "stretch", sm: "flex-start" },
                  width: { xs: "100%", sm: "auto" },
                  borderRadius: 1,
                  px: 3,
                  py: 1.35,
                  textTransform: "none",
                  fontWeight: 850,
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "none",
                  },
                }}
              >
                Browse Templates
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={goToCanvas}
                startIcon={<PlayIcon />}
                aria-label="Start designing infrastructure"
                sx={{
                  alignSelf: { xs: "stretch", sm: "flex-start" },
                  width: { xs: "100%", sm: "auto" },
                  borderRadius: 1,
                  px: 3,
                  py: 1.35,
                  textTransform: "none",
                  fontWeight: 850,
                  borderColor: alpha(theme.palette.secondary.main, 0.42),
                  color: "text.primary",
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.02)
                      : alpha(theme.palette.common.white, 0.52),
                  "&:hover": {
                    borderColor: theme.palette.secondary.main,
                    backgroundColor: alpha(theme.palette.tertiary.main, 0.24),
                  },
                }}
              >
                Start Designing
              </Button>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 2 }}
              sx={{
                color: "text.secondary",
                flexWrap: "wrap",
                maxWidth: "100%",
              }}
            >
              {[
                "Public template gallery",
                "Visual architecture canvas",
                "Terraform bundle export",
              ].map((label) => (
                <Stack
                  key={label}
                  direction="row"
                  spacing={0.8}
                  alignItems="center"
                >
                  <VerifiedIcon
                    sx={{ color: theme.palette.secondary.main, fontSize: 18 }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
            <MobileProductPreview />
          </Box>
        </Container>
      </Box>

      <Box component="main">
        <MaestroSection />
        <ProductLoopSection />
        <ArtifactSection />
        <TemplateShowcaseSection onBrowseTemplates={goToTemplates} />
        <CapabilityMatrixSection />
        <FinalCta
          onBrowseTemplates={goToTemplates}
          onStartDesigning={goToCanvas}
        />
      </Box>

      <Box
        component="footer"
        sx={{
          py: 4,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.68)}`,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            2026 Orchestrator. Cloud templates, visual design, Terraform export.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
