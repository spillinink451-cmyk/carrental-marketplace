import { PDFDocument, PDFPage, StandardFonts, PDFFont, rgb } from "pdf-lib";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/datetime";
import { getSignatureReadUrl } from "@/lib/r2";

// ---------- Layout constants ----------
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_LEFT = 56;
const MARGIN_RIGHT = 56;
const MARGIN_TOP = 56;
const MARGIN_BOTTOM = 64;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

// ---------- Brand palette, converted for pdf-lib's 0-1 rgb() ----------
const COLOR_INK = rgb(0.118, 0.161, 0.231);     // #1E293B
const COLOR_MUTED = rgb(0.392, 0.455, 0.545);   // #64748B
const COLOR_BRAND = rgb(0.247, 0.318, 0.710);   // #3F51B5
const COLOR_AMBER = rgb(0.961, 0.620, 0.043);   // #F59E0B
const COLOR_BORDER = rgb(0.898, 0.906, 0.922);  // #E5E7EB

function wrapTextToWidth(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

class LeaseDocument {
  pdfDoc: PDFDocument;
  fontRegular: PDFFont;
  fontBold: PDFFont;
  pages: PDFPage[] = [];
  page!: PDFPage;
  y = 0;
  companyName: string;
  leaseRef: string;

  private constructor(pdfDoc: PDFDocument, fontRegular: PDFFont, fontBold: PDFFont, companyName: string, leaseRef: string) {
    this.pdfDoc = pdfDoc;
    this.fontRegular = fontRegular;
    this.fontBold = fontBold;
    this.companyName = companyName;
    this.leaseRef = leaseRef;
  }

  static async create(companyName: string, leaseRef: string) {
    const pdfDoc = await PDFDocument.create();
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const doc = new LeaseDocument(pdfDoc, fontRegular, fontBold, companyName, leaseRef);
    doc.addPage(true);
    return doc;
  }

  addPage(isFirst = false) {
    const page = this.pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.pages.push(page);
    this.page = page;
    this.y = PAGE_HEIGHT - MARGIN_TOP;
    if (isFirst) this.drawCoverHeader();
    else this.drawRunningHeader();
  }

  ensureSpace(height: number) {
    if (this.y - height < MARGIN_BOTTOM) this.addPage(false);
  }

  dividerLine() {
    this.page.drawLine({
      start: { x: MARGIN_LEFT, y: this.y },
      end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: this.y },
      thickness: 0.75, color: COLOR_BORDER,
    });
  }

  drawCoverHeader() {
    this.page.drawText(this.companyName.toUpperCase(), { x: MARGIN_LEFT, y: this.y, size: 9, font: this.fontBold, color: COLOR_MUTED });
    this.y -= 4;
    this.page.drawRectangle({ x: MARGIN_LEFT, y: this.y - 6, width: 36, height: 3, color: COLOR_AMBER });
    this.y -= 26;
    this.page.drawText("Vehicle Lease Agreement", { x: MARGIN_LEFT, y: this.y, size: 24, font: this.fontBold, color: COLOR_INK });
    this.y -= 22;
    this.page.drawText(`Agreement Ref: ${this.leaseRef}`, { x: MARGIN_LEFT, y: this.y, size: 10, font: this.fontRegular, color: COLOR_MUTED });
    this.y -= 28;
    this.dividerLine();
    this.y -= 18;
  }

  drawRunningHeader() {
    const label = `${this.companyName} — Vehicle Lease Agreement`;
    this.page.drawText(label, { x: MARGIN_LEFT, y: this.y, size: 9, font: this.fontBold, color: COLOR_MUTED });
    this.page.drawText(this.leaseRef, {
      x: PAGE_WIDTH - MARGIN_RIGHT - this.fontRegular.widthOfTextAtSize(this.leaseRef, 9),
      y: this.y, size: 9, font: this.fontRegular, color: COLOR_MUTED,
    });
    this.y -= 14;
    this.dividerLine();
    this.y -= 20;
  }

  sectionHeading(title: string) {
    this.ensureSpace(30);
    this.page.drawRectangle({ x: MARGIN_LEFT, y: this.y - 9, width: 4, height: 13, color: COLOR_BRAND });
    this.page.drawText(title.toUpperCase(), { x: MARGIN_LEFT + 12, y: this.y - 8, size: 11, font: this.fontBold, color: COLOR_INK });
    this.y -= 26;
  }

  twoColumnFields(pairs: { label: string; value: string }[]) {
    const gap = 24;
    const colWidth = (CONTENT_WIDTH - gap) / 2;
    const colX = [MARGIN_LEFT, MARGIN_LEFT + colWidth + gap];

    for (let i = 0; i < pairs.length; i += 2) {
      const rowPairs = [pairs[i], pairs[i + 1]];
      const wrapped = rowPairs.map((p) => (p ? wrapTextToWidth(p.value, this.fontRegular, 10.5, colWidth) : []));
      const maxLines = Math.max(...wrapped.map((w) => w.length), 1);
      const rowHeight = 14 + maxLines * 13 + 12;

      this.ensureSpace(rowHeight);
      const rowTopY = this.y;

      rowPairs.forEach((p, c) => {
        if (!p) return;
        this.page.drawText(p.label.toUpperCase(), { x: colX[c], y: rowTopY, size: 8, font: this.fontBold, color: COLOR_MUTED });
        let ly = rowTopY - 14;
        for (const line of wrapped[c]) {
          this.page.drawText(line, { x: colX[c], y: ly, size: 10.5, font: this.fontRegular, color: COLOR_INK });
          ly -= 13;
        }
      });

      this.y = rowTopY - rowHeight;
    }
  }

  paragraph(text: string, opts: { size?: number; gapAfter?: number } = {}) {
    const size = opts.size ?? 10;
    const lines = wrapTextToWidth(text, this.fontRegular, size, CONTENT_WIDTH);
    for (const line of lines) {
      this.ensureSpace(size + 5);
      this.page.drawText(line, { x: MARGIN_LEFT, y: this.y, size, font: this.fontRegular, color: COLOR_INK });
      this.y -= size + 5;
    }
    this.y -= opts.gapAfter ?? 6;
  }

  spacer(amount: number) {
    this.y -= amount;
  }

  finalizeFooters(generatedAt: Date, timezone: string) {
    const total = this.pages.length;
    this.pages.forEach((page, idx) => {
      page.drawLine({
        start: { x: MARGIN_LEFT, y: MARGIN_BOTTOM - 20 },
        end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: MARGIN_BOTTOM - 20 },
        thickness: 0.75, color: COLOR_BORDER,
      });
      page.drawText(`Generated ${formatDate(generatedAt, timezone)}`, {
        x: MARGIN_LEFT, y: MARGIN_BOTTOM - 34, size: 8, font: this.fontRegular, color: COLOR_MUTED,
      });
      const pageLabel = `Page ${idx + 1} of ${total}`;
      page.drawText(pageLabel, {
        x: PAGE_WIDTH - MARGIN_RIGHT - this.fontRegular.widthOfTextAtSize(pageLabel, 8),
        y: MARGIN_BOTTOM - 34, size: 8, font: this.fontRegular, color: COLOR_MUTED,
      });
    });
  }
}

async function drawSignatureBlock(doc: LeaseDocument, opts: {
  customerName: string; customerSignatureUrl: string; customerSignedAt: Date;
  companyName: string; companySignatureUrl: string; companySignedAt: Date;
  timezone: string;
}) {
  doc.sectionHeading("Signatures");
  doc.ensureSpace(120);

  const gap = 24;
  const colWidth = (CONTENT_WIDTH - gap) / 2;
  const colX = [MARGIN_LEFT, MARGIN_LEFT + colWidth + gap];
  const topY = doc.y;

  async function embed(key: string, x: number) {
  try {
    const signedUrl = key.startsWith("http") ? key : await getSignatureReadUrl(key);
    const bytes = await (await fetch(signedUrl)).arrayBuffer();
    const img = await doc.pdfDoc.embedPng(bytes);
    const dims = img.scaleToFit(140, 50);
    doc.page.drawImage(img, { x, y: topY - dims.height, width: dims.width, height: dims.height });
  } catch (err) {
    console.error("Failed to embed signature:", err);
  }
}

  await embed(opts.customerSignatureUrl, colX[0]);
  await embed(opts.companySignatureUrl, colX[1]);

  const lineY = topY - 58;
  [0, 1].forEach((c) => {
    doc.page.drawLine({ start: { x: colX[c], y: lineY }, end: { x: colX[c] + colWidth, y: lineY }, thickness: 0.75, color: COLOR_BORDER });
  });

  doc.page.drawText(opts.customerName, { x: colX[0], y: lineY - 14, size: 10, font: doc.fontBold, color: COLOR_INK });
  doc.page.drawText("Lessee", { x: colX[0], y: lineY - 27, size: 8, font: doc.fontRegular, color: COLOR_MUTED });
  doc.page.drawText(`Signed ${formatDate(opts.customerSignedAt, opts.timezone)}`, { x: colX[0], y: lineY - 40, size: 8, font: doc.fontRegular, color: COLOR_MUTED });

  doc.page.drawText(opts.companyName, { x: colX[1], y: lineY - 14, size: 10, font: doc.fontBold, color: COLOR_INK });
  doc.page.drawText("Authorized Representative", { x: colX[1], y: lineY - 27, size: 8, font: doc.fontRegular, color: COLOR_MUTED });
  doc.page.drawText(`Signed ${formatDate(opts.companySignedAt, opts.timezone)}`, { x: colX[1], y: lineY - 40, size: 8, font: doc.fontRegular, color: COLOR_MUTED });

  doc.y = lineY - 60;
}

export async function generateLeasePDF(lease: {
  id: string;
  companyNameSnapshot: string; carSnapshot: string;
  lesseeName: string; lesseePhone: string; lesseeCnic: string; idDocumentLabel: string;
  startDate: Date; endDate: Date;
  pricePerDay: string; totalAmount: string; depositAmount: string;
  mileageLimitKm: number | null; fuelPolicy: string; lateFeePerDay: string | null;
  termsAndConditions: string;
  currency: string; timezone: string;
  customerSignatureUrl: string; customerSignedAt: Date;
  companySignatureUrl: string; companySignedAt: Date;
}): Promise<Buffer> {
  const leaseRef = `LSE-${lease.id.slice(0, 8).toUpperCase()}`;
  const doc = await LeaseDocument.create(lease.companyNameSnapshot, leaseRef);

  doc.sectionHeading("Parties");
  doc.twoColumnFields([
    { label: "Lessor", value: lease.companyNameSnapshot },
    { label: "Lessee", value: lease.lesseeName },
    { label: "Lessee Phone", value: lease.lesseePhone },
    { label: `Lessee ${lease.idDocumentLabel}`, value: lease.lesseeCnic },
  ]);
  doc.spacer(10);

  doc.sectionHeading("Vehicle & Lease Period");
  doc.twoColumnFields([
    { label: "Vehicle", value: lease.carSnapshot },
    { label: "Agreement Ref", value: leaseRef },
    { label: "Lease Start", value: formatDate(lease.startDate, lease.timezone) },
    { label: "Lease End", value: formatDate(lease.endDate, lease.timezone) },
  ]);
  doc.spacer(10);

  doc.sectionHeading("Financial Terms");
  const financialFields = [
    { label: "Price Per Day", value: formatCurrency(lease.pricePerDay, lease.currency) },
    { label: "Total Amount", value: formatCurrency(lease.totalAmount, lease.currency) },
    { label: "Security Deposit", value: formatCurrency(lease.depositAmount, lease.currency) },
    { label: "Fuel Policy", value: lease.fuelPolicy },
  ];
  if (lease.mileageLimitKm) financialFields.push({ label: "Mileage Limit", value: `${lease.mileageLimitKm} km` });
  if (lease.lateFeePerDay) financialFields.push({ label: "Late Fee (per day)", value: formatCurrency(lease.lateFeePerDay, lease.currency) });
  doc.twoColumnFields(financialFields);
  doc.spacer(10);

  doc.sectionHeading("Terms & Conditions");
  const paragraphs = lease.termsAndConditions.split(/\n+/).filter(Boolean);
  for (const p of paragraphs.length ? paragraphs : [lease.termsAndConditions]) {
    doc.paragraph(p, { size: 9.5, gapAfter: 10 });
  }
  doc.spacer(10);

  await drawSignatureBlock(doc, {
    customerName: lease.lesseeName, customerSignatureUrl: lease.customerSignatureUrl, customerSignedAt: lease.customerSignedAt,
    companyName: lease.companyNameSnapshot, companySignatureUrl: lease.companySignatureUrl, companySignedAt: lease.companySignedAt,
    timezone: lease.timezone,
  });

  doc.finalizeFooters(new Date(), lease.timezone);

  return Buffer.from(await doc.pdfDoc.save());
}