import React from "react";

// Match the platform's long axis while keeping small labels legible.
const groundLabelProjection = "matrix(1 0.165 -0.22 0.82 0 0)";

const MaestroPlanFigure: React.FC<{ refined: boolean }> = ({ refined }) => (
  <svg
    className={`preview-maestro__figure${refined ? " preview-maestro__figure--refined" : ""}`}
    viewBox="0 50 1172 480"
    role="img"
    aria-label={
      refined
        ? "Illustrative architecture: a private API routes through an elevated SQS queue to a worker, which writes to RDS PostgreSQL inside the VPC."
        : "Illustrative first plan: a private API connects directly to a worker and RDS PostgreSQL inside a VPC."
    }
  >
    <defs>
      <marker
        id="maestro-arrow"
        viewBox="0 0 12 12"
        refX="10"
        refY="6"
        markerWidth="12"
        markerHeight="12"
        markerUnits="userSpaceOnUse"
        orient="auto"
      >
        <path
          d="M1 1 L11 6 L1 11 L4 6 Z"
          className="preview-maestro__arrowhead"
        />
      </marker>
    </defs>

    <g className="preview-maestro__ground" aria-hidden="true">
      <path
        className="preview-maestro__ground-right"
        d="M955 461 L1108 284 L1108 320 L955 514 Z"
      />
      <path
        className="preview-maestro__ground-front"
        d="M55 312 L955 461 L955 514 L55 368 Z"
      />
      <path
        className="preview-maestro__ground-top"
        d="M55 312 L264 167 L1108 284 L955 461 Z"
      />
      <path
        className="preview-maestro__ground-back"
        d="M55 312 L264 167 L1108 284"
      />
      <path className="preview-maestro__zone" d="M543 206 L375 365 L375 421" />
      <path className="preview-maestro__zone" d="M836 246 L662 413 L662 466" />
      <path
        className="preview-maestro__zone-hint"
        d="M264 167 L264 212 M543 206 L543 239 M836 246 L836 272"
      />
      <g transform="translate(76 337) matrix(1 0.165 0 1 0 0)">
        <text
          x="0"
          y="0"
          className="preview-maestro__resource-label preview-maestro__resource-label--accent"
        >
          VPC
        </text>
        <text
          x="0"
          y="21"
          className="preview-maestro__resource-label preview-maestro__resource-label--secondary"
        >
          Private network
        </text>
      </g>
    </g>

    <g className="preview-maestro__routes" aria-hidden="true">
      <path
        className="preview-maestro__route preview-maestro__route--direct"
        d="M368 263 C429 266 466 288 537 308"
        markerEnd="url(#maestro-arrow)"
      />
      <path
        className="preview-maestro__route preview-maestro__route--refined"
        d="M368 263 L372 263 Q385 263 385 247 L385 143 Q385 125 403 125 L441 125"
        markerEnd="url(#maestro-arrow)"
      />
      <path
        className="preview-maestro__route preview-maestro__route--refined"
        d="M579 142 L583 143 Q604 148 604 171 L604 258"
        markerEnd="url(#maestro-arrow)"
      />
      <path
        className="preview-maestro__route preview-maestro__route--data"
        d="M665 319 L839 359"
        markerEnd="url(#maestro-arrow)"
      />
    </g>

    <g className="preview-maestro__queue" aria-hidden="true">
      <path
        className="preview-maestro__queue-shadow"
        d="M406 190 L492 134 L651 155 L574 213 Z"
      />
      <path
        className="preview-maestro__queue-deck-side"
        d="M576 162 L643 115 L643 133 L576 180 Z"
      />
      <path
        className="preview-maestro__queue-deck-front"
        d="M423 143 L576 162 L576 180 L423 159 Z"
      />
      <path
        className="preview-maestro__queue-deck-top"
        d="M423 143 L492 95 L643 115 L576 162 Z"
      />
      <path
        className="preview-maestro__queue-box-side"
        d="M547 125 L574 104 L574 140 L547 159 Z"
      />
      <path
        className="preview-maestro__queue-box-front"
        d="M487 116 L547 125 L547 159 L487 149 Z"
      />
      <path
        className="preview-maestro__queue-box-top"
        d="M487 116 L517 96 L574 104 L547 125 Z"
      />
      {[0, 10, 20, 30, 40].map((offset) => (
        <path
          key={offset}
          className="preview-maestro__queue-slot"
          d={`M${494 + offset} ${128 + offset * 0.15} l0 17 q2 3 4 0 l0 -17 q-2 -3 -4 0 Z`}
        />
      ))}
      <g transform="translate(518 80) matrix(1 0.125 -0.22 0.82 0 0)">
        <text
          x="0"
          y="0"
          className="preview-maestro__resource-label preview-maestro__resource-label--accent"
        >
          SQS queue
        </text>
      </g>
    </g>

    <g
      className="preview-maestro__api"
      transform="translate(6 0)"
      aria-hidden="true"
    >
      <path
        className="preview-maestro__resource-side"
        d="M320 258 L362 229 L362 281 L320 310 Z"
      />
      <path
        className="preview-maestro__resource-front"
        d="M243 248 L320 258 L320 310 L243 299 Z"
      />
      <path
        className="preview-maestro__resource-top"
        d="M243 248 L285 219 L362 229 L320 258 Z"
      />
      {[0, 1, 2, 3].map((index) => (
        <path
          key={index}
          className="preview-maestro__vent"
          d={`M${253 + index * 19} ${245 + index * 2.5} l31 -22 l8 1 l-31 23 Z`}
        />
      ))}
      {Array.from({ length: 19 }, (_, index) => (
        <path
          key={index}
          className="preview-maestro__hatch"
          d={`M${250 + index * 3.5} ${259 + index * 0.45} l0 39`}
        />
      ))}
      <g transform={`translate(286 331) ${groundLabelProjection}`}>
        <text
          x="0"
          y="0"
          textAnchor="middle"
          className="preview-maestro__resource-label"
        >
          API service
        </text>
      </g>
    </g>

    <g
      className="preview-maestro__worker"
      transform="translate(-41 -5)"
      aria-hidden="true"
    >
      <path
        className="preview-maestro__resource-side"
        d="M666 317 L706 276 L706 330 L666 360 Z"
      />
      <path
        className="preview-maestro__resource-front"
        d="M585 306 L666 317 L666 360 L585 349 Z"
      />
      <path
        className="preview-maestro__resource-top"
        d="M585 306 L627 266 L706 276 L666 317 Z"
      />
      {[0, 1, 2, 3].map((index) => (
        <path
          key={index}
          className="preview-maestro__vent"
          d={`M${597 + index * 19} ${303 + index * 2.5} l31 -28 l8 1 l-30 29 Z`}
        />
      ))}
      <path
        className="preview-maestro__worker-slot"
        d="M593 321 L656 330 L656 339 L593 330 Z M593 338 L656 347"
      />
      <circle
        className="preview-maestro__worker-light"
        cx="648"
        cy="336"
        r="1.5"
      />
      <circle
        className="preview-maestro__worker-light"
        cx="648"
        cy="351"
        r="1.5"
      />
      <g transform={`translate(630 382) ${groundLabelProjection}`}>
        <text
          x="0"
          y="0"
          textAnchor="middle"
          className="preview-maestro__resource-label"
        >
          Worker
        </text>
      </g>
    </g>

    <g
      className="preview-maestro__database"
      transform="translate(-25 16)"
      aria-hidden="true"
    >
      <path
        className="preview-maestro__database-body"
        d="M878 295 V373 C878 391 952 391 952 373 V295"
      />
      <ellipse
        className="preview-maestro__database-top"
        cx="915"
        cy="295"
        rx="37"
        ry="14"
      />
      <path
        className="preview-maestro__database-band"
        d="M878 321 C878 339 952 339 952 321 M878 348 C878 366 952 366 952 348"
      />
      <g transform={`translate(910 408) ${groundLabelProjection}`}>
        <text
          x="0"
          y="0"
          textAnchor="middle"
          className="preview-maestro__resource-label"
        >
          RDS PostgreSQL
        </text>
      </g>
    </g>
  </svg>
);

export default MaestroPlanFigure;
