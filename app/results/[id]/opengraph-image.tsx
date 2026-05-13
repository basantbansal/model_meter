import { ImageResponse } from "next/og";

import { getAuditById } from "@/lib/audits";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";
export const alt = "ModelMeter savings report preview";
export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { result } = await getAuditById(id);
  const yearlySavings = result ? currency.format(result.yearlySavings) : "$0";
  const driver = result?.primarySavingsDriver ?? "AI spend hygiene";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f4ef",
          color: "#1c1917",
          padding: "64px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ffffff",
              border: "1px solid #d6d3d1",
              color: "#115e59",
            }}
          >
            M
          </div>
          ModelMeter
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div style={{ fontSize: 26, color: "#0f766e", fontWeight: 700 }}>
            Shareable AI spend audit
          </div>
          <div style={{ fontSize: 76, lineHeight: 1.05, fontWeight: 700 }}>
            {yearlySavings}
          </div>
          <div style={{ fontSize: 36, lineHeight: 1.25, color: "#57534e" }}>
            in potential yearly savings
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "24px",
            fontSize: 24,
            color: "#57534e",
          }}
        >
          <span>Primary driver: {driver}</span>
          <span>Deterministic audit model</span>
        </div>
      </div>
    ),
    size,
  );
}
