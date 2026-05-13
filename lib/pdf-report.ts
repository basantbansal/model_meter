import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";

import type { AuditRecommendation, AuditResult } from "@/types/audit";

const pageWidth = 612;
const pageHeight = 792;
const margin = 44;
const contentWidth = pageWidth - margin * 2;

const colors = {
  ink: rgb(0.11, 0.1, 0.09),
  muted: rgb(0.39, 0.36, 0.33),
  faint: rgb(0.86, 0.84, 0.81),
  paper: rgb(0.97, 0.96, 0.94),
  card: rgb(1, 1, 1),
  row: rgb(0.98, 0.97, 0.95),
  teal: rgb(0.06, 0.46, 0.43),
  tealSoft: rgb(0.88, 0.98, 0.96),
  amber: rgb(0.95, 0.62, 0.11),
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

type Fonts = {
  regular: PDFFont;
  bold: PDFFont;
};

type PdfContext = {
  doc: PDFDocument;
  fonts: Fonts;
  page: PDFPage;
  y: number;
  reportUrl: string;
  generatedAt: Date;
};

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  font: PDFFont,
  color = colors.ink,
) {
  page.drawText(cleanText(text), { x, y, size, font, color });
}

function truncateText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const clean = cleanText(text);

  if (font.widthOfTextAtSize(clean, size) <= maxWidth) {
    return clean;
  }

  let next = clean;

  while (next.length > 4 && font.widthOfTextAtSize(`${next}...`, size) > maxWidth) {
    next = next.slice(0, -1);
  }

  return `${next}...`;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = cleanText(text).split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
    }

    current = word;
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function drawWrappedText({
  page,
  text,
  x,
  y,
  width,
  size,
  font,
  color = colors.muted,
  lineGap = 5,
}: {
  page: PDFPage;
  text: string;
  x: number;
  y: number;
  width: number;
  size: number;
  font: PDFFont;
  color?: ReturnType<typeof rgb>;
  lineGap?: number;
}) {
  let nextY = y;

  for (const line of wrapText(text, font, size, width)) {
    drawText(page, line, x, nextY, size, font, color);
    nextY -= size + lineGap;
  }

  return nextY;
}

function drawHeader(page: PDFPage, fonts: Fonts, title: string, subtitle: string) {
  page.drawRectangle({
    x: 0,
    y: pageHeight - 82,
    width: pageWidth,
    height: 82,
    color: colors.paper,
  });
  page.drawRectangle({
    x: margin,
    y: pageHeight - 58,
    width: 34,
    height: 34,
    borderColor: colors.faint,
    borderWidth: 1,
    color: colors.card,
  });
  drawText(page, "M", margin + 11, pageHeight - 47, 15, fonts.bold, colors.teal);
  drawText(page, "ModelMeter", margin + 48, pageHeight - 36, 16, fonts.bold);
  drawText(page, "AI spend optimization report", margin + 48, pageHeight - 52, 8.5, fonts.regular, colors.muted);
  drawText(page, title, margin, pageHeight - 106, 18, fonts.bold);
  drawText(page, subtitle, margin, pageHeight - 123, 9, fonts.regular, colors.muted);
}

function drawFooter(ctx: PdfContext, page: PDFPage, pageNumber: number, totalPages: number) {
  const footer = `Page ${pageNumber} of ${totalPages}`;
  const timestamp = `Generated ${dateFormatter.format(ctx.generatedAt)} UTC`;

  page.drawLine({
    start: { x: margin, y: 34 },
    end: { x: pageWidth - margin, y: 34 },
    thickness: 0.5,
    color: colors.faint,
  });
  drawText(page, timestamp, margin, 20, 8, ctx.fonts.regular, colors.muted);
  drawText(
    page,
    footer,
    pageWidth - margin - ctx.fonts.regular.widthOfTextAtSize(footer, 8),
    20,
    8,
    ctx.fonts.regular,
    colors.muted,
  );
}

function addPage(ctx: PdfContext, title = "Recommendations", subtitle = "Operating actions and modeled savings assumptions") {
  ctx.page = ctx.doc.addPage([pageWidth, pageHeight]);
  drawHeader(ctx.page, ctx.fonts, title, subtitle);
  ctx.y = pageHeight - 154;
}

function ensureSpace(ctx: PdfContext, height: number) {
  if (ctx.y - height < 58) {
    addPage(ctx);
  }
}

function sectionTitle(ctx: PdfContext, title: string, subtitle?: string) {
  ensureSpace(ctx, subtitle ? 48 : 30);
  drawText(ctx.page, title, margin, ctx.y, 13, ctx.fonts.bold);
  ctx.y -= 16;

  if (subtitle) {
    ctx.y = drawWrappedText({
      page: ctx.page,
      text: subtitle,
      x: margin,
      y: ctx.y,
      width: contentWidth,
      size: 9,
      font: ctx.fonts.regular,
    });
  }

  ctx.y -= 8;
}

function metricCard(
  ctx: PdfContext,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  emphasized = false,
) {
  ctx.page.drawRectangle({
    x,
    y,
    width,
    height: 78,
    color: emphasized ? colors.tealSoft : colors.card,
    borderColor: emphasized ? colors.teal : colors.faint,
    borderWidth: emphasized ? 1.1 : 0.8,
  });
  drawText(ctx.page, label, x + 14, y + 50, 8.5, ctx.fonts.regular, colors.muted);
  drawText(ctx.page, value, x + 14, y + 22, 19, ctx.fonts.bold, emphasized ? colors.teal : colors.ink);
}

function drawSummaryPage(ctx: PdfContext, result: AuditResult) {
  drawHeader(
    ctx.page,
    ctx.fonts,
    "Savings summary",
    "Finance-friendly overview for renewal, procurement, and team planning",
  );
  ctx.y = pageHeight - 162;

  drawWrappedText({
    page: ctx.page,
    text: `Shareable report: ${ctx.reportUrl}`,
    x: margin,
    y: ctx.y,
    width: contentWidth,
    size: 9,
    font: ctx.fonts.regular,
    color: colors.muted,
  });
  ctx.y -= 46;

  const gap = 12;
  const cardWidth = (contentWidth - gap * 2) / 3;
  metricCard(ctx, "Current monthly spend", currency.format(result.monthlySpend), margin, ctx.y - 78, cardWidth);
  metricCard(ctx, "Modeled monthly savings", currency.format(result.monthlySavings), margin + cardWidth + gap, ctx.y - 78, cardWidth, true);
  metricCard(ctx, "Modeled yearly savings", currency.format(result.yearlySavings), margin + (cardWidth + gap) * 2, ctx.y - 78, cardWidth, true);
  ctx.y -= 112;

  sectionTitle(ctx, "Audit summary");
  ctx.y = drawWrappedText({
    page: ctx.page,
    text:
      result.summary ||
      "ModelMeter did not generate a narrative summary for this report.",
    x: margin,
    y: ctx.y,
    width: contentWidth,
    size: 10.5,
    font: ctx.fonts.regular,
    color: colors.ink,
    lineGap: 5,
  });
  ctx.y -= 18;

  sectionTitle(
    ctx,
    "Savings concentration",
    "Bar lengths show each tool's share of modeled monthly savings.",
  );

  const rows = result.recommendations.filter((item) => item.savings > 0).slice(0, 7);

  if (rows.length === 0) {
    ctx.page.drawRectangle({
      x: margin,
      y: ctx.y - 54,
      width: contentWidth,
      height: 58,
      color: colors.row,
      borderColor: colors.faint,
      borderWidth: 0.8,
    });
    drawText(ctx.page, "No material savings concentration detected.", margin + 14, ctx.y - 19, 10, ctx.fonts.bold);
    drawWrappedText({
      page: ctx.page,
      text: "The report still includes operating checks, but the submitted inputs do not justify forcing a savings claim.",
      x: margin + 14,
      y: ctx.y - 35,
      width: contentWidth - 28,
      size: 8.8,
      font: ctx.fonts.regular,
    });
    ctx.y -= 76;
  } else {
    for (const item of rows) {
      const share = Math.max(0, Math.min(100, item.share));
      const label = truncateText(item.tool, ctx.fonts.bold, 9, 120);
      const value = `${currency.format(item.savings)} monthly | ${share}%`;
      const barX = margin + 142;
      const barWidth = 250;

      drawText(ctx.page, label, margin, ctx.y - 2, 9, ctx.fonts.bold);
      ctx.page.drawRectangle({
        x: barX,
        y: ctx.y - 7,
        width: barWidth,
        height: 11,
        color: colors.row,
      });
      ctx.page.drawRectangle({
        x: barX,
        y: ctx.y - 7,
        width: Math.max(4, (share / 100) * barWidth),
        height: 11,
        color: colors.teal,
      });
      drawText(ctx.page, value, barX + barWidth + 14, ctx.y - 2, 8.5, ctx.fonts.regular, colors.muted);
      ctx.y -= 24;
    }
  }

  ctx.y -= 14;
  sectionTitle(ctx, "Primary savings driver");
  ctx.page.drawRectangle({
    x: margin,
    y: ctx.y - 52,
    width: contentWidth,
    height: 58,
    color: colors.tealSoft,
    borderColor: colors.teal,
    borderWidth: 0.8,
  });
  drawWrappedText({
    page: ctx.page,
    text: result.primarySavingsDriver,
    x: margin + 14,
    y: ctx.y - 16,
    width: contentWidth - 28,
    size: 11,
    font: ctx.fonts.bold,
    color: colors.teal,
  });
  ctx.y -= 76;
}

function drawSavingsTable(ctx: PdfContext, recommendations: AuditRecommendation[]) {
  sectionTitle(
    ctx,
    "Savings table",
    "Projected spend is the modeled post-cleanup monthly spend used by the audit engine.",
  );

  const columns = [
    { label: "Tool", x: margin + 10, width: 126 },
    { label: "Current", x: margin + 168, width: 74 },
    { label: "Projected", x: margin + 254, width: 78 },
    { label: "Savings", x: margin + 350, width: 72 },
    { label: "Share", x: margin + 456, width: 50 },
  ];

  ensureSpace(ctx, 58);
  ctx.page.drawRectangle({
    x: margin,
    y: ctx.y - 20,
    width: contentWidth,
    height: 24,
    color: colors.row,
    borderColor: colors.faint,
    borderWidth: 0.6,
  });

  for (const column of columns) {
    drawText(ctx.page, column.label, column.x, ctx.y - 12, 8.5, ctx.fonts.bold, colors.muted);
  }

  ctx.y -= 34;

  for (const item of recommendations) {
    ensureSpace(ctx, 28);
    ctx.page.drawLine({
      start: { x: margin, y: ctx.y - 8 },
      end: { x: pageWidth - margin, y: ctx.y - 8 },
      thickness: 0.4,
      color: colors.faint,
    });
    drawText(ctx.page, truncateText(item.tool, ctx.fonts.bold, 9.5, columns[0].width), columns[0].x, ctx.y, 9.5, ctx.fonts.bold);
    drawText(ctx.page, currency.format(item.currentSpend), columns[1].x, ctx.y, 9.5, ctx.fonts.regular, colors.muted);
    drawText(ctx.page, currency.format(item.projectedSpend), columns[2].x, ctx.y, 9.5, ctx.fonts.regular, colors.muted);
    drawText(ctx.page, currency.format(item.savings), columns[3].x, ctx.y, 9.5, ctx.fonts.bold, colors.teal);
    drawText(ctx.page, `${item.share}%`, columns[4].x, ctx.y, 9.5, ctx.fonts.regular, colors.muted);
    ctx.y -= 26;
  }

  ctx.y -= 12;
}

function recommendationHeight(ctx: PdfContext, recommendation: AuditRecommendation) {
  const explanationLines = wrapText(recommendation.explanation, ctx.fonts.regular, 9.2, contentWidth - 32).slice(0, 4);
  const actionLines = wrapText(recommendation.optimizationAction, ctx.fonts.regular, 9, contentWidth - 150).slice(0, 2);
  return 104 + explanationLines.length * 11 + actionLines.length * 11;
}

function drawRecommendationCard(ctx: PdfContext, recommendation: AuditRecommendation) {
  const height = recommendationHeight(ctx, recommendation);
  ensureSpace(ctx, height + 12);

  const y = ctx.y - height;
  ctx.page.drawRectangle({
    x: margin,
    y,
    width: contentWidth,
    height,
    color: colors.card,
    borderColor: colors.faint,
    borderWidth: 0.8,
  });

  const badgeWidth = 72;
  ctx.page.drawRectangle({
    x: pageWidth - margin - badgeWidth - 14,
    y: y + height - 30,
    width: badgeWidth,
    height: 18,
    color: recommendation.severity === "High" ? colors.tealSoft : colors.row,
    borderColor: recommendation.severity === "High" ? colors.teal : colors.faint,
    borderWidth: 0.6,
  });
  drawText(
    ctx.page,
    recommendation.severity,
    pageWidth - margin - badgeWidth + 7,
    y + height - 24,
    8.5,
    ctx.fonts.bold,
    recommendation.severity === "High" ? colors.teal : colors.muted,
  );

  drawText(ctx.page, truncateText(`${recommendation.tool}: ${recommendation.title}`, ctx.fonts.bold, 11.5, contentWidth - 130), margin + 14, y + height - 25, 11.5, ctx.fonts.bold);
  drawText(
    ctx.page,
    `${currency.format(recommendation.currentSpend)} current -> ${currency.format(recommendation.projectedSpend)} projected | ${currency.format(recommendation.savings)} modeled monthly savings`,
    margin + 14,
    y + height - 43,
    8.6,
    ctx.fonts.regular,
    colors.muted,
  );

  let nextY = y + height - 66;
  nextY = drawWrappedText({
    page: ctx.page,
    text: recommendation.explanation,
    x: margin + 14,
    y: nextY,
    width: contentWidth - 32,
    size: 9.2,
    font: ctx.fonts.regular,
    color: colors.ink,
    lineGap: 3,
  });

  nextY -= 7;
  drawText(ctx.page, "Operating action", margin + 14, nextY, 8.8, ctx.fonts.bold, colors.teal);
  drawWrappedText({
    page: ctx.page,
    text: recommendation.optimizationAction,
    x: margin + 112,
    y: nextY,
    width: contentWidth - 130,
    size: 8.8,
    font: ctx.fonts.regular,
    color: colors.muted,
    lineGap: 3,
  });

  const assumption = recommendation.findings[0]?.detail;

  if (assumption) {
    drawText(ctx.page, "Savings assumption", margin + 14, y + 16, 8.3, ctx.fonts.bold, colors.muted);
    drawText(
      ctx.page,
      truncateText(assumption, ctx.fonts.regular, 8.1, contentWidth - 148),
      margin + 122,
      y + 16,
      8.1,
      ctx.fonts.regular,
      colors.muted,
    );
  }

  ctx.y = y - 14;
}

function drawRecommendations(ctx: PdfContext, result: AuditResult) {
  addPage(ctx, "Recommendations", "Prioritized operating actions with traceable savings assumptions");
  drawSavingsTable(ctx, result.recommendations);

  sectionTitle(ctx, "Recommended actions");

  for (const recommendation of result.recommendations) {
    drawRecommendationCard(ctx, recommendation);
  }
}

export async function createAuditPdf(
  result: AuditResult,
  reportUrl: string,
  generatedAt = new Date(),
) {
  const doc = await PDFDocument.create();
  const fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  const firstPage = doc.addPage([pageWidth, pageHeight]);
  const ctx: PdfContext = {
    doc,
    fonts,
    page: firstPage,
    y: pageHeight - 140,
    reportUrl,
    generatedAt,
  };

  drawSummaryPage(ctx, result);
  drawRecommendations(ctx, result);

  const pages = doc.getPages();
  pages.forEach((page, index) => drawFooter(ctx, page, index + 1, pages.length));

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
