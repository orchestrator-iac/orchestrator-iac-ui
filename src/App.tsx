import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@xyflow/react/dist/style.css";
import "./App.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

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


// Add FontAwesome icon packs
library.add(fab, fas);

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/register-success",
        element: <RegisterSuccessPage />,
      },
      {
        path: "/confirm",
        element: <ConfirmEmail />,
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/resources/:resource_id",
        element: (
          <ProtectedRoute>
            <Resources />
          </ProtectedRoute>
        ),
      },
      {
        path: "/orchestrator/:template_id",
        element: (
          <ProtectedRoute>
            <Orchestrator />
          </ProtectedRoute>
        ),
      },
      {
        path: "/home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "/",
        element: <Home />,
      },
    ],
  },
]);

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
