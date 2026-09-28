import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { feedbackToCsv } from "@/lib/csv";
import { connectDb } from "@/lib/db";
import { ClientFeedback } from "@/lib/feedback-model";
import { renderFeedbackPdf } from "@/lib/pdf";
import { feedbackFilter } from "@/lib/query";
import { toRecord } from "@/lib/serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Sign in to export responses." }, { status: 401 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  if (format !== "csv" && format !== "pdf") {
    return NextResponse.json({ error: "Choose csv or pdf." }, { status: 400 });
  }

  try {
    await connectDb();
    const docs = await ClientFeedback.find(feedbackFilter(url.searchParams))
      .sort({ submittedAt: -1 })
      .limit(500)
      .lean();
    const rows = docs.map((doc) => toRecord(doc));

    if (format === "csv") {
      return new NextResponse(feedbackToCsv(rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=\"candexai-feedback.csv\"",
          "Cache-Control": "no-store",
        },
      });
    }

    const pdf = renderFeedbackPdf(rows);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=\"candexai-feedback.pdf\"",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to export feedback", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Could not export responses." }, { status: 500 });
  }
}
