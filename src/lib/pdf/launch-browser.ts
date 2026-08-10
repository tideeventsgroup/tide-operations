/**
 * Headless Chromium launcher (section 2: "Server-side rendering (headless
 * Chromium via an Edge/Node function)"). Locally this uses the full
 * `puppeteer` package (bundles its own Chromium). On Vercel's serverless
 * runtime, swap to `puppeteer-core` + `@sparticuz/chromium` (both already
 * installed) via the VERCEL env var Vercel sets automatically.
 */
export async function launchBrowser() {
  if (process.env.VERCEL) {
    const { default: chromium } = await import("@sparticuz/chromium");
    const puppeteerCore = await import("puppeteer-core");
    return puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const puppeteer = await import("puppeteer");
  return puppeteer.launch({ headless: true });
}
