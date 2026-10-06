import { useEffect, useRef } from "react";

import styles from "./Templates.module.css";

type Vec2 = [number, number];
type Vec3 = [number, number, number];
type Sample = { u: number; v: number; nu: number; nv: number };
type Ring = Sample[];
type Camera = { az: number; k: number; scale: number; ox: number; oy: number };
type Projector = (x: number, y: number, z: number) => Vec2;
type Solid = { silhouette: SVGPathElement; crease: SVGPathElement };
type Spring = { x: number; velocity: number; target: number };

const XS = [18, 48, 78, 108];
const YB = 11;
const X1 = 124;
const Y1 = 58;
const H = 14;
const L = 56;
const MAX = 44;
const REST = [-9, 3, -4, 32];
const D: Vec2 = [Math.SQRT1_2, -Math.SQRT1_2];
const RESPONSE_RANGE = 3.5;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.max(minimum, Math.min(maximum, value));
const lerp = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;
const rad = (degrees: number) => (degrees * Math.PI) / 180;
const r2 = (value: number) => Math.round(value * 100) / 100;

const make = <K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {},
  parent?: Element,
) => {
  const element = document.createElementNS(
    "http://www.w3.org/2000/svg",
    tag,
  ) as SVGElementTagNameMap[K];
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, String(value)));
  parent?.appendChild(element);
  return element;
};

const poly = (points: readonly Vec2[]) =>
  `M${points.map((point) => `${r2(point[0])} ${r2(point[1])}`).join("L")}Z`;
const open = (points: readonly Vec2[]) =>
  points.length < 2
    ? ""
    : `M${points.map((point) => `${r2(point[0])} ${r2(point[1])}`).join("L")}`;
const seg = (from: Vec2, to: Vec2) =>
  `M${r2(from[0])} ${r2(from[1])}L${r2(to[0])} ${r2(to[1])}`;

const cam = (azimuth: number, elevation: number, scale: number): Camera => ({
  az: rad(azimuth),
  k: elevation,
  scale,
  ox: 0,
  oy: 0,
});

const proj = (current: Camera): Projector => {
  const cosine = Math.cos(current.az);
  const sine = Math.sin(current.az);
  const vertical = Math.sqrt(1 - current.k * current.k);
  return (x, y, z) => {
    const screenX = x * cosine - y * sine;
    const screenY = x * sine + y * cosine;
    return [
      current.ox + current.scale * screenX,
      current.oy + current.scale * (screenY * current.k - z * vertical),
    ];
  };
};

const fit = (current: Camera, points: readonly Vec3[]) => {
  const projection = proj(current);
  const projected = points.map((point) => projection(...point));
  const xs = projected.map(([x]) => x);
  const ys = projected.map(([, y]) => y);
  current.ox = 200 - (Math.min(...xs) + Math.max(...xs)) / 2;
  current.oy = 166 - (Math.min(...ys) + Math.max(...ys)) / 2;
};

const rrect = (u0: number, v0: number, u1: number, v1: number, radius: number, n = 4): Ring => {
  const result: Ring = [];
  const corners: Array<[number, number, number]> = [
    [u1 - radius, v1 - radius, 0],
    [u0 + radius, v1 - radius, 90],
    [u0 + radius, v0 + radius, 180],
    [u1 - radius, v0 + radius, 270],
  ];
  corners.forEach(([centerX, centerY, start]) => {
    for (let index = 0; index <= n; index += 1) {
      const angle = rad(start + (90 * index) / n);
      result.push({
        u: centerX + radius * Math.cos(angle),
        v: centerY + radius * Math.sin(angle),
        nu: Math.cos(angle),
        nv: Math.sin(angle),
      });
    }
  });
  return result;
};

const circ = (radius: number, count = 20): Ring =>
  Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    return {
      u: radius * Math.cos(angle),
      v: radius * Math.sin(angle),
      nu: Math.cos(angle),
      nv: Math.sin(angle),
    };
  });

const hull = (input: readonly Vec2[]) => {
  const points = [...input].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Vec2, a: Vec2, b: Vec2) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Vec2[] = [];
  const upper: Vec2[] = [];
  points.forEach((point) => {
    while (lower.length > 1 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop();
    lower.push(point);
  });
  for (let index = points.length - 1; index >= 0; index -= 1) {
    const point = points[index];
    while (upper.length > 1 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop();
    upper.push(point);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
};

const ringAt = (projection: Projector, ring: readonly Sample[], z: number) =>
  ring.map((point) => projection(point.u, point.v, z));

const facing = (current: Camera) => {
  const sine = Math.sin(current.az);
  const cosine = Math.cos(current.az);
  return (point: Sample) => point.nu * sine + point.nv * cosine >= -1e-6;
};

const run = (ring: readonly Sample[], keep: (point: Sample) => boolean) => {
  const start = ring.findIndex(
    (point, index) => keep(point) && !keep(ring[(index + ring.length - 1) % ring.length]),
  );
  if (start < 0) return keep(ring[0]) ? [...ring] : [];
  const result: Ring = [];
  for (let offset = 0; offset < ring.length; offset += 1) {
    const point = ring[(start + offset) % ring.length];
    if (!keep(point)) break;
    result.push(point);
  }
  return result;
};

const prism = (
  projection: Projector,
  front: (point: Sample) => boolean,
  ring: readonly Sample[],
  inset: readonly Sample[] | null,
  bottom: number,
  top: number,
) => ({
  silhouette: poly(hull(ringAt(projection, ring, top).concat(ringAt(projection, ring, bottom)))),
  crease: inset ? open(ringAt(projection, run(inset, front), top)) : "",
});

const createSolid = (parent: Element): Solid => {
  const group = make("g", {}, parent);
  return {
    silhouette: make("path", { class: styles.galleryConnectivitySilhouette }, group),
    crease: make("path", { class: styles.galleryConnectivityCrease }, group),
  };
};

const setPaths = (solid: Solid, paths: { silhouette: string; crease: string }) => {
  solid.silhouette.setAttribute("d", paths.silhouette);
  solid.crease.setAttribute("d", paths.crease);
};

const along = (index: number, lean: number, length: number): Vec3 => {
  const sine = Math.sin(rad(lean));
  const cosine = Math.cos(rad(lean));
  return [XS[index] + D[0] * sine * length, YB + D[1] * sine * length, H + 4 + cosine * length];
};

const spring = (value: number): Spring => ({ x: value, velocity: 0, target: value });

const stepSpring = (value: Spring, delta: number, reduced: boolean) => {
  if (reduced) {
    value.x = value.target;
    value.velocity = 0;
    return false;
  }
  const count = Math.max(1, Math.ceil(delta * 240));
  const step = delta / count;
  for (let index = 0; index < count; index += 1) {
    const acceleration = -100 * (value.x - value.target) - 18 * value.velocity;
    value.velocity += acceleration * step;
    value.x += value.velocity * step;
  }
  if (Math.abs(value.x - value.target) < 0.05 && Math.abs(value.velocity) < 0.5) {
    value.x = value.target;
    value.velocity = 0;
    return false;
  }
  return true;
};

type Antenna = { index: number; solid: Solid; spring: Spring; pivot: Vec2; drawn: number };

const mountRouter = (svg: SVGSVGElement) => {
  let reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let pointer: Vec2 | null = null;
  let highlighted: Antenna | null = null;
  let animationFrame = 0;
  let previousTime = performance.now();
  const currentCamera = cam(45, 0.5, 1.78);
  const bounds: Vec3[] = [[0, 0, 0], [X1, Y1, 0], [X1, 0, 0], [0, Y1, 0]];
  XS.forEach((_, index) => [-MAX, 0, MAX].forEach((lean) => bounds.push(along(index, lean, L + 1))));
  fit(currentCamera, bounds);
  const projection = proj(currentCamera);
  const front = facing(currentCamera);
  const origin = projection(0, 0, 0);
  const diagonal = projection(D[0], D[1], 0);
  const horizontalScale = Math.hypot(diagonal[0] - origin[0], diagonal[1] - origin[1]);
  const verticalScale = origin[1] - projection(0, 0, 1)[1];
  const group = make("g", {}, svg);

  const body = createSolid(group);
  const foot = rrect(0, 0, X1, Y1, 13, 6);
  const top = rrect(3, 3, X1 - 3, Y1 - 3, 10, 6);
  const inner = rrect(4.6, 4.6, X1 - 4.6, Y1 - 4.6, 8.4, 6);
  setPaths(body, {
    silhouette: poly(hull(ringAt(projection, foot, 0).concat(ringAt(projection, top, H)))),
    crease: open(ringAt(projection, run(inner, front), H)),
  });

  for (let index = 0; index < 6; index += 1) {
    const z = H * 0.56;
    const point = projection(34 + index * 9, Y1 - 3 * (z / H) + 0.1, z);
    make(
      "circle",
      { class: index === 0 ? styles.galleryConnectivityActiveDot : styles.galleryConnectivityDot, cx: r2(point[0]), cy: r2(point[1]), r: 1.05 },
      group,
    );
  }

  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 13 - (row % 2); column += 1) {
      const point = projection(26 + (row % 2) * 3 + column * 6, 29 + row * 5.5, H);
      make(
        "ellipse",
        { class: styles.galleryConnectivityGrilleDot, cx: r2(point[0]), cy: r2(point[1]), rx: r2(0.5 * currentCamera.scale), ry: r2(0.5 * currentCamera.scale * currentCamera.k) },
        group,
      );
    }
  }

  const antennas: Antenna[] = XS.map((x, index) => {
    const boss = createSolid(group);
    const shift = (ring: Ring) => ring.map((point) => ({ ...point, u: point.u + x, v: point.v + YB }));
    setPaths(boss, prism(projection, front, shift(circ(4.6, 16)), shift(circ(3.5, 16)), H, H + 5));
    return { index, solid: createSolid(group), spring: spring(REST[index]), pivot: projection(...along(index, 0, 0)), drawn: Number.NaN };
  });
  const antennaGap = Math.abs(antennas[1].pivot[0] - antennas[0].pivot[0]) / horizontalScale;

  const disc = (center: Vec2, radius: number) =>
    Array.from({ length: 20 }, (_, index) => {
      const angle = (index * Math.PI) / 10;
      return [center[0] + radius * horizontalScale * Math.cos(angle), center[1] + radius * horizontalScale * Math.sin(angle)] as Vec2;
    });

  const drawAntenna = (antenna: Antenna) => {
    if (antenna.spring.x === antenna.drawn) return;
    antenna.drawn = antenna.spring.x;
    const lean = antenna.spring.x;
    const base = projection(...along(antenna.index, lean, 0));
    const tip = projection(...along(antenna.index, lean, L));
    const elbow = projection(...along(antenna.index, lean, L * 0.21));
    const length = Math.hypot(tip[0] - base[0], tip[1] - base[1]);
    const normal: Vec2 = [-(tip[1] - base[1]) / length, (tip[0] - base[0]) / length];
    const width = lerp(3.3, 2.1, 0.21) * horizontalScale - 1.1;
    setPaths(antenna.solid, {
      silhouette: poly(hull(disc(base, 3.3).concat(disc(tip, 2.1)))),
      crease: seg([elbow[0] + normal[0] * width, elbow[1] + normal[1] * width], [elbow[0] - normal[0] * width, elbow[1] - normal[1] * width]),
    });
  };

  const highlight = (antenna: Antenna) => {
    if (highlighted === antenna) return;
    highlighted?.solid.silhouette.classList.remove(styles.galleryConnectivityHighlighted);
    highlighted = antenna;
    highlighted.solid.silhouette.classList.add(styles.galleryConnectivityHighlighted);
  };

  const retarget = () => {
    if (!pointer) {
      antennas.forEach((antenna, index) => { antenna.spring.target = REST[index]; });
      highlight(antennas[3]);
      return;
    }
    const distances = antennas.map((antenna) => (pointer![0] - antenna.pivot[0]) / horizontalScale);
    const nearestDistance = Math.min(...distances.map(Math.abs));
    const nearest = antennas[distances.findIndex((distance) => Math.abs(distance) === nearestDistance)];
    antennas.forEach((antenna, index) => {
      const offset = Math.sign(distances[index]) * Math.max(Math.abs(distances[index]) - 4.4, 0);
      const height = Math.max((antenna.pivot[1] - pointer![1]) / verticalScale, Math.sqrt(Math.max(L * L - offset * offset, 0)), 0);
      const aim = (Math.atan2(offset, height) * 180) / Math.PI;
      const falloff = clamp(1 - (Math.abs(distances[index]) - nearestDistance) / antennaGap / RESPONSE_RANGE, 0.1, 1);
      antenna.spring.target = clamp(aim, -MAX, MAX) * falloff;
    });
    highlight(nearest);
  };

  const tick = (now: number) => {
    const delta = Math.min(0.05, Math.max(0, (now - previousTime) / 1000));
    previousTime = now;
    let moving = false;
    antennas.forEach((antenna) => { if (stepSpring(antenna.spring, delta, reduced)) moving = true; drawAntenna(antenna); });
    animationFrame = moving ? requestAnimationFrame(tick) : 0;
  };
  const wake = () => {
    if (!animationFrame) { previousTime = performance.now(); animationFrame = requestAnimationFrame(tick); }
  };
  const pointFromEvent = (event: PointerEvent): Vec2 => {
    const rect = svg.getBoundingClientRect();
    return [((event.clientX - rect.left) / rect.width) * 400, ((event.clientY - rect.top) / rect.height) * 320];
  };
  const onPointerMove = (event: PointerEvent) => { pointer = pointFromEvent(event); retarget(); wake(); };
  const onPointerLeave = () => { pointer = null; retarget(); wake(); };
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onMotionChange = (event: MediaQueryListEvent) => { reduced = event.matches; wake(); };

  antennas.forEach(drawAntenna);
  highlight(antennas[3]);
  svg.addEventListener("pointermove", onPointerMove);
  svg.addEventListener("pointerleave", onPointerLeave);
  motionQuery.addEventListener("change", onMotionChange);
  wake();

  return () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    svg.removeEventListener("pointermove", onPointerMove);
    svg.removeEventListener("pointerleave", onPointerLeave);
    motionQuery.removeEventListener("change", onMotionChange);
    svg.replaceChildren();
  };
};

export default function TemplateConnectivityFigure() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return undefined;
    return mountRouter(svgRef.current);
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 320"
      role="img"
      aria-label="Connectivity router with four antennas searching for the template service"
      className={styles.galleryConnectivityFigureSvg}
      fill="none"
    />
  );
}
