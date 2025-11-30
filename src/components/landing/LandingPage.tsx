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
} from "@mui/icons-material";
import { FaAws, FaMicrosoft } from "react-icons/fa";
import { SiGooglecloud, SiAmazonec2 } from "react-icons/si";

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
            transform: "translateY(-20px) rotate(5deg)",
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
        backgroundImage: theme.palette.mode === "dark"
          ? `linear-gradient(${alpha(theme.palette.divider, 0.08)} 1px, transparent 1px),
             linear-gradient(90deg, ${alpha(theme.palette.divider, 0.08)} 1px, transparent 1px),
             linear-gradient(to bottom, ${theme.palette.background.default}, ${alpha(theme.palette.background.paper, 0.8)}),
             radial-gradient(ellipse at top, ${alpha(theme.palette.primary.main, 0.1)}, transparent),
             radial-gradient(ellipse at bottom, ${alpha(theme.palette.secondary.main, 0.08)}, transparent)`
          : `linear-gradient(${alpha(theme.palette.divider, 0.1)} 1px, transparent 1px),
             linear-gradient(90deg, ${alpha(theme.palette.divider, 0.1)} 1px, transparent 1px),
             linear-gradient(to bottom, ${theme.palette.background.default}, ${alpha(theme.palette.background.paper, 0.5)}),
             radial-gradient(ellipse at top, ${alpha(theme.palette.primary.main, 0.05)}, transparent),
             radial-gradient(ellipse at bottom, ${alpha(theme.palette.secondary.main, 0.03)}, transparent)`,
        backgroundSize: "60px 60px, 60px 60px, 100% 100%, 100% 100%, 100% 100%",
      }}
    >
      {/* Floating background icons - Cloud Providers & Services */}
      <FloatingIcon icon={<FaAws size={64} />} delay={0} duration={8} x="5%" y="10%" />
      <FloatingIcon icon={<FaMicrosoft size={64} />} delay={1} duration={9} x="15%" y="25%" />
      <FloatingIcon icon={<SiGooglecloud size={64} />} delay={2} duration={10} x="85%" y="15%" />
      <FloatingIcon icon={<SiAmazonec2 size={64} />} delay={3} duration={11} x="90%" y="30%" />
      <FloatingIcon icon={<DiagramIcon />} delay={1.5} duration={9} x="10%" y="70%" />
      <FloatingIcon icon={<StorageIcon />} delay={2.5} duration={10} x="80%" y="75%" />
      <FloatingIcon icon={<SecurityIcon />} delay={3} duration={11} x="90%" y="85%" />
      <FloatingIcon icon={<CodeIcon />} delay={0.5} duration={8} x="5%" y="85%" />

      <Box sx={{ position: "relative", overflow: "hidden" }}>
        {/* Hero Section - Centered Design */}
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ minHeight: { md: "90vh" }, py: { xs: 8, md: 12 }, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box sx={{ textAlign: "center", maxWidth: 900, mx: "auto" }}>
              <Box
                sx={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(30px)",
                  transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {/* Badge */}
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    px: 2.5,
                    py: 1,
                    mb: 4,
                    borderRadius: 50,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <BoltIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                  <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: theme.palette.text.primary }}>
                    Production-Ready Infrastructure as Code
                  </Typography>
                  <TrendingUpIcon sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
                </Box>

                {/* Main Heading */}
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "2.75rem", sm: "3.5rem", md: "4.5rem", lg: "5.5rem" },
                    fontWeight: 900,
                    lineHeight: 1.05,
                    mb: 3,
                    letterSpacing: "-0.04em",
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      background: `linear-gradient(120deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Build Cloud
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      color: theme.palette.text.primary,
                    }}
                  >
                    Infrastructure
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      color: alpha(theme.palette.text.secondary, 0.8),
                      fontSize: "0.6em",
                      fontWeight: 700,
                    }}
                  >
                    Visually, Instantly
                  </Box>
                </Typography>

                {/* Description */}
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: "1.1rem", md: "1.3rem" },
                    color: theme.palette.text.secondary,
                    lineHeight: 1.8,
                    mb: 5,
                  }}
                >
                  Drag, drop, and design cloud infrastructure with 75+ resources.
                  Export production-ready Terraform code in one click.
                </Typography>

                {/* CTA Buttons */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 5, justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/home")}
                    sx={{
                      px: 5,
                      py: 2.5,
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      borderRadius: 2,
                      textTransform: "none",
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      boxShadow: `0 10px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
                      "&:hover": {
                        boxShadow: `0 15px 50px ${alpha(theme.palette.primary.main, 0.4)}`,
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Start Building Free
                  </Button>
                  <Button
                    variant="text"
                    size="large"
                    startIcon={<PlayIcon />}
                    sx={{
                      px: 4,
                      py: 2.5,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      textTransform: "none",
                      color: theme.palette.text.primary,
                      "&:hover": {
                        background: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    Watch Demo
                  </Button>
                </Stack>

                {/* Stats */}
                <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap sx={{ justifyContent: "center" }}>
                  {[
                    { value: "75+", label: "Cloud Resources" },
                    { value: "1000+", label: "Active Users" },
                    { value: "5min", label: "Avg. Setup Time" },
                  ].map((stat, idx) => (
                    <Box key={idx}>
                      <Typography
                        sx={{
                          fontSize: "2rem",
                          fontWeight: 800,
                          color: theme.palette.primary.main,
                          lineHeight: 1,
                          mb: 0.5,
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.875rem",
                          color: theme.palette.text.secondary,
                          fontWeight: 500,
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

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
  );
};

export default LandingPage;
