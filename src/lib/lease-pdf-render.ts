import fs from "fs";
import path from "path";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { buildLeaseHtml } from "./lease-html-template";
import { getSignatureReadUrl } from "@/lib/r2";

let cachedFontBase64: string | null = null;
function getFontBase64() {
  if (cachedFontBase64) return cachedFontBase64;
  const fontPath = path.join(process.cwd(), "public/fonts/NotoSansArabic-Variable.ttf");
  cachedFontBase64 = fs.readFileSync(fontPath).toString("base64");
  return cachedFontBase64;
}

export async function generateLeasePdfViaChromium(lease: Parameters<typeof buildLeaseHtml>[0]): Promise<Buffer> {
  // Signatures are stored as private R2 keys — resolve them to real signed
  // URLs first, since Chromium's <img> tags fetch over real HTTP, not our DB.
  const customerSigUrl = lease.customerSignatureUrl.startsWith("http")
    ? lease.customerSignatureUrl
    : await getSignatureReadUrl(lease.customerSignatureUrl);
  const companySigUrl = lease.companySignatureUrl.startsWith("http")
    ? lease.companySignatureUrl
    : await getSignatureReadUrl(lease.companySignatureUrl);

  const html = buildLeaseHtml(
    { ...lease, customerSignatureUrl: customerSigUrl, companySignatureUrl: companySigUrl },
    getFontBase64()
  );

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdfBytes = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "16mm", left: "10mm", right: "10mm" },
    });
    return Buffer.from(pdfBytes);
  } finally {
    await browser.close();
  }
}