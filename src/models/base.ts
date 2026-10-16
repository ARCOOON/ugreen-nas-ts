import type { UgreenNasClient } from "../client.ts";

export abstract class NasResource<T = any> {
  protected client: UgreenNasClient;
  public raw: T;

  constructor(client: UgreenNasClient, raw: T) {
    this.client = client;
    this.raw = raw;
  }

  protected _refresh(data: T): void {
    this.raw = data;
  }

  public toJSON(): T {
    return this.raw;
  }
}
