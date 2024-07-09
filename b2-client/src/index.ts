import {
  B2AuthorizeAccountSchema,
  B2ListFileNamesSchema,
  fetch_b2_authorize_account,
  fetch_b2_download_file_by_name,
  fetch_b2_list_file_names,
} from './native.js';

export class B2Client {
  private id: string;
  private key: string;
  constructor(id: string, key: string) {
    this.id = id;
    this.key = key;
  }

  private apiUrl: string | undefined;
  private downloadUrl: string | undefined;
  private authorizationToken: string | undefined;
  async auth() {
    const data = B2AuthorizeAccountSchema.parse(
      await (await fetch_b2_authorize_account(this.id, this.key)).json(),
    );
    this.apiUrl = data.apiInfo.storageApi.apiUrl;
    this.downloadUrl = data.apiInfo.storageApi.downloadUrl;
    this.authorizationToken = data.authorizationToken;
    return this;
  }

  async down(BUCKET_NAME: string, FILE_NAME: string) {
    if (this.downloadUrl === undefined || this.authorizationToken === undefined)
      throw Error('no auth');
    return fetch_b2_download_file_by_name(
      this.downloadUrl,
      BUCKET_NAME,
      FILE_NAME,
      this.authorizationToken,
    );
  }

  async list(
    bucketId: string,
    option?: {
      listAll?: boolean;
      startFileName?: string;
      maxFileCount?: number;
      prefix?: string;
      delimiter?: string;
    },
  ) {
    if (
      this.id === undefined ||
      this.apiUrl === undefined ||
      this.authorizationToken === undefined
    )
      throw Error('no auth');

    const oneshot = B2ListFileNamesSchema.parse(
      await (
        await fetch_b2_list_file_names(
          this.apiUrl,
          this.authorizationToken,
          bucketId,
          option,
        )
      ).json(),
    );
    if (option?.listAll !== true || typeof oneshot.nextFileName !== 'string')
      return oneshot.files;

    const wrapper = async (sfn: string) =>
      B2ListFileNamesSchema.parse(
        await (
          await fetch_b2_list_file_names(
            this.apiUrl!,
            this.authorizationToken!,
            bucketId,
            { ...option, startFileName: sfn },
          )
        ).json(),
      );
    let files = oneshot.files;
    let nextFileName: string | null = oneshot.nextFileName;
    while (nextFileName !== null) {
      const data = await wrapper(nextFileName);
      files = files.concat(data.files);
      nextFileName = data.nextFileName;
    }
    return files;
  }
}

export * as native from './native.js';
