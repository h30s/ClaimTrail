export type StorageDriver = {
  put(key: string, bytes: Uint8Array, contentType: string): Promise<void>;
  get(key: string): Promise<Uint8Array>;
  removePrefix(prefix: string): Promise<void>; // seed reset only
};
