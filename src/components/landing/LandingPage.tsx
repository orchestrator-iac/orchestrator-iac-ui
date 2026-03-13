import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  useTheme,
  alpha,
  Stack,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import {
  CloudQueue as CloudIcon,
  AccountTree as DiagramIcon,
  Code as CodeIcon,
  Architecture as ArchitectureIcon,
  AutoFixHigh as AutoFixIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Link as LinkIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Security as SecurityIcon,
  Bolt as BoltIcon,
  TrendingUp as TrendingUpIcon,
  Storage as StorageIcon,
  Dns as DnsIcon,
  NetworkCheck as NetworkIcon,
  Memory as MemoryIcon,
  DeveloperBoard as ServerIcon,
  DataObject as DataIcon,
  Shield as ShieldIcon,
} from "@mui/icons-material";
import { FaAws, FaDocker, FaJenkins } from "react-icons/fa";
import {
  SiGooglecloud,
  SiAmazonec2,
  SiKubernetes,
  SiTerraform,
  SiAnsible,
  SiPrometheus,
  SiGrafana,
  SiElasticsearch,
  SiRedis,
  SiPostgresql,
  SiMongodb,
  SiApachekafka,
  SiNginx,
  SiAwslambda,
  SiAwsamplify,
  SiAwselasticloadbalancing,
} from "react-icons/si";
import { VscAzure, VscAzureDevops } from "react-icons/vsc";

interface FloatingIconProps {
  icon: React.ReactNode;
  delay: number;
  duration: number;
  x: string;
  y: string;
}

const FloatingIcon: React.FC<FloatingIconProps> = ({
  icon,
  delay,
  duration,
  x,
  y,
}) => {
  const theme = useTheme();
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "absolute",
        left: x,
        top: y,
        opacity: theme.palette.mode === "dark" ? 0.14 : 0.25,
        fontSize: "64px",
        color: theme.palette.primary.main,
        animation: `float ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "@keyframes float": {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-10px) rotate(5deg)",
          },
        },
      }}
    >
      {icon}
    </Box>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "20px",
          mb: 2,
          background: isHovered
            ? theme.palette.primary.main
            : alpha(theme.palette.primary.main, 0.12),
          border: `2px solid ${isHovered ? "transparent" : alpha(theme.palette.primary.main, 0.3)}`,
          color: isHovered ? "#fff" : theme.palette.primary.main,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isHovered ? "scale(1.15)" : "scale(1)",
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          mb: 1,
          color: theme.palette.text.primary,
          fontSize: "1.1rem",
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          lineHeight: 1.7,
          fontSize: "0.95rem",
        }}
      >
        {description}
      </Typography>
    </Box>
  );
};

interface PathCardProps {
  emoji: string;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}

const PathCard: React.FC<PathCardProps> = ({
  emoji,
  title,
  description,
  action,
  onClick,
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={title}
      sx={{
        p: 4,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        background:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.background.paper, 0.4)
            : alpha(theme.palette.background.paper, 0.8),
        backdropFilter: "blur(20px)",
        border: `2px solid ${alpha(theme.palette.divider, theme.palette.mode === "dark" ? 0.3 : 0.15)}`,
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-8px)" : "translateY(0)",
        boxShadow: isHovered
          ? `0 16px 48px ${alpha(theme.palette.primary.main, 0.4)}`
          : `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
        "&:hover": {
          border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
        },
      }}
    >
      <Typography sx={{ fontSize: "64px", mb: 2, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}>{emoji}</Typography>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          mb: 2,
          color: theme.palette.text.primary,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.text.secondary,
          mb: 3,
          lineHeight: 1.8,
        }}
      >
        {description}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: theme.palette.primary.main,
          fontWeight: 600,
          fontSize: "0.95rem",
          transition: "gap 0.3s ease",
        }}
      >
        {action}
        <Box
          component="span"
          sx={{
            display: "inline-block",
            transition: "transform 0.3s ease",
            transform: isHovered ? "translateX(4px)" : "translateX(0)",
          }}
        >
          →
        </Box>
      </Box>
    </Box>
  );
};

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ quote, author, role }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 4,
        borderRadius: 3,
        background: alpha(theme.palette.background.paper, 0.6),
        backdropFilter: "blur(16px)",
        border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
        borderLeft: `4px solid ${theme.palette.primary.main}`,
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
        height: "100%",
      }}
    >
      <Typography
        sx={{
          fontSize: "56px",
          fontWeight: 900,
          color: theme.palette.primary.main,
          mb: -1,
          lineHeight: 1,
          opacity: 0.7,
        }}
      >
        "
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.text.secondary,
          mb: 3,
          lineHeight: 1.8,
          fontStyle: "italic",
        }}
      >
        {quote}
      </Typography>
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: theme.palette.text.primary }}
        >
          {author}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: theme.palette.text.secondary }}
        >
          {role}
        </Typography>
      </Box>
    </Box>
  );
};

const useInView = (threshold = 0.12) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const workflowView = useInView();
  const useCasesView = useInView();
  const pathsView = useInView();
  const featuresView = useInView();
  const testimonialsView = useInView();

  const features = [
    {
      icon: <DiagramIcon />,
      title: "Visual Architecture Design",
      description:
        "Drag-and-drop interface to design cloud infrastructure with 75+ AWS, Azure, and GCP components",
    },
    {
      icon: <LinkIcon />,
      title: "Smart Resource Linking",
      description:
        "Automatically link resources with intelligent connections and output references between modules",
    },
    {
      icon: <CodeIcon />,
      title: "Terraform Code Generation",
      description:
        "Generate production-ready Terraform IaC code directly from your visual designs in seconds",
    },
    {
      icon: <DownloadIcon />,
      title: "Export & Deploy",
      description:
        "Download complete Terraform bundles with proper module structure ready for deployment",
    },
    {
      icon: <VisibilityIcon />,
      title: "Real-time Preview",
      description:
        "See your infrastructure architecture in real-time as you build with instant visual feedback",
    },
    {
      icon: <SettingsIcon />,
      title: "Dynamic Configuration",
      description:
        "Configure resource properties with dynamic forms and validation for each cloud service",
    },
  ];

  const paths = [
    {
      emoji: "🎨",
      title: "Design Canvas",
      description:
        "Start from scratch with our visual canvas. Drag resources, connect them, configure properties, and watch your infrastructure come to life",
      action: "Open Canvas",
      onClick: () => navigate("/home"),
    },
    {
      emoji: "📦",
      title: "Browse Templates",
      description:
        "Explore pre-built infrastructure templates for common patterns like VPC setups, EKS clusters, or multi-tier applications",
      action: "View Templates",
      onClick: () => navigate("/home"),
    },
    {
      emoji: "⚡",
      title: "Quick Deploy",
      description:
        "Choose a template, customize it to your needs, generate Terraform code, and deploy to your cloud provider instantly",
      action: "Get Started",
      onClick: () => navigate("/register"),
    },
  ];

  const testimonials = [
    {
      quote:
        "Finally, a tool that bridges the gap between visual design and infrastructure as code. Our team's productivity has doubled.",
      author: "Alex Thompson",
      role: "DevOps Lead, TechStart Inc",
    },
    {
      quote:
        "The visual canvas makes it so easy to plan complex architectures. Exporting to Terraform saves us hours of manual coding.",
      author: "Maria Garcia",
      role: "Cloud Architect, Enterprise Solutions",
    },
    {
      quote:
        "Perfect for teaching IaC concepts. Students can see the infrastructure visually while learning Terraform best practices.",
      author: "Dr. James Wilson",
      role: "Professor, Cloud Computing Lab",
    },
  ];

  const useCases = [
    {
      icon: <CloudIcon sx={{ fontSize: 40 }} />,
      title: "Multi-Cloud Infrastructure",
      description:
        "Design and deploy infrastructure across AWS, Azure, and GCP with seamless cross-cloud resource linking",
      examples: ["VPC Setup", "EKS Cluster", "Load Balancing"],
    },
    {
      icon: <ArchitectureIcon sx={{ fontSize: 40 }} />,
      title: "Complex Architectures",
      description:
        "Build sophisticated multi-tier applications with microservices, serverless functions, and managed databases",
      examples: ["API Gateway", "Lambda Functions", "RDS Instances"],
    },
    {
      icon: <AutoFixIcon sx={{ fontSize: 40 }} />,
      title: "Automated Workflows",
      description:
        "Streamline your DevOps with CI/CD pipelines, auto-scaling policies, and comprehensive monitoring",
      examples: ["Auto Scaling", "CloudWatch", "SNS Alerts"],
    },
  ];

  const workflow = [
    {
      number: "01",
      title: "Design Visually",
      description:
        "Drag and drop cloud resources onto the canvas. Connect them to define relationships.",
      icon: <DiagramIcon sx={{ fontSize: 40 }} />,
    },
    {
      number: "02",
      title: "Configure Properties",
      description:
        "Set resource properties, tags, and configurations using intuitive forms.",
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
    },
    {
      number: "03",
      title: "Generate Code",
      description:
        "Click generate to create production-ready Terraform code with proper module structure.",
      icon: <CodeIcon sx={{ fontSize: 40 }} />,
    },
    {
      number: "04",
      title: "Deploy",
      description:
        "Download the Terraform bundle and deploy to your cloud provider using terraform apply.",
      icon: <PlayIcon sx={{ fontSize: 40 }} />,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: theme.palette.background.default,
      }}
    >
      {/* Enhanced Hero Background Section with Gradient Mesh */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background:
            theme.palette.mode === "dark"
              ? `
              radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 50%),
              radial-gradient(circle at 80% 40%, ${alpha(theme.palette.secondary.main, 0.12)} 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
              linear-gradient(135deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.main, 0.03)} 50%, ${theme.palette.background.default} 100%)
            `
              : `
              radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 50%),
              radial-gradient(circle at 80% 40%, ${alpha(theme.palette.secondary.main, 0.06)} 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
              linear-gradient(135deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.main, 0.02)} 50%, ${theme.palette.background.default} 100%)
            `,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              theme.palette.mode === "dark"
                ? `linear-gradient(${alpha(theme.palette.divider, 0.06)} 1px, transparent 1px),
                 linear-gradient(90deg, ${alpha(theme.palette.divider, 0.06)} 1px, transparent 1px)`
                : `linear-gradient(${alpha(theme.palette.divider, 0.08)} 1px, transparent 1px),
                 linear-gradient(90deg, ${alpha(theme.palette.divider, 0.08)} 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
            opacity: 0.5,
            pointerEvents: "none",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              theme.palette.mode === "dark"
                ? `linear-gradient(180deg, transparent 0%, ${alpha(theme.palette.background.default, 0.4)} 70%, ${theme.palette.background.default} 100%)`
                : `linear-gradient(180deg, transparent 0%, ${alpha(theme.palette.background.default, 0.6)} 70%, ${theme.palette.background.default} 100%)`,
            pointerEvents: "none",
          },
        }}
      >
        {/* Animated Gradient Orbs */}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.3)} 0%, transparent 70%)`,
            filter: "blur(60px)",
            opacity: theme.palette.mode === "dark" ? 0.9 : 0.65,
            animation: "float-slow 20s ease-in-out infinite",
            "@keyframes float-slow": {
              "0%, 100%": { transform: "translate(0, 0) scale(1)" },
              "33%": { transform: "translate(30px, -30px) scale(1.1)" },
              "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
            },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "20%",
            right: "10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.25)} 0%, transparent 70%)`,
            filter: "blur(60px)",
            opacity: theme.palette.mode === "dark" ? 0.8 : 0.55,
            animation: "float-slow 25s ease-in-out infinite reverse",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "10%",
            left: "40%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            filter: "blur(50px)",
            opacity: theme.palette.mode === "dark" ? 0.4 : 0.25,
            animation: "float-slow 18s ease-in-out infinite",
          }}
        />

        {/* Floating background icons - Cloud Providers & DevOps Tools */}
        {/* Top Row - Evenly Distributed */}
        <FloatingIcon
          icon={<SiAmazonec2 size={70} />}
          delay={0}
          duration={20}
          x="8%"
          y="5%"
        />
        <FloatingIcon
          icon={<VscAzure size={65} />}
          delay={2}
          duration={22}
          x="28%"
          y="8%"
        />
        <FloatingIcon
          icon={<SiGooglecloud size={65} />}
          delay={4}
          duration={24}
          x="45%"
          y="4%"
        />
        <FloatingIcon
          icon={<FaAws size={65} />}
          delay={6}
          duration={26}
          x="65%"
          y="7%"
        />
        <FloatingIcon
          icon={<FaDocker size={62} />}
          delay={8}
          duration={28}
          x="85%"
          y="9%"
        />

        {/* Second Row */}
        <FloatingIcon
          icon={<SiKubernetes size={60} />}
          delay={1}
          duration={23}
          x="5%"
          y="22%"
        />
        <FloatingIcon
          icon={<SecurityIcon />}
          delay={3}
          duration={25}
          x="20%"
          y="25%"
        />
        <FloatingIcon
          icon={<SiTerraform size={58} />}
          delay={5}
          duration={27}
          x="38%"
          y="23%"
        />
        <FloatingIcon
          icon={<SiAwselasticloadbalancing size={56} />}
          delay={7}
          duration={29}
          x="58%"
          y="24%"
        />
        <FloatingIcon
          icon={<DnsIcon />}
          delay={9}
          duration={21}
          x="78%"
          y="26%"
        />
        <FloatingIcon
          icon={<VscAzureDevops size={54} />}
          delay={11}
          duration={30}
          x="92%"
          y="22%"
        />

        {/* Third Row */}
        <FloatingIcon
          icon={<SiNginx size={52} />}
          delay={2}
          duration={26}
          x="10%"
          y="38%"
        />
        <FloatingIcon
          icon={<SiApachekafka size={50} />}
          delay={4}
          duration={28}
          x="30%"
          y="40%"
        />
        <FloatingIcon
          icon={<ServerIcon />}
          delay={6}
          duration={24}
          x="50%"
          y="39%"
        />
        <FloatingIcon
          icon={<SiAwsamplify size={48} />}
          delay={8}
          duration={22}
          x="70%"
          y="41%"
        />
        <FloatingIcon
          icon={<NetworkIcon />}
          delay={10}
          duration={25}
          x="88%"
          y="38%"
        />

        {/* Fourth Row */}
        <FloatingIcon
          icon={<SiAnsible size={56} />}
          delay={1.5}
          duration={27}
          x="6%"
          y="52%"
        />
        <FloatingIcon
          icon={<StorageIcon />}
          delay={3.5}
          duration={29}
          x="24%"
          y="55%"
        />
        <FloatingIcon
          icon={<DiagramIcon />}
          delay={5.5}
          duration={31}
          x="42%"
          y="53%"
        />
        <FloatingIcon
          icon={<SiAwslambda size={54} />}
          delay={7.5}
          duration={23}
          x="60%"
          y="54%"
        />
        <FloatingIcon
          icon={<MemoryIcon />}
          delay={9.5}
          duration={26}
          x="80%"
          y="56%"
        />

        {/* Fifth Row */}
        <FloatingIcon
          icon={<FaJenkins size={52} />}
          delay={2.5}
          duration={28}
          x="12%"
          y="68%"
        />
        <FloatingIcon
          icon={<DataIcon />}
          delay={4.5}
          duration={24}
          x="32%"
          y="70%"
        />
        <FloatingIcon
          icon={<SiPrometheus size={50} />}
          delay={6.5}
          duration={30}
          x="52%"
          y="69%"
        />
        <FloatingIcon
          icon={<ShieldIcon />}
          delay={8.5}
          duration={22}
          x="72%"
          y="71%"
        />
        <FloatingIcon
          icon={<SiGrafana size={48} />}
          delay={10.5}
          duration={25}
          x="90%"
          y="68%"
        />

        {/* Bottom Row */}
        <FloatingIcon
          icon={<SiPostgresql size={56} />}
          delay={3}
          duration={27}
          x="8%"
          y="82%"
        />
        <FloatingIcon
          icon={<SiMongodb size={54} />}
          delay={5}
          duration={29}
          x="28%"
          y="85%"
        />
        <FloatingIcon
          icon={<CodeIcon />}
          delay={7}
          duration={23}
          x="48%"
          y="83%"
        />
        <FloatingIcon
          icon={<SiRedis size={52} />}
          delay={9}
          duration={26}
          x="68%"
          y="86%"
        />
        <FloatingIcon
          icon={<SiElasticsearch size={50} />}
          delay={11}
          duration={28}
          x="88%"
          y="84%"
        />

        {/* Hero Section - Enhanced Modern Design */}
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              minHeight: { md: "95vh" },
              py: { xs: 4, md: 5 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box sx={{ textAlign: "center", maxWidth: 1000, mx: "auto" }}>
              <Box
                sx={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(30px)",
                  transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {/* Delightful Badge — animated gradient border + shimmer sweep */}
                <Box
                  sx={{
                    position: "relative",
                    display: "inline-flex",
                    mb: 5,
                    borderRadius: 50,
                    p: "2px",
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                    backgroundSize: "200% 200%",
                    animation: "badge-border 4s ease infinite",
                    boxShadow: `0 0 32px ${alpha(theme.palette.primary.main, 0.45)}, 0 0 64px ${alpha(theme.palette.primary.main, 0.2)}`,
                    "@keyframes badge-border": {
                      "0%, 100%": { backgroundPosition: "0% 50%" },
                      "50%": { backgroundPosition: "100% 50%" },
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 3,
                      py: 1.25,
                      borderRadius: 50,
                      background:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.background.default, 0.92)
                          : alpha(theme.palette.background.paper, 0.95),
                      backdropFilter: "blur(20px)",
                      position: "relative",
                      overflow: "hidden",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "55%",
                        height: "100%",
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
                        animation: "badge-shimmer 3.5s ease-in-out infinite",
                        "@keyframes badge-shimmer": {
                          "0%": { left: "-100%" },
                          "55%, 100%": { left: "210%" },
                        },
                      },
                    }}
                  >
                    <ArchitectureIcon
                      sx={{
                        fontSize: 22,
                        color: theme.palette.primary.main,
                        filter: `drop-shadow(0 0 6px ${alpha(theme.palette.primary.main, 0.9)})`,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        letterSpacing: "0.01em",
                      }}
                    >
                      Production-Ready Infrastructure as Code
                    </Typography>
                  </Box>
                </Box>

                {/* Enhanced Main Heading with Better Gradient */}
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: {
                      xs: "3.5rem",
                      sm: "5rem",
                      md: "6.5rem",
                      lg: "6.5rem",
                    },
                    fontWeight: 900,
                    lineHeight: 1,
                    mb: 4,
                    letterSpacing: "-0.06em",
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      background:
                        theme.palette.mode === "dark"
                          ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.primary.main} 100%)`
                          : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      backgroundSize: "200% auto",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      animation: "gradient-shift 6s ease infinite",
                      "@keyframes gradient-shift": {
                        "0%, 100%": { backgroundPosition: "0% 50%" },
                        "50%": { backgroundPosition: "100% 50%" },
                      },
                    }}
                  >
                    Design Cloud
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      color: theme.palette.text.primary,
                      mt: 1,
                      position: "relative",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: -14,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "40%",
                        height: 5,
                        borderRadius: 3,
                        background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main}, transparent)`,
                        boxShadow: `0 0 24px ${alpha(theme.palette.primary.main, 0.8)}, 0 0 48px ${alpha(theme.palette.primary.main, 0.4)}`,
                        animation: "heading-glow-line 3s ease-in-out infinite",
                        "@keyframes heading-glow-line": {
                          "0%, 100%": { opacity: 0.6, width: "35%" },
                          "50%": { opacity: 1, width: "58%" },
                        },
                      },
                    }}
                  >
                    Infrastructure
                  </Box>
                </Typography>

                {/* Delightful tagline — individually lit words */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: { xs: 2, sm: 3 },
                    mt: 3,
                    mb: 5,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontSize: { xs: "0.9rem", sm: "1rem", md: "1.15rem" },
                      fontWeight: 800,
                      color: theme.palette.primary.main,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      textShadow: `0 0 28px ${alpha(theme.palette.primary.main, 0.7)}`,
                    }}
                  >
                    Visually
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      color: alpha(theme.palette.primary.main, 0.45),
                      fontSize: "1.1rem",
                      lineHeight: 1,
                      userSelect: "none",
                    }}
                  >
                    ✦
                  </Box>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: { xs: "0.9rem", sm: "1rem", md: "1.15rem" },
                      fontWeight: 800,
                      color: theme.palette.secondary.main,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      textShadow: `0 0 28px ${alpha(theme.palette.secondary.main, 0.7)}`,
                    }}
                  >
                    Effortlessly
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      color: alpha(theme.palette.primary.main, 0.45),
                      fontSize: "1.1rem",
                      lineHeight: 1,
                      userSelect: "none",
                    }}
                  >
                    ✦
                  </Box>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: { xs: "0.9rem", sm: "1rem", md: "1.15rem" },
                      fontWeight: 800,
                      color: theme.palette.primary.light,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      textShadow: `0 0 28px ${alpha(theme.palette.primary.main, 0.6)}`,
                    }}
                  >
                    Instantly
                  </Typography>
                </Box>

                {/* Enhanced Description */}
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: "1.15rem", md: "1.4rem" },
                    color: theme.palette.text.secondary,
                    lineHeight: 1.8,
                    mb: 6,
                    maxWidth: 800,
                    mx: "auto",
                    fontWeight: 400,
                  }}
                >
                  Design with{" "}
                  <Box
                    component="span"
                    sx={{ fontWeight: 700, color: theme.palette.primary.main }}
                  >
                    75+ cloud resources
                  </Box>{" "}
                  across AWS, Azure & GCP. Generate{" "}
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.secondary.main,
                    }}
                  >
                    production-ready Terraform
                  </Box>{" "}
                  code instantly.
                </Typography>

                {/* Enhanced CTA Buttons */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={3}
                  sx={{ mb: 8, justifyContent: "center" }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/home")}
                    aria-label="Start Building Free — open the design canvas"
                    startIcon={<DiagramIcon aria-hidden="true" />}
                    sx={{
                      px: 5,
                      py: 1.75,
                      fontSize: "1rem",
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: "none",
                      background: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                      "&:hover": {
                        background: theme.palette.primary.dark,
                        boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                        transform: "translateY(-1px)",
                      },
                      "&:active": {
                        transform: "scale(0.98)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Start Building Free
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    aria-label="Watch a product demo"
                    startIcon={<PlayIcon aria-hidden="true" />}
                    sx={{
                      px: 5,
                      py: 1.75,
                      fontSize: "1rem",
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: "none",
                      color: theme.palette.text.primary,
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      borderWidth: 2,
                      background: alpha(theme.palette.background.paper, 0.5),
                      backdropFilter: "blur(10px)",
                      "&:hover": {
                        background: alpha(theme.palette.primary.main, 0.1),
                        borderColor: theme.palette.primary.main,
                        borderWidth: 2,
                        transform: "translateY(-2px)",
                        boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Watch Demo
                  </Button>
                </Stack>

                {/* Enhanced Stats with Icons */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: { xs: 3, md: 6 },
                    flexWrap: "wrap",
                    pt: 4,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  {[
                    {
                      value: "75+",
                      label: "Cloud Resources",
                      icon: <CloudIcon sx={{ fontSize: 28 }} />,
                    },
                    {
                      value: "1000+",
                      label: "Active Users",
                      icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
                    },
                    {
                      value: "<5min",
                      label: "Setup Time",
                      icon: <BoltIcon sx={{ fontSize: 28 }} />,
                    },
                  ].map((stat, idx) => (
                    <Box
                      key={idx}
                      aria-label={`${stat.value} ${stat.label}`}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                        px: 4,
                        py: 3,
                        borderRadius: 3,
                        background:
                          theme.palette.mode === "dark"
                            ? alpha(theme.palette.background.paper, 0.55)
                            : alpha(theme.palette.background.paper, 0.85),
                        backdropFilter: "blur(16px)",
                        boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.28)}, 0 8px 32px ${alpha(theme.palette.primary.main, 0.12)}`,
                        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          background: alpha(theme.palette.primary.main, 0.08),
                          boxShadow: `0 0 0 2px ${theme.palette.primary.main}, 0 16px 48px ${alpha(theme.palette.primary.main, 0.35)}`,
                          transform: "translateY(-10px)",
                        },
                      }}
                    >
                      <Box sx={{ color: theme.palette.primary.main }} aria-hidden="true">
                        {stat.icon}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: "3.5rem",
                          fontWeight: 900,
                          color: theme.palette.primary.main,
                          lineHeight: 1,
                          letterSpacing: "-0.03em",
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.9rem",
                          color: theme.palette.text.secondary,
                          fontWeight: 600,
                          textAlign: "center",
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Trusted By Section */}
                <Box sx={{ mt: 8 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: alpha(theme.palette.text.secondary, 0.65),
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      mb: 3,
                      display: "block",
                    }}
                  >
                    Trusted by DevOps Teams Worldwide
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      justifyContent: "center",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    {[
                      { icon: <FaAws size={36} />, label: "AWS" },
                      { icon: <VscAzure size={32} />, label: "Azure" },
                      { icon: <SiGooglecloud size={34} />, label: "GCP" },
                    ].map(({ icon, label }) => (
                      <Box
                        key={label}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 0.75,
                          px: 3,
                          py: 1.5,
                          borderRadius: 2,
                          background: alpha(theme.palette.background.paper, 0.5),
                          border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                          backdropFilter: "blur(8px)",
                          color: alpha(theme.palette.text.primary, 0.45),
                          transition: "all 0.3s ease",
                          "&:hover": {
                            color: theme.palette.primary.main,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                            background: alpha(theme.palette.primary.main, 0.05),
                            transform: "translateY(-3px)",
                            boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
                          },
                        }}
                      >
                        {icon}
                        <Typography
                          sx={{
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                          }}
                        >
                          {label}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>

        {/* Decorative Wave Separator */}
        <Box
          sx={{
            position: "absolute",
            bottom: -2,
            left: 0,
            width: "100%",
            overflow: "hidden",
            lineHeight: 0,
            transform: "rotate(180deg)",
          }}
        >
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            style={{
              position: "relative",
              display: "block",
              width: "calc(100% + 1.3px)",
              height: "80px",
            }}
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              fill={theme.palette.background.default}
            />
          </svg>
        </Box>
      </Box>

      {/* Main Content Area with Different Background */}
      <Box
        sx={{
          background: theme.palette.background.default,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          {/* How It Works Section */}
          <Box component="section" aria-labelledby="how-it-works-heading" sx={{ py: { xs: 6, md: 10 } }}>
            <Typography
              id="how-it-works-heading"
              variant="h2"
              sx={{
                textAlign: "center",
                fontWeight: 900,
                fontSize: { xs: "2.4rem", md: "3.2rem" },
                mb: 2,
                color: theme.palette.text.primary,
              }}
            >
              How It Works
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: "center",
                color: theme.palette.text.secondary,
                mb: 6,
                maxWidth: 600,
                mx: "auto",
                fontSize: "1.1rem",
              }}
            >
              From design to deployment in four simple steps
            </Typography>

            <Grid container spacing={4} ref={workflowView.ref}>
              {workflow.map((step, index) => (
                <Grid
                  size={{ xs: 12, sm: 6, md: 3 }}
                  key={index}
                  sx={{
                    opacity: workflowView.inView ? 1 : 0,
                    transform: workflowView.inView ? "none" : "translateY(28px)",
                    transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
                  }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      background:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.background.paper, 0.6)
                          : alpha(theme.palette.background.paper, 0.9),
                      backdropFilter: "blur(20px)",
                      border: `2px solid ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.25 : 0.15)}`,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-12px)",
                        boxShadow: `0 20px 56px ${alpha(theme.palette.primary.main, 0.35)}`,
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                      },
                    }}
                  >
                    <CardContent
                      sx={{ p: 4, textAlign: "center", flexGrow: 1 }}
                    >
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 900,
                          mb: 2,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {step.number}
                      </Typography>
                      <Box
                        sx={{
                          width: 96,
                          height: 96,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(theme.palette.secondary.main, 0.3)})`,
                          border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                          color: theme.palette.primary.main,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mx: "auto",
                          mb: 3,
                        }}
                      >
                        {step.icon}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                        }}
                      >
                        {step.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: alpha(theme.palette.text.primary, 0.7),
                        }}
                      >
                        {step.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Use Cases Section */}
          <Box component="section" aria-labelledby="use-cases-heading" sx={{ py: { xs: 6, md: 10 } }}>
            <Typography
              id="use-cases-heading"
              variant="h2"
              sx={{
                textAlign: "center",
                fontWeight: 900,
                fontSize: { xs: "2.4rem", md: "3.2rem" },
                mb: 2,
                color: theme.palette.text.primary,
              }}
            >
              Perfect For
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: "center",
                color: theme.palette.text.secondary,
                mb: 6,
                maxWidth: 600,
                mx: "auto",
                fontSize: "1.1rem",
              }}
            >
              Whether you're a startup or enterprise, we've got you covered
            </Typography>

            <Grid container spacing={4} ref={useCasesView.ref}>
              {useCases.map((useCase, index) => (
                <Grid
                  size={{ xs: 12, md: 4 }}
                  key={index}
                  sx={{
                    opacity: useCasesView.inView ? 1 : 0,
                    transform: useCasesView.inView ? "none" : "translateY(28px)",
                    transition: `opacity 0.5s ease ${index * 0.12}s, transform 0.5s ease ${index * 0.12}s`,
                  }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      background:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.background.paper, 0.6)
                          : alpha(theme.palette.background.paper, 0.9),
                      backdropFilter: "blur(20px)",
                      border: `2px solid ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.25 : 0.15)}`,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-12px)",
                        boxShadow: `0 20px 56px ${alpha(theme.palette.primary.main, 0.35)}`,
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 4,
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          width: 76,
                          height: 76,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(theme.palette.secondary.main, 0.3)})`,
                          border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                          color: theme.palette.primary.main,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 3,
                        }}
                      >
                        {useCase.icon}
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                        }}
                      >
                        {useCase.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: alpha(theme.palette.text.primary, 0.7),
                          mb: 3,
                        }}
                      >
                        {useCase.description}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {useCase.examples.map((example, idx) => (
                          <Chip
                            key={idx}
                            label={example}
                            size="small"
                            sx={{
                              background: alpha(theme.palette.primary.main, 0.1),
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                              color: theme.palette.primary.main,
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Choose Your Path Section */}
          <Box component="section" aria-labelledby="choose-path-heading" sx={{ py: { xs: 6, md: 10 } }}>
            <Typography
              id="choose-path-heading"
              variant="h2"
              sx={{
                textAlign: "center",
                fontWeight: 900,
                fontSize: { xs: "2.4rem", md: "3.2rem" },
                mb: 2,
                color: theme.palette.text.primary,
              }}
            >
              Choose Your Path
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: "center",
                color: theme.palette.text.secondary,
                mb: 6,
                maxWidth: 600,
                mx: "auto",
                fontSize: "1.1rem",
              }}
            >
              Whether you're learning, building, or teaching — we've got you
              covered
            </Typography>

            <Grid container spacing={4} ref={pathsView.ref}>
              {paths.map((path, index) => (
                <Grid
                  size={{ xs: 12, md: 4 }}
                  key={index}
                  sx={{
                    opacity: pathsView.inView ? 1 : 0,
                    transform: pathsView.inView ? "none" : "translateY(28px)",
                    transition: `opacity 0.5s ease ${index * 0.12}s, transform 0.5s ease ${index * 0.12}s`,
                  }}
                >
                  <Box sx={{ height: "100%", py: 1 }}>
                    <PathCard {...path} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Powerful Features Section */}
          <Box component="section" aria-labelledby="features-heading" sx={{ py: { xs: 6, md: 10 } }}>
            <Typography
              id="features-heading"
              variant="h2"
              sx={{
                textAlign: "center",
                fontWeight: 900,
                fontSize: { xs: "2.4rem", md: "3.2rem" },
                mb: 2,
                color: theme.palette.text.primary,
              }}
            >
              Powerful Features
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: "center",
                color: theme.palette.text.secondary,
                mb: 6,
                maxWidth: 600,
                mx: "auto",
                fontSize: "1.1rem",
              }}
            >
              Everything you need to design, document, and share system
              architectures
            </Typography>

            <Grid container spacing={4} ref={featuresView.ref}>
              {features.map((feature, index) => (
                <Grid
                  size={{ xs: 12, sm: 6, md: 4 }}
                  key={index}
                  sx={{
                    opacity: featuresView.inView ? 1 : 0,
                    transform: featuresView.inView ? "none" : "translateY(28px)",
                    transition: `opacity 0.5s ease ${index * 0.08}s, transform 0.5s ease ${index * 0.08}s`,
                  }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      background:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.background.paper, 0.6)
                          : alpha(theme.palette.background.paper, 0.9),
                      backdropFilter: "blur(20px)",
                      border: `2px solid ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.25 : 0.15)}`,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-12px)",
                        boxShadow: `0 20px 56px ${alpha(theme.palette.primary.main, 0.35)}`,
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        p: "0 !important",
                      }}
                    >
                      <FeatureCard {...feature} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Testimonials Section */}
          <Box component="section" aria-labelledby="testimonials-heading" sx={{ py: { xs: 6, md: 10 } }}>
            <Typography
              id="testimonials-heading"
              variant="h2"
              sx={{
                textAlign: "center",
                fontWeight: 900,
                fontSize: { xs: "2.4rem", md: "3.2rem" },
                mb: 2,
                color: theme.palette.text.primary,
              }}
            >
              Loved by Cloud Teams Worldwide
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: "center",
                color: theme.palette.text.secondary,
                mb: 6,
                maxWidth: 600,
                mx: "auto",
                fontSize: "1.1rem",
              }}
            >
              Join thousands who trust our platform for their cloud
              infrastructure needs
            </Typography>

            <Grid container spacing={4} ref={testimonialsView.ref}>
              {testimonials.map((testimonial, index) => (
                <Grid
                  size={{ xs: 12, md: 4 }}
                  key={index}
                  sx={{
                    opacity: testimonialsView.inView ? 1 : 0,
                    transform: testimonialsView.inView ? "none" : "translateY(28px)",
                    transition: `opacity 0.5s ease ${index * 0.15}s, transform 0.5s ease ${index * 0.15}s`,
                  }}
                >
                  <Testimonial {...testimonial} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Final CTA */}
          <Box
            component="section"
            aria-labelledby="final-cta-heading"
            sx={{
              py: { xs: 8, md: 12 },
              textAlign: "center",
            }}
          >
            <Typography
              id="final-cta-heading"
              variant="h2"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "2.6rem", md: "3.5rem" },
                mb: 2,
                color: theme.palette.text.primary,
              }}
            >
              Ready to Start Designing?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                mb: 4,
                maxWidth: 600,
                mx: "auto",
                fontWeight: 400,
                lineHeight: 1.7,
              }}
            >
              Join thousands of developers and architects who trust our platform
              for their cloud infrastructure needs
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/home")}
              aria-label="Launch free canvas — start designing your infrastructure"
              sx={{
                px: 8,
                py: 2.5,
                fontSize: "1.3rem",
                fontWeight: 700,
                borderRadius: 3,
                textTransform: "none",
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.45)}`,
                "&:hover": {
                  boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.6)}`,
                  transform: "translateY(-4px) scale(1.02)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Launch Free Canvas
            </Button>
          </Box>
        </Container>

        {/* Footer */}
        <Box
          sx={{
            borderTop: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === "dark" ? 0.2 : 0.1)}`,
            py: 4,
            textAlign: "center",
            background:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.background.paper, 0.3)
                : "transparent",
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              © 2026 Cloud Orchestrator. Built with ❤️ for cloud architects
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default LandingPage;
