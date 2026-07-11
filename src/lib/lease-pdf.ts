import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getSignatureReadUrl } from "@/lib/r2";
import { formatCurrency } from "@/lib/currency"; 

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxCharsPerLine) {
      lines.push(current.trim());
      current = word;
    } else {
      current += " " + word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

export async function generateLeasePDF(lease: {
  companyNameSnapshot: string; carSnapshot: string;
  lesseeName: string; lesseePhone: string; lesseeCnic: string;
  startDate: Date; endDate: Date;
  pricePerDay: string; totalAmount: string; depositAmount: string;
  mileageLimitKm: number | null; fuelPolicy: string; lateFeePerDay: string | null;
  termsAndConditions: string;
  currency: string;
  customerSignatureUrl: string; customerSignedAt: Date;
  companySignatureUrl: string; companySignedAt: Date;
}): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const left = 50;

  function text(str: string, opts: { size?: number; bold?: boolean; gap?: number } = {}) {
    page.drawText(str, { x: left, y, size: opts.size ?? 11, font: opts.bold ? boldFont : font, color: rgb(0.11, 0.12, 0.14) });
    y -= opts.gap ?? (opts.size ? opts.size + 8 : 18);
  }

  text("Vehicle Lease Agreement", { size: 20, bold: true, gap: 30 });
  text(`Company: ${lease.companyNameSnapshot}`, { bold: true });
  text(`Vehicle: ${lease.carSnapshot}`);
  text(`Lease period: ${lease.startDate.toDateString()} - ${lease.endDate.toDateString()}`);
  y -= 10;

  text("Lessee Details", { size: 13, bold: true, gap: 22 });
  text(`Name: ${lease.lesseeName}`);
  text(`Phone: ${lease.lesseePhone}`);
  text(`ID Number: ${lease.lesseeCnic}`);
  y -= 10;

  text("Financial Terms", { size: 13, bold: true, gap: 22 });
  text(`Price per day: ${formatCurrency(lease.pricePerDay, lease.currency)}`);
text(`Total amount: ${formatCurrency(lease.totalAmount, lease.currency)}`);
text(`Deposit: ${formatCurrency(lease.depositAmount, lease.currency)}`);
if (lease.mileageLimitKm) text(`Mileage limit: ${lease.mileageLimitKm} km`);
text(`Fuel policy: ${lease.fuelPolicy}`);
if (lease.lateFeePerDay) text(`Late fee per day: ${formatCurrency(lease.lateFeePerDay, lease.currency)}`);
y -= 10;

  text("Terms & Conditions", { size: 13, bold: true, gap: 22 });
  for (const line of wrapText(lease.termsAndConditions, 95)) {
    if (y < 200) break; // simple first-pass layout guard against page overflow
    text(line, { size: 10, gap: 14 });
  }

  y = 150;
  text("Signatures", { size: 13, bold: true, gap: 22 });

async function embedSignature(signature: string, x: number) {
  try {
    console.log("Signature stored in DB:", signature);

    const signedUrl = signature.startsWith("http")
      ? signature
      : await getSignatureReadUrl(signature);

    console.log("Generated signed URL:", signedUrl);

    const response = await fetch(signedUrl);

    console.log("Fetch status:", response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch signature (${response.status})`);
    }

    const bytes = await response.arrayBuffer();

    console.log("Downloaded bytes:", bytes.byteLength);

    const img = await pdfDoc.embedPng(bytes);

    page.drawImage(img, {
      x,
      y: y - 60,
      width: 150,
      height: 60,
    });

    console.log("Signature embedded successfully");
  } catch (err) {
    console.error("Failed to embed signature:", err);
  }

}
  await embedSignature(lease.customerSignatureUrl, left);
  await embedSignature(lease.companySignatureUrl, left + 250);

  page.drawText(`Customer — signed ${lease.customerSignedAt.toDateString()}`, { x: left, y: y - 75, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(`Company — signed ${lease.companySignedAt.toDateString()}`, { x: left + 250, y: y - 75, size: 9, font, color: rgb(0.4, 0.4, 0.4) });

  return Buffer.from(await pdfDoc.save());
}