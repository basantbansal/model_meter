import { getAuditById } from "@/lib/audits";
import { createAuditPdf } from "@/lib/pdf-report";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    )
  ) {
    return Response.json({ error: "Report not found." }, { status: 404 });
  }

  const { result, error } = await getAuditById(id);

  if (error || !result) {
    return Response.json({ error: "Report not found." }, { status: 404 });
  }

  const reportUrl = `${getSiteUrl()}/results/${id}`;

  let pdf: Buffer;

  try {
    pdf = await createAuditPdf(result, reportUrl);
  } catch {
    return Response.json(
      { error: "The report PDF could not be generated." },
      { status: 500 },
    );
  }

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="modelmeter-report-${id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
