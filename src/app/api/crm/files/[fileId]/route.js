import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "lib/supabase/server";

export async function GET(request, { params }) {
  const { fileId } = await params;
  const supabase = await createClient();

  const { data: file, error: fileError } = await supabase
    .from("files")
    .select("*")
    .eq("id", fileId)
    .single();

  if (fileError) {
    return NextResponse.json({ error: fileError.message }, { status: 404 });
  }

  const { data, error: downloadError } = await supabase.storage
    .from(file.storage_bucket)
    .download(file.storage_path);

  if (downloadError) {
    return NextResponse.json({ error: downloadError.message }, { status: 400 });
  }

  let bytes = Buffer.from(await data.arrayBuffer());

  if (file.is_encrypted) {
    try {
      bytes = decryptBytes(bytes);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": file.mime_type || "application/octet-stream",
      "Content-Disposition": `inline; filename="${file.file_name.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

function decryptBytes(payload) {
  const encryptionKey = process.env.CRM_FIELD_ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new Error("CRM_FIELD_ENCRYPTION_KEY is not configured.");
  }

  const magic = payload.subarray(0, 8).toString();
  if (magic !== "AGRMENC1") {
    throw new Error("Encrypted file payload is not recognized.");
  }

  const key = crypto.createHash("sha256").update(encryptionKey).digest();
  const iv = payload.subarray(8, 20);
  const authTag = payload.subarray(20, 36);
  const ciphertext = payload.subarray(36);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
