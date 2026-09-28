import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { ClientFeedback } from "@/lib/feedback-model";
import { isFeedbackId } from "@/lib/ids";
import { toRecord } from "@/lib/serialize";
import { sameOrigin } from "@/lib/security";
import { adminUpdate } from "@/lib/update-feedback";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function load(feedbackId: string) {
  if (!isFeedbackId(feedbackId)) return null;
  await connectDb();
  return ClientFeedback.findOne({ feedbackId }).lean();
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ feedbackId: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Sign in to read responses." }, { status: 401 });
  }
  const { feedbackId } = await context.params;
  const doc = await load(feedbackId);
  if (!doc) return NextResponse.json({ error: "That feedback ID was not found." }, { status: 404 });
  return NextResponse.json({ response: toRecord(doc) });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ feedbackId: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Sign in to update responses." }, { status: 401 });
  }
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Update feedback from the admin page." }, { status: 403 });
  }

  const { feedbackId } = await context.params;
  if (!isFeedbackId(feedbackId)) {
    return NextResponse.json({ error: "That feedback ID was not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON object." }, { status: 400 });
  }

  const change = adminUpdate(body);
  if ("error" in change) {
    return NextResponse.json({ error: change.error }, { status: 400 });
  }

  await connectDb();
  const doc = await ClientFeedback.findOneAndUpdate({ feedbackId }, change.update, {
    new: true,
    runValidators: true,
  }).lean();
  if (!doc) return NextResponse.json({ error: "That feedback ID was not found." }, { status: 404 });
  return NextResponse.json({ response: toRecord(doc) });
}
