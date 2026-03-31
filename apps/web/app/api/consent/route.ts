import { NextResponse } from "next/server";
import { getStore } from "../../../lib/store";
import { validateConsent } from "../../../lib/validation";

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON", requestId }, { status: 400 });
  }

  const validated = validateConsent(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error, requestId }, { status: 400 });
  }

  try {
    const store = getStore();
    const result = await store.recordConsent({
      subjectType: validated.value.subjectType,
      subjectRef: validated.value.subjectRef,
      consentType: validated.value.consentType,
      consentGiven: validated.value.consentGiven,
      policyVersion: validated.value.policyVersion,
      sourceIp: req.headers.get("x-forwarded-for") ?? validated.value.sourceIp,
      userAgent: req.headers.get("user-agent") ?? validated.value.userAgent
    });

    await store.recordAuditEvent({
      actorType: "CUSTOMER",
      eventType: "CONSENT_RECORDED",
      entityType: "CONSENT",
      entityRef: result.consentId,
      payload: {
        subjectType: validated.value.subjectType,
        subjectRef: validated.value.subjectRef
      }
    });

    return NextResponse.json(
      {
        consentId: result.consentId,
        status: "RECORDED",
        requestId
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected consent error";
    return NextResponse.json({ error: message, requestId }, { status: 500 });
  }
}
