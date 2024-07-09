import { z } from 'zod';

export const B2AuthorizeAccountSchema = z.object({
  apiInfo: z.object({
    storageApi: z.object({
      apiUrl: z.string(),
      downloadUrl: z.string(),
    }),
  }),
  authorizationToken: z.string(),
});

export const B2ListFileNamesSchema = z.object({
  files: z.array(
    z.object({
      contentLength: z.number(),
      fileName: z.string(),
      uploadTimestamp: z.number(),
    }),
  ),
  nextFileName: z.string().nullable(),
});

export async function fetch_b2_authorize_account(
  applicationKeyId: string,
  applicationKey: string,
  option?: {
    apiUrl?: string;
  },
) {
  const apiUrl = option?.apiUrl ?? 'https://api.backblazeb2.com';

  return fetch(`${apiUrl}/b2api/v3/b2_authorize_account`, {
    headers: {
      Authorization: `Basic ${btoa(`${applicationKeyId}:${applicationKey}`)}`,
    },
  });
}

export function fetch_b2_download_file_by_name(
  downloadUrl: string,
  BUCKET_NAME: string,
  FILE_NAME: string,
  authorizationToken: string,
) {
  return fetch(
    `${downloadUrl}/file/${BUCKET_NAME}/${FILE_NAME}?Authorization=${authorizationToken}`,
  );
}

export async function fetch_b2_list_file_names(
  apiUrl: string,
  authorizationToken: string,
  bucketId: string,
  option?: {
    startFileName?: string;
    maxFileCount?: number;
    prefix?: string;
    delimiter?: string;
  },
) {
  const search = new URLSearchParams({ bucketId });
  if (option !== undefined) {
    const { startFileName, delimiter, maxFileCount, prefix } = option;
    for (const entry of Object.entries({
      startFileName,
      delimiter,
      maxFileCount,
      prefix,
    }))
      entry[1] !== undefined && search.set(entry[0], entry[1].toString());
  }
  return fetch(`${apiUrl}/b2api/v3/b2_list_file_names?${search}`, {
    headers: {
      Authorization: authorizationToken,
    },
  });
}
