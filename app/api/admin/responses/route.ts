import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { ClientFeedback } from "@/lib/feedback-model";
import { feedbackFilter } from "@/lib/query";
import { toSummary } from "@/lib/serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Sign in to read responses." }, { status: 401 });
  }

  try {
    await connectDb();
    const docs = await ClientFeedback.find(feedbackFilter(new URL(request.url).searchParams))
      .sort({ submittedAt: -1 })
      .limit(500)
      .lean();
    return NextResponse.json({ responses: docs.map((doc) => toSummary(doc)) });
  } catch (error) {
    console.error("Failed to list feedback", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Could not load responses." }, { status: 500 });
  }
}
