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

  const { companyId } = await params;
  const body = await request.json();
  const updateEin = Object.hasOwn(body, "ein");
  const updateAgTaxExempt = Object.hasOwn(body, "agTaxExemptNumber");

  if (!updateEin && !updateAgTaxExempt) {
    return NextResponse.json(
      { error: "No sensitive company fields were provided." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("set_company_tax_identifiers", {
    p_company_id: companyId,
    p_ein: body.ein || "",
    p_ag_tax_exempt_number: body.agTaxExemptNumber || "",
    p_update_ein: updateEin,
    p_update_ag_tax_exempt: updateAgTaxExempt,
    p_encryption_key: encryptionKey,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ company: data?.[0] || null });
}
