import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@xyflow/react/dist/style.css";
import "./App.css";

import React, { lazy, Suspense, useEffect, useState } from "react";

import { Box } from "@mui/material";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { ThemeProvider } from "./components/shared/theme/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatLayoutProvider, useChatLayout } from "./context/ChatLayoutContext";
import { ProductGuidanceProvider } from "./components/shared/guidance/ProductGuidanceProvider";
import "./config/fontAwesome";

import Layout from "./components/shared/layout/Layout";
import Header from "./components/shared/header/Header";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import ChatbotLauncher from "./components/chatbot/ChatbotLauncher";

const Login = lazy(() => import("./components/auth/login/Login"));
const Home = lazy(() => import("./components/home/Home"));
const Resources = lazy(() => import("./components/resources/Resources"));
const Orchestrator = lazy(
  () => import("./components/orchestrator/Orchestrator"),
);
const Register = lazy(() => import("./components/auth/register/Register"));
const RegisterSuccessPage = lazy(
  () => import("./components/auth/register/RegisterSuccessPage"),
);
const Profile = lazy(() => import("./components/auth/profile/Profile"));
const ConfirmEmail = lazy(() => import("./components/auth/ConfirmEmail"));
const NotFound = lazy(() => import("./components/shared/NotFound"));
const ResendEmailForm = lazy(() => import("./components/auth/ResendEmailForm"));
const UpdatePassword = lazy(
  () => import("./components/auth/login/UpdatePassword"),
);
const Chatbot = lazy(() => import("./components/chatbot/Chatbot"));
const LandingPage = lazy(() => import("./components/landing/LandingPage"));
const LandingPreviewPage = lazy(
  () => import("./components/landing-preview/LandingPreviewPage"),
);
const TemplatesGallery = lazy(
  () => import("./components/templates/TemplatesGallery"),
);
const TemplateDetail = lazy(
  () => import("./components/templates/TemplateDetail"),
);
const ResourcesGallery = lazy(
  () => import("./components/resources/ResourcesGallery"),
);

const RouteLoadingFallback = () => (
  <Box
    sx={{
      minHeight: "240px",
      display: "grid",
      placeItems: "center",
      color: "text.secondary",
    }}
    role="status"
    aria-live="polite"
  >
    Loading workspace…
  </Box>
);

const ChatbotLoadingFallback = () => (
  <Box
    sx={{
      position: "fixed",
      right: { xs: 16, md: 24 },
      bottom: { xs: 86, md: 90 },
      width: { xs: "calc(100vw - 32px)", sm: 360, md: 560 },
      minHeight: 120,
      display: "grid",
      placeItems: "center",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 3,
      bgcolor: "background.paper",
      color: "text.secondary",
      boxShadow: 8,
      zIndex: 1299,
    }}
    role="status"
    aria-live="polite"
  >
    Loading Maestro…
  </Box>
);

const SITE_URL = "https://orchestrator.next-zen.dev";

const NO_HEADER_ROUTES = new Set([
  "/",
  "/login",
  "/register",
  "/register-success",
  "/confirm",
  "/email-verification/forgot",
  "/email-verification/verify",
  "/black-hole",
  "/update-password",
  "/landing-preview",
]);

const MAESTRO_DISABLED_ROUTES = new Set([
  "/",
  "/login",
  "/register",
  "/register-success",
  "/confirm",
  "/black-hole",
  "/update-password",
  "/landing-preview",
]);

const isMaestroDisabledRoute = (pathname: string) =>
  MAESTRO_DISABLED_ROUTES.has(pathname) ||
  pathname.startsWith("/email-verification/");

const PRIVATE_ROUTES = new Set([
  "/login",
  "/register",
  "/register-success",
  "/confirm",
  "/update-password",
  "/black-hole",
  "/profile",
  "/resources",
  "/home",
  "/dashboard",
  "/landing-legacy",
]);

const isPrivateSeoRoute = (pathname: string) =>
  PRIVATE_ROUTES.has(pathname) ||
  pathname.startsWith("/email-verification/") ||
  pathname.startsWith("/resources/") ||
  pathname.startsWith("/orchestrator/");

const upsertMetaTag = (
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

const AppShell: React.FC<{
  isSplitView: boolean;
  splitWidth: number;
  isDragging: boolean;
}> = ({ isSplitView, splitWidth, isDragging }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, isInitializing } = useAuth();
  const hideHeader = NO_HEADER_ROUTES.has(location.pathname);
  const isOrchestratorRoute =
    location.pathname === "/orchestrator" ||
    location.pathname.startsWith("/orchestrator/");
  const showChatbot =
    !isInitializing &&
    Boolean(token) &&
    !isMaestroDisabledRoute(location.pathname);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotLoaded, setChatbotLoaded] = useState(false);
  const { setSplitView } = useChatLayout();

  useEffect(() => {
    if (!showChatbot) {
      setChatbotOpen(false);
      setSplitView(false);
    }
  }, [setSplitView, showChatbot]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!showChatbot || params.get("maestro") !== "open") return;

    setChatbotLoaded(true);
    setChatbotOpen(true);
    params.delete("maestro");
    navigate(
      {
        pathname: location.pathname,
        search: params.toString() ? `?${params}` : "",
        hash: location.hash,
      },
      { replace: true, state: location.state },
    );
  }, [
    location.hash,
    location.pathname,
    location.search,
    location.state,
    navigate,
    showChatbot,
  ]);

  const handleChatbotToggle = () => {
    setChatbotLoaded(true);
    setChatbotOpen((current) => !current);
  };

  useEffect(() => {
    if (!isPrivateSeoRoute(location.pathname)) {
      return;
    }

    document.title = "Orchestrator";
    upsertMetaTag(
      'meta[name="robots"]',
      "meta",
      { name: "robots" },
      "content",
      "noindex, nofollow",
    );
    upsertMetaTag(
      'link[rel="canonical"]',
      "link",
      { rel: "canonical" },
      "href",
      `${SITE_URL}${location.pathname}`,
    );
  }, [location.pathname]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {!hideHeader && <Header fullWidth={isOrchestratorRoute} />}
      <Box sx={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
        <Box
          sx={{
            width: isSplitView ? `calc(100% - ${splitWidth}px)` : "100%",
            height: "100%",
            overflow: "auto",
            flexShrink: 0,
            transition: isDragging ? "none" : "width 0.2s ease",
          }}
        >
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<LandingPreviewPage />} />
                <Route
                  path="landing-preview"
                  element={<LandingPreviewPage />}
                />
                <Route
                  path="landing-legacy"
                  element={<LandingPage legacyMode />}
                />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route
                  path="register-success"
                  element={<RegisterSuccessPage />}
                />
                <Route path="confirm" element={<ConfirmEmail />} />
                <Route path="update-password" element={<UpdatePassword />} />
                <Route
                  path="email-verification/:type"
                  element={<ResendEmailForm />}
                />
                {/* Public template routes */}
                <Route path="templates" element={<TemplatesGallery />} />
                <Route path="templates/:id" element={<TemplateDetail />} />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="resources"
                  element={
                    <ProtectedRoute>
                      <ResourcesGallery />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="resources/:resource_id"
                  element={
                    <ProtectedRoute>
                      <Resources />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="orchestrator/:template_id"
                  element={
                    <ProtectedRoute>
                      <Orchestrator />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="home"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="*"
                  element={
                    <ProtectedRoute>
                      <NotFound />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </Suspense>
        </Box>
        {showChatbot && (
          <>
            <ChatbotLauncher
              openChat={chatbotOpen}
              onToggle={handleChatbotToggle}
            />
            {chatbotLoaded && (
              <Suspense fallback={<ChatbotLoadingFallback />}>
                <Chatbot
                  openChat={chatbotOpen}
                  onClose={() => setChatbotOpen(false)}
                />
              </Suspense>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

const AppLayout = () => {
  const { isSplitView, splitWidth, isDragging } = useChatLayout();

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ProductGuidanceProvider>
        <AppShell
          isSplitView={isSplitView}
          splitWidth={splitWidth}
          isDragging={isDragging}
        />
      </ProductGuidanceProvider>
    </BrowserRouter>
  );
};

const App = () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <ThemeProvider>
          <ChatLayoutProvider>
            <AppLayout />
          </ChatLayoutProvider>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
