import type { UgreenNasClient } from "../client.ts";
import { SshTerminal } from "../models/power.ts";
import {
  FtpService,
  NfsService,
  RsyncService,
  SmbService,
  WebdavService,
} from "../models/shares.ts";

export class ServicesManager {
  public smb: SmbService;
  public nfs: NfsService;
  public ftp: FtpService;
  public webdav: WebdavService;
  public rsync: RsyncService;
  public ssh: SshTerminal;

  constructor(client: UgreenNasClient) {
    this.smb = new SmbService(client);
    this.nfs = new NfsService(client);
    this.ftp = new FtpService(client);
    this.webdav = new WebdavService(client);
    this.rsync = new RsyncService(client);
    this.ssh = new SshTerminal(client);
  }
}
