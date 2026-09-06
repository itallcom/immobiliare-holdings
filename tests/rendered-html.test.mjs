import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(await response.text(), developmentPreviewMeta);
});

test("renders only the approved public company statement", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("public", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Immobiliare Holdings is the parent company/);
  assert.match(html, /name="robots" content="noindex, nofollow/);
  assert.doesNotMatch(html, /Network Allcom|St Catherine|PostgreSQL|Capital allocation/i);
});

test("renders published CMS content and the operating-model structure", async (t) => {
  // Exercise published content rendering without depending on the live database.
  let contentRequests = 0;
  t.mock.method(globalThis, "fetch", async (input) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    assert.equal(url.pathname, "/rest/v1/site_content");
    assert.equal(url.searchParams.get("content_key"), "eq.company-profile");
    contentRequests += 1;
    return Response.json({ content: {
      title: "Company profile",
      intro: "Published company introduction.",
      sections: [{ heading: "Published ownership framework", paragraphs: ["Content published from the Control Room."] }],
    } });
  });
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("structure", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
  const context = { waitUntil() {}, passThroughOnException() {} };

  const companyResponse = await worker.fetch(
    new Request("http://localhost/company", { headers: { accept: "text/html" } }),
    env,
    context,
  );
  const companyHtml = await companyResponse.text();
  assert.equal(companyResponse.status, 200);
  assert.match(companyHtml, /Company profile/);
  assert.ok(contentRequests > 0, "the page must read published content from the CMS");
  assert.match(companyHtml, /Published ownership framework/);
  assert.match(companyHtml, /Content published from the Control Room/);
  assert.doesNotMatch(companyHtml, /Network Allcom|St Catherine|PostgreSQL/i);

  const modelResponse = await worker.fetch(
    new Request("http://localhost/operating-model", { headers: { accept: "text/html" } }),
    env,
    context,
  );
  const modelHtml = await modelResponse.text();
  assert.equal(modelResponse.status, 200);
  assert.match(modelHtml, /Holding–operating company relationship/);
  assert.match(modelHtml, /Division of responsibilities/);
  assert.doesNotMatch(modelHtml, /Network Allcom|St Catherine|PostgreSQL/i);
});
