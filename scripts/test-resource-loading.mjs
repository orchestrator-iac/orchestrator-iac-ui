import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { configureStore } from "@reduxjs/toolkit";

const require = createRequire(import.meta.url);
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function loadSlice(path, api) {
  const exports = {};
  const { outputText } = ts.transpileModule(read(path), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  vm.runInNewContext(outputText, {
    exports, AbortController, console,
    require: (id) => id.endsWith("/apiService") ? { default: api } : require(id),
  });
  return exports;
}

// Execute the actual component effect callbacks with the real Redux reducers.
// Simulate dependency changes and StrictMode cleanup/setup without a DOM.
function readLoadEffect(path, thunkName) {
  const source = ts.createSourceFile(path, read(path), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let callback;
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(source) === "useEffect" &&
        node.arguments[0].getText(source).includes(`dispatch(${thunkName}())`)) {
      callback = node.arguments[0].getText(source);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(callback, `Missing ${thunkName} effect in ${path}`);
  return callback;
}

const consumers = [
  "src/components/orchestrator/sidebar/Sidebar.tsx",
  "src/components/resources/ResourcesGallery.tsx",
];
const loaders = [
  ["fetchResources", "resources", "src/store/resourcesSlice.ts"],
  ["fetchTopResources", "resourceAnalytics", "src/store/resourceAnalyticsSlice.ts"],
];
const flush = () => new Promise((resolve) => setImmediate(resolve));

for (const consumer of consumers) {
  for (const [thunkName, stateKey, slicePath] of loaders) {
    test(`${consumer}: ${thunkName} survives loading transition and StrictMode replay`, async () => {
      const calls = [];
      const api = { get: (_url, { signal }) => new Promise((resolve) => calls.push({ signal, resolve })) };
      const slice = loadSlice(slicePath, api);
      const store = configureStore({ reducer: { [stateKey]: slice.default } });
      const effect = readLoadEffect(consumer, thunkName);
      const bindings = {
        dispatch: store.dispatch,
        [thunkName]: slice[thunkName],
        hasRetriedAnalyticsLoad: { current: false },
        hasRetriedFailedLoad: { current: false },
      };
      const renderEffect = (status) => vm.runInNewContext(`(${effect})()`, {
        ...bindings, status, resourcesStatus: status, analyticsStatus: status,
      });
      let cleanup = renderEffect("idle");
      // StrictMode replays the original render's effect with its idle closure.
      cleanup?.();
      cleanup = renderEffect("idle");
      // Redux pending changes the dependency, triggering cleanup again.
      cleanup?.();
      renderEffect(store.getState()[stateKey].status);
      await flush();
      assert.equal(store.getState()[stateKey].status, "loading", "request must not abort itself");
      assert.equal(calls.length, 1, "replay must not start duplicate requests");
      assert.equal(calls[0].signal.aborted, false);
      calls[0].resolve([{ resourceId: "vpc", count: 3 }]);
      await flush();
      assert.equal(store.getState()[stateKey].status, "succeeded");
      renderEffect("succeeded");
      assert.equal(calls.length, 1);
    });
  }
}
