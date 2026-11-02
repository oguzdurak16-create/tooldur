// Browser regression checks with isolated auth/database responses. Never writes real user data.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium, webkit } = require(
  process.env.PLAYWRIGHT_MODULE || "playwright",
);
const engine = process.env.UI_TEST_ENGINE || "chromium";
const base = process.env.UI_TEST_URL || "http://localhost:3816";
const origin = new URL(base).origin;
const output = process.env.UI_TEST_OUTPUT || "/tmp/tooldur-workspace-ui";
const uid = "00000000-0000-4000-8000-000000000001";
const user = {
  id: uid,
  aud: "authenticated",
  role: "authenticated",
  email: "muhendis@example.test",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: { full_name: "Test Mühendis" },
  created_at: "2026-01-01T00:00:00Z",
};
const now = new Date().toISOString();
const project = {
  id: "00000000-0000-4000-8000-000000000010",
  ad: "Atölye tasarımı",
  aciklama: "Üretim hattı revizyonu",
  sahip_uid: uid,
  renk: "#246ca2",
  emoji: "📐",
  created_at: now,
};
const task = {
  id: "00000000-0000-4000-8000-000000000020",
  proje_id: project.id,
  baslik: "Mil hesabını kontrol et",
  aciklama: "Teknik çizim ve ölçüleri gözden geçir.",
  durum: "yapilacak",
  oncelik: "yuksek",
  olusturan_uid: uid,
  created_at: now,
  updated_at: now,
  etiketler: ["tasarım"],
  checklistler: [],
  atananlar: [],
  termin: null,
};
const checks = [];
const transportSettlers = new WeakMap();
const pass = (message) => {
  checks.push(message);
  console.error("PASS", message);
};
async function setup(browser, signedIn = true, theme = "light", empty = false) {
  const ctx = await browser.newContext({
    viewport: { width: 393, height: 780 },
    isMobile: true,
    hasTouch: true,
    serviceWorkers: "block",
  });
  const state = {
    projects: empty
      ? []
      : [
          { ...project },
          {
            ...project,
            id: "fixture-project-two",
            ad: "Montaj ve test planı",
            aciklama: "Yeni üretim hattı için hazırlıklar",
            renk: "#237849",
            emoji: "📁",
          },
          {
            ...project,
            id: "fixture-project-three",
            ad: "Mekanik sistem doğrulaması ve üretim hazırlığı",
            renk: "#7c3aed",
            emoji: "🔧",
          },
        ],
    tasks: empty ? [] : [{ ...task }],
    failWrite: false,
    failReads: false,
    failRecent: false,
    writes: [],
  };
  await ctx.addInitScript(
    ({ signedIn, theme, user, origin }) => {
      if (location.origin !== origin) return;
      if (sessionStorage.getItem("workspace-test-seeded")) return;
      sessionStorage.setItem("workspace-test-seeded", "1");
      localStorage.setItem("td-theme", theme);
      localStorage.setItem(
        "tooldur_cookie_consent",
        JSON.stringify({
          analytics: false,
          advertising: false,
          necessary: true,
          timestamp: Date.now(),
          version: "1.0",
        }),
      );
      if (signedIn) {
        const exp = Math.floor(Date.now() / 1000) + 3600;
        const enc = (value) =>
          btoa(JSON.stringify(value))
            .replace(/=/g, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");
        localStorage.setItem(
          "tooldur-auth",
          JSON.stringify({
            access_token:
              enc({ alg: "HS256", typ: "JWT" }) +
              "." +
              enc({
                exp,
                sub: user.id,
                aud: "authenticated",
                role: "authenticated",
              }) +
              ".fixture-signature",
            token_type: "bearer",
            expires_at: exp,
            expires_in: 3600,
            refresh_token: "fixture-refresh",
            user,
          }),
        );
      }
    },
    { signedIn, theme, user, origin },
  );
  const page = await ctx.newPage();
  const errors = [];
  let activeRequests = 0;
  page.on("pageerror", (e) => errors.push(e.message));
  await page.routeWebSocket("**/realtime/v1/**", (ws) => {
    ws.onMessage((message) => {
      const [join, ref, topic, event, payload] = JSON.parse(message.toString());
      if (event === "phx_join")
        ws.send(
          JSON.stringify([
            join,
            ref,
            topic,
            "phx_reply",
            {
              status: "ok",
              response: {
                postgres_changes: (payload.config?.postgres_changes || []).map(
                  (change, i) => ({ ...change, id: i + 1 }),
                ),
              },
            },
          ]),
        );
      if (event === "heartbeat")
        ws.send(
          JSON.stringify([
            join,
            ref,
            topic,
            "phx_reply",
            { status: "ok", response: {} },
          ]),
        );
    });
  });
  await page.route("**/*", async (route) => {
    activeRequests += 1;
    try {
      const req = route.request(),
        url = new URL(req.url());
      if (url.hostname.endsWith(".supabase.co")) {
        const cors = {
          "access-control-allow-origin": origin,
          "access-control-allow-headers": "*",
          "access-control-allow-methods": "GET,POST,PATCH,DELETE,HEAD,OPTIONS",
          "access-control-expose-headers": "content-range",
          "content-type": "application/json",
        };
        if (req.method() === "OPTIONS")
          return route.fulfill({ status: 204, headers: cors });
        if (url.pathname.startsWith("/auth/"))
          return route.fulfill({
            status: 200,
            headers: cors,
            body: JSON.stringify(user),
          });
        const table = url.pathname.split("/").pop();
        const db = {
          profiles: [
            {
              id: uid,
              full_name: "Test Mühendis",
              branch: "makine",
              title: "Mühendis",
            },
          ],
          calculation_history: [
            {
              id: "h1",
              user_id: uid,
              tool_name: "Ohm Kanunu",
              summary: "2 A × 10 Ω = 20 V",
              calculated_at: now,
            },
          ],
          notes: [{ id: "n1", user_id: uid }],
          pm_projeler: state.projects,
          pm_gorevler: state.tasks,
          pm_proje_uyeler: [],
          pm_davetler: [],
          pm_kullanici_profiller: [
            {
              uid,
              email: user.email,
              display_name: "Test Mühendis",
              photo_url: "",
            },
          ],
          pm_aktiviteler: [],
          pm_ekler: [],
          pm_yorumlar: [],
        };
        if (
          state.failReads &&
          ["profiles", "notes", "calculation_history"].includes(table)
        )
          return route.fulfill({
            status: 503,
            headers: cors,
            body: JSON.stringify({
              message: "Test: kayıtlar geçici olarak kullanılamıyor",
            }),
          });
        if (
          state.failRecent &&
          table === "calculation_history" &&
          req.method() === "GET"
        )
          return route.fulfill({
            status: 503,
            headers: cors,
            body: JSON.stringify({
              message: "Test: son kayıtlar geçici olarak kullanılamıyor",
            }),
          });
        let rows = db[table] || [];
        if (!["GET", "HEAD"].includes(req.method())) {
          const payload = req.postDataJSON();
          state.writes.push({ method: req.method(), table, payload });
          if (state.failWrite) {
            state.failWrite = false;
            return route.fulfill({
              status: 503,
              headers: cors,
              body: JSON.stringify({ message: "Test: kayıt kaydedilemedi" }),
            });
          }
          if (req.method() === "POST") {
            const row = {
              id: "fixture-" + state.writes.length,
              created_at: now,
              updated_at: now,
              ...payload,
            };
            rows.push(row);
            return route.fulfill({
              status: 201,
              headers: cors,
              body: JSON.stringify(
                req.headers().accept?.includes("vnd.pgrst.object")
                  ? row
                  : [row],
              ),
            });
          }
          for (const row of rows)
            if (
              !url.searchParams.get("id") ||
              url.searchParams.get("id") === "eq." + row.id
            )
              Object.assign(row, payload || {});
          return route.fulfill({ status: 200, headers: cors, body: "[]" });
        }
        for (const [column, filter] of url.searchParams)
          if (filter.startsWith("eq."))
            rows = rows.filter(
              (row) => String(row[column]) === filter.slice(3),
            );
        return route.fulfill({
          status: 200,
          headers: {
            ...cors,
            "content-range": `0-${Math.max(0, rows.length - 1)}/${rows.length}`,
          },
          body:
            req.method() === "HEAD"
              ? ""
              : JSON.stringify(
                  req.headers().accept?.includes("vnd.pgrst.object")
                    ? rows[0] || null
                    : rows,
                ),
        });
      }
      if (url.origin !== origin) return route.abort();
      const headers = Object.fromEntries(
        Object.entries(await req.allHeaders()).filter(([k]) =>
          [
            "rsc",
            "next-router-state-tree",
            "next-router-prefetch",
            "next-router-segment-prefetch",
            "next-url",
            "accept",
          ].includes(k),
        ),
      );
      const relay = process.env.UI_TEST_RELAY;
      if (req.method() === "OPTIONS")
        return route.fulfill({
          status: 204,
          headers: {
            "access-control-allow-origin": origin,
            "access-control-allow-credentials": "true",
            "access-control-allow-headers":
              "rsc,next-router-state-tree,next-router-prefetch,next-router-segment-prefetch,next-url,accept",
            "access-control-allow-methods": "GET,OPTIONS",
          },
        });
      const source = process.env.UI_TEST_SOURCE;
      const response = await page.request.get(
        relay
          ? relay +
              "?url=" +
              encodeURIComponent(url.href) +
              "&headers=" +
              encodeURIComponent(JSON.stringify(headers))
          : source
            ? source + url.pathname + url.search
            : url.href,
        { headers: relay ? {} : headers, timeout: 45000 },
      );
      await route.fulfill({
        status: response.status(),
        headers: {
          "access-control-allow-origin": origin,
          "access-control-allow-credentials": "true",
          ...Object.fromEntries(
            Object.entries(response.headers()).filter(
              ([k]) =>
                ["content-type", "vary", "cache-control"].includes(k) ||
                k.startsWith("x-nextjs-"),
            ),
          ),
        },
        body: await response.body(),
      });
    } catch (e) {
      if (
        !/Target.*closed|context disposed|Route is already handled|Request.*canceled/i.test(
          e.message,
        )
      )
        throw e;
    } finally {
      activeRequests -= 1;
    }
  });
  transportSettlers.set(page, async () => {
    const deadline = Date.now() + 60000;
    let stableSince = 0;
    while (Date.now() < deadline) {
      if (activeRequests === 0) {
        stableSince ||= Date.now();
        if (Date.now() - stableSince >= 300) return;
      } else stableSince = 0;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error(
      "Browser transport still has " + activeRequests + " pending requests",
    );
  });

  return {
    ctx,
    page,
    state,
    errors,
    close: async () => {
      await page.unrouteAll({ behavior: "ignoreErrors" });
      await ctx.close();
    },
  };
}
function luminance(rgb) {
  const c = rgb
    .match(/[\d.]+/g)
    .slice(0, 3)
    .map(Number)
    .map((v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
  return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
}
async function checkSelectedContrast(page) {
  await page
    .locator(".pm-tab.is-active")
    .evaluate((e) => getComputedStyle(e).color);
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((a) => !(a instanceof CSSTransition) || a.playState !== "running"),
  );
  const colors = await page.locator(".pm-tab.is-active").evaluate((e) => ({
    text: getComputedStyle(e).color,
    bg: getComputedStyle(e).backgroundColor,
  }));
  const a = luminance(colors.text),
    b = luminance(colors.bg);
  assert.ok(
    (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5,
    "unreadable selected tab: " + JSON.stringify(colors),
  );
}
async function fit(page) {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "page overflow",
  );
}
async function settle(page) {
  // Routed requests can still be fetching upstream after browser networkidle.
  await page.waitForLoadState("networkidle");
  await transportSettlers.get(page)?.();
}
async function ready(page, route = "/dashboard") {
  if (page.url() !== "about:blank") await settle(page);
  await page.goto(base + route, { waitUntil: "load", timeout: 60000 });
  await page
    .getByRole("heading", {
      name: route === "/dashboard" ? "Mühendislik masası" : "Atölye tasarımı",
      exact: true,
    })
    .waitFor();
  await settle(page);
}
async function fakeKeyboard(page, height = 330) {
  await page.evaluate((height) => {
    Object.defineProperty(visualViewport, "height", {
      configurable: true,
      get: () => height,
    });
    visualViewport.dispatchEvent(new Event("resize"));
  }, height);
  await page.waitForFunction(
    (height) =>
      document.documentElement.style.getPropertyValue(
        "--visual-viewport-height",
      ) ===
      height + "px",
    height,
  );
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await (engine === "webkit" ? webkit : chromium).launch({
    ...(process.env.UI_TEST_EXECUTABLE
      ? { executablePath: process.env.UI_TEST_EXECUTABLE }
      : {}),
    ...(engine === "chromium" ? { args: ["--no-sandbox"] } : {}),
  });
  try {
    for (const theme of ["light", "dark"]) {
      const t = await setup(browser, true, theme),
        { page, state } = t;
      try {
        await ready(page);
        assert.equal(
          await page
            .getByRole("region", { name: "Tooldur destek ve reklam alanı" })
            .count(),
          0,
        );
        assert.equal(
          await page.locator("html").getAttribute("data-theme"),
          theme,
        );
        assert.match(
          await page.locator('[aria-label="Kayıt özeti"]').innerText(),
          /1/,
        );
        for (const width of [
          320, 393, 768, 1024, 1100, 1215, 1280, 1440, 1519,
        ]) {
          await page.setViewportSize({ width, height: 900 });
          await fit(page);
        }
        await page.setViewportSize({ width: 393, height: 780 });
        await page.screenshot({
          path: `${output}/${engine}-dashboard-${theme}.png`,
          fullPage: true,
        });
        await settle(page);
        await page.getByRole("link", { name: /^Projelerim/ }).click();
        await page
          .getByRole("heading", { name: "Atölye tasarımı", exact: true })
          .waitFor();
        await settle(page);
        await page.goBack();
        await page
          .getByRole("heading", { name: "Mühendislik masası", exact: true })
          .waitFor();
        await fit(page);
        await page
          .getByRole("searchbox", { name: "Panelde araç ara" })
          .fill("ohm");
        await page
          .locator('[data-dashboard] a[href="/arac/ohm-kanunu-hesaplama"]')
          .waitFor();
        await settle(page);
        await page
          .getByRole("searchbox", { name: "Panelde araç ara" })
          .press("Enter");
        await page.waitForURL("**/arac/ohm-kanunu-hesaplama");
        await page
          .getByRole("heading", { name: /Ohm Kanunu/ })
          .first()
          .waitFor();
        await settle(page);
        pass(theme + ": panel layout, real count responses, tool search");
        await ready(page, "/proje-yonetimi");
        await page.locator(".pm-task-card").first().waitFor();
        for (const width of [
          320, 393, 768, 1024, 1100, 1215, 1280, 1440, 1519,
        ]) {
          await page.setViewportSize({ width, height: 900 });
          await fit(page);
        }
        await page.setViewportSize({ width: 1519, height: 596 });
        await fit(page);
        const lanes = await page.locator(".pm-column").evaluateAll((es) =>
          es.map((e) => {
            const r = e.getBoundingClientRect();
            return { x: r.x, right: r.right, y: r.y };
          }),
        );
        assert.equal(lanes.length, 4);
        assert.equal(new Set(lanes.map((l) => Math.round(l.y))).size, 1);
        assert.ok(lanes.every((l) => l.x >= 0 && l.right <= 1520));
        const newTaskBounds = await page
          .locator(".pm-top-actions")
          .getByRole("button", { name: "Yeni görev", exact: true })
          .boundingBox();
        assert.ok(newTaskBounds.x + newTaskBounds.width <= 1520);
        await settle(page);
        await page.screenshot({
          path: `${output}/${engine}-desktop-board-${theme}.png`,
        });
        await page
          .getByRole("button", { name: /^Montaj ve test planı/ })
          .click();
        await page
          .getByRole("heading", {
            name: "Bu projede ne yapacağız?",
            exact: true,
          })
          .waitFor();
        assert.equal(await page.locator(".pm-board").count(), 0);
        await page.screenshot({
          path: `${output}/${engine}-desktop-empty-${theme}.png`,
        });
        await page
          .getByRole("searchbox", { name: "Projelerde ara" })
          .fill("bulunamayanproje");
        await page
          .getByRole("status")
          .filter({ hasText: "Bu adla proje bulunamadı." })
          .waitFor();
        await page.getByRole("searchbox", { name: "Projelerde ara" }).fill("");
        await page.getByRole("button", { name: /^Atölye tasarımı/ }).click();
        await page.locator(".pm-task-card").first().waitFor();
        await page.setViewportSize({ width: 393, height: 780 });
        assert.equal(
          await page.locator(".pm-topbar .pm-new-project").isVisible(),
          true,
        );
        for (const label of ["Takım", "Proje ayarları", "Yeni görev"])
          assert.equal(
            await page
              .locator(".pm-top-actions")
              .getByRole("button", { name: label, exact: true })
              .isVisible(),
            true,
          );
        const bg = await page
          .locator(".pm-topbar")
          .evaluate((e) => getComputedStyle(e).backgroundColor);
        assert.equal(
          bg,
          theme === "light" ? "rgb(255, 255, 255)" : "rgb(25, 37, 52)",
        );
        await page.getByRole("button", { name: /temaya geç/ }).click();
        const otherTheme = theme === "light" ? "dark" : "light";
        await page.waitForFunction(
          (t) => document.documentElement.dataset.theme === t,
          otherTheme,
        );
        await checkSelectedContrast(page);
        assert.equal(
          await page
            .locator(".pm-topbar")
            .evaluate((e) => getComputedStyle(e).backgroundColor),
          otherTheme === "light" ? "rgb(255, 255, 255)" : "rgb(25, 37, 52)",
        );
        await page.getByRole("button", { name: /temaya geç/ }).click();
        await page.waitForFunction(
          (t) => document.documentElement.dataset.theme === t,
          theme,
        );
        await checkSelectedContrast(page);
        await page.keyboard.press("Control+k");
        assert.ok(
          await page
            .locator("#pm-global-search")
            .evaluate((e) => e === document.activeElement),
        );
        assert.equal(await page.getByRole("dialog").count(), 0);
        await page
          .locator(".pm-task-card select")
          .first()
          .dispatchEvent("keydown", { key: "Enter", bubbles: true });
        assert.equal(await page.getByRole("dialog").count(), 0);
        await page.screenshot({
          path: `${output}/${engine}-projects-${theme}.png`,
          fullPage: true,
        });
        await page.getByRole("tab", { name: "Liste", exact: true }).click();
        await page
          .getByRole("textbox", { name: "Projede görev ara" })
          .fill("zz-no-match");
        await page
          .locator(".pm-task-table tbody tr")
          .count()
          .then((count) => assert.equal(count, 0));
        await page.getByRole("textbox", { name: "Projede görev ara" }).fill("");
        await page.getByRole("tab", { name: "Kanban", exact: true }).click();
        await page.getByRole("textbox", { name: "Projede görev ara" }).fill("");
        const patch = page.waitForResponse(
          (r) =>
            r.url().includes("/rest/v1/pm_gorevler") &&
            r.request().method() === "PATCH",
        );
        await page
          .locator(".pm-task-card select")
          .first()
          .selectOption("devam");
        await patch;
        assert.ok(
          state.writes.some(
            (w) => w.method === "PATCH" && w.payload.durum === "devam",
          ),
        );
        await page.getByRole("tab", { name: "Takvim", exact: true }).click();
        await page.getByRole("tab", { name: "Analiz", exact: true }).click();
        await page
          .getByRole("heading", { name: "Proje sağlığı", exact: true })
          .waitFor();
        pass(
          theme +
            ": project theme, mobile actions, search, status change, views",
        );
        const trigger = page.locator(".pm-new-project");
        await trigger.click();
        let modal = page.getByRole("dialog", {
          name: "Yeni proje",
          exact: true,
        });
        await modal.waitFor();
        await page.waitForFunction(() =>
          document
            .querySelector('[role="dialog"]')
            .contains(document.activeElement),
        );
        const last = modal.getByRole("button", {
          name: "Projeyi oluştur",
          exact: true,
        });
        await modal
          .getByLabel("Proje adı", { exact: true })
          .fill("Mobil test projesi");
        await last.focus();
        await page.keyboard.press("Tab");
        assert.ok(
          await modal.evaluate((e) => e.contains(document.activeElement)),
        );
        await fakeKeyboard(page);
        assert.ok((await modal.boundingBox()).height <= 331);
        await page.evaluate(() => {
          delete visualViewport.height;
          visualViewport.dispatchEvent(new Event("resize"));
        });
        await page.keyboard.press("Escape");
        assert.ok(await trigger.evaluate((e) => e === document.activeElement));
        await trigger.click();
        modal = page.getByRole("dialog", { name: "Yeni proje", exact: true });
        await modal
          .getByLabel("Proje adı", { exact: true })
          .fill("Mobil test projesi");
        state.failWrite = true;
        await modal
          .getByRole("button", { name: "Projeyi oluştur", exact: true })
          .click();
        await modal.locator(".pm-error-banner").waitFor();
        assert.equal(await modal.isVisible(), true);
        await modal
          .getByRole("button", { name: "Projeyi oluştur", exact: true })
          .click();
        await modal.waitFor({ state: "hidden" });
        await page
          .getByRole("heading", { name: "Mobil test projesi", exact: true })
          .waitFor();
        await page
          .locator(".pm-top-actions")
          .getByRole("button", { name: "Yeni görev", exact: true })
          .click();
        modal = page.getByRole("dialog", { name: "Yeni görev", exact: true });
        await modal
          .getByLabel("Görev başlığı", { exact: true })
          .fill("Ölçüleri doğrula");
        await modal
          .getByRole("button", { name: "Görevi oluştur", exact: true })
          .click();
        await modal.waitFor({ state: "hidden" });
        await page.getByRole("tab", { name: "Kanban", exact: true }).click();
        await page
          .locator(".pm-task-card")
          .filter({ hasText: "Ölçüleri doğrula" })
          .waitFor();
        await page
          .locator(".pm-task-card")
          .filter({ hasText: "Ölçüleri doğrula" })
          .click();
        modal = page.getByRole("dialog", {
          name: "Görev detayları",
          exact: true,
        });
        await modal.waitFor();
        await fakeKeyboard(page);
        assert.ok((await modal.boundingBox()).height <= 331);
        await page.keyboard.press("Escape");
        await page.evaluate(() => {
          delete visualViewport.height;
          visualViewport.dispatchEvent(new Event("resize"));
        });
        pass(
          theme +
            ": dialogs trap/restore focus, fit keyboard, report failed save, create project/task immediately",
        );
        await ready(page);
        state.failReads = true;
        await page.reload();
        await page
          .getByRole("alert")
          .filter({ hasText: "Bazı kayıtlar" })
          .waitFor();
        state.failReads = false;
        await page
          .getByRole("button", { name: "Yeniden dene", exact: true })
          .click();
        await page.waitForFunction(
          () => !document.querySelector('[data-dashboard] [role="alert"]'),
        );
        await settle(page);
        state.failRecent = true;
        await page.reload();
        await page
          .getByRole("heading", { name: "Kayıtlar yüklenemedi", exact: true })
          .waitFor();
        assert.match(
          await page.locator('[aria-label="Kayıt özeti"]').innerText(),
          /1/,
        );
        state.failRecent = false;
        await page
          .getByRole("button", { name: "Yeniden dene", exact: true })
          .click();
        await page.getByRole("link", { name: /Ohm Kanunu.*20 V/ }).waitFor();
        assert.deepEqual(t.errors, []);
        pass(
          theme +
            ": failed reads and partial history errors recover with no page errors",
        );
      } catch (e) {
        await page.screenshot({
          path: `${output}/${engine}-failure.png`,
          fullPage: true,
        });
        throw e;
      } finally {
        await t.close();
      }
    }
    const empty = await setup(browser, true, "light", true);
    try {
      await empty.page.goto(base + "/proje-yonetimi", { waitUntil: "load" });
      await empty.page
        .getByRole("heading", { name: "Projelerim", exact: true })
        .waitFor();
      await empty.page
        .getByText("İlk projenle başla", { exact: true })
        .waitFor();
      await empty.page.locator(".pm-topbar .pm-new-project").click();
      let modal = empty.page.getByRole("dialog", {
        name: "Yeni proje",
        exact: true,
      });
      await modal
        .getByLabel("Proje adı", { exact: true })
        .fill("İlk çalışma alanım");
      await modal
        .getByRole("button", { name: "Projeyi oluştur", exact: true })
        .click();
      await empty.page
        .getByRole("heading", { name: "Bu projede ne yapacağız?", exact: true })
        .waitFor();
      await fit(empty.page);
      await empty.page.screenshot({
        path: `${output}/${engine}-mobile-empty.png`,
        fullPage: true,
      });
      await empty.page
        .getByRole("button", { name: "İlk görevi ekle", exact: true })
        .click();
      modal = empty.page.getByRole("dialog", {
        name: "Yeni görev",
        exact: true,
      });
      await modal
        .getByLabel("Görev başlığı", { exact: true })
        .fill("Teknik gereksinimleri belirle");
      await modal
        .getByRole("button", { name: "Görevi oluştur", exact: true })
        .click();
      await empty.page
        .locator(".pm-task-card")
        .filter({ hasText: "Teknik gereksinimleri belirle" })
        .waitFor();
      assert.deepEqual(empty.errors, []);
      pass(
        "first project and first task: actionable onboarding replaces four empty columns",
      );
    } finally {
      await empty.close();
    }
    const guest = await setup(browser, false);
    try {
      await guest.page.goto(base + "/dashboard", { waitUntil: "load" });
      await guest.page.waitForURL("**/giris?redirect=%2Fdashboard");
      await settle(guest.page);
      await guest.page.goto(base + "/proje-yonetimi", { waitUntil: "load" });
      await guest.page
        .getByRole("heading", { name: "Hesabınla giriş yap", exact: true })
        .waitFor();
      assert.equal(
        await guest.page
          .getByRole("link", { name: "Giriş yap veya üye ol" })
          .getAttribute("href"),
        "/giris?redirect=%2Fproje-yonetimi",
      );
      const icons = await guest.page
        .locator('link[rel="icon"]')
        .evaluateAll((es) => es.map((e) => e.getAttribute("href")));
      assert.ok(icons.some((url) => url.includes("favicon.svg?v=20261102")));
      assert.equal(icons.filter((url) => url === "/favicon.ico").length, 0);
      assert.deepEqual(guest.errors, []);
      pass("guest: login return routes and versioned favicons");
    } finally {
      await guest.close();
    }
    fs.writeFileSync(
      `${output}/${engine}-checks.json`,
      JSON.stringify(
        {
          engine,
          base,
          checkedAt: new Date().toISOString(),
          fixtureData: true,
          transportSource: process.env.UI_TEST_SOURCE || null,
          relayTransport: Boolean(process.env.UI_TEST_RELAY),
          checks,
        },
        null,
        2,
      ),
    );
    console.log("PASSED", checks.length);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
