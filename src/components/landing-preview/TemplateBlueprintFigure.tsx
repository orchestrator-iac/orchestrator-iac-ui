import React, { useState } from "react";
import "./TemplateBlueprintFigure.css";

const CARD_POSES = [
  [1.175, -0.565, 0.064, 0.56, 145, 242],
  [1.175, -0.53, 0.155, 0.6, 178, 259],
  [1.12, -0.53, 0.195, 0.65, 216, 271],
  [0.965, -0.46, 0.315, 0.94, 298, 245],
] as const;

const poseFor = (index: number, active: number | null): string => {
  const [a, b, c, d, e, f] = CARD_POSES[index];
  if (active === null) return `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`;

  const distance = Math.abs(index - active);
  const rise = [40, 18, 6, 0][distance];
  const fan = [12, 6, 2, 0][distance];
  const shift = index > active ? fan : -fan;

  // Move the top corners while keeping the sheet's lower edge seated in the tray.
  return `matrix(${a}, ${b}, ${c - shift / 220}, ${d + rise / 220}, ${e + shift}, ${f - rise})`;
};

const Block: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`} className="template-blueprint__block">
    <path d="M0 0 17-9 34 0 17 9Z" />
    <path d="M0 0v22l17 9V9M17 31l17-9V0" />
  </g>
);

const BlueprintSheet: React.FC<{ detailed?: boolean }> = ({
  detailed = false,
}) => (
  <>
    <rect
      className="template-blueprint__sheet-edge"
      x="-2"
      y="2"
      width="200"
      height="220"
      rx="2.4"
    />
    <rect
      className="template-blueprint__sheet"
      width="200"
      height="220"
      rx="2.4"
    />
    <path className="template-blueprint__inset" d="M11 17V207H186V13H11" />
    <g className="template-blueprint__ink">
      <path d="M22 28H174M22 42H103M22 55H69" />
      <path d="M22 83v47h60M22 151h44M22 162h85" />
      <path d="M22 186h111M22 196h72" />
    </g>
    {detailed ? (
      <g
        className="template-blueprint__diagram"
        transform="translate(105 70) scale(.77)"
      >
        <path
          className="template-blueprint__ink"
          d="M18 27v17l25 14M56 38v16"
        />
        <Block x={5} y={0} />
        <Block x={37} y={23} />
        <Block x={-21} y={42} />
        <Block x={12} y={65} />
      </g>
    ) : (
      <g className="template-blueprint__ink">
        <path d="M104 83h63v57h-63ZM104 105h63M133 83v57" />
        <path d="M28 76h47v40H28ZM43 116v17h48v-18" />
      </g>
    )}
    <g className="template-blueprint__fine-ink">
      <path d="M108 154h66M108 160h49M108 166h57M140 188h34M140 194h27" />
      <path d="M25 29h146M25 187h105" />
    </g>
  </>
);

/** All sheets share the tray's upward-right width axis. */
const TemplateBlueprintFigure: React.FC = () => {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  return (
    <div
      className="template-blueprint"
      data-riffling={activeCard === null ? undefined : ""}
      role="group"
      tabIndex={0}
      aria-label="Interactive illustration of four architecture blueprint sheets in a tray. Move the pointer or use the left and right arrow keys to riffle through them."
      onPointerMove={(event) => {
        if (event.pointerType === "touch") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 600;
        setActiveCard(x < 210 ? 0 : x < 285 ? 1 : x < 360 ? 2 : 3);
      }}
      onPointerLeave={() => setActiveCard(null)}
      onBlur={() => setActiveCard(null)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          setActiveCard((current) =>
            current === null ? 0 : Math.min(CARD_POSES.length - 1, current + 1),
          );
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          setActiveCard((current) =>
            current === null ? CARD_POSES.length - 1 : Math.max(0, current - 1),
          );
        } else if (event.key === "Escape") {
          setActiveCard(null);
        }
      }}
    >
      <svg viewBox="0 0 600 460" aria-hidden="true" focusable="false">
        <g transform="translate(-50 -95)">
          <g className="template-blueprint__ground">
            <path d="m48 399 291 163 299-150M66 365l380 161M138 339l359 163M210 312l339 166M282 284l321 171" />
            <path d="m72 437 293-146M130 469l293-147M186 502l294-148M243 533l294-147" />
          </g>
          <path
            className="template-blueprint__floor"
            d="M90 332 350 205 616 344 350 477Z"
          />
          <path
            className="template-blueprint__back-wall"
            d="M90 332v59l260-127 266 134v-54L350 205Z"
          />
          <path
            className="template-blueprint__floor"
            d="M104 337 350 218 601 347 350 463Z"
          />
          <path
            className="template-blueprint__rim"
            d="M90 332 350 205 616 344M103 336 350 218 601 347"
          />
          <g className="template-blueprint__slots">
            <path d="m142 357 232-113 10 6-232 112ZM191 384l230-113 10 6-230 113ZM242 411l229-112 10 6-229 113ZM295 439l228-111 10 6-228 112Z" />
          </g>
          {CARD_POSES.slice(0, 3).map((_, index) => (
            <g
              key={index}
              className={`template-blueprint__card${activeCard === index ? " template-blueprint__card--highlight" : ""}`}
              style={
                {
                  "--card-pose": poseFor(index, activeCard),
                  "--card-rest-pose": poseFor(index, null),
                } as React.CSSProperties
              }
            >
              <BlueprintSheet />
            </g>
          ))}
          <path
            className="template-blueprint__seat"
            d="m346 450 204-98 25 8-205 103Z"
          />
          <g
            className={`template-blueprint__card template-blueprint__selected${activeCard === null || activeCard === 3 ? " template-blueprint__card--highlight" : ""}`}
            style={
              {
                "--card-pose": poseFor(3, activeCard),
                "--card-rest-pose": poseFor(3, null),
              } as React.CSSProperties
            }
          >
            <BlueprintSheet detailed />
          </g>
          <g className="template-blueprint__mounts">
            <path d="m354 445 14-7 5 15-14 7ZM544 355l14-7 5 15-14 7Z" />
            <path d="m354 445 5 2 14-7M359 447l5 14M544 355l5 2 14-7M549 357l5 14" />
          </g>
          <path
            className="template-blueprint__wall-left"
            d="M90 332 350 476v55L93 393q-3-2-3-6Z"
          />
          <path
            className="template-blueprint__wall-front"
            d="M350 476 616 344v50q0 4-4 6L354 529q-4 2-4 2Z"
          />
          <path
            className="template-blueprint__rim"
            d="M91 332 350 476 616 344M103 330 350 464 602 340"
          />
          <path
            className="template-blueprint__crease"
            d="M96 342 346 481M356 482l253-126M350 482v45"
          />
          <path
            className="template-blueprint__handle"
            d="m402 479 105-51 1 7-105 51Z"
          />
          <path
            className="template-blueprint__handle-highlight"
            d="m403 479 59-29"
          />
        </g>
      </svg>
    </div>
  );
};

export default TemplateBlueprintFigure;
