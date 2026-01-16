import React, { useEffect, useState } from "react";
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

const FloatingIcon: React.FC<FloatingIconProps> = ({ icon, delay, duration, x, y }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: "absolute",
        left: x,
        top: y,
        opacity: theme.palette.mode === "dark" ? 0.08 : 0.15,
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

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
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
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-8px)" : "translateY(0)",
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "16px",
          mb: 2,
          background: isHovered
            ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
            : alpha(theme.palette.primary.main, 0.1),
          color: isHovered ? "#fff" : theme.palette.primary.main,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isHovered ? "scale(1.1)" : "scale(1)",
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

const PathCard: React.FC<PathCardProps> = ({ emoji, title, description, action, onClick }) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        p: 4,
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        background: theme.palette.mode === "dark" 
          ? alpha(theme.palette.background.paper, 0.4)
          : alpha(theme.palette.background.paper, 0.8),
        backdropFilter: "blur(20px)",
        border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === "dark" ? 0.2 : 0.1)}`,
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered
          ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`
          : "none",
        "&:hover": {
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        },
      }}
    >
      <Typography sx={{ fontSize: "48px", mb: 2 }}>{emoji}</Typography>
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
        background: alpha(theme.palette.background.paper, 0.4),
        backdropFilter: "blur(10px)",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        height: "100%",
      }}
    >
      <Typography
        sx={{
          fontSize: "32px",
          color: theme.palette.primary.main,
          mb: 2,
          lineHeight: 1,
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

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: <DiagramIcon />,
      title: "Visual Architecture Design",
      description: "Drag-and-drop interface to design cloud infrastructure with 75+ AWS, Azure, and GCP components",
    },
    {
      icon: <LinkIcon />,
      title: "Smart Resource Linking",
      description: "Automatically link resources with intelligent connections and output references between modules",
    },
    {
      icon: <CodeIcon />,
      title: "Terraform Code Generation",
      description: "Generate production-ready Terraform IaC code directly from your visual designs in seconds",
    },
    {
      icon: <DownloadIcon />,
      title: "Export & Deploy",
      description: "Download complete Terraform bundles with proper module structure ready for deployment",
    },
    {
      icon: <VisibilityIcon />,
      title: "Real-time Preview",
      description: "See your infrastructure architecture in real-time as you build with instant visual feedback",
    },
    {
      icon: <SettingsIcon />,
      title: "Dynamic Configuration",
      description: "Configure resource properties with dynamic forms and validation for each cloud service",
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
      quote: "Finally, a tool that bridges the gap between visual design and infrastructure as code. Our team's productivity has doubled.",
      author: "Alex Thompson",
      role: "DevOps Lead, TechStart Inc",
    },
    {
      quote: "The visual canvas makes it so easy to plan complex architectures. Exporting to Terraform saves us hours of manual coding.",
      author: "Maria Garcia",
      role: "Cloud Architect, Enterprise Solutions",
    },
    {
      quote: "Perfect for teaching IaC concepts. Students can see the infrastructure visually while learning Terraform best practices.",
      author: "Dr. James Wilson",
      role: "Professor, Cloud Computing Lab",
    },
  ];

  const useCases = [
    {
      icon: <CloudIcon sx={{ fontSize: 40 }} />,
      title: "Multi-Cloud Infrastructure",
      description: "Design and deploy infrastructure across AWS, Azure, and GCP with seamless cross-cloud resource linking",
      examples: ["VPC Setup", "EKS Cluster", "Load Balancing"],
    },
    {
      icon: <ArchitectureIcon sx={{ fontSize: 40 }} />,
      title: "Complex Architectures",
      description: "Build sophisticated multi-tier applications with microservices, serverless functions, and managed databases",
      examples: ["API Gateway", "Lambda Functions", "RDS Instances"],
    },
    {
      icon: <AutoFixIcon sx={{ fontSize: 40 }} />,
      title: "Automated Workflows",
      description: "Streamline your DevOps with CI/CD pipelines, auto-scaling policies, and comprehensive monitoring",
      examples: ["Auto Scaling", "CloudWatch", "SNS Alerts"],
    },
  ];

  const workflow = [
    {
      number: "01",
      title: "Design Visually",
      description: "Drag and drop cloud resources onto the canvas. Connect them to define relationships.",
      icon: <DiagramIcon sx={{ fontSize: 40 }} />,
    },
    {
      number: "02",
      title: "Configure Properties",
      description: "Set resource properties, tags, and configurations using intuitive forms.",
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
    },
    {
      number: "03",
      title: "Generate Code",
      description: "Click generate to create production-ready Terraform code with proper module structure.",
      icon: <CodeIcon sx={{ fontSize: 40 }} />,
    },
    {
      number: "04",
      title: "Deploy",
      description: "Download the Terraform bundle and deploy to your cloud provider using terraform apply.",
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
          background: theme.palette.mode === "dark"
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
            backgroundImage: theme.palette.mode === "dark"
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
            background: theme.palette.mode === "dark"
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
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 70%)`,
            filter: "blur(60px)",
            opacity: theme.palette.mode === "dark" ? 0.6 : 0.4,
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
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.12)} 0%, transparent 70%)`,
            filter: "blur(60px)",
            opacity: theme.palette.mode === "dark" ? 0.5 : 0.3,
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
        <FloatingIcon icon={<SiAmazonec2 size={70} />} delay={0} duration={20} x="8%" y="5%" />
        <FloatingIcon icon={<VscAzure size={65} />} delay={2} duration={22} x="28%" y="8%" />
        <FloatingIcon icon={<SiGooglecloud size={65} />} delay={4} duration={24} x="45%" y="4%" />
        <FloatingIcon icon={<FaAws size={65} />} delay={6} duration={26} x="65%" y="7%" />
        <FloatingIcon icon={<FaDocker size={62} />} delay={8} duration={28} x="85%" y="9%" />

        {/* Second Row */}
        <FloatingIcon icon={<SiKubernetes size={60} />} delay={1} duration={23} x="5%" y="22%" />
        <FloatingIcon icon={<SecurityIcon />} delay={3} duration={25} x="20%" y="25%" />
        <FloatingIcon icon={<SiTerraform size={58} />} delay={5} duration={27} x="38%" y="23%" />
        <FloatingIcon icon={<SiAwselasticloadbalancing size={56} />} delay={7} duration={29} x="58%" y="24%" />
        <FloatingIcon icon={<DnsIcon />} delay={9} duration={21} x="78%" y="26%" />
        <FloatingIcon icon={<VscAzureDevops size={54} />} delay={11} duration={30} x="92%" y="22%" />
        
        {/* Third Row */}
        <FloatingIcon icon={<SiNginx size={52} />} delay={2} duration={26} x="10%" y="38%" />
        <FloatingIcon icon={<SiApachekafka size={50} />} delay={4} duration={28} x="30%" y="40%" />
        <FloatingIcon icon={<ServerIcon />} delay={6} duration={24} x="50%" y="39%" />
        <FloatingIcon icon={<SiAwsamplify size={48} />} delay={8} duration={22} x="70%" y="41%" />
        <FloatingIcon icon={<NetworkIcon />} delay={10} duration={25} x="88%" y="38%" />
        
        {/* Fourth Row */}
        <FloatingIcon icon={<SiAnsible size={56} />} delay={1.5} duration={27} x="6%" y="52%" />
        <FloatingIcon icon={<StorageIcon />} delay={3.5} duration={29} x="24%" y="55%" />
        <FloatingIcon icon={<DiagramIcon />} delay={5.5} duration={31} x="42%" y="53%" />
        <FloatingIcon icon={<SiAwslambda size={54} />} delay={7.5} duration={23} x="60%" y="54%" />
        <FloatingIcon icon={<MemoryIcon />} delay={9.5} duration={26} x="80%" y="56%" />
        
        {/* Fifth Row */}
        <FloatingIcon icon={<FaJenkins size={52} />} delay={2.5} duration={28} x="12%" y="68%" />
        <FloatingIcon icon={<DataIcon />} delay={4.5} duration={24} x="32%" y="70%" />
        <FloatingIcon icon={<SiPrometheus size={50} />} delay={6.5} duration={30} x="52%" y="69%" />
        <FloatingIcon icon={<ShieldIcon />} delay={8.5} duration={22} x="72%" y="71%" />
        <FloatingIcon icon={<SiGrafana size={48} />} delay={10.5} duration={25} x="90%" y="68%" />
        
        {/* Bottom Row */}
        <FloatingIcon icon={<SiPostgresql size={56} />} delay={3} duration={27} x="8%" y="82%" />
        <FloatingIcon icon={<SiMongodb size={54} />} delay={5} duration={29} x="28%" y="85%" />
        <FloatingIcon icon={<CodeIcon />} delay={7} duration={23} x="48%" y="83%" />
        <FloatingIcon icon={<SiRedis size={52} />} delay={9} duration={26} x="68%" y="86%" />
        <FloatingIcon icon={<SiElasticsearch size={50} />} delay={11} duration={28} x="88%" y="84%" />
        
        {/* Hero Section - Enhanced Modern Design */}
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ minHeight: { md: "95vh" }, py: { xs: 10, md: 14 }, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box sx={{ textAlign: "center", maxWidth: 1000, mx: "auto" }}>
              <Box
                sx={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(30px)",
                  transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {/* Enhanced Badge with Animation */}
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 3,
                    py: 1.25,
                    mb: 5,
                    borderRadius: 50,
                    background: theme.palette.mode === "dark"
                      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.secondary.main, 0.15)})`
                      : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main, 0.08)})`,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    backdropFilter: "blur(20px)",
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                    animation: "pulse 3s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%, 100%": {
                        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                      },
                      "50%": {
                        boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.25)}`,
                      },
                    },
                  }}
                >
                  <BoltIcon sx={{ fontSize: 22, color: theme.palette.primary.main }} />
                  <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: theme.palette.text.primary, letterSpacing: "0.01em" }}>
                    Production-Ready Infrastructure as Code
                  </Typography>
                  <Chip 
                    label="NEW" 
                    size="small" 
                    sx={{ 
                      height: 20, 
                      fontSize: "0.7rem", 
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                      color: "#fff",
                    }} 
                  />
                </Box>

                {/* Enhanced Main Heading with Better Gradient */}
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "3rem", sm: "4rem", md: "5rem", lg: "6.5rem" },
                    fontWeight: 900,
                    lineHeight: 1.1,
                    mb: 4,
                    letterSpacing: "-0.05em",
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      background: theme.palette.mode === "dark"
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
                    }}
                  >
                    Infrastructure
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: { xs: 1, sm: 1.5, md: 2 },
                      mt: 2,
                      fontSize: "0.45em",
                      fontWeight: 800,
                      color: theme.palette.text.secondary,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box component="span" sx={{ 
                      height: 3, 
                      width: { xs: 20, sm: 30, md: 40 }, 
                      background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main})`,
                      borderRadius: 2,
                      flexShrink: 0,
                    }} />
                    <Box component="span" sx={{ whiteSpace: "nowrap" }}>
                      Visually, Effortlessly, Instantly
                    </Box>
                    <Box component="span" sx={{ 
                      height: 3, 
                      width: { xs: 20, sm: 30, md: 40 }, 
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, transparent)`,
                      borderRadius: 2,
                      flexShrink: 0,
                    }} />
                  </Box>
                </Typography>

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
                  Design with <Box component="span" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>75+ cloud resources</Box> across AWS, Azure & GCP.
                  Generate <Box component="span" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>production-ready Terraform</Box> code instantly.
                </Typography>

                {/* Enhanced CTA Buttons */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ mb: 8, justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/home")}
                    startIcon={<DiagramIcon />}
                    sx={{
                      px: 6,
                      py: 3,
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      borderRadius: 3,
                      textTransform: "none",
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      boxShadow: `0 12px 50px ${alpha(theme.palette.primary.main, 0.4)}`,
                      position: "relative",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "100%",
                        height: "100%",
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                        transition: "left 0.5s",
                      },
                      "&:hover": {
                        boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.5)}`,
                        transform: "translateY(-4px) scale(1.02)",
                        "&::before": {
                          left: "100%",
                        },
                      },
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    Start Building Free
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PlayIcon />}
                    sx={{
                      px: 5,
                      py: 3,
                      fontSize: "1.15rem",
                      fontWeight: 600,
                      borderRadius: 3,
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
                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "center", 
                  gap: { xs: 3, md: 6 }, 
                  flexWrap: "wrap",
                  pt: 4,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}>
                  {[
                    { value: "75+", label: "Cloud Resources", icon: <CloudIcon sx={{ fontSize: 28 }} /> },
                    { value: "1000+", label: "Active Users", icon: <TrendingUpIcon sx={{ fontSize: 28 }} /> },
                    { value: "<5min", label: "Setup Time", icon: <BoltIcon sx={{ fontSize: 28 }} /> },
                  ].map((stat, idx) => (
                    <Box 
                      key={idx}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                        px: 3,
                        py: 2,
                        borderRadius: 2,
                        background: alpha(theme.palette.background.paper, 0.4),
                        backdropFilter: "blur(10px)",
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background: alpha(theme.palette.primary.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                          transform: "translateY(-4px)",
                        },
                      }}
                    >
                      <Box sx={{ color: theme.palette.primary.main }}>
                        {stat.icon}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: "2.5rem",
                          fontWeight: 900,
                          color: theme.palette.primary.main,
                          lineHeight: 1,
                          letterSpacing: "-0.02em",
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
                <Box sx={{ mt: 8, opacity: 0.6 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.text.secondary, 
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      mb: 3,
                      display: "block",
                    }}
                  >
                    Trusted by DevOps Teams Worldwide
                  </Typography>
                  <Stack 
                    direction="row" 
                    spacing={4} 
                    sx={{ 
                      justifyContent: "center", 
                      alignItems: "center",
                      opacity: 0.5,
                    }}
                  >
                    <FaAws size={40} />
                    <VscAzure size={36} />
                    <SiGooglecloud size={38} />
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
          <Box sx={{ py: { xs: 6, md: 10 } }}>
          <Typography
            variant="h2"
            sx={{
              textAlign: "center",
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "2.5rem" },
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

          <Grid container spacing={4}>
            {workflow.map((step, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: theme.palette.mode === "dark"
                      ? alpha(theme.palette.background.paper, 0.6)
                      : alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.2 : 0.1)}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: "center", flexGrow: 1 }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: alpha(theme.palette.primary.main, 0.5),
                      }}
                    >
                      {step.number}
                    </Typography>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
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
        <Box sx={{ py: { xs: 6, md: 10 } }}>
          <Typography
            variant="h2"
            sx={{
              textAlign: "center",
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "2.5rem" },
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

          <Grid container spacing={4}>
            {useCases.map((useCase, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: theme.palette.mode === "dark"
                      ? alpha(theme.palette.background.paper, 0.6)
                      : alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.2 : 0.1)}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
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
        <Box sx={{ py: { xs: 6, md: 10 } }}>
          <Typography
            variant="h2"
            sx={{
              textAlign: "center",
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "2.5rem" },
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
            Whether you're learning, building, or teaching — we've got you covered
          </Typography>

          <Grid container spacing={3}>
            {paths.map((path, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Box sx={{ height: "100%", py: 1 }}>
                  <PathCard {...path} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Powerful Features Section */}
        <Box sx={{ py: { xs: 6, md: 10 } }}>
          <Typography
            variant="h2"
            sx={{
              textAlign: "center",
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "2.5rem" },
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
            Everything you need to design, document, and share system architectures
          </Typography>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: theme.palette.mode === "dark"
                      ? alpha(theme.palette.background.paper, 0.6)
                      : alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.2 : 0.1)}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <FeatureCard {...feature} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Testimonials Section */}
        <Box sx={{ py: { xs: 6, md: 10 } }}>
          <Typography
            variant="h2"
            sx={{
              textAlign: "center",
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "2.5rem" },
              mb: 2,
              color: theme.palette.text.primary,
            }}
          >
            Loved by Designers Worldwide
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
            Join thousands who trust our platform for their cloud infrastructure needs
          </Typography>

          <Grid container spacing={3}>
            {testimonials.map((testimonial, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Testimonial {...testimonial} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Final CTA */}
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            textAlign: "center",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "2.5rem" },
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
            Join thousands of developers and architects who trust our platform for
            their cloud infrastructure needs
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/home")}
            sx={{
              px: 6,
              py: 2,
              fontSize: "1.2rem",
              fontWeight: 600,
              borderRadius: 2,
              textTransform: "none",
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
              "&:hover": {
                boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                transform: "translateY(-2px)",
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
          background: theme.palette.mode === "dark" 
            ? alpha(theme.palette.background.paper, 0.3)
            : "transparent",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary }}
          >
            © 2025 Cloud Orchestrator. Built with ❤️ for cloud architects
          </Typography>
        </Container>
      </Box>
    </Box>
    </Box>
  );
};

export default LandingPage;
