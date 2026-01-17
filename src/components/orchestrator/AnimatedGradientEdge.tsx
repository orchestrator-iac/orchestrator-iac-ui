import React, { useId } from "react";
import { EdgeProps, getSmoothStepPath } from "@xyflow/react";

/**
 * AnimatedGradientEdge - Custom edge with animated gradient flow
 *
 * Usage - Pass custom colors via edge data:
 *
 * const edge = {
 *   id: 'e1-2',
 *   source: 'node1',
 *   target: 'node2',
 *   type: 'animatedGradient',
 *   data: {
 *     gradientStartColor: '#1e88e5',  // Start color (default: blue)
 *     gradientMidColor: '#42a5f5',    // Middle color (default: light blue)
 *     gradientEndColor: '#64b5f6',    // End color (default: lighter blue)
 *     strokeWidth: 2,                 // Edge thickness (default: 2)
 *     animated: true,                 // Enable animation (default: true)
 *     duration: 2                     // Animation duration in seconds (default: 2)
 *   }
 * };
 *
 * Color suggestions for different themes:
 * - Success: { start: '#4caf50', mid: '#66bb6a', end: '#81c784' }
 * - Warning: { start: '#ff9800', mid: '#ffa726', end: '#ffb74d' }
 * - Error: { start: '#f44336', mid: '#ef5350', end: '#e57373' }
 * - Info: { start: '#2196f3', mid: '#42a5f5', end: '#64b5f6' }
 * - Purple: { start: '#9c27b0', mid: '#ab47bc', end: '#ba68c8' }
 */
const AnimatedGradientEdge: React.FC<EdgeProps> = (props) => {
  const {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    id,
    markerEnd,
    data,
  } = props;

  const uniqueId = useId();
  const gradientId = `gradient-${uniqueId}`;

  // Extract custom props
  const animated = (data?.animated ?? true) as boolean;
  const gradientStartColor = (data?.gradientStartColor ?? "#1e88e5") as string; // Blue
  const gradientMidColor = (data?.gradientMidColor ?? "#42a5f5") as string; // Light Blue
  const gradientEndColor = (data?.gradientEndColor ?? "#64b5f6") as string; // Lighter Blue
  const strokeWidth = (data?.strokeWidth ?? 2) as number;
  const duration = (data?.duration ?? 2) as number; // Animation duration in seconds

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Get marker URL
  const getMarkerEnd = () => {
    if (!markerEnd) return undefined;
    if (typeof markerEnd === "string") return markerEnd;
    const markerType = (markerEnd as any).type || "arrow";
    return `url(#react-flow__${markerType})`;
  };

  return (
    <g>
      {/* Define gradient */}
      <defs>
        <linearGradient
          id={gradientId}
          x1={sourceX}
          y1={sourceY}
          x2={targetX}
          y2={targetY}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity={0}>
            {animated && (
              <animate
                attributeName="offset"
                values="-2; 1"
                dur={`${duration}s`}
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="10%" stopColor={gradientStartColor} stopOpacity={1}>
            {animated && (
              <animate
                attributeName="offset"
                values="-1.9; 1.1"
                dur={`${duration}s`}
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="32.5%" stopColor={gradientMidColor} stopOpacity={1}>
            {animated && (
              <animate
                attributeName="offset"
                values="-1.675; 1.325"
                dur={`${duration}s`}
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="100%" stopColor={gradientEndColor} stopOpacity={0}>
            {animated && (
              <animate
                attributeName="offset"
                values="-1; 2"
                dur={`${duration}s`}
                repeatCount="indefinite"
              />
            )}
          </stop>
        </linearGradient>
      </defs>

      {/* Base gray path */}
      <path
        d={edgePath}
        fill="none"
        stroke="gray"
        strokeWidth={strokeWidth}
        strokeOpacity={0.2}
        strokeLinecap="round"
      />

      {/* Gradient path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        markerEnd={getMarkerEnd()}
      />
    </g>
  );
};

export default AnimatedGradientEdge;
