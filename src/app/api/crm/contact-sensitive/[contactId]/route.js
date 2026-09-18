import { NextResponse } from "next/server";
import { createClient } from "lib/supabase/server";

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
