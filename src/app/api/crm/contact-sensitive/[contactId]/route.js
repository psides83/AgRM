import { NextResponse } from "next/server";
import { createClient } from "lib/supabase/server";

const revealFunctions = {
  ssn: "get_contact_social_security_number",
  agTaxExemptNumber: "get_contact_ag_tax_exempt_number",
};

export async function GET(request, { params }) {
  const encryptionKey = process.env.CRM_FIELD_ENCRYPTION_KEY;

  if (!encryptionKey) {
    return NextResponse.json(
      { error: "CRM_FIELD_ENCRYPTION_KEY is not configured." },
      { status: 500 },
    );
  }

  const field = new URL(request.url).searchParams.get("field");
  const rpcName = revealFunctions[field];

  if (!rpcName) {
    return NextResponse.json(
      { error: "A valid sensitive field is required." },
      { status: 400 },
    );
  }

  const { contactId } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(rpcName, {
    p_contact_id: contactId,
    p_encryption_key: encryptionKey,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "The protected value was not found." },
      { status: 404 },
    );
  }

  return sensitiveResponse(data);
}

export async function PATCH(request, { params }) {
  const encryptionKey = process.env.CRM_FIELD_ENCRYPTION_KEY;

  if (!encryptionKey) {
    return NextResponse.json(
      { error: "CRM_FIELD_ENCRYPTION_KEY is not configured." },
      { status: 500 },
    );
  }

  const { contactId } = await params;
  const body = await request.json();
  const supabase = await createClient();
  const updates = {};

  if (Object.hasOwn(body, "socialSecurityNumber")) {
    const { data, error } = await supabase.rpc(
      "set_contact_social_security_number",
      {
        p_contact_id: contactId,
        p_ssn: body.socialSecurityNumber || "",
        p_encryption_key: encryptionKey,
      },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    updates.socialSecurityNumber = data?.[0] || null;
  }

  if (Object.hasOwn(body, "agTaxExemptNumber")) {
    const { data, error } = await supabase.rpc(
      "set_contact_ag_tax_exempt_number",
      {
        p_contact_id: contactId,
        p_ag_tax_exempt_number: body.agTaxExemptNumber || "",
        p_encryption_key: encryptionKey,
      },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    updates.agTaxExemptNumber = data?.[0] || null;
  }

  return NextResponse.json({ contact: updates });
}

function sensitiveResponse(value) {
  return NextResponse.json(
    { value },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        Pragma: "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
