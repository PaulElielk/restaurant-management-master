import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "C:/Users/Paul-Eliel Kouame/Desktop/programming/restaurant-management-master";
const OUT = path.join(ROOT, "report_figures");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9225;
const API_BASE = "http://127.0.0.1:8001";
const APP_BASE = process.env.APP_BASE || "http://127.0.0.1:8001";
const NODE = "C:/Program Files/nodejs/node.exe";
const CMD = "C:/Windows/System32/cmd.exe";

await mkdir(OUT, { recursive: true });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitJson(url, attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      // retry
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function waitText(url, attempts = 80) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.text();
    } catch {
      // retry
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function ensureBackend() {
  try {
    await waitText(`${API_BASE}/api`, 2);
    return null;
  } catch {
    const backend = spawn(NODE, ["index.js"], {
      cwd: path.join(ROOT, "backend"),
      stdio: "ignore",
      windowsHide: true,
    });
    await waitText(`${API_BASE}/api`, 120);
    return backend;
  }
}

async function ensureFrontend() {
  try {
    await waitText(APP_BASE, 2);
    return null;
  } catch {
    if (APP_BASE.includes(":8001")) throw new Error(`Application is not reachable at ${APP_BASE}`);
    const frontend = spawn(CMD, ["/c", "npm.cmd", "run", "serve", "--", "--host", "127.0.0.1", "--port", "8080"], {
      cwd: path.join(ROOT, "frontend"),
      stdio: "ignore",
      windowsHide: true,
      shell: false,
    });
    await waitText(APP_BASE, 240);
    return frontend;
  }
}

class CDP {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    this.ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data.toString());
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method && this.events.has(msg.method)) {
        for (const handler of this.events.get(msg.method)) handler(msg.params || {});
      }
    });
    this.ws.addEventListener("close", () => {
      for (const { reject } of this.pending.values()) reject(new Error("CDP websocket closed"));
      this.pending.clear();
    });
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP command timed out: ${method}`));
        }
      }, 15000);
      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
    });
  }

  once(method) {
    return new Promise((resolve) => {
      const handler = (params) => {
        const list = this.events.get(method) || [];
        this.events.set(method, list.filter((item) => item !== handler));
        resolve(params);
      };
      const list = this.events.get(method) || [];
      list.push(handler);
      this.events.set(method, list);
    });
  }
}

async function navigate(cdp, url) {
  const load = cdp.once("Page.loadEventFired");
  await cdp.send("Page.navigate", { url });
  await load.catch(() => {});
  await sleep(1200);
  const result = await evaluate(cdp, `({
    url: location.href,
    title: document.title,
    text: document.body ? document.body.innerText.slice(0, 300) : ''
  })`);
  const value = result.result?.value || {};
  if (/This site can't be reached|ERR_CONNECTION_REFUSED|ERR_BLOCKED_BY_CLIENT/i.test(value.text)) {
    throw new Error(`Navigation failed for ${url}: ${value.text}`);
  }
}

async function evaluate(cdp, expression) {
  return await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
}

async function screenshot(cdp, filename) {
  const result = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  await writeFile(path.join(OUT, filename), Buffer.from(result.data, "base64"));
}

const backend = await ensureBackend();
const frontend = await ensureFrontend();
const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  "--remote-allow-origins=*",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${path.join(ROOT, ".chrome-report-profile")}`,
  "--window-size=1366,900",
  "about:blank",
], { stdio: "ignore", windowsHide: true });

try {
  await waitJson(`http://127.0.0.1:${PORT}/json/version`);
  const target = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json());
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 1366,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await navigate(cdp, `${APP_BASE}/login`);
  await evaluate(cdp, `
    (async () => {
      const set = (el, value) => {
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      set(document.querySelector('#uEmail'), 'synthetic1001@example.com');
      set(document.querySelector('#uPass'), 'password123');
      document.querySelector('#loginForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(r => setTimeout(r, 1600));
      const menuLink = [...document.querySelectorAll('a')].find(a => a.getAttribute('href') === '/menu');
      if (menuLink) menuLink.click();
      await new Promise(r => setTimeout(r, 2500));
      return { url: location.href, title: document.title };
    })()
  `);
  await screenshot(cdp, "figure_5_4_customer_menu_recommendations.png");

  await evaluate(cdp, `
    (async () => {
      const toggle = document.querySelector('.chatbot-toggle');
      if (!toggle) return { error: 'chatbot toggle not found', body: document.body.innerText.slice(0, 500) };
      toggle.click();
      await new Promise(r => setTimeout(r, 900));
      const input = document.querySelector('.chatbot-input-area input');
      if (input) {
        input.value = 'show me spicy dishes';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        const button = document.querySelector('.chatbot-input-area button');
        if (button) button.click();
      }
      await new Promise(r => setTimeout(r, 2500));
      return {
        chatbotOpen: !!document.querySelector('.chatbot-window'),
        toggleRect: toggle.getBoundingClientRect().toJSON ? toggle.getBoundingClientRect().toJSON() : null,
        text: document.body.innerText.slice(0, 500)
      };
    })()
  `);
  const chatbotCheck = await evaluate(cdp, `({
    chatbotOpen: !!document.querySelector('.chatbot-window'),
    hasInput: !!document.querySelector('.chatbot-input-area input'),
    text: document.body.innerText.slice(0, 800)
  })`);
  if (!chatbotCheck.result?.value?.chatbotOpen) {
    throw new Error(`Chatbot window did not open: ${JSON.stringify(chatbotCheck.result?.value)}`);
  }
  await screenshot(cdp, "figure_5_5_chatbot_interface.png");

  await navigate(cdp, `${APP_BASE}/admin`);
  await evaluate(cdp, `
    (async () => {
      const pass = document.querySelector('#uPass');
      if (pass) {
        pass.value = '25082002';
        pass.dispatchEvent(new Event('input', { bubbles: true }));
        pass.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const form = document.querySelector('#adminForm');
      if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(r => setTimeout(r, 3500));
      return { url: location.href, forecast: document.body.innerText.includes('AI Demand Forecast') };
    })()
  `);
  await screenshot(cdp, "figure_5_6_admin_dashboard_forecast.png");

  console.log(JSON.stringify({
    ok: true,
    files: [
      "report_figures/figure_5_4_customer_menu_recommendations.png",
      "report_figures/figure_5_5_chatbot_interface.png",
      "report_figures/figure_5_6_admin_dashboard_forecast.png",
    ],
  }, null, 2));
} finally {
  chrome.kill();
  if (frontend) frontend.kill();
  if (backend) backend.kill();
}
