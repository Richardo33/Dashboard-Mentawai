import { existsSync } from "node:fs";
import path from "node:path";
import chromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright-core";

function getLocalChromiumPath() {
  const candidates = [
    process.env.CHROMIUM_EXECUTABLE_PATH,
    process.env.CHROME_EXECUTABLE_PATH,
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Google/Chrome/Application/chrome.exe"),
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Google/Chrome/Application/chrome.exe"),
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Microsoft/Edge/Application/msedge.exe"),
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter((value): value is string => Boolean(value));

  return candidates.find((candidate) => existsSync(candidate));
}

async function getBrowser() {
  const localExecutable = getLocalChromiumPath();
  const executablePath = localExecutable ?? await chromium.executablePath();

  return playwrightChromium.launch({
    args: localExecutable ? ["--no-sandbox"] : chromium.args,
    executablePath,
    headless: true,
  });
}

export async function generateSptpdPdf(html: string) {
  let browser;
  try {
    browser = await getBrowser();
    const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "load" });
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser?.close();
  }
}
