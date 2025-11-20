import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@xyflow/react/dist/style.css";
import "./App.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { ThemeProvider } from "./components/shared/theme/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

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
import BlackHoleDemo from "./components/shared/black-hole/BlackHoleDemo";
import UpdatePassword from "./components/auth/login/UpdatePassword";
import Chatbot from './components/chatbot/Chatbot';

// Add FontAwesome icon packs
library.add(fab, fas);

const App = () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="register-success" element={<RegisterSuccessPage />} />
              <Route path="confirm" element={<ConfirmEmail />} />
              <Route path="night-sky" element={<NightSky />} />
              <Route path="black-hole" element={<BlackHoleDemo />} />
              <Route path="update-password" element={<UpdatePassword />} />
              <Route path="email-verification/:type" element={<ResendEmailForm />} />
              <Route path="profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="resources/:resource_id" element={
                <ProtectedRoute>
                  <Resources />
                </ProtectedRoute>
              } />
              <Route path="orchestrator/:template_id" element={
                <ProtectedRoute>
                  <Orchestrator />
                </ProtectedRoute>
              } />
              <Route path="home" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route index element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="*" element={
                <ProtectedRoute>
                  <NotFound />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
          <Chatbot />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
