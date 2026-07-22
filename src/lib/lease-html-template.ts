import { formatCurrency } from "@/lib/currency";
import { formatDate, formatTime, formatWeekday } from "@/lib/datetime";

type LeaseData = {
  id: string;
  companyNameSnapshot: string; 
  carSnapshot: string;
  lesseeName: string; 
  lesseePhone: string; 
  lesseeWorkPhone: string | null; 
  lesseeCnic: string; 
  idDocumentLabel: string;
  lesseeNationality: string | null; 
  lesseeAddress: string | null; 
  lesseeWorkAddress: string | null;
  licenseType: string | null; 
  drivingLicenseNo: string | null;
  licenseIssueDate: Date | null;
  plateNo: string | null; 
  carColor: string | null; 
  kmOut: number | null; kmIn: number | null;
  radioCassette: boolean; 
  airCondition: boolean; 
  insuranceCoverage: string | null;
  uncleaningFee: string | null; 
  excessMileageRate: string | null;
  startDate: Date; endDate: Date;
  pricePerDay: string; 
  totalAmount: string; 
  depositAmount: string;
  mileageLimitKm: number | null; 
  fuelPolicy: string; 
  lateFeePerDay: string | null;
  termsAndConditions: string; 
  termsAndConditionsAr: string | null;
  currency: string; 
  timezone: string;
  customerSignatureUrl: string; 
  customerSignedAt: Date;
  companySignatureUrl: string; 
  companySignedAt: Date;
};

function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function field(enLabel: string, arLabel: string, value: string) {
  return `
    <tr>
      <td class="label">${escapeHtml(enLabel)} <span class="ar">/ ${arLabel}</span></td>
      <td class="value">${escapeHtml(value)}</td>
    </tr>`;
}

export function buildLeaseHtml(lease: LeaseData, fontBase64: string) {
  const leaseRef = `LSE-${lease.id.slice(0, 8).toUpperCase()}`;
  const paragraphsEn = lease.termsAndConditions.split(/\n+/).filter(Boolean);
  const paragraphsAr = (lease.termsAndConditionsAr ?? "").split(/\n+/).filter(Boolean);

  const days = Math.max(1, Math.ceil((lease.endDate.getTime() - lease.startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const rentTime = `${days} day${days > 1 ? "s" : ""}`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'NotoArabic';
    src: url(data:font/ttf;base64,${fontBase64}) format('truetype');
    font-weight: 100 900;
  }
  * { box-sizing: border-box; }
  body { font-family: 'NotoArabic', Arial, sans-serif; color: #1E293B; font-size: 11px; margin: 0; padding: 36px 44px; }
  h1 { font-size: 22px; margin: 0 0 4px 0; }
  .ref { color: #64748B; font-size: 10px; margin-bottom: 16px; }
  .rule { border: none; border-top: 1px solid #E5E7EB; margin: 16px 0; }
  .section-title { font-weight: 700; font-size: 12px; text-transform: uppercase; color: #1E293B; margin: 18px 0 8px 0; border-left: 3px solid #3F51B5; padding-left: 8px; }
  table.fields { width: 100%; border-collapse: collapse; }
  table.fields td { padding: 5px 8px; border-bottom: 1px solid #F1F5F9; vertical-align: top; font-size: 10.5px; }
  table.fields td.label { color: #64748B; width: 46%; font-weight: 600; }
  table.fields td.value { font-weight: 500; }
  .ar { font-family: 'NotoArabic', sans-serif; direction: rtl; unicode-bidi: embed; color: #94A3B8; font-weight: 400; }
  .notes { margin-top: 6px; }
  .notes p { font-size: 9px; color: #64748B; margin: 0 0 4px 0; background: #F8FAFC; padding: 6px 8px; border-radius: 6px; }
  .notes p .ar { display: block; text-align: right; margin-top: 2px; color: #64748B; }
  .terms-columns { display: flex; gap: 24px; margin-top: 6px; }
  .terms-col { flex: 1; font-size: 9px; line-height: 1.6; }
  .terms-col.ar-col { direction: rtl; text-align: right; font-family: 'NotoArabic', sans-serif; }
  .terms-col p { margin: 0 0 8px 0; }
  .declaration { background: #F8FAFC; border-radius: 8px; padding: 12px; margin-top: 12px; font-size: 9.5px; line-height: 1.6; }
  .declaration .ar-block { direction: rtl; text-align: right; font-family: 'NotoArabic', sans-serif; margin-bottom: 8px; }
  .sig-block { display: flex; gap: 32px; margin-top: 20px; }
  .sig-col { flex: 1; }
  .sig-col img { max-width: 150px; max-height: 55px; }
  .sig-line { border-top: 1px solid #E5E7EB; margin-top: 4px; padding-top: 6px; }
  .sig-name { font-weight: 700; }
  .sig-role, .sig-date { color: #64748B; font-size: 9px; }
  .footer { position: fixed; bottom: 20px; left: 44px; right: 44px; border-top: 1px solid #E5E7EB; padding-top: 6px; font-size: 8px; color: #94A3B8; display: flex; justify-content: space-between; }
</style>
</head>
<body>
  <h1>${escapeHtml(lease.companyNameSnapshot)} — Vehicle Lease Agreement</h1>
  <div class="ref">Agreement Ref: ${leaseRef}</div>
  <hr class="rule">

  <div class="section-title">Vehicle &amp; Renter Details</div>
  <table class="fields">
    ${field("No.", "الرقم", leaseRef)}
    ${field("Name", "اسم المستأجر", lease.lesseeName)}
    ${field("Current Address", "العنوان الحالي", lease.lesseeAddress ?? "—")}
    ${field("Tel.", "هاتف", lease.lesseePhone)}
    ${field("Work Address", "عنوان العمل", lease.lesseeWorkAddress ?? "—")}
    ${field("Tel. (Work)", "هاتف", lease.lesseeWorkPhone ?? "—")}
    ${field("Nationality", "الجنسية", lease.lesseeNationality ?? "—")}
    ${field("Type of License", "نوع الرخصة", lease.licenseType ?? "—")}
    ${field("Date of Issue", "تاريخ اصدار الرخصة", lease.licenseIssueDate ? formatDate(lease.licenseIssueDate, lease.timezone) : "—")}    ${field("Driving License No.", "رقم رخصة القيادة", lease.drivingLicenseNo ?? "—")}
    ${field(lease.idDocumentLabel, "بطاقة شخصية / رقم جواز", lease.lesseeCnic)}
    ${field("Plate No.", "رقم اللوحة", lease.plateNo ?? "—")}
    ${field("Color", "اللون", lease.carColor ?? "—")}
    ${field("Type of Car", "نوع السيارة", lease.carSnapshot)}
    ${field("K.M. Out", "الكيلومتر عند الخروج", lease.kmOut != null ? `${lease.kmOut}` : "—")}
    ${field("Time Out", "وقت الخروج", formatTime(lease.startDate, lease.timezone))}
    ${field("Date Out", "تاريخ يوم المغادرة", formatDate(lease.startDate, lease.timezone))}
    ${field("Amount Paid", "المبلغ المدفوع", formatCurrency(lease.depositAmount, lease.currency))}
    ${field("Daily Rent Amount", "قيمة الأجرة في اليوم", formatCurrency(lease.pricePerDay, lease.currency))}
    ${field("Rent Time", "مدة الايجار", rentTime)}
    ${field("Date Return", "تاريخ يوم العودة", formatDate(lease.endDate, lease.timezone))}
    ${field("Time Back", "وقت العودة", formatTime(lease.endDate, lease.timezone))}
    ${field("Excess K.Ms (Return)", "الكيلو متر عند العودة", lease.kmIn != null ? `${lease.kmIn}` : "—")}
    ${field("Radio / Cassette", "المسجل - الراديو", lease.radioCassette ? "Available" : "Not available")}
    ${field("Air Condition", "المكيف", lease.airCondition ? "Available" : "Not available")}
    ${field("Car Insurance", "تأمين السيارة", lease.insuranceCoverage ?? "—")}
  </table>

  ${lease.uncleaningFee || lease.excessMileageRate ? `
  <div class="notes">
    ${lease.uncleaningFee ? `<p>If the car is returned uncleaned, ${formatCurrency(lease.uncleaningFee, lease.currency)} will be deducted from the deposit.
      <span class="ar">في حال رجوع السيارة غير نظيفة، يتم خصم ${formatCurrency(lease.uncleaningFee, lease.currency)} من التأمين.</span></p>` : ""}
    ${lease.excessMileageRate ? `<p>${escapeHtml(lease.excessMileageRate)}</p>` : ""}
  </div>` : ""}

  <div class="section-title">Lease Period &amp; Financial Terms</div>
  <table class="fields">
    ${field("Total Amount", "المبلغ الإجمالي", formatCurrency(lease.totalAmount, lease.currency))}
    ${lease.mileageLimitKm ? field("Mileage Limit", "الحد الأقصى للمسافة", `${lease.mileageLimitKm} km`) : ""}
    ${lease.lateFeePerDay ? field("Late Fee / Day", "غرامة التأخير", formatCurrency(lease.lateFeePerDay, lease.currency)) : ""}
    ${field("Fuel Policy", "سياسة الوقود", lease.fuelPolicy)}
  </table>

  <div class="section-title">Terms &amp; Conditions / شروط وأحكام التأجير</div>
  <div class="terms-columns">
    <div class="terms-col">${paragraphsEn.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}</div>
    <div class="terms-col ar-col">${paragraphsAr.map((p) => `<p>${p}</p>`).join("")}</div>
  </div>

  <div class="declaration">
    <div class="ar-block">اقر واشهد بأنني قرأت الشروط والبنود الواردة خلف هذا العقد وأنني موافق عليها، والتوقيع على العقد يعد تعهداً بالموافقة على جميع شروط العقد، والتعهد بدفع جميع المخالفات المرورية، وأتحمل مسؤولية السيارة التي استأجرتها حسب عقد الإيجار، وأن أقوم بدفع الإيجار كاملاً. وإذا لا سمح الله وقع على السيارة حادث أو أصيبت بعطل فني من جراء الاستخدام، سأقوم بدفع قيمة التصليح وفترة وقوف السيارة في الكراج، على أن يتم التصليح في وكالة السيارة المعتمدة، ودفع مساهمة شركة التأمين التي تقرها الشركة.</div>
    <div>I have read and agree to the terms and conditions on the back of this agreement, and I agree to pay all charges for traffic violations. I take full responsibility for the leased vehicle for the duration of the rental agreement and agree to pay the rental amount in full. In the event of an accident or mechanical breakdown resulting from use, I will pay the repair cost and any charges for the time the vehicle is off the road, provided repairs are carried out at an authorized garage, in addition to the insurance contribution determined by the company.</div>
  </div>

  <div class="sig-block">
    <div class="sig-col">
      <img src="${lease.customerSignatureUrl}" />
      <div class="sig-line">
        <div class="sig-name">${escapeHtml(lease.lesseeName)}</div>
        <div class="sig-role">Lessee <span class="ar">/ توقيع المستأجر</span></div>
        <div class="sig-date">${formatWeekday(lease.customerSignedAt, lease.timezone)}, ${formatDate(lease.customerSignedAt, lease.timezone)}</div>
      </div>
    </div>
    <div class="sig-col">
      <img src="${lease.companySignatureUrl}" />
      <div class="sig-line">
        <div class="sig-name">${escapeHtml(lease.companyNameSnapshot)}</div>
        <div class="sig-role">Authorized Representative <span class="ar">/ توقيع المسؤول</span></div>
        <div class="sig-date">${formatWeekday(lease.companySignedAt, lease.timezone)}, ${formatDate(lease.companySignedAt, lease.timezone)}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <span>Generated ${formatDate(new Date(), lease.timezone)}</span>
    <span>${leaseRef}</span>
  </div>
</body>
</html>`;
}