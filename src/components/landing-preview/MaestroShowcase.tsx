import React, { useState } from "react";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import MaestroPlanFigure from "./MaestroPlanFigure";
import "./MaestroShowcase.css";

type MaestroShowcaseProps = {
  onStart: () => void;
};

const firstRequest =
  "Build a private API on AWS with background workers and a PostgreSQL database.";
const followUp = "Put a queue between the API and the workers.";

const MaestroShowcase: React.FC<MaestroShowcaseProps> = ({ onStart }) => {
  const [selectedRefined, setSelectedRefined] = useState(false);
  const [previewingRefinement, setPreviewingRefinement] = useState(false);
  const refined = selectedRefined || previewingRefinement;

  return (
    <section id="maestro" className="preview-section preview-maestro">
      <div className="preview-container">
        <div className="preview-maestro__intro">
          <div>
            <p className="preview-kicker">Meet Maestro</p>
            <h2>Describe the system. Review the plan.</h2>
          </div>
          <div className="preview-maestro__pitch">
            <p>
              Tell Maestro what you want to build. It turns your request into a
              structured infrastructure plan you can refine, then opens a draft
              in the visual canvas for your review.
            </p>
            <button
              className="preview-button preview-button--primary"
              type="button"
              onClick={onStart}
            >
              Plan with Maestro <ArrowOutwardIcon fontSize="small" />
            </button>
          </div>
        </div>

        <div className="preview-maestro__study">
          <div className="preview-maestro__plan">
            <div className="preview-maestro__plan-meta">
              <span className="preview-maestro__label">Maestro's plan</span>
              <span
                className="preview-maestro__count"
                aria-live="polite"
                aria-atomic="true"
              >
                {refined
                  ? previewingRefinement && !selectedRefined
                    ? "05 resources · previewing refinement"
                    : "05 resources · queue added"
                  : "04 resources · first draft"}
              </span>
            </div>
            <div
              className="preview-maestro__figure-hitbox"
              onPointerEnter={(event) => {
                if (
                  event.pointerType === "mouse" ||
                  event.pointerType === "pen"
                ) {
                  setPreviewingRefinement(true);
                }
              }}
              onPointerLeave={() => setPreviewingRefinement(false)}
            >
              <MaestroPlanFigure refined={refined} />
            </div>
            <p className="preview-maestro__mobile-route" aria-hidden="true">
              {refined
                ? "API service → SQS queue → Worker → RDS PostgreSQL"
                : "API service → Worker → RDS PostgreSQL"}
            </p>
            <div className="preview-maestro__handoff">
              <span
                aria-hidden="true"
                className="preview-maestro__handoff-line"
              />
              <span>
                {!selectedRefined && (
                  <span className="preview-maestro__hover-hint">
                    Hover the plan to preview the revision.{" "}
                    <span aria-hidden="true">· </span>
                  </span>
                )}
                Illustrative plan · open as a canvas draft and review before
                saving.
              </span>
            </div>
          </div>

          <div className="preview-maestro__annotation">
            <div className="preview-maestro__request">
              <span className="preview-maestro__label">Your request</span>
              <blockquote>{firstRequest}</blockquote>
            </div>
            <div className="preview-maestro__revision">
              <span className="preview-maestro__label">
                {refined ? "Then refine it" : "First plan"}
              </span>
              <p>
                {refined
                  ? followUp
                  : "A private network, an API, background work, and data."}
              </p>
            </div>
            <div
              className="preview-maestro__switch"
              role="group"
              aria-label="Illustrative plan state"
            >
              <button
                type="button"
                aria-pressed={!selectedRefined}
                onClick={() => setSelectedRefined(false)}
              >
                First plan
              </button>
              <button
                type="button"
                aria-pressed={selectedRefined}
                onClick={() => setSelectedRefined(true)}
              >
                After refinement
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MaestroShowcase;
