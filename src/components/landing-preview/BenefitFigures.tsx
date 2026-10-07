import React from "react";
import "./BenefitFigures.css";

type BenefitFigureKind = "reusable" | "connected" | "reviewable" | "portable";

const BlueprintTile: React.FC<{ x: number; y: number; scale?: number }> = ({
  x,
  y,
  scale = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path className="benefit-figure__left" d="M0 19v11l48 24V43Z" />
    <path className="benefit-figure__right" d="M48 43v11l48-24V19Z" />
    <path className="benefit-figure__top" d="M0 19 48-5 96 19 48 43Z" />
    <path
      className="benefit-figure__detail"
      d="m19 18 29-14 28 14-28 14ZM30 24l18-9 18 9M48 15v17"
    />
  </g>
);

const IsoBlock: React.FC<{ x: number; y: number; accent?: boolean }> = ({
  x,
  y,
  accent = false,
}) => (
  <g
    className={accent ? "benefit-figure__node--accent" : undefined}
    transform={`translate(${x} ${y})`}
  >
    <path className="benefit-figure__left" d="M-16 0 0 8v15l-16-8Z" />
    <path className="benefit-figure__right" d="M0 8 16 0v15L0 23Z" />
    <path className="benefit-figure__top" d="M-16 0 0-8 16 0 0 8Z" />
    <path className="benefit-figure__detail" d="m-9 0 9-4 9 4" />
  </g>
);

const ReusableFigure: React.FC = () => (
  <svg viewBox="0 0 260 140" aria-hidden="true" focusable="false">
    <path
      className="benefit-figure__guide"
      d="M128 75 94 93 54 75M128 75l35 18 36-18"
    />
    <g className="benefit-figure__copy benefit-figure__copy--left">
      <BlueprintTile x={28} y={79} scale={0.55} />
    </g>
    <g className="benefit-figure__copy benefit-figure__copy--right">
      <BlueprintTile x={173} y={79} scale={0.55} />
    </g>
    <BlueprintTile x={80} y={24} />
    <path className="benefit-figure__accent" d="m101 42 27-13 27 13" />
  </svg>
);

const ConnectedFigure: React.FC = () => (
  <svg viewBox="0 0 260 140" aria-hidden="true" focusable="false">
    <path className="benefit-figure__left" d="M22 76v10l108 53v-10Z" />
    <path className="benefit-figure__right" d="M130 129v10l108-53V76Z" />
    <path className="benefit-figure__top" d="M22 76 130 22 238 76 130 129Z" />
    <path
      className="benefit-figure__guide benefit-figure__network"
      d="m67 78 61-30 65 31-64 30-62-31M128 48l1 61"
    />
    <circle className="benefit-figure__port" cx="67" cy="78" r="2.5" />
    <circle className="benefit-figure__port" cx="193" cy="79" r="2.5" />
    <circle className="benefit-figure__port" cx="129" cy="109" r="2.5" />
    <IsoBlock x={67} y={66} />
    <IsoBlock x={193} y={67} />
    <IsoBlock x={129} y={97} />
    <IsoBlock x={128} y={36} accent />
  </svg>
);

const ReviewableFigure: React.FC = () => (
  <svg viewBox="0 0 260 140" aria-hidden="true" focusable="false">
    <g transform="matrix(1 -0.22 0.16 0.94 38 42)">
      <rect
        className="benefit-figure__back"
        x="-6"
        y="-6"
        width="178"
        height="104"
        rx="4"
      />
      <path className="benefit-figure__left" d="M-6-6 0 0v104l-6-6Z" />
      <rect className="benefit-figure__top" width="178" height="104" rx="4" />
      <path className="benefit-figure__detail" d="M0 20h178" />
      <g className="benefit-figure__detail">
        <circle cx="12" cy="10" r="2" />
        <circle cx="21" cy="10" r="2" />
        <path d="M38 10h116M17 34h98M17 46h130M17 88h86" />
      </g>
      <g className="benefit-figure__warning">
        <rect x="13" y="56" width="151" height="22" rx="3" />
        <path d="m30 61 7 12H23ZM30 65v4m0 2v.4M46 66h91" />
      </g>
      <path className="benefit-figure__accent" d="m123 88 6 5 10-13" />
    </g>
  </svg>
);

const PortableFigure: React.FC = () => (
  <svg viewBox="0 0 260 140" aria-hidden="true" focusable="false">
    {/* The vacant dock keeps the export legible as something that can leave. */}
    <path className="benefit-figure__left" d="M19 84v11l48 24v-11Z" />
    <path className="benefit-figure__right" d="M67 108v11l48-24V84Z" />
    <path className="benefit-figure__top" d="M19 84 67 60l48 24-48 24Z" />
    <path className="benefit-figure__detail" d="M42 84 67 71l25 13-25 13Z" />
    <path className="benefit-figure__detail" d="M42 84v5l25 13 25-13v-5" />
    <path className="benefit-figure__detail" d="M67 97v5" />
    <path
      className="benefit-figure__guide benefit-figure__routes"
      d="m112 71 24-12m-7-1 7 1-2 7"
    />
    <g className="benefit-figure__bundle">
      {/* Three complete sheets form one movable, self-contained code packet. */}
      <path className="benefit-figure__left" d="M143 77v5l43 22v-5Z" />
      <path className="benefit-figure__right" d="M186 99v5l43-22v-5Z" />
      <path className="benefit-figure__top" d="M143 77 186 55l43 22-43 22Z" />
      <path className="benefit-figure__left" d="M143 69v5l43 22v-5Z" />
      <path className="benefit-figure__right" d="M186 91v5l43-22v-5Z" />
      <path className="benefit-figure__top" d="M143 69 186 47l43 22-43 22Z" />
      <path className="benefit-figure__left" d="M143 61v5l43 22v-5Z" />
      <path className="benefit-figure__right" d="M186 83v5l43-22v-5Z" />
      <path className="benefit-figure__top" d="M143 61 186 39l43 22-43 22Z" />
      <path
        className="benefit-figure__detail"
        d="m161 58 25-13m-19 20 14-7m4-2 19-10m-31 25 14-7m5-3 11-6"
      />
      <path className="benefit-figure__accent" d="m162 74 24 12 24-12" />
    </g>
  </svg>
);

const figures: Record<BenefitFigureKind, React.FC> = {
  reusable: ReusableFigure,
  connected: ConnectedFigure,
  reviewable: ReviewableFigure,
  portable: PortableFigure,
};

const BenefitFigure: React.FC<{ kind: BenefitFigureKind }> = ({ kind }) => {
  const Figure = figures[kind];
  return (
    <div
      className={`benefit-figure benefit-figure--${kind}`}
      aria-hidden="true"
    >
      <Figure />
    </div>
  );
};

export default BenefitFigure;
