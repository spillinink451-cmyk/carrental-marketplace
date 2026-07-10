import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

type BucketConfig = { bucket: string; publicUrl: string };

const EVIDENCE_BUCKET: BucketConfig = { bucket: process.env.R2_BUCKET_NAME!, publicUrl: process.env.R2_PUBLIC_URL! };
const CAR_IMAGES_BUCKET: BucketConfig = { bucket: process.env.R2_CAR_IMAGES_BUCKET_NAME!, publicUrl: process.env.R2_CAR_IMAGES_PUBLIC_URL! };
const LEASE_DOCS_BUCKET = process.env.R2_LEASE_DOCS_BUCKET_NAME!;

async function getUploadUrlFor(config: BucketConfig, key: string, contentType: string) {
  const command = new PutObjectCommand({ Bucket: config.bucket, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
  return { uploadUrl, publicUrl: `${config.publicUrl}/${key}` };
}

export function getEvidenceUploadUrl(key: string, contentType: string) {
  return getUploadUrlFor(EVIDENCE_BUCKET, key, contentType);
}

export function getCarImageUploadUrl(key: string, contentType: string) {
  return getUploadUrlFor(CAR_IMAGES_BUCKET, key, contentType);
}

// Lease documents: written directly by server code (never a browser upload),
// read only via short-lived signed URLs generated fresh on each request.
export async function uploadLeaseDocument(key: string, buffer: Buffer, contentType: string) {
  await r2.send(new PutObjectCommand({ Bucket: LEASE_DOCS_BUCKET, Key: key, Body: buffer, ContentType: contentType }));
  return key;
}
export async function uploadSignature
(
  key: string,
  buffer: Buffer, 
  contentType: string
) 
{
  await r2.send
  (new PutObjectCommand({ 
    Bucket: LEASE_DOCS_BUCKET, 
    Key: key, 
    Body: buffer, 
    ContentType: contentType })
  );
  return key;
}

export async function getLeaseDocumentReadUrl(key: string) {
  const command = new GetObjectCommand({ Bucket: LEASE_DOCS_BUCKET, Key: key });
  return getSignedUrl(r2, command, { expiresIn: 300 });
}


export async function getSignatureReadUrl(key: string) 
{
  const command = new GetObjectCommand(
    { Bucket: LEASE_DOCS_BUCKET, 
      Key: key 
    });
  return getSignedUrl(r2, command, { expiresIn: 300 });
}