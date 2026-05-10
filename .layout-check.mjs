import { chromium } from "@playwright/test";

const URL = "https://anuragashok-com.vercel.app";

const browser = await chromium.launch();

for (const [size, viewport] of [
  ["desktop-1440", { width: 1440, height: 900 }],
  ["laptop-1280", { width: 1280, height: 800 }],
  ["wide-1920", { width: 1920, height: 1080 }],
]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });

  const dims = await page.evaluate(() => {
    const main = document.querySelector("main");
    const h1 = document.querySelector("h1");
    const html = document.documentElement;
    const body = document.body;
    const mr = main?.getBoundingClientRect();
    const hr = h1?.getBoundingClientRect();
    return {
      windowInnerWidth: window.innerWidth,
      htmlScrollWidth: html.scrollWidth,
      bodyScrollWidth: body.scrollWidth,
      mainRect: mr ? { x: Math.round(mr.x), y: Math.round(mr.y), width: Math.round(mr.width), height: Math.round(mr.height) } : null,
      mainComputedMaxWidth: main ? getComputedStyle(main).maxWidth : null,
      mainComputedMargin: main ? `${getComputedStyle(main).marginLeft} | ${getComputedStyle(main).marginRight}` : null,
      h1Rect: hr ? { x: Math.round(hr.x), y: Math.round(hr.y), width: Math.round(hr.width), height: Math.round(hr.height) } : null,
      h1FontFamily: h1 ? getComputedStyle(h1).fontFamily : null,
      bodyFontFamily: getComputedStyle(body).fontFamily,
    };
  });

  console.log(`\n=== ${size} (${viewport.width}x${viewport.height}) ===`);
  console.log(JSON.stringify(dims, null, 2));

  const path = `/tmp/${size}-home.png`;
  await page.screenshot({ path, fullPage: false });
  console.log(`saved: ${path}`);

  await page.goto(`${URL}/blog/hello-world`, { waitUntil: "networkidle" });
  const postPath = `/tmp/${size}-post.png`;
  await page.screenshot({ path: postPath, fullPage: false });
  console.log(`saved: ${postPath}`);

  await ctx.close();
}

await browser.close();
