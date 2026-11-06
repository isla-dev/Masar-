import puppeteer, { Browser } from 'puppeteer';

// A single shared browser instance is reused across requests — launching
// Chromium per-certificate would be far too slow. It's started lazily on
// first use and left running for the life of the server process.
let browserPromise: Promise<Browser> | null = null;

function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // needed in most containerized/CI environments
    });
  }
  return browserPromise;
}

/**
 * Renders an HTML string to a landscape A4 PDF buffer.
 * NOTE: the template's @font-face rule pulls from fonts.googleapis.com, so
 * this requires the server to have outbound internet access at render time.
 * For fully offline/air-gapped deployments, download the font files once
 * and reference them locally in certificates.template.ts instead.
 */
export async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBytes = await page.pdf({
      width: '297mm',
      height: '210mm',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });
    return Buffer.from(pdfBytes);
  } finally {
    await page.close();
  }
}
