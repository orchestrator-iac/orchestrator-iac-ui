import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { configureStore } from "@reduxjs/toolkit";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const read = (path) => readFileSync(resolve(root, path), "utf8");
function evaluate(source, bindings = {}) {
  const exports = {};
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  vm.runInNewContext(outputText, {
    exports,
    console,
    AbortController,
    ...bindings,
  });
  return exports;
}
function load(path, api) {
  return evaluate(read(path), {
    require: (id) =>
      id.endsWith("/apiService")
        ? { default: api }
        : id.startsWith(".")
          ? load(resolve(dirname(resolve(root, path)), `${id}.ts`), api)
          : require(id),
  });
}
const lookup = load("src/services/resourceLookup.ts");
const hydration = load("src/utils/graphHydration.ts");
const component = "src/components/orchestrator/Orchestrator.tsx";
const source = ts.createSourceFile(
  component,
  read(component),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
function expression(name, hook = false) {
  let result;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === name) {
      result = (
        hook ? node.initializer.arguments[0] : node.initializer
      ).getText(source);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(result, `Missing ${name}`);
  return result;
}
const callback = (name, bindings) =>
  evaluate(`export const run = ${expression(name, true)}`, bindings).run;
function effect(hook, needle, bindings) {
  let body;
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText(source) === hook &&
      node.arguments[0].getText(source).includes(needle)
    ) {
      body = node.arguments[0].getText(source);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(body, `Missing ${hook} for ${needle}`);
  return evaluate(`export const run = ${body}`, bindings).run;
}
const plain = (value) => JSON.parse(JSON.stringify(value));
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
};
const config = (configId, id = "vpc") => ({
  id,
  configId,
  cloudProvider: "aws",
  data: {
    configId,
    resourceId: id,
    resourceNode: {
      data: {
        fields: [configId],
        handles: ["port"],
        links: [],
        header: { label: "Catalog", icon: "catalog.svg" },
      },
    },
  },
});

test("batch thunk retains two versions of the same resource and separates legacy/provider lookups", async () => {
  const calls = [];
  const api = {
    post: async (_url, payload) => {
      calls.push(payload);
      return [config("v1").data, config("v2").data];
    },
  };
  const slice = load("src/store/resourceSlice.ts", api);
  const store = configureStore({ reducer: slice.default });
  const result = await store
    .dispatch(
      slice.fetchResourcesByLookups([
        { id: "vpc", cloudProvider: "AWS", configId: "v1" },
        { id: "vpc", cloudProvider: "aws", configId: "v2" },
        { id: "vpc", cloudProvider: "aws", configId: "v1" },
        { id: "vpc", cloudProvider: "aws" },
      ]),
    )
    .unwrap();
  assert.equal(calls[0].lookups.length, 3);
  assert.equal(result.items.length, 2);
  assert.ok(store.getState().resources["config:v1"]);
  assert.ok(store.getState().resources["config:v2"]);
  const indexed = lookup.indexResourceBatch(
    calls[0].lookups.map((item) => ({ ...item, id: item.resourceId })),
    result.items,
  );
  assert.equal(indexed.get("config:v1").configId, "v1");
  assert.equal(indexed.get("config:v2").configId, "v2");
  assert.equal(
    indexed.has("resource:vpc|aws"),
    false,
    "ambiguous versions require an explicit fallback",
  );
});

test("100+ nodes deduplicate by config ID and exclude alternative names from the initial request", () => {
  const candidates = Array.from({ length: 250 }, (_, i) => [
    { id: "vpc", cloudProvider: "aws", configId: `version-${i % 110}` },
    { id: `old-alias-${i}`, cloudProvider: "aws" },
  ]);
  const selected = lookup.primaryResourceLookups(candidates);
  assert.equal(selected.length, 110);
  assert.ok(selected.every((item) => item.configId));
});

test("provider metadata missing from older documents is recovered using config ID", async () => {
  const slice = load("src/store/resourceSlice.ts", {
    post: async () => [config("azure-config").data, config("aws-config").data],
  });
  const store = configureStore({ reducer: slice.default });
  const result = await store
    .dispatch(
      slice.fetchResourcesByLookups([
        { id: "vpc", cloudProvider: "aws", configId: "aws-config" },
        { id: "vpc", cloudProvider: "azure", configId: "azure-config" },
      ]),
    )
    .unwrap();
  assert.equal(
    result.items.find((item) => item.configId === "azure-config").cloudProvider,
    "azure",
  );
  assert.equal(
    result.items.find((item) => item.configId === "aws-config").cloudProvider,
    "aws",
  );
});

test("a deleted config ID resolves to a unique replacement, without confusing other versions", () => {
  const requests = [{ id: "vpc", cloudProvider: "aws", configId: "deleted" }];
  assert.equal(
    lookup
      .indexResourceBatch(requests, [config("replacement")])
      .get("config:deleted").configId,
    "replacement",
  );
  assert.equal(
    lookup.indexResourceBatch(requests, [config("v1"), config("v2")]).size,
    0,
  );
});

function harness() {
  const state = {
    nodes: [],
    edges: [],
    requests: [],
    graphHydrationGenerationRef: { current: 0 },
    isMountedRef: { current: true },
    routeEpochRef: { current: 0 },
    routeIdentityRef: { current: null },
  };
  const bindings = {
    ...lookup,
    ...hydration,
    graphHydrationGenerationRef: state.graphHydrationGenerationRef,
    isMountedRef: state.isMountedRef,
    setNodes: (value) => {
      state.nodes = typeof value === "function" ? value(state.nodes) : value;
    },
    setEdges: (value) => {
      state.edges = typeof value === "function" ? value(state.edges) : value;
    },
    setTemplateInfo() {},
    setInitOpen() {},
    user: {},
    MarkerType: { ArrowClosed: "arrowclosed" },
    runWithRouteLoading: (run) => run(),
    fetchCatalogResources: (lookups) => {
      const pending = deferred();
      state.requests.push({ ...pending, lookups });
      return pending.promise.then((items) =>
        lookup.indexResourceBatch(lookups, items),
      );
    },
  };
  bindings.getResourceLookupCandidates = evaluate(`
    const UUID_LENGTH = 36;
    const extractCatalogId = ${expression("extractCatalogId")};
    export const get = ${expression("getResourceLookupCandidates")};
  `).get;
  bindings.resolveResourceData = callback("resolveResourceData", {
    ...bindings,
    dispatch: () => {
      throw new Error("Unexpected per-resource fallback");
    },
    RESOURCE_FALLBACK_TIMEOUT_MS: 2000,
  });
  state.run = callback("loadSerializedGraph", bindings);
  state.bindings = bindings;
  return state;
}

function setupRoute(h, id = "route-a") {
  return effect("useLayoutEffect", "graphHydrationGenerationRef", {
    routeLoadCountRef: { current: 0 },
    setIsRouteLoading() {},
    setRouteLoadError() {},
    graphHydrationGenerationRef: h.graphHydrationGenerationRef,
    isMountedRef: h.isMountedRef,
    routeEpochRef: h.routeEpochRef,
    routeIdentityRef: h.routeIdentityRef,
    template_id: id,
    template_type: "custom",
    maestroDraftToken: null,
    routeLoadAttempt: 0,
    loadedOrchestratorIdRef: { current: null },
    requestedOrchestratorIdsRef: { current: new Set() },
    requestedTemplateIdsRef: { current: new Set() },
  });
}
const saved = (id, configId = "old") => ({
  id,
  resourceId: "vpc",
  resourceType: "alternate",
  configId,
  position: { x: 10, y: 20 },
  values: { name: "saved" },
});

test("late hydration preserves edits, moves, additions and deletions, while replacing stale config IDs", async () => {
  const h = harness();
  const pending = h.run(
    [saved("a"), saved("b"), saved("c")],
    [
      { id: "ab", source: "a", target: "b" },
      { id: "bc", source: "b", target: "c" },
    ],
    { cloud: "aws" },
  );
  assert.equal(h.requests[0].lookups.length, 1);
  h.nodes = h.nodes
    .filter((node) => node.id !== "c")
    .map((node) =>
      node.id === "a"
        ? {
            ...node,
            position: { x: 200, y: 300 },
            selected: true,
            data: {
              ...node.data,
              values: { name: "edited" },
              header: { ...node.data.header, label: "My label" },
            },
          }
        : node,
    );
  h.nodes.push({ id: "new", position: { x: 1, y: 1 }, data: { values: {} } });
  h.edges = h.edges
    .filter((edge) => edge.id === "ab")
    .map((edge) => ({
      ...edge,
      data: { ...edge.data, animated: false, custom: "edited" },
    }));
  h.edges.push({ id: "new-edge", source: "a", target: "new", data: {} });
  h.requests[0].resolve([config("replacement")]);
  await pending;
  assert.deepEqual(plain(h.nodes.map((node) => node.id)), ["a", "b", "new"]);
  assert.deepEqual(plain(h.nodes[0].position), { x: 200, y: 300 });
  assert.equal(h.nodes[0].data.values.name, "edited");
  assert.equal(h.nodes[0].data.header.label, "My label");
  assert.equal(h.nodes[0].data.__configId, "replacement");
  assert.deepEqual(plain(h.nodes[0].data.fields), ["replacement"]);
  assert.deepEqual(plain(h.edges.map((edge) => edge.id)), ["ab", "new-edge"]);
  assert.equal(h.edges[0].data.animated, false);
  assert.equal(h.edges[0].data.custom, "edited");
});

test("a previous graph response cannot overwrite a newer graph load", async () => {
  const h = harness();
  const first = h.run([saved("old-graph", "v1")], [], { cloud: "aws" });
  const second = h.run([saved("new-graph", "v2")], [], { cloud: "aws" });
  h.requests[1].resolve([config("v2")]);
  await second;
  h.requests[0].resolve([config("v1")]);
  await first;
  assert.equal(h.nodes.length, 1);
  assert.equal(h.nodes[0].id, "new-graph");
  assert.equal(h.nodes[0].data.__configId, "v2");
});

test("single-resource fallback retains the exact config ID and propagates cancellation", async () => {
  const calls = [];
  const api = {
    get: (url, options) => new Promise(() => calls.push({ url, options })),
  };
  const slice = load("src/store/resourceSlice.ts", api);
  const store = configureStore({ reducer: slice.default });
  const pending = store.dispatch(
    slice.fetchResourceById({
      id: "vpc",
      configId: "vpc/v1",
      cloudProvider: "aws",
    }),
  );
  pending.abort();
  const result = await pending;
  assert.equal(calls[0].url, "/configs/vpc%2Fv1");
  assert.equal(calls[0].options.signal.aborted, true);
  assert.equal(result.meta.aborted, true);
});

test("route cleanup invalidates catalog work still in flight", async () => {
  const h = harness();
  const setup = setupRoute(h);
  const cleanup = setup();
  const pending = h.run([saved("old")], [], { cloud: "aws" });
  cleanup();
  h.nodes = [];
  h.requests[0].resolve([config("replacement")]);
  await pending;
  assert.equal(h.nodes.length, 0);
});

test("an old orchestrator detail response cannot start hydration on a new route", async () => {
  const response = deferred();
  const routeEpochRef = { current: 1 };
  let request;
  let graphLoads = 0;
  const run = effect("useEffect", "requestedTemplateIdsRef.current.add", {
    template_id: "old",
    template_type: "custom",
    maestroDraftToken: null,
    isViewMode: false,
    isMountedRef: { current: true },
    routeEpochRef,
    loadedOrchestratorIdRef: { current: null },
    requestedOrchestratorIdsRef: { current: new Set() },
    runWithRouteLoading: (load) => {
      request = load();
      return request;
    },
    dispatch: () => ({ unwrap: () => response.promise }),
    fetchOrchestratorById: (id) => id,
    loadSerializedGraph: () => {
      graphLoads += 1;
    },
  });
  run();
  routeEpochRef.current += 1;
  response.resolve({ nodes: [], edges: [], templateInfo: {} });
  await request;
  assert.equal(graphLoads, 0);
});

test("StrictMode cleanup and setup of the same route allows pending hydration to finish", async () => {
  const h = harness();
  const setup = setupRoute(h);
  const cleanup = setup();
  const pending = h.run([saved("a")], [], { cloud: "aws" });
  cleanup();
  setup();
  h.requests[0].resolve([config("replacement")]);
  await pending;
  assert.equal(h.nodes[0].data.__configId, "replacement");
  assert.deepEqual(plain(h.nodes[0].data.fields), ["replacement"]);
});

test("a consumed Maestro prefill survives StrictMode replay without reopening the init dialog", async () => {
  const h = harness();
  const setup = setupRoute(h, "new");
  const cleanup = setup();
  let raw = JSON.stringify({
    nodes: [saved("a", "v1")],
    edges: [],
    templateInfo: { cloud: "aws" },
  });
  const dialogs = [];
  const run = effect("useEffect", "sessionStorage.getItem", {
    ...h.bindings,
    routeEpochRef: h.routeEpochRef,
    appliedPrefillEpochRef: { current: null },
    template_id: "new",
    template_type: "custom",
    searchParams: { has: () => false },
    sessionStorage: {
      getItem: () => raw,
      removeItem: () => {
        raw = null;
      },
    },
    extractCatalogId: () => "vpc",
    setInitOpen: (value) => dialogs.push(value),
    setTimeout: () => 0,
  });
  run();
  cleanup();
  setup();
  run();
  assert.equal(dialogs.at(-1), false);
  assert.equal(h.requests.length, 1);
  h.requests[0].resolve([config("v1")]);
  await new Promise((done) => setImmediate(done));
  assert.equal(h.nodes[0].id, "a");
  assert.equal(h.nodes[0].data.__configId, "v1");
});

test("an old route failure cannot change the current loading or error state", async () => {
  const routeEpochRef = { current: 1 };
  const errors = [];
  let ended = 0;
  const run = callback("runWithRouteLoading", {
    routeEpochRef,
    isMountedRef: { current: true },
    beginRouteLoad() {},
    endRouteLoad: () => {
      ended += 1;
    },
    setRouteLoadError: (error) => errors.push(error),
    window: { setTimeout: () => 1, clearTimeout() {} },
    ROUTE_LOAD_TIMEOUT_MS: 15000,
  });
  let rejectOld;
  const old = run(
    () =>
      new Promise((_resolve, reject) => {
        rejectOld = reject;
      }),
  );
  routeEpochRef.current += 1;
  rejectOld(new Error("old request failed"));
  await assert.rejects(old, /old request failed/);
  assert.equal(ended, 0);
  assert.equal(errors.length, 0);
  assert.equal(await run(async () => "current"), "current");
  assert.equal(ended, 1);
});

for (const navigateAway of [false, true]) {
  test(`Maestro draft owns its graph and ${navigateAway ? "ignores a late response after navigation" : "survives clearing its one-shot query"}`, async () => {
    const h = harness();
    setupRoute(h)();
    const loadedOrchestratorIdRef = { current: null };
    const reviews = [];
    const apply = callback("applyMaestroDraft", {
      ...h.bindings,
      routeEpochRef: h.routeEpochRef,
      routeLoadCountRef: { current: 0 },
      loadedOrchestratorIdRef,
      loadSerializedGraph: h.run,
      normalizeTemplateInfo: (value) => value,
      setCurrentOrchestratorId() {},
      setMaestroReviewDraft: (value) => reviews.push(value),
      setIsMaestroReviewDraftBannerDismissed() {},
      setPendingMaestroDraft() {},
      setReplaceDraftDialogOpen() {},
      setBaselineSnapshot() {},
      serializePersistedSnapshot: JSON.stringify,
    });
    const draft = {
      action: "update",
      targetOrchestratorId: "route-a",
      saveRequest: {
        templateInfo: { cloud: "aws" },
        nodes: [saved("a", "v1")],
        edges: [],
      },
    };
    const pending = apply(draft);
    assert.equal(loadedOrchestratorIdRef.current, "route-a");
    setupRoute(h, navigateAway ? "route-b" : "route-a")();
    h.requests[0].resolve([config("v1")]);
    await pending;
    assert.equal(reviews.length, navigateAway ? 0 : 1);
    if (!navigateAway) assert.deepEqual(plain(h.nodes[0].data.fields), ["v1"]);
  });
}
