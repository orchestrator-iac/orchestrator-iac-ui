import React from "react";
import "./TemplateBlueprintFigure.css";
import "./WorkflowCompanionFigures.css";

const GroundGrid: React.FC = () => (
  <g className="template-blueprint__ground">
    <path d="m14 316 285 147 287-145M15 353l285 146 286-145M75 285l285 147M137 255l285 147M199 225l285 147" />
    <path d="m70 398 288-145M128 428l288-145M187 458l288-145M245 487l288-145" />
  </g>
);

const ResourceBlock: React.FC<{
  x: number;
  y: number;
  scale?: number;
  highlighted?: boolean;
}> = ({ x, y, scale = 1, highlighted = false }) => (
  <g
    className={`workflow-figure__resource${highlighted ? " workflow-figure__resource--highlight" : ""}`}
    transform={`translate(${x} ${y}) scale(${scale})`}
  >
    <path
      className="workflow-figure__resource-left"
      d="M-40 0 0 21v34L-40 34Z"
    />
    <path className="workflow-figure__resource-right" d="M0 21 40 0v34L0 55Z" />
    <path
      className="workflow-figure__resource-top"
      d="M-40 0 0-21 40 0 0 21Z"
    />
    <path
      className="workflow-figure__fine"
      d="m-30-1 30-15 30 15M-25 27l17 8M13 34l16-8"
    />
  </g>
);

const ConfigureResourcesFigure: React.FC = () => (
  <div
    className="template-blueprint workflow-figure workflow-figure--configure"
    role="img"
    aria-label="Isometric architecture board with connected resources and one raised, highlighted resource"
  >
    <svg viewBox="0 0 600 460" aria-hidden="true" focusable="false">
      <GroundGrid />
      <path
        className="workflow-figure__board-side"
        d="M34 278 300 412 565 278v34L300 446 34 312Z"
      />
      <path
        className="workflow-figure__board-top"
        d="M34 278 300 146 565 278 300 412Z"
      />
      <path
        className="workflow-figure__board-crease"
        d="M50 278 300 155 549 278 300 402ZM300 412v34"
      />
      <g className="workflow-figure__board-grid">
        <path d="m89 278 211-105 212 105-212 107ZM143 278l157-77 157 77-157 78ZM198 278l102-50 103 50-103 52Z" />
        <path d="m120 236 362 183M174 209l362 184M68 304l364-181M120 330l364-181" />
      </g>
      <g className="workflow-figure__wires">
        <path d="m126 276 79 41 87-44 81 40 98-48M212 224l85 43 79-40M300 344l-1-54" />
        <path
          className="workflow-figure__wire--highlight"
          d="m126 276 79 41 87-44 81 40M297 267l79-40"
        />
      </g>
      <g className="workflow-figure__ports">
        <circle cx="205" cy="317" r="3" />
        <circle cx="292" cy="273" r="3" />
        <circle cx="373" cy="313" r="3" />
        <circle cx="376" cy="227" r="3" />
        <circle cx="299" cy="344" r="3" />
      </g>
      <g className="workflow-figure__database">
        <path
          className="workflow-figure__resource-left"
          d="M85 254v40c0 15 71 15 71 0v-40"
        />
        <ellipse
          className="workflow-figure__resource-top"
          cx="120.5"
          cy="254"
          rx="35.5"
          ry="15"
        />
        <path
          className="workflow-figure__fine"
          d="M85 267c0 15 71 15 71 0M85 282c0 15 71 15 71 0"
        />
      </g>
      <ResourceBlock x={212} y={217} scale={0.71} />
      <ResourceBlock x={449} y={252} scale={0.79} />
      <path
        className="workflow-figure__socket-side"
        d="m254 301 46 24 46-24v24l-46 24-46-24Z"
      />
      <path
        className="workflow-figure__socket-top"
        d="m254 301 46-24 46 24-46 24Z"
      />
      <path
        className="workflow-figure__socket-core"
        d="m270 301 30-16 30 16-30 16Z"
      />
      <ResourceBlock x={307} y={379} scale={0.87} />
      <path
        className="workflow-figure__lift-tether"
        d="M300 277V119M340 277V119"
      />
      <g className="workflow-figure__lift">
        <ResourceBlock x={320} y={92} scale={1.4} highlighted />
      </g>
    </svg>
  </div>
);

const ReviewOutputFigure: React.FC = () => (
  <div
    className="template-blueprint workflow-figure workflow-figure--review"
    role="img"
    aria-label="Angled terminal reviewing generated Terraform, with a highlighted warning line and a ready output line"
  >
    <svg viewBox="0 0 600 460" aria-hidden="true" focusable="false">
      <g
        transform="matrix(1 -.25 0 1 133 143)"
        className="workflow-figure__terminal"
      >
        <rect
          className="workflow-figure__terminal-back"
          x="-9"
          y="-8"
          width="340"
          height="300"
          rx="15"
        />
        <path
          className="workflow-figure__terminal-side"
          d="M0 0-9-8v300l9 8Z"
        />
        <rect
          className="workflow-figure__terminal-face"
          width="340"
          height="300"
          rx="15"
        />
        <path
          className="workflow-figure__terminal-header"
          d="M15 0h310q15 0 15 15v26H0V15Q0 0 15 0Z"
        />
        <path
          className="workflow-figure__terminal-divider"
          d="M0 41h340M18 280h304"
        />
        <g className="workflow-figure__terminal-controls">
          <circle cx="20" cy="20" r="3.5" />
          <circle cx="32" cy="20" r="3.5" />
          <circle cx="44" cy="20" r="3.5" />
          <rect x="65" y="12" width="250" height="15" rx="7.5" />
        </g>
        <path
          className="workflow-figure__terminal-inset"
          d="M17 52h306v215H17Z"
        />
        <g className="workflow-figure__terminal-row workflow-figure__terminal-row--first">
          <circle cx="31" cy="70" r="2.5" />
          <rect x="46" y="65" width="76" height="10" rx="5" />
          <rect x="130" y="65" width="33" height="10" rx="5" />
        </g>
        <g className="workflow-figure__terminal-row workflow-figure__terminal-row--second">
          <circle cx="31" cy="98" r="2.5" />
          <rect x="46" y="93" width="43" height="10" rx="5" />
          <rect x="97" y="93" width="123" height="10" rx="5" />
        </g>
        <g className="workflow-figure__terminal-row workflow-figure__terminal-row--third">
          <circle cx="31" cy="126" r="2.5" />
          <rect x="46" y="121" width="143" height="10" rx="5" />
          <rect x="197" y="121" width="48" height="10" rx="5" />
        </g>
        <g className="workflow-figure__terminal-row workflow-figure__terminal-row--fourth">
          <circle cx="31" cy="154" r="2.5" />
          <rect x="46" y="149" width="103" height="10" rx="5" />
          <rect x="157" y="149" width="74" height="10" rx="5" />
        </g>
        <g className="workflow-figure__terminal-row workflow-figure__terminal-row--warning">
          <rect
            className="workflow-figure__terminal-warning-bed"
            x="21"
            y="177"
            width="285"
            height="28"
            rx="6"
          />
          <path
            className="workflow-figure__terminal-warning-mark"
            d="m38 184 8 13H30Z"
          />
          <rect x="55" y="186" width="96" height="10" rx="5" />
          <rect x="159" y="186" width="112" height="10" rx="5" />
        </g>
        <g className="workflow-figure__terminal-row workflow-figure__terminal-row--ready">
          <circle cx="31" cy="238" r="3.5" />
          <rect x="46" y="233" width="116" height="10" rx="5" />
          <rect x="170" y="233" width="78" height="10" rx="5" />
        </g>
        <path
          className="workflow-figure__terminal-footer"
          d="M19 290h42m238 0h22"
        />
      </g>
    </svg>
  </div>
);

export { ConfigureResourcesFigure, ReviewOutputFigure };
