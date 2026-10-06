const { Cam, clamp, facing, fillet, fit, hull, open, poly, proj, rad, ringAt, rrect, run, tdone, tset, tval, tween, disposer, mk, pointer, reflect, register } = HL;
const N = 5, W = 82, H = 56, G = 15;
const TAB_W = 24;
const TAB_H = 7;
const TAB_X = [7, 30, 53];
const REST = [-11, -7, -13, -8, -12];
const REST_LIFT = [1.5, 0, 2.5, 0.5, 1.5];
const BACK = -26;
const FWD = 22;
const LIFT = 17;
const X0 = -6;
const X1 = W + 6;
const Y0 = -10;
const Y1 = (N - 1) * G + 10;
const TRAY_H = 18;
const TRAY_R = 6;
const TRAY_WALL = 2.4;
const REST_MARK = 2;
const LR = (points) => points[0][0] <= points[points.length - 1][0] ? points : points.slice().reverse();
function tray(P, front, outer, inner) {
  const far = [
    [poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, TRAY_H)))), "sil"],
    [poly(ringAt(P, inner, TRAY_H)), "nf"],
    [open(ringAt(P, run(inner, (point) => !front(point)), 2.5)), "nf lo"],
  ];
  const innerFront = LR(ringAt(P, run(inner, front), TRAY_H));
  const outerTop = LR(ringAt(P, run(outer, front), TRAY_H));
  const outerBottom = LR(ringAt(P, run(outer, front), 0));
  const handleX = (X0 + X1) / 2;
  const onFront = (ring) => ring.map((point) => P(point.u, Y1, point.v));
  const near = [
    [
      poly([
        ...innerFront,
        outerTop[outerTop.length - 1],
        ...outerBottom.slice().reverse(),
        outerTop[0],
      ]),
      "fo",
    ],
    [open(outerTop), "nf lo"],
    [open(innerFront), "nf"],
    [open([outerTop[0], ...outerBottom, outerTop[outerTop.length - 1]]), "nf sil"],
    [poly(onFront(rrect(handleX - 11, 6.5, handleX + 11, 12.5, 3, 5))), "nf"],
    [poly(onFront(rrect(handleX - 9.4, 8, handleX + 9.4, 11, 1.5, 5))), "nf lo"],
  ];
  return { far, near };
}
function cardShape(i) {
  const tab = TAB_X[(N - 1 - i) % TAB_X.length];
  const shape = fillet(
    [
      [0, 0],
      [W, 0],
      [W, H],
      [tab + TAB_W, H],
      [tab + TAB_W, H + TAB_H],
      [tab, H + TAB_H],
      [tab, H],
      [0, H],
    ],
    [1, 1, 3.2, 1.8, 2.4, 2.4, 1.8, 3.2],
  );
  return { tab, shape };
}
function pose(P, shape, tab, row, angle, lift) {
  const yb = row * G;
  const sine = Math.sin(rad(angle));
  const cosine = Math.cos(rad(angle));
  const point = (u, v) => P(u, yb + v * sine, v * cosine + lift);
  const back = (u, v) => P(u, yb + v * sine - 2.2 * cosine, v * cosine + 2.2 * sine + lift);
  const line = (u, v) => open([point(u, v), point(W - u, v)]);
  return {
    back: poly(shape.map((part) => back(part[0], part[1]))),
    face: poly(shape.map((part) => point(part[0], part[1]))),
    crease: line(6, H - 10),
    detail: line(8, H - 20) + line(8, H - 28),
    tab: poly([
      point(tab + 3, H + 1.5),
      point(tab + TAB_W - 3, H + 1.5),
      point(tab + TAB_W - 3, H + TAB_H - 2),
      point(tab + 3, H + TAB_H - 2),
    ]),
  };
}
function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stagger = value;
  const camera = Cam(45, 0.5, 1.67);
  fit(
    camera,
    [
      [X0, Y0, 0],
      [X1, Y1, -8],
      [X0, Y0, H + TAB_H],
      [X1, Y0, H + TAB_H + LIFT],
    ],
    200,
    166,
  );
  const P = proj(camera);
  const front = facing(camera);
  const outer = rrect(X0, Y0, X1, Y1, TRAY_R, 6);
  const inner = rrect(X0 + TRAY_WALL, Y0 + TRAY_WALL, X1 - TRAY_WALL, Y1 - TRAY_WALL, TRAY_R - TRAY_WALL, 6);
  const paths = tray(P, front, outer, inner);
  const group = mk("g", {}, svg);
  reflect(svg, group, P, front, outer, 0, 14);
  for (const [d, cls] of paths.far) mk("path", { d, class: cls }, group);
  const cards = [];
  for (let i = 0; i < N; i += 1) {
    const { tab, shape } = cardShape(i);
    const cardGroup = mk("g", {}, group);
    cards.push({
      tab,
      shape,
      back: mk("path", { class: "lo" }, cardGroup),
      face: mk("path", { class: "sil" }, cardGroup),
      crease: mk("path", { class: "nf" }, cardGroup),
      detail: mk("path", { class: "nf lo" }, cardGroup),
      tabPath: mk("path", { class: "nf lo" }, cardGroup),
      angle: tween(REST[i]),
      lift: tween(REST_LIFT[i]),
    });
  }
  for (const [d, cls] of paths.near) mk("path", { d, class: cls }, group);
  const top = (i) => P(W / 2, i * G + H * Math.sin(rad(REST[i])), H * Math.cos(rad(REST[i])));
  const c0 = top(0);
  const c1 = top(1);
  const direction = [c1[0] - c0[0], c1[1] - c0[1]];
  const px0 = P(0, 0, 0);
  const px1 = P(1, 0, 0);
  const across = [px1[0] - px0[0], px1[1] - px0[1]];
  const half = W / 2 + 6;
  const determinant = direction[0] * across[1] - direction[1] * across[0];
  function hit([x, y]) {
    const qx = x - c0[0];
    const qy = y - c0[1];
    const s = (qx * across[1] - qy * across[0]) / determinant;
    const r = (direction[0] * qy - direction[1] * qx) / determinant;
    if (Math.abs(r) > half || s < -0.5 || s > N + 1) return -1;
    return clamp(Math.round(s), 0, N - 1);
  }
  function draw(i, angle, lift) {
    const card = cards[i];
    const next = pose(P, card.shape, card.tab, i, angle, lift);
    card.back.setAttribute("d", next.back);
    card.face.setAttribute("d", next.face);
    card.crease.setAttribute("d", next.crease);
    card.detail.setAttribute("d", next.detail);
    card.tabPath.setAttribute("d", next.tab);
  }
  const clock = register(stage, (_dt, now) => {
    let moving = false;
    cards.forEach((card, i) => {
      draw(i, tval(card.angle, now), tval(card.lift, now));
      if (!tdone(card.angle, now) || !tdone(card.lift, now)) moving = true;
    });
    return moving;
  });
  bag.add(clock.unregister);
  let active = -1;
  function setActive(next) {
    if (next === active) return;
    const now = performance.now();
    const from = next >= 0 ? next : active;
    active = next;
    cards.forEach((card, i) => {
      const delay = Math.abs(i - from) * stagger;
      const angle = next < 0 ? REST[i] : i < next ? BACK : i > next ? FWD : 0;
      const lift = next < 0 ? REST_LIFT[i] : i === next ? LIFT : 0;
      tset(card.angle, angle, now, delay);
      tset(card.lift, lift, now, delay);
      const highlighted = next < 0 ? i === REST_MARK : i === next;
      card.face.classList.toggle("hi", highlighted);
      card.crease.classList.toggle("hi", highlighted);
    });
    read.textContent = next < 0 ? "rest" : "template " + (next + 1) + " · 0";
    clock.wake();
  }
  cards[REST_MARK].face.classList.add("hi");
  cards[REST_MARK].crease.classList.add("hi");
  read.textContent = "rest";
  bag.add(pointer(stage, { move: (point) => setActive(hit(point)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());
  return {
    set: (next) => {
      stagger = next;
    },
    destroy: bag.dispose,
  };
}
figure({
  name: "template-rack",
  means: "Five empty blueprint cards wait in a rack; the card under the pointer stands up, but every card still holds zero patterns.",
  rules: [1, 2, 4, 5, 8, 9, 10],
  range: [0, 42, 90],
  mount,
});
