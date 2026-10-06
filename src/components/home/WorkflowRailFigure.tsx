import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";

interface WorkflowRailFigureProps {
  dark: boolean;
}

type Vec2 = [number, number];
type Vec3 = [number, number, number];
type Projector = (x: number, y: number, z: number) => Vec2;

interface Sample {
  u: number;
  v: number;
  nu: number;
  nv: number;
}

interface PrismPaths {
  silhouette: string;
  crease: string;
}

interface RailGeometry {
  farFoot: PrismPaths;
  farUpright: PrismPaths;
  bar: PrismPaths;
  nearFoot: PrismPaths;
  nearUpright: PrismPaths;
  hangerCenters: number[];
  project: Projector;
}

interface HangerPaths {
  body: PrismPaths;
  hook: string;
}

/* Self-contained isometric Rail geometry and motion; no external figure library is bundled. */

const L = 132;
const TOP = 92;
const POST = 4.4;
const FOOT = 34;
const BAR = 2;
const HANGER_X0 = 21;
const HANGER_DX = 15;
const HANGER_THICKNESS = 1.8;
const HANGER_ROCK = 22;
const HANGER_REACH = 3.5;
const HANGER_REST = [4, -7, 2, 13, -3, 6, -9];
const RESTING_HANGER = 3;
const HANGER_BODY = fillet(
  [
    [0, 9],
    [25, 21],
    [25, 25],
    [-25, 25],
    [-25, 21],
  ],
  [4, 2, 2, 2, 2],
  5,
);
const HANGER_HOLE = fillet(
  [
    [0, 14],
    [15, 21.5],
    [-15, 21.5],
  ],
  [2, 1.2, 1.2],
  4,
);
const HANGER_HOOK: Vec2[] = [
  [0, 9],
  [0, 5],
  ...Array.from({ length: 10 }, (_, index): Vec2 => {
    const angle = rad(120 - index * 20);
    return [Math.sin(angle) * 3.4, -Math.cos(angle) * 3.4];
  }),
];

const COLORS = {
  light: {
    plate: "var(--product-surface)",
    hi: "#232327",
    edge: "#a4a4ac",
    mid: "#c3c3c9",
    lo: "#e0e0e4",
  },
  dark: {
    plate: "var(--product-surface)",
    hi: "#d0d6e0",
    edge: "#5b5d64",
    mid: "#3e3e44",
    lo: "#29292d",
  },
};

function rad(degrees: number) {
  return (degrees * Math.PI) / 180;
}
const round = (value: number) => Math.round(value * 100) / 100;

const poly = (points: readonly Vec2[]) =>
  `M${points.map(([x, y]) => `${round(x)} ${round(y)}`).join("L")}Z`;

const open = (points: readonly Vec2[]) =>
  points.length < 2
    ? ""
    : `M${points.map(([x, y]) => `${round(x)} ${round(y)}`).join("L")}`;

const rrect = (u0: number, v0: number, u1: number, v1: number, radius: number, steps = 4): Sample[] => {
  const r = Math.max(0, Math.min(radius, (u1 - u0) / 2, (v1 - v0) / 2));
  const result: Sample[] = [];

  for (const [centerU, centerV, start] of [
    [u1 - r, v1 - r, 0],
    [u0 + r, v1 - r, 90],
    [u0 + r, v0 + r, 180],
    [u1 - r, v0 + r, 270],
  ]) {
    for (let index = 0; index <= steps; index += 1) {
      const angle = rad(start + (90 * index) / steps);
      const normalU = Math.cos(angle);
      const normalV = Math.sin(angle);
      result.push({
        u: centerU + r * normalU,
        v: centerV + r * normalV,
        nu: normalU,
        nv: normalV,
      });
    }
  }

  return result;
};

function fillet(points: readonly Vec2[], radii: readonly number[], steps = 4): Vec2[] {
  const result: Vec2[] = [];

  for (let index = 0; index < points.length; index += 1) {
    const previous = points[(index + points.length - 1) % points.length];
    const point = points[index];
    const next = points[(index + 1) % points.length];
    const previousLength = Math.hypot(previous[0] - point[0], previous[1] - point[1]);
    const nextLength = Math.hypot(next[0] - point[0], next[1] - point[1]);
    const radius = Math.min(radii[index], previousLength / 2, nextLength / 2);
    const start: Vec2 = [
      point[0] + ((previous[0] - point[0]) / previousLength) * radius,
      point[1] + ((previous[1] - point[1]) / previousLength) * radius,
    ];
    const end: Vec2 = [
      point[0] + ((next[0] - point[0]) / nextLength) * radius,
      point[1] + ((next[1] - point[1]) / nextLength) * radius,
    ];

    for (let step = 0; step <= steps; step += 1) {
      const progress = step / steps;
      const inverse = 1 - progress;
      result.push([
        inverse * inverse * start[0] + 2 * inverse * progress * point[0] + progress * progress * end[0],
        inverse * inverse * start[1] + 2 * inverse * progress * point[1] + progress * progress * end[1],
      ]);
    }
  }

  return result;
}

const hull = (input: readonly Vec2[]) => {
  const points = input.slice().sort(([ax, ay], [bx, by]) => ax - bx || ay - by);
  const cross = (origin: Vec2, first: Vec2, second: Vec2) =>
    (first[0] - origin[0]) * (second[1] - origin[1]) -
    (first[1] - origin[1]) * (second[0] - origin[0]);
  const lower: Vec2[] = [];
  const upper: Vec2[] = [];

  for (const point of points) {
    while (lower.length > 1 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop();
    }
    lower.push(point);
  }
  for (let index = points.length - 1; index >= 0; index -= 1) {
    const point = points[index];
    while (upper.length > 1 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      upper.pop();
    }
    upper.push(point);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
};

const ringAt = (project: Projector, ring: readonly Sample[], z: number) =>
  ring.map((sample) => project(sample.u, sample.v, z));

const frontFacing = (azimuth: number) => {
  const sin = Math.sin(azimuth);
  const cos = Math.cos(azimuth);
  return (sample: Sample) => sample.nu * sin + sample.nv * cos >= -1e-6;
};

const frontRun = (ring: readonly Sample[], keep: (sample: Sample) => boolean) => {
  const start = ring.findIndex((sample, index) => keep(sample) && !keep(ring[(index + ring.length - 1) % ring.length]));
  if (start < 0) return keep(ring[0]) ? ring.slice() : [];

  const result: Sample[] = [];
  for (let index = 0; index < ring.length && keep(ring[(start + index) % ring.length]); index += 1) {
    result.push(ring[(start + index) % ring.length]);
  }
  return result;
};

const prism = (
  project: Projector,
  front: (sample: Sample) => boolean,
  ring: readonly Sample[],
  inner: readonly Sample[] | null,
  bottom: number,
  top: number,
): PrismPaths => ({
  silhouette: poly(hull(ringAt(project, ring, top).concat(ringAt(project, ring, bottom)))),
  crease: inner ? open(ringAt(project, frontRun(inner, front), top)) : "",
});

const rings = (x0: number, y0: number, x1: number, y1: number, radius: number, bevel: number) => [
  rrect(x0, y0, x1, y1, radius),
  rrect(x0 + bevel, y0 + bevel, x1 - bevel, y1 - bevel, Math.max(0.3, radius - bevel)),
] as const;

const createCamera = () => {
  const camera = { azimuth: rad(45), squash: 0.5, scale: 1.9, offsetX: 0, offsetY: 0 };
  const projectWithoutOffset: Projector = (x, y, z) => {
    const cos = Math.cos(camera.azimuth);
    const sin = Math.sin(camera.azimuth);
    const vertical = Math.sqrt(1 - camera.squash * camera.squash);
    const screenX = x * cos - y * sin;
    const screenY = x * sin + y * cos;
    return [camera.scale * screenX, camera.scale * (screenY * camera.squash - z * vertical)];
  };
  const extents: Vec3[] = [
    [0, -FOOT / 2, 0],
    [L, -FOOT / 2, 0],
    [0, FOOT / 2, 0],
    [L, FOOT / 2, 0],
    [0, 0, TOP + 6],
    [L, 0, TOP + 6],
    [0, -30, TOP - 30],
    [L, 30, TOP - 30],
  ];
  const projected = extents.map(([x, y, z]) => projectWithoutOffset(x, y, z));
  const minX = Math.min(...projected.map(([x]) => x));
  const maxX = Math.max(...projected.map(([x]) => x));
  const minY = Math.min(...projected.map(([, y]) => y));
  const maxY = Math.max(...projected.map(([, y]) => y));
  camera.offsetX = 200 - (minX + maxX) / 2;
  camera.offsetY = 166 - (minY + maxY) / 2;

  const project: Projector = (x, y, z) => {
    const [screenX, screenY] = projectWithoutOffset(x, y, z);
    return [screenX + camera.offsetX, screenY + camera.offsetY];
  };

  return { camera, project };
};

const createRailGeometry = (): RailGeometry => {
  const { camera, project } = createCamera();
  const front = frontFacing(camera.azimuth);
  const block = (x0: number, y0: number, x1: number, y1: number, radius: number, bottom: number, top: number) => {
    const [outer, inner] = rings(x0, y0, x1, y1, radius, 0.7);
    return prism(project, front, outer, inner, bottom, top);
  };

  const farFoot = block(-POST / 2 - 1, -FOOT / 2, POST / 2 + 1, FOOT / 2, 2.2, 0, 3);
  const farUpright = block(-POST / 2, -POST / 2, POST / 2, POST / 2, 1.4, 3, TOP + 4);
  const bar = block(0, -BAR, L, BAR, BAR, TOP - BAR, TOP + BAR);
  const nearFoot = block(L - POST / 2 - 1, -FOOT / 2, L + POST / 2 + 1, FOOT / 2, 2.2, 0, 3);
  const nearUpright = block(L - POST / 2, -POST / 2, L + POST / 2, POST / 2, 1.4, 3, TOP + 4);
  const hangerCenters = HANGER_REST.map((_, index) => project(HANGER_X0 + index * HANGER_DX, 0, TOP - 17)[0]);

  return { farFoot, farUpright, bar, nearFoot, nearUpright, hangerCenters, project };
};

const RAIL = createRailGeometry();

const createHangerPaths = (angle: number, x: number): HangerPaths => {
  const cosine = Math.cos(rad(angle));
  const sine = Math.sin(rad(angle));
  const at = (point: Vec2, depth: number): Vec2 =>
    RAIL.project(
      x + depth,
      point[0] * cosine + point[1] * sine,
      TOP - (point[1] * cosine - point[0] * sine),
    );
  const bodyPoints = HANGER_BODY.map((point) => at(point, 0)).concat(HANGER_BODY.map((point) => at(point, HANGER_THICKNESS)));

  return {
    body: {
      silhouette: poly(hull(bodyPoints)),
      crease: poly(HANGER_HOLE.map((point) => at(point, HANGER_THICKNESS))),
    },
    hook: open(HANGER_HOOK.map((point) => at(point, HANGER_THICKNESS / 2))),
  };
};

const clamp = (value: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(maximum, value));

export default function WorkflowRailFigure({ dark }: WorkflowRailFigureProps) {
  const [angles, setAngles] = useState(HANGER_REST);
  const [activeHanger, setActiveHanger] = useState<number | null>(null);
  const anglesRef = useRef(HANGER_REST);
  const velocitiesRef = useRef(HANGER_REST.map(() => 0));
  const targetsRef = useRef(HANGER_REST);
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const colors = dark ? COLORS.dark : COLORS.light;

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const wake = () => {
    if (frameRef.current !== null) return;

    const tick = (time: number) => {
      const previous = lastFrameRef.current ?? time;
      const delta = Math.min(0.032, Math.max(0.001, (time - previous) / 1000));
      lastFrameRef.current = time;
      const nextAngles = [...anglesRef.current];
      const nextVelocities = [...velocitiesRef.current];
      let moving = false;

      for (let index = 0; index < nextAngles.length; index += 1) {
        const substeps = Math.max(1, Math.ceil(delta * 240));
        const step = delta / substeps;
        for (let substep = 0; substep < substeps; substep += 1) {
          const acceleration = -60 * (nextAngles[index] - targetsRef.current[index]) - 6 * nextVelocities[index];
          nextVelocities[index] += acceleration * step;
          nextAngles[index] += nextVelocities[index] * step;
        }
        if (Math.abs(nextAngles[index] - targetsRef.current[index]) < 0.02 && Math.abs(nextVelocities[index]) < 0.2) {
          nextAngles[index] = targetsRef.current[index];
          nextVelocities[index] = 0;
        } else {
          moving = true;
        }
      }

      anglesRef.current = nextAngles;
      velocitiesRef.current = nextVelocities;
      setAngles(nextAngles);

      if (moving) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        frameRef.current = null;
        lastFrameRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
  };

  const choose = (index: number, side = 1) => {
    const targets = HANGER_REST.map((rest, hangerIndex) => {
      const reach = index < 0 ? 0 : clamp(1 - Math.abs(hangerIndex - index) / (HANGER_REACH + 0.5), 0, 1);
      return rest - HANGER_ROCK * reach * reach * (hangerIndex === index ? side : Math.sign(hangerIndex - index));
    });
    targetsRef.current = targets;
    setActiveHanger(index < 0 ? null : index);
    wake();
  };

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = ((event.clientX - bounds.left) / bounds.width) * 400;
    const index = RAIL.hangerCenters.reduce(
      (closest, center, hangerIndex) =>
        Math.abs(pointerX - center) < Math.abs(pointerX - RAIL.hangerCenters[closest]) ? hangerIndex : closest,
      0,
    );
    choose(index, pointerX < RAIL.hangerCenters[index] ? 1 : -1);
  };

  const renderSolid = (paths: PrismPaths, highlighted = false) => (
    <g>
      <path
        d={paths.silhouette}
        fill={colors.plate}
        stroke={highlighted ? colors.hi : colors.edge}
        strokeWidth="0.9"
        vectorEffect="non-scaling-stroke"
      />
      {paths.crease && (
        <path
          d={paths.crease}
          fill="none"
          stroke={colors.lo}
          strokeWidth="0.9"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </g>
  );

  return (
    <svg
      viewBox="0 0 400 320"
      role="img"
      aria-label="Animated empty garment rail with seven waiting workflow hangers"
      className="workflowRailFigure"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => choose(-1)}
      fill="none"
    >
      {renderSolid(RAIL.farFoot)}
      {renderSolid(RAIL.farUpright)}

      {angles.map((angle, index) => {
        const paths = createHangerPaths(angle, HANGER_X0 + index * HANGER_DX);
        const highlighted = activeHanger === index || (activeHanger === null && index === RESTING_HANGER);
        return (
          <g key={index}>
            <path
              d={paths.body.silhouette}
              fill={colors.plate}
              stroke={highlighted ? colors.hi : colors.edge}
              strokeWidth={highlighted ? "1.15" : "0.9"}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d={paths.body.crease}
              fill="none"
              stroke={colors.lo}
              strokeWidth="0.9"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>
        );
      })}

      {renderSolid(RAIL.bar)}

      {angles.map((angle, index) => {
        const paths = createHangerPaths(angle, HANGER_X0 + index * HANGER_DX);
        return (
          <path
            key={`hook-${index}`}
            d={paths.hook}
            fill="none"
            stroke={colors.mid}
            strokeWidth="0.9"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}

      {renderSolid(RAIL.nearFoot)}
      {renderSolid(RAIL.nearUpright)}
    </svg>
  );
}
