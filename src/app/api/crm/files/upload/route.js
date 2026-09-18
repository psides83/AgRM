import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "lib/supabase/server";

const bucketName = "crm-files";
const encryptedCategories = new Set(["driver_license"]);
const recordIdFields = {
  contact: "contact_id",
  company: "company_id",
  lead: "lead_id",
  deal: "deal_id",
};

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const recordType = formData.get("recordType");
  const recordId = formData.get("recordId");
  const fileCategory = formData.get("fileCategory") || "general";
  const recordField = recordIdFields[recordType];

  if (!file || !recordField || !recordId) {
    return NextResponse.json(
      { error: "Missing file or CRM record." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "You need to be logged in to upload files." },
      { status: 401 },
    );
  }

  const shouldEncrypt = encryptedCategories.has(fileCategory);
  const bytes = Buffer.from(await file.arrayBuffer());
  let storedBytes = bytes;

  try {
    storedBytes = shouldEncrypt ? encryptBytes(bytes) : bytes;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const storagePath = [
    user.id,
    recordType,
    recordId,
    `${Date.now()}-${safeFileName(file.name)}${shouldEncrypt ? ".enc" : ""}`,
  ].join("/");

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, storedBytes, {
      cacheControl: "3600",
      contentType: shouldEncrypt
        ? "application/octet-stream"
        : file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data, error: insertError } = await supabase
    .from("files")
    .insert({
      owner_id: user.id,
      [recordField]: recordId,
      storage_bucket: bucketName,
      storage_path: storagePath,
      file_name: file.name,
      mime_type: file.type || null,
      size_bytes: file.size,
      file_category: fileCategory,
      is_encrypted: shouldEncrypt,
      encryption_version: shouldEncrypt ? "aes-256-gcm:v1" : null,
    })
    .select("*")
    .single();

  if (insertError) {
    await supabase.storage.from(bucketName).remove([storagePath]);
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ file: data });
}

function encryptBytes(bytes) {
  const encryptionKey = process.env.CRM_FIELD_ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new Error("CRM_FIELD_ENCRYPTION_KEY is not configured.");
  }

  const key = crypto.createHash("sha256").update(encryptionKey).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(bytes), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([Buffer.from("AGRMENC1"), iv, authTag, ciphertext]);
}

function safeFileName(value) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}
