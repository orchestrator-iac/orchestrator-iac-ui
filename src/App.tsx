import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@xyflow/react/dist/style.css";
import "./App.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";

import { Box } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { ThemeProvider } from "./components/shared/theme/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ChatLayoutProvider, useChatLayout } from "./context/ChatLayoutContext";

import Home from "./components/home/Home";
import Resources from "./components/resources/Resources";
import Orchestrator from "./components/orchestrator/Orchestrator";
import Login from "./components/auth/login/Login";
import Register from "./components/auth/register/Register";
import RegisterSuccessPage from "./components/auth/register/RegisterSuccessPage";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import Layout from "./components/shared/layout/Layout";
import Profile from "./components/auth/profile/Profile";
import ConfirmEmail from "./components/auth/ConfirmEmail";
import NotFound from "./components/shared/NotFound";
import ResendEmailForm from "./components/auth/ResendEmailForm";
import NightSky from "./components/shared/night-sky/NightSky";
import UpdatePassword from "./components/auth/login/UpdatePassword";
import Chatbot from "./components/chatbot/Chatbot";
import LandingPage from "./components/landing/LandingPage";
import TemplatesGallery from "./components/templates/TemplatesGallery";
import TemplateDetail from "./components/templates/TemplateDetail";
import ResourcesGallery from "./components/resources/ResourcesGallery";

// Add FontAwesome icon packs
library.add(fab, fas);

const AppLayout = () => {
  const { isSplitView, splitWidth, isDragging } = useChatLayout();

  return (
    <BrowserRouter>
      <Box sx={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
        <Box
          sx={{
            width: isSplitView ? `calc(100% - ${splitWidth}px)` : "100%",
            height: "100%",
            overflow: "auto",
            flexShrink: 0,
            transition: isDragging ? "none" : "width 0.2s ease",
          }}
        >
          <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<LandingPage />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route
                  path="register-success"
                  element={<RegisterSuccessPage />}
                />
                <Route path="confirm" element={<ConfirmEmail />} />
                <Route path="night-sky" element={<NightSky />} />
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
        </Box>
        <Chatbot />
      </Box>
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
