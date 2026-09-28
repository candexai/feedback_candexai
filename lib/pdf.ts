import { formatStamp } from "@/lib/format";
import type { FeedbackRecord } from "@/lib/types";

function pdfSafe(value: string) {
  return value
    .replace(/\r/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/[^\x09\x0A\x20-\xFF]/g, "?");
}

function escapePdfText(value: string) {
  return pdfSafe(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrap(text: string, width: number) {
  const lines: string[] = [];
  for (const raw of pdfSafe(text).split("\n")) {
    if (!raw.trim()) {
      lines.push("");
      continue;
    }
    let rest = raw.trim();
    while (rest.length > width) {
      let cut = rest.lastIndexOf(" ", width);
      if (cut < 12) cut = width;
      lines.push(rest.slice(0, cut));
      rest = rest.slice(cut).trim();
    }
    lines.push(rest);
  }
  return lines;
}

function recordLines(row: FeedbackRecord) {
  const answers = row.answers.map((answer) => `${answer.prompt}\n${answer.value || "—"}`).join("\n\n");
  return [
    row.feedbackId,
    `${row.clientCompany} · ${row.projectCampaign}`,
    `Campaign ${row.campaignStart} to ${row.campaignEnd}`,
    `Reviewer: ${row.reviewerName}, ${row.reviewerDesignation}`,
    `Email: ${row.reviewerEmail}`,
    `Submitted: ${formatStamp(row.submittedAt)}`,
    `Status: ${row.status}`,
    `Overall ${row.ratings.overallExperience}/5 · AI calls ${row.ratings.aiCallQuality}/5 · Reliability ${row.ratings.campaignReliability}/5`,
    `Performance: ${row.performanceVsExpectations}`,
    `Continue / expand: ${row.continueEngagement}`,
    "",
    answers,
    "",
    "Original testimonial",
    row.testimonial.willing ? row.testimonial.originalText : "No testimonial submitted.",
    row.testimonial.willing
      ? `${row.testimonial.name}, ${row.testimonial.designation}, ${row.testimonial.company}`
      : "",
    row.testimonial.linkedin ? `LinkedIn: ${row.testimonial.linkedin}` : "",
    `Marketing consent: ${row.testimonial.consentToUse ? "Yes" : "No"} (${formatStamp(row.testimonial.consentAt)})`,
    `Display name / designation / company: ${row.testimonial.displayIdentity ? "Yes" : "No"} (${formatStamp(row.testimonial.displayIdentityAt)})`,
    `Company logo: ${row.testimonial.useLogo ? "Yes" : "No"} (${formatStamp(row.testimonial.useLogoAt)})`,
    "",
    "Approved / edited testimonial",
    row.testimonial.approvedText || "—",
    "",
    `Audit IP: ${row.audit.ip}`,
    `User agent: ${row.audit.userAgent}`,
    "—",
  ].filter((line) => line !== undefined);
}

export function renderFeedbackPdf(rows: FeedbackRecord[]) {
  const width = 90;
  const lines = ["CandexAI feedback", ""];
  if (!rows.length) lines.push("No submissions match this export.");
  for (const row of rows) lines.push(...recordLines(row), "");

  const wrapped = lines.flatMap((line) => wrap(line, width));
  const lineHeight = 14;
  const margin = 54;
  const pageHeight = 792;
  const linesPerPage = 48;
  const pages: string[][] = [];
  for (let index = 0; index < wrapped.length; index += linesPerPage) {
    pages.push(wrapped.slice(index, index + linesPerPage));
  }
  if (!pages.length) pages.push([""]);

  const objects: Buffer[] = [];
  const fontId = 3 + pages.length * 2;
  const kids = pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ");

  objects[1] = Buffer.from("<< /Type /Catalog /Pages 2 0 R >>");
  objects[2] = Buffer.from(`<< /Type /Pages /Count ${pages.length} /Kids [${kids}] >>`);

  pages.forEach((pageLines, index) => {
    const pageId = 3 + index * 2;
    const contentId = pageId + 1;
    const commands = ["BT", "/F1 11 Tf", `${margin} ${pageHeight - margin} Td`];
    pageLines.forEach((line, lineIndex) => {
      if (lineIndex > 0) commands.push(`0 -${lineHeight} Td`);
      commands.push(`(${escapePdfText(line)}) Tj`);
    });
    commands.push("ET");
    const stream = Buffer.from(commands.join("\n"), "latin1");
    objects[contentId] = Buffer.concat([
      Buffer.from(`<< /Length ${stream.length} >>\nstream\n`),
      stream,
      Buffer.from("\nendstream"),
    ]);
    objects[pageId] = Buffer.from(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 ${pageHeight}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`,
    );
  });

  objects[fontId] = Buffer.from("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  let pdf = Buffer.from("%PDF-1.4\n");
  const offsets = [0];
  for (let id = 1; id <= fontId; id += 1) {
    offsets[id] = pdf.length;
    pdf = Buffer.concat([pdf, Buffer.from(`${id} 0 obj\n`), objects[id], Buffer.from("\nendobj\n")]);
  }
  const xref = pdf.length;
  let table = `xref\n0 ${fontId + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= fontId; id += 1) {
    table += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf = Buffer.concat([
    pdf,
    Buffer.from(`${table}trailer << /Size ${fontId + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`),
  ]);
  return pdf;
}
