import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import { fetchTemplates } from "../../store/templatesSlice";
import type { AppDispatch, RootState } from "../../store";
import type { TemplateListItem } from "../../types/template";
import MinimalThemeToggle from "../shared/theme/MinimalThemeToggle";
import { useAuth } from "../../context/AuthContext";
import awsLogo from "../../assets/aws_logo.svg";
import azureLogo from "../../assets/az_logo.svg";
import gcpLogo from "../../assets/gcp_logo.svg";
import "./LandingPreviewPage.css";
import TemplateBlueprintFigure from "./TemplateBlueprintFigure";
import BenefitFigure from "./BenefitFigures";
import MaestroShowcase from "./MaestroShowcase";
import {
  ConfigureResourcesFigure,
  ReviewOutputFigure,
} from "./WorkflowCompanionFigures";

const SITE_URL = "https://orchestrator.next-zen.dev";
const PREVIEW_SEO = {
  title: "Maestro Infrastructure Planning & Terraform | Orchestrator",
  description:
    "Plan infrastructure with Maestro or start from a reusable template, review the connected resources visually, and export Terraform with Orchestrator.",
  url: `${SITE_URL}/`,
  image: `${SITE_URL}/og-landing.png`,
};

type InfrastructureResource =
  | "api"
  | "events"
  | "worker"
  | "queue"
  | "network"
  | "compute"
  | "data"
  | "security"
  | "cluster"
  | "nodes"
  | "app"
  | "endpoint"
  | "storage";

type ArchitectureVariant =
  | "event-driven"
  | "vpc"
  | "eks"
  | "azure"
  | "reference"
  | "code";

type ArchitectureNode = {
  id: InfrastructureResource;
  label: string;
  meta: string;
  shape: "slab" | "cube" | "cylinder" | "boundary";
  left: number;
  top: number;
  width?: number;
  rotation?: number;
};

type ArchitectureLayout = {
  viewBox: string;
  paths: string[];
  points: Array<[number, number]>;
  nodes: ArchitectureNode[];
};

type ArchitectureDefinition = {
  provider: string;
  region: string;
  ariaLabel: string;
  regionLabel?: string;
  providerLabel?: string;
  hero?: ArchitectureLayout;
  compact: ArchitectureLayout;
};

interface PreviewTemplate {
  id?: string;
  name: string;
  description: string;
  cloud: string;
  region?: string;
  nodeCount?: number;
  detail: string;
}

const fallbackTemplates: PreviewTemplate[] = [
  {
    name: "AWS VPC Landing Zone",
    description: "Networking, subnets, NAT, and routing.",
    cloud: "AWS",
    region: "aws",
    nodeCount: 12,
    detail: "Template-first networking",
  },
  {
    name: "Kubernetes Platform Base",
    description: "Cluster, node groups, IAM, and observability.",
    cloud: "AWS",
    region: "aws",
    nodeCount: 18,
    detail: "Platform foundation",
  },
  {
    name: "Azure App Baseline",
    description: "VNet, app service, storage, and private endpoints.",
    cloud: "Azure",
    region: "azure",
    nodeCount: 14,
    detail: "Application baseline",
  },
];

const architectureDefinitions: Record<
  ArchitectureVariant,
  ArchitectureDefinition
> = {
  "event-driven": {
    provider: "aws",
    region: "event-driven reference",
    regionLabel: "architecture",
    ariaLabel:
      "AWS event-driven architecture connecting an API gateway, EventBridge, Lambda, DynamoDB, and an SQS dead-letter queue",
    hero: {
      viewBox: "0 0 560 500",
      paths: [
        "M190 248 C224 220 248 174 280 174",
        "M375 145 C410 152 430 195 380 248",
        "M470 286 C464 340 420 382 350 390",
        "M280 181 C260 240 230 320 225 360",
      ],
      points: [
        [190, 248],
        [280, 174],
        [380, 248],
        [350, 390],
        [225, 360],
      ],
      nodes: [
        {
          id: "api",
          label: "api gateway",
          meta: "edge / https",
          shape: "cube",
          left: 10,
          top: 210,
          width: 180,
          rotation: -1.4,
        },
        {
          id: "events",
          label: "eventbridge",
          meta: "event bus / rules",
          shape: "boundary",
          left: 195,
          top: 105,
          width: 180,
          rotation: 0.8,
        },
        {
          id: "worker",
          label: "lambda",
          meta: "async worker",
          shape: "slab",
          left: 380,
          top: 210,
          width: 180,
          rotation: 1.2,
        },
        {
          id: "data",
          label: "dynamodb",
          meta: "single-table / private",
          shape: "cylinder",
          left: 350,
          top: 350,
          width: 180,
          rotation: -1,
        },
        {
          id: "queue",
          label: "sqs / dlq",
          meta: "retries / recovery",
          shape: "boundary",
          left: 45,
          top: 360,
          width: 180,
          rotation: 0.8,
        },
      ],
    },
    compact: {
      viewBox: "0 0 360 360",
      paths: [
        "M146 170 C168 148 180 124 192 112",
        "M262 112 C286 120 300 145 214 170",
        "M286 208 C280 236 258 252 214 258",
        "M192 128 C180 176 160 224 146 250",
      ],
      points: [
        [146, 170],
        [192, 112],
        [214, 170],
        [214, 258],
        [146, 250],
      ],
      nodes: [
        {
          id: "api",
          label: "api gateway",
          meta: "edge / https",
          shape: "cube",
          left: 0,
          top: 142,
        },
        {
          id: "events",
          label: "eventbridge",
          meta: "event bus / rules",
          shape: "boundary",
          left: 107,
          top: 48,
        },
        {
          id: "worker",
          label: "lambda",
          meta: "async worker",
          shape: "slab",
          left: 214,
          top: 142,
        },
        {
          id: "data",
          label: "dynamodb",
          meta: "single-table",
          shape: "cylinder",
          left: 214,
          top: 242,
        },
        {
          id: "queue",
          label: "sqs / dlq",
          meta: "retries / recovery",
          shape: "boundary",
          left: 0,
          top: 252,
        },
      ],
    },
  },
  vpc: {
    provider: "aws",
    region: "ap-south-1",
    ariaLabel:
      "AWS VPC landing zone architecture connecting internet ingress, a VPC, private subnets, RDS, and security controls",
    compact: {
      viewBox: "0 0 360 360",
      paths: [
        "M180 96 C176 112 160 122 146 134",
        "M180 96 C194 100 204 105 214 110",
        "M146 198 C168 224 192 240 214 250",
        "M146 198 C158 240 170 270 180 286",
      ],
      points: [
        [180, 96],
        [146, 134],
        [214, 110],
        [214, 250],
        [180, 286],
      ],
      nodes: [
        {
          id: "api",
          label: "internet",
          meta: "edge / public",
          shape: "cube",
          left: 107,
          top: 32,
        },
        {
          id: "network",
          label: "vpc",
          meta: "public / private",
          shape: "slab",
          left: 0,
          top: 134,
        },
        {
          id: "compute",
          label: "private subnets",
          meta: "nat / routes",
          shape: "boundary",
          left: 214,
          top: 110,
        },
        {
          id: "data",
          label: "rds",
          meta: "encrypted / private",
          shape: "cylinder",
          left: 214,
          top: 218,
        },
        {
          id: "security",
          label: "security",
          meta: "validated boundary",
          shape: "boundary",
          left: 70,
          top: 286,
        },
      ],
    },
  },
  eks: {
    provider: "aws",
    region: "ap-south-1",
    ariaLabel:
      "AWS Kubernetes platform architecture connecting a load balancer, EKS cluster, node groups, RDS, and observability",
    compact: {
      viewBox: "0 0 360 360",
      paths: [
        "M146 168 C168 146 186 122 214 108",
        "M262 108 C284 122 300 146 314 168",
        "M287 232 C280 250 260 264 240 276",
        "M180 204 C178 236 178 264 180 286",
      ],
      points: [
        [146, 168],
        [214, 108],
        [314, 168],
        [240, 276],
        [180, 286],
      ],
      nodes: [
        {
          id: "api",
          label: "load balancer",
          meta: "ingress / tls",
          shape: "cube",
          left: 0,
          top: 140,
        },
        {
          id: "cluster",
          label: "eks cluster",
          meta: "control plane",
          shape: "boundary",
          left: 107,
          top: 42,
        },
        {
          id: "nodes",
          label: "node groups",
          meta: "autoscaling / iam",
          shape: "slab",
          left: 214,
          top: 140,
        },
        {
          id: "data",
          label: "rds",
          meta: "managed / private",
          shape: "cylinder",
          left: 214,
          top: 238,
        },
        {
          id: "security",
          label: "observability",
          meta: "logs / metrics",
          shape: "boundary",
          left: 70,
          top: 286,
        },
      ],
    },
  },
  azure: {
    provider: "azure",
    region: "central-india",
    ariaLabel:
      "Azure application baseline connecting a virtual network, App Service, private endpoint, and storage",
    compact: {
      viewBox: "0 0 360 360",
      paths: [
        "M146 170 C168 146 186 120 214 106",
        "M146 188 C168 214 192 236 214 250",
        "M286 170 C278 210 250 250 216 286",
      ],
      points: [
        [146, 170],
        [214, 106],
        [214, 250],
        [216, 286],
      ],
      nodes: [
        {
          id: "network",
          label: "vnet",
          meta: "private / segmented",
          shape: "slab",
          left: 0,
          top: 142,
        },
        {
          id: "app",
          label: "app service",
          meta: "web / managed",
          shape: "cube",
          left: 214,
          top: 72,
        },
        {
          id: "endpoint",
          label: "private endpoint",
          meta: "internal access",
          shape: "boundary",
          left: 214,
          top: 218,
        },
        {
          id: "storage",
          label: "storage",
          meta: "blob / private",
          shape: "cylinder",
          left: 70,
          top: 286,
        },
      ],
    },
  },
  reference: {
    provider: "cloud",
    region: "reference architecture",
    ariaLabel:
      "Reference cloud architecture connecting a client, application service, message queue, and managed database",
    compact: {
      viewBox: "0 0 360 360",
      paths: [
        "M146 168 C168 146 190 120 214 108",
        "M262 108 C284 124 300 146 314 168",
        "M287 232 C280 250 250 270 214 286",
      ],
      points: [
        [146, 168],
        [214, 108],
        [314, 168],
        [214, 286],
      ],
      nodes: [
        {
          id: "api",
          label: "client",
          meta: "request / https",
          shape: "cube",
          left: 0,
          top: 140,
        },
        {
          id: "compute",
          label: "service",
          meta: "application layer",
          shape: "slab",
          left: 214,
          top: 72,
        },
        {
          id: "queue",
          label: "queue",
          meta: "buffer / retry",
          shape: "boundary",
          left: 214,
          top: 218,
        },
        {
          id: "data",
          label: "database",
          meta: "managed / private",
          shape: "cylinder",
          left: 107,
          top: 272,
        },
      ],
    },
  },
  code: {
    provider: "terraform",
    region: "request path",
    regionLabel: "flow",
    providerLabel: "source",
    ariaLabel:
      "Terraform dependency graph connecting a client, an EKS API, an SQS queue, an EKS worker, and RDS",
    compact: {
      viewBox: "0 0 360 360",
      paths: [
        "M146 76 C168 76 190 76 214 76",
        "M214 106 C188 128 170 150 146 168",
        "M146 168 C168 168 190 168 214 168",
        "M287 232 C280 252 250 270 214 286",
      ],
      points: [
        [146, 76],
        [214, 76],
        [146, 168],
        [214, 168],
        [214, 286],
      ],
      nodes: [
        {
          id: "api",
          label: "client",
          meta: "request / https",
          shape: "cube",
          left: 0,
          top: 42,
        },
        {
          id: "cluster",
          label: "eks / api",
          meta: "ingress / service",
          shape: "boundary",
          left: 214,
          top: 42,
        },
        {
          id: "queue",
          label: "sqs queue",
          meta: "buffer / retry",
          shape: "boundary",
          left: 0,
          top: 140,
        },
        {
          id: "worker",
          label: "eks / worker",
          meta: "consumer / pods",
          shape: "slab",
          left: 214,
          top: 140,
        },
        {
          id: "data",
          label: "rds",
          meta: "orders / private",
          shape: "cylinder",
          left: 107,
          top: 272,
        },
      ],
    },
  },
};

const terraformLines: Array<{
  text: string;
  resource?: InfrastructureResource;
}> = [
  { text: 'module "client" {', resource: "api" },
  { text: '  source = "./modules/client"', resource: "api" },
  { text: "  route  = module.api.ingress", resource: "api" },
  { text: "}", resource: "api" },
  { text: "" },
  { text: 'module "api" {', resource: "cluster" },
  { text: '  source = "./modules/eks-api"', resource: "cluster" },
  { text: "  queue  = module.queue.arn", resource: "cluster" },
  { text: "}", resource: "cluster" },
  { text: "" },
  { text: 'module "queue" {', resource: "queue" },
  { text: '  source = "./modules/sqs"', resource: "queue" },
  { text: "  retry  = 3", resource: "queue" },
  { text: "}", resource: "queue" },
  { text: "" },
  { text: 'module "worker" {', resource: "worker" },
  { text: '  source    = "./modules/eks-worker"', resource: "worker" },
  { text: "  queue_arn = module.queue.arn", resource: "worker" },
  { text: "}", resource: "worker" },
  { text: "" },
  { text: 'module "database" {', resource: "data" },
  { text: '  source = "./modules/rds"', resource: "data" },
  { text: '  engine = "postgres"', resource: "data" },
  { text: "}", resource: "data" },
];

const workflow = [
  {
    number: "01",
    title: "Choose a template",
    description:
      "Start from a published architecture instead of a blank Terraform folder.",
    figure: "template" as const,
  },
  {
    number: "02",
    title: "Configure the resources",
    description:
      "Shape the graph and complete provider-specific fields in structured forms.",
    figure: "configure" as const,
  },
  {
    number: "03",
    title: "Review the output",
    description:
      "See warnings before export and take the generated Terraform into your process.",
    figure: "review" as const,
  },
];

const benefits = [
  {
    title: "Reusable",
    description:
      "Publish proven orchestrators as templates your team can fork and adapt.",
    figure: "reusable" as const,
  },
  {
    title: "Connected",
    description:
      "Keep resource relationships visible while the architecture changes.",
    figure: "connected" as const,
  },
  {
    title: "Reviewable",
    description:
      "Surface incomplete configuration before generated code reaches a pipeline.",
    figure: "reviewable" as const,
  },
  {
    title: "Portable",
    description:
      "Export Terraform bundles without locking the workflow to one deployment path.",
    figure: "portable" as const,
  },
];

const toPreviewTemplate = (template: TemplateListItem): PreviewTemplate => ({
  id: template.id,
  name: template.templateName,
  description: template.description || "Published infrastructure blueprint.",
  cloud: (template.cloud || "cloud").toUpperCase(),
  region: template.region,
  nodeCount: template.nodeCount,
  detail: `${template.nodeCount} resource${template.nodeCount === 1 ? "" : "s"} connected`,
});

const getTemplateArchitecture = (
  template: PreviewTemplate,
): Exclude<ArchitectureVariant, "event-driven" | "code"> => {
  const templateText = `${template.name} ${template.description}`.toLowerCase();

  if (template.cloud.toLowerCase() === "azure") return "azure";
  if (templateText.includes("kubernetes") || templateText.includes("eks")) {
    return "eks";
  }
  if (
    templateText.includes("vpc") ||
    templateText.includes("network") ||
    templateText.includes("landing zone") ||
    templateText.includes("subnet")
  ) {
    return "vpc";
  }
  return "reference";
};

const getTemplateActiveResource = (
  variant: Exclude<ArchitectureVariant, "event-driven" | "code">,
): InfrastructureResource => {
  if (variant === "eks") return "cluster";
  if (variant === "azure") return "app";
  if (variant === "reference") return "compute";
  return "network";
};

const getArchitectureNodeLabel = (
  variant: ArchitectureVariant,
  resource: InfrastructureResource,
): string => {
  const node = architectureDefinitions[variant].compact.nodes.find(
    (item) => item.id === resource,
  );
  return node?.label || resource;
};

const useReveal = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return {
    ref,
    className: visible ? "preview-reveal is-visible" : "preview-reveal",
  };
};

const useHeroParallax = () => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (reducedMotion || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    setOffset({ x: x * 4, y: y * 3 });
  };

  const reset = () => setOffset({ x: 0, y: 0 });
  return { offset, onPointerMove, reset };
};

const PreviewHeader: React.FC<{
  onStartMaestro: () => void;
}> = ({ onStartMaestro }) => {
  const [open, setOpen] = useState(false);

  return (
    <header className="preview-header">
      <div className="preview-container preview-header__inner">
        <a className="preview-brand" href="#top" aria-label="Orchestrator home">
          <img src="/one-color-teal-print.svg" alt="" aria-hidden="true" />
          <span>Orchestrator</span>
        </a>

        <span className="preview-theme-control">
          <span className="preview-theme-label">Theme</span>
          <MinimalThemeToggle size="small" />
        </span>

        <button
          className="preview-menu-button"
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? (
            <CloseIcon fontSize="small" />
          ) : (
            <MenuIcon fontSize="small" />
          )}
        </button>

        <nav
          className={open ? "preview-nav is-open" : "preview-nav"}
          aria-label="Preview page navigation"
        >
          <a href="#maestro" onClick={() => setOpen(false)}>
            Maestro
          </a>
          <a href="/login" onClick={() => setOpen(false)}>
            Sign in
          </a>
          <button
            className="preview-header__cta"
            type="button"
            onClick={onStartMaestro}
          >
            Plan with Maestro <ArrowOutwardIcon fontSize="inherit" />
          </button>
        </nav>
      </div>
    </header>
  );
};

const InfrastructureSculpture: React.FC<{
  activeResource?: InfrastructureResource;
  compact?: boolean;
  providerOverride?: string;
  regionOverride?: string;
  style?: React.CSSProperties;
  variant?: ArchitectureVariant;
}> = ({
  activeResource,
  compact = false,
  providerOverride,
  regionOverride,
  style,
  variant = "event-driven",
}) => {
  const definition = architectureDefinitions[variant];
  const diagram = compact
    ? definition.compact
    : definition.hero || definition.compact;
  const displayedProvider = providerOverride || definition.provider;
  const displayedRegion = regionOverride || definition.region;

  return (
    <div
      className={`sculpture sculpture--${variant}${compact ? " sculpture--compact" : ""}`}
      style={style}
      aria-label={definition.ariaLabel}
      role="img"
    >
      <div className="sculpture__annotation sculpture__annotation--region">
        {definition.regionLabel || "region"}: {displayedRegion}
      </div>
      <div className="sculpture__annotation sculpture__annotation--provider">
        {definition.providerLabel || "provider"}: {displayedProvider}
      </div>
      <svg
        className="sculpture__lines"
        viewBox={diagram.viewBox}
        aria-hidden="true"
      >
        {diagram.paths.map((path) => (
          <path d={path} key={path} />
        ))}
        {diagram.points.map(([cx, cy]) => (
          <circle cx={cx} cy={cy} r="3" key={`${cx}-${cy}`} />
        ))}
      </svg>
      {diagram.nodes.map((node) => (
        <div
          className={`sculpture__node ${activeResource === node.id ? "is-active" : ""}`}
          key={node.id}
          style={
            {
              "--node-left": `${node.left}px`,
              "--node-top": `${node.top}px`,
              "--node-width": `${node.width || (compact ? 146 : 180)}px`,
              "--node-rotation": `${node.rotation || 0}deg`,
            } as React.CSSProperties
          }
        >
          <span
            className={`sculpture__node-shape sculpture__node-shape--${node.shape}`}
          />
          <span className="sculpture__node-label">{node.label}</span>
          <span className="sculpture__node-meta">{node.meta}</span>
        </div>
      ))}
    </div>
  );
};

const Hero: React.FC<{
  onExplore: () => void;
  onStartMaestro: () => void;
}> = ({ onExplore, onStartMaestro }) => {
  const reveal = useReveal();
  const parallax = useHeroParallax();

  return (
    <section
      id="top"
      className="preview-hero"
      onPointerMove={parallax.onPointerMove}
      onPointerLeave={parallax.reset}
    >
      <div className="preview-container preview-hero__grid">
        <div
          ref={reveal.ref}
          className={`${reveal.className} preview-hero__copy`}
        >
          <p className="preview-kicker">Infrastructure as code</p>
          <h1>
            Infrastructure
            <br />
            <em>that holds together.</em>
          </h1>
          <p className="preview-hero__lede">
            Describe your infrastructure to Maestro, refine the plan, and review
            the draft on a visual canvas before exporting Terraform.
          </p>
          <div className="preview-actions">
            <button
              className="preview-button preview-button--primary"
              type="button"
              onClick={onStartMaestro}
            >
              Plan with Maestro <ArrowOutwardIcon fontSize="small" />
            </button>
            <button
              className="preview-button preview-button--quiet"
              type="button"
              onClick={onExplore}
            >
              Explore templates <NorthEastIcon fontSize="small" />
            </button>
          </div>
          <div className="preview-proof-row" aria-label="Product capabilities">
            <span>Conversational planning</span>
            <span>Visual resource graph</span>
            <span>Terraform export</span>
          </div>
        </div>

        <div className="preview-hero__visual" aria-hidden="true">
          <InfrastructureSculpture
            style={{
              transform: `translate3d(${parallax.offset.x}px, ${parallax.offset.y}px, 0)`,
            }}
          />
          <span className="preview-hero__note">
            a connected system / not a blank page
          </span>
        </div>
      </div>
    </section>
  );
};

const ProviderStrip: React.FC = () => (
  <section className="preview-provider-strip" aria-label="Supported providers">
    <div className="preview-container preview-provider-strip__inner">
      <span className="preview-mono-label">
        Works with the providers in your workflow
      </span>
      <div className="preview-providers">
        <span>
          <img src={awsLogo} alt="" aria-hidden="true" />
          AWS
        </span>
        <span>
          <img src={azureLogo} alt="" aria-hidden="true" />
          Azure
        </span>
        <span>
          <img src={gcpLogo} alt="" aria-hidden="true" />
          GCP
        </span>
        <span className="preview-provider-wordmark">Terraform</span>
      </div>
    </div>
  </section>
);

const TemplatesSection: React.FC<{
  onOpen: (template?: PreviewTemplate) => void;
}> = ({ onOpen }) => {
  const dispatch = useDispatch<AppDispatch>();
  const templates = useSelector((state: RootState) => state.templates.items);
  const status = useSelector((state: RootState) => state.templates.status);
  const [activeTemplate, setActiveTemplate] = useState(0);
  const reveal = useReveal();

  useEffect(() => {
    if (status === "idle")
      dispatch(fetchTemplates({ page: 1, size: 3, sort: "popularity" }));
  }, [dispatch, status]);

  const rows = useMemo<PreviewTemplate[]>(() => {
    const liveRows = templates.slice(0, 3).map(toPreviewTemplate);
    return liveRows.length > 0 ? liveRows : fallbackTemplates;
  }, [templates]);
  const activeTemplateData = rows[activeTemplate] || rows[0];
  const activeTemplateVariant = activeTemplateData
    ? getTemplateArchitecture(activeTemplateData)
    : "reference";

  return (
    <section id="templates" className="preview-section preview-templates">
      <div ref={reveal.ref} className={`preview-container ${reveal.className}`}>
        <div className="preview-section-heading preview-section-heading--split">
          <div>
            <p className="preview-kicker">Templates</p>
            <h2>Start with something proven.</h2>
          </div>
          <p>
            Published infrastructure blueprints give the first decision a shape
            before you open the canvas.
          </p>
        </div>
        <div className="preview-template-layout">
          <div
            className="preview-template-list"
            aria-label="Infrastructure templates"
          >
            {rows.map((template, index) => (
              <article
                className={
                  index === activeTemplate
                    ? "preview-template-row is-active"
                    : "preview-template-row"
                }
                key={`${template.name}-${index}`}
                onMouseEnter={() => setActiveTemplate(index)}
              >
                <button
                  className="preview-template-row__inspect"
                  type="button"
                  onFocus={() => setActiveTemplate(index)}
                  onClick={() => setActiveTemplate(index)}
                  aria-label={`Inspect ${template.name} architecture`}
                >
                  <span className="preview-template-row__index">
                    0{index + 1}
                  </span>
                  <span className="preview-template-row__body">
                    <strong>{template.name}</strong>
                    <span>{template.description}</span>
                    <small>{template.detail}</small>
                  </span>
                </button>
                <button
                  className="preview-template-row__open"
                  type="button"
                  onFocus={() => setActiveTemplate(index)}
                  onClick={() => onOpen(template)}
                  aria-label={`Open ${template.name}`}
                >
                  <span className="preview-template-row__meta">
                    {template.cloud}
                  </span>
                  <NorthEastIcon fontSize="small" aria-hidden="true" />
                </button>
              </article>
            ))}
            {status === "loading" && templates.length === 0 && (
              <span className="preview-inline-status">
                Loading published templates…
              </span>
            )}
          </div>
          <div className="preview-template-visual" aria-hidden="true">
            <InfrastructureSculpture
              compact
              variant={activeTemplateVariant}
              providerOverride={activeTemplateData?.cloud.toLowerCase()}
              regionOverride={activeTemplateData?.region}
              activeResource={getTemplateActiveResource(activeTemplateVariant)}
            />
            <span className="preview-template-visual__caption">
              inspect a row, then open its template
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

const CodeInfrastructureSection: React.FC = () => {
  const [activeResource, setActiveResource] =
    useState<InfrastructureResource>("api");
  const reveal = useReveal();

  return (
    <section id="code" className="preview-section preview-code-section">
      <div ref={reveal.ref} className={`preview-container ${reveal.className}`}>
        <div className="preview-section-heading">
          <p className="preview-kicker">Code becomes infrastructure</p>
          <h2>The relationships stay visible.</h2>
          <p>
            Follow a request from the client through an EKS service, a durable
            queue, worker pods, and RDS—then trace each dependency back to
            Terraform.
          </p>
        </div>
        <div className="preview-code-layout">
          <div className="preview-code-panel" aria-label="Terraform example">
            <div className="preview-code-panel__topline">
              <span>main.tf</span>
              <span>terraform</span>
            </div>
            <pre>
              {terraformLines.map((line, index) => (
                <button
                  className={
                    line.resource === activeResource
                      ? "preview-code-line is-active"
                      : "preview-code-line"
                  }
                  type="button"
                  key={`${line.text}-${index}`}
                  onMouseEnter={() =>
                    line.resource && setActiveResource(line.resource)
                  }
                  onFocus={() =>
                    line.resource && setActiveResource(line.resource)
                  }
                  aria-label={
                    line.resource
                      ? `Highlight ${getArchitectureNodeLabel("code", line.resource)} infrastructure`
                      : undefined
                  }
                >
                  <span className="preview-code-line__number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{line.text || " "}</span>
                </button>
              ))}
            </pre>
          </div>
          <div className="preview-code-visual">
            <InfrastructureSculpture
              compact
              variant="code"
              activeResource={activeResource}
            />
            <div className="preview-code-visual__legend">
              <span className="preview-mono-label">linked resource</span>
              <strong>
                {getArchitectureNodeLabel("code", activeResource)}
              </strong>
              <span>
                Hover or focus a Terraform block to follow the connection.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const WorkflowSection: React.FC = () => {
  const reveal = useReveal();
  return (
    <section id="how-it-works" className="preview-section preview-workflow">
      <div ref={reveal.ref} className={`preview-container ${reveal.className}`}>
        <div className="preview-section-heading preview-section-heading--narrow">
          <p className="preview-kicker">How it works</p>
          <h2>Less blank page. More useful first draft.</h2>
        </div>
        <div className="preview-workflow-list">
          {workflow.map((step, index) => (
            <React.Fragment key={step.number}>
              <article className="preview-workflow-step">
                {step.figure === "template" && <TemplateBlueprintFigure />}
                {step.figure === "configure" && <ConfigureResourcesFigure />}
                {step.figure === "review" && <ReviewOutputFigure />}
                <div className="preview-workflow-step__copy">
                  <span className="preview-workflow-step__number">
                    {step.number}
                  </span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </div>
              </article>
              {index < workflow.length - 1 && (
                <span className="preview-workflow-line" aria-hidden="true" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

const StackSection: React.FC = () => {
  const reveal = useReveal();
  const layers = ["application", "compute", "network", "security", "data"];
  return (
    <section className="preview-section preview-stack-section">
      <div
        ref={reveal.ref}
        className={`preview-container preview-stack-layout ${reveal.className}`}
      >
        <div className="preview-stack-copy">
          <p className="preview-kicker">Infrastructure, composed</p>
          <h2>Every layer has a place.</h2>
          <p>
            Model the system as a connected set of resources, not a pile of
            disconnected variables. The visual language stays calm so the
            decisions remain legible.
          </p>
        </div>
        <div
          className="preview-stack"
          aria-label="Infrastructure layers"
          role="img"
        >
          {layers.map((layer, index) => (
            <div
              className={`preview-stack__layer preview-stack__layer--${index + 1}`}
              key={layer}
            >
              <span>{layer}</span>
              <i aria-hidden="true" />
            </div>
          ))}
          <span className="preview-stack__annotation">
            one model / many decisions
          </span>
        </div>
      </div>
    </section>
  );
};

const BenefitsSection: React.FC = () => {
  const reveal = useReveal();
  return (
    <section className="preview-section preview-benefits">
      <div ref={reveal.ref} className={`preview-container ${reveal.className}`}>
        <div className="preview-section-heading preview-section-heading--split">
          <div>
            <p className="preview-kicker">Why Orchestrator</p>
            <h2>Infrastructure that stays understandable.</h2>
          </div>
          <p>
            For teams that want reusable architecture without hiding the
            decisions inside an opaque deployment path.
          </p>
        </div>
        <div className="preview-benefit-grid">
          {benefits.map((benefit) => (
            <article className="preview-benefit" key={benefit.title}>
              <BenefitFigure kind={benefit.figure} />
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const FinalCta: React.FC<{
  onExplore: () => void;
  onStartMaestro: () => void;
}> = ({ onExplore, onStartMaestro }) => (
  <section className="preview-final-cta">
    <div className="preview-container preview-final-cta__inner">
      <div className="preview-final-cta__sculpture" aria-hidden="true">
        <span className="preview-final-cta__stone preview-final-cta__stone--one" />
        <span className="preview-final-cta__stone preview-final-cta__stone--two" />
        <span className="preview-final-cta__stone preview-final-cta__stone--three" />
      </div>
      <div>
        <p className="preview-kicker">Build once. Use everywhere.</p>
        <h2>A better first move for infrastructure.</h2>
        <p>
          Plan with Maestro or begin with a blueprint. Either way, leave with an
          artifact your team can inspect.
        </p>
        <div className="preview-actions">
          <button
            className="preview-button preview-button--primary"
            type="button"
            onClick={onStartMaestro}
          >
            Plan with Maestro <ArrowOutwardIcon fontSize="small" />
          </button>
          <button
            className="preview-button preview-button--quiet"
            type="button"
            onClick={onExplore}
          >
            Explore templates <NorthEastIcon fontSize="small" />
          </button>
        </div>
      </div>
    </div>
  </section>
);

const PreviewFooter: React.FC<{
  onExplore: () => void;
  onStartMaestro: () => void;
}> = ({ onExplore, onStartMaestro }) => (
  <footer className="preview-site-footer">
    <FinalCta onExplore={onExplore} onStartMaestro={onStartMaestro} />
    <div className="preview-footer">
      <div className="preview-container preview-footer__inner">
        <a className="preview-brand" href="#top">
          <img src="/one-color-teal-print.svg" alt="" aria-hidden="true" />
          <span>Orchestrator</span>
        </a>
        <a
          className="preview-footer__note"
          href="https://next-zen.dev/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Built by Next Zen
        </a>
      </div>
    </div>
  </footer>
);

const LandingPreviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isPrimaryRoute = location.pathname === "/";

  useEffect(() => {
    const previousTitle = document.title;
    const managedTags = [
      {
        selector: 'meta[name="description"]',
        attributes: { name: "description", content: PREVIEW_SEO.description },
      },
      {
        selector: 'meta[name="robots"]',
        attributes: {
          name: "robots",
          content: isPrimaryRoute ? "index, follow" : "noindex, follow",
        },
      },
      {
        selector: 'meta[property="og:title"]',
        attributes: { property: "og:title", content: PREVIEW_SEO.title },
      },
      {
        selector: 'meta[property="og:description"]',
        attributes: {
          property: "og:description",
          content: PREVIEW_SEO.description,
        },
      },
      {
        selector: 'meta[property="og:url"]',
        attributes: { property: "og:url", content: PREVIEW_SEO.url },
      },
      {
        selector: 'meta[property="og:type"]',
        attributes: { property: "og:type", content: "website" },
      },
      {
        selector: 'meta[property="og:site_name"]',
        attributes: { property: "og:site_name", content: "Orchestrator" },
      },
      {
        selector: 'meta[property="og:image"]',
        attributes: { property: "og:image", content: PREVIEW_SEO.image },
      },
      {
        selector: 'meta[property="og:image:width"]',
        attributes: { property: "og:image:width", content: "1200" },
      },
      {
        selector: 'meta[property="og:image:height"]',
        attributes: { property: "og:image:height", content: "630" },
      },
      {
        selector: 'meta[name="twitter:card"]',
        attributes: { name: "twitter:card", content: "summary_large_image" },
      },
      {
        selector: 'meta[name="twitter:title"]',
        attributes: { name: "twitter:title", content: PREVIEW_SEO.title },
      },
      {
        selector: 'meta[name="twitter:description"]',
        attributes: {
          name: "twitter:description",
          content: PREVIEW_SEO.description,
        },
      },
      {
        selector: 'meta[name="twitter:image"]',
        attributes: { name: "twitter:image", content: PREVIEW_SEO.image },
      },
    ];
    const previousAttributes = managedTags.map(({ selector, attributes }) => {
      const existing = document.querySelector(selector);
      const element = existing || document.createElement("meta");
      const previous = Object.keys(attributes).reduce<
        Record<string, string | null>
      >((values, attribute) => {
        values[attribute] = element.getAttribute(attribute);
        return values;
      }, {});

      Object.entries(attributes).forEach(([attribute, value]) => {
        element.setAttribute(attribute, value);
      });
      if (!existing) document.head.appendChild(element);

      return { element, previous, created: !existing };
    });
    const canonical =
      document.querySelector('link[rel="canonical"]') ||
      document.createElement("link");
    const previousCanonical = canonical.getAttribute("href");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", PREVIEW_SEO.url);
    if (!canonical.parentElement) document.head.appendChild(canonical);

    const structuredData =
      document.querySelector<HTMLScriptElement>(
        'script[data-seo="landing-preview"]',
      ) || document.createElement("script");
    const previousStructuredData = structuredData.textContent;
    if (isPrimaryRoute) {
      structuredData.type = "application/ld+json";
      structuredData.dataset.seo = "landing-preview";
      structuredData.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: PREVIEW_SEO.title,
        description: PREVIEW_SEO.description,
        url: PREVIEW_SEO.url,
        isPartOf: {
          "@type": "WebSite",
          name: "Orchestrator",
          url: SITE_URL,
        },
      });
      if (!structuredData.parentElement)
        document.head.appendChild(structuredData);
    } else if (structuredData.parentElement) {
      structuredData.remove();
    }

    document.title = PREVIEW_SEO.title;
    return () => {
      document.title = previousTitle;
      previousAttributes.forEach(({ element, previous, created }) => {
        if (created) {
          element.remove();
          return;
        }
        Object.entries(previous).forEach(([attribute, value]) => {
          if (value === null) element.removeAttribute(attribute);
          else element.setAttribute(attribute, value);
        });
      });
      if (previousCanonical === null || previousCanonical === undefined) {
        canonical.remove();
      } else {
        canonical.setAttribute("href", previousCanonical);
      }
      if (previousStructuredData === null) structuredData.remove();
      else structuredData.textContent = previousStructuredData;
    };
  }, [isPrimaryRoute]);

  const openTemplates = (template?: PreviewTemplate) => {
    if (template?.id) {
      navigate(`/templates/${template.id}`);
      return;
    }
    navigate("/templates");
  };

  const { token } = useAuth();
  const startWithMaestro = () => {
    const destination = "/home?maestro=open";
    if (token) navigate(destination);
    else navigate("/login", { state: { redirect: destination } });
  };

  return (
    <div className="landing-preview">
      <PreviewHeader onStartMaestro={startWithMaestro} />
      <main>
        <Hero
          onExplore={() => openTemplates()}
          onStartMaestro={startWithMaestro}
        />
        <ProviderStrip />
        <MaestroShowcase onStart={startWithMaestro} />
        <TemplatesSection onOpen={openTemplates} />
        <CodeInfrastructureSection />
        <WorkflowSection />
        <StackSection />
        <BenefitsSection />
      </main>
      <PreviewFooter
        onExplore={() => openTemplates()}
        onStartMaestro={startWithMaestro}
      />
    </div>
  );
};

export default LandingPreviewPage;
