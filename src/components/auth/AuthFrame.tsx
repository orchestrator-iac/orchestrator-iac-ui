import React, { type ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import MinimalThemeToggle from "../shared/theme/MinimalThemeToggle";
import BrandLockup from "../shared/brand/BrandLockup";
import "./AuthFrame.css";

type AuthFrameProps = {
  children: ReactNode;
  mode: "login" | "register" | "recovery";
  title: string;
  description: string;
  alternatePrompt: string;
  alternateLabel: string;
  alternateTo: string;
};

const authFormLabels = {
  login: "Return to your workspace",
  register: "Start with a blueprint",
  recovery: "Keep your workspace secure",
} as const;

const AuthSystemDiagram: React.FC = () => (
  <div className="auth-diagram" aria-hidden="true">
    <svg className="auth-diagram__lines" viewBox="0 0 520 250" fill="none">
      <path d="M108 78C168 78 169 152 228 152" />
      <path d="M292 152C351 152 351 78 412 78" />
      <circle cx="108" cy="78" r="4" />
      <circle cx="260" cy="152" r="4" />
      <circle cx="412" cy="78" r="4" />
    </svg>
    <div className="auth-diagram__node auth-diagram__node--template">
      <span className="auth-diagram__node-mark" />
      <span>Template</span>
      <small>start with a shape</small>
    </div>
    <div className="auth-diagram__node auth-diagram__node--canvas">
      <span className="auth-diagram__node-mark" />
      <span>Canvas</span>
      <small>keep the links visible</small>
    </div>
    <div className="auth-diagram__node auth-diagram__node--terraform">
      <span className="auth-diagram__node-mark" />
      <span>Terraform</span>
      <small>leave with reviewable code</small>
    </div>
  </div>
);

const AuthFrame: React.FC<AuthFrameProps> = ({
  children,
  mode,
  title,
  description,
  alternatePrompt,
  alternateLabel,
  alternateTo,
}) => (
  <div className={`auth-shell auth-shell--${mode}`}>
    <aside className="auth-rail">
      <div className="auth-rail__topline">
        <RouterLink
          className="auth-brand"
          to="/"
          aria-label="Orchestrator home"
        >
          <BrandLockup />
        </RouterLink>
      </div>

      <div className="auth-rail__content">
        <p className="auth-rail__label">A clearer way into infrastructure</p>
        <h2>Keep the decisions visible.</h2>
        <p className="auth-rail__copy">
          Start with a reusable cloud template, shape the architecture visually,
          and export Terraform your team can review.
        </p>
        <AuthSystemDiagram />
      </div>

      <div className="auth-rail__footer">
        <span>Templates</span>
        <span>Visual graph</span>
        <span>Terraform export</span>
      </div>
    </aside>

    <main className="auth-form-column">
      <div className="auth-form-column__topline">
        <MinimalThemeToggle size="small" />
      </div>

      <section className="auth-form-surface" aria-labelledby="auth-form-title">
        <div className="auth-form-header">
          <p className="auth-form-header__label">{authFormLabels[mode]}</p>
          <h1 id="auth-form-title">{title}</h1>
          <p>{description}</p>
        </div>
        {children}
        <p className="auth-form-switch">
          {alternatePrompt}{" "}
          <RouterLink to={alternateTo}>{alternateLabel}</RouterLink>
        </p>
      </section>
    </main>
  </div>
);

export default AuthFrame;
