export class UserInfo {

  fp: string;
  email: string;
  realms: string[];
  permissions: string[];
  owner: boolean;

  constructor(obj?: any) {
    if (typeof obj !== 'undefined') {
      this.fp = obj.fp;
      this.email = obj.email;
      this.realms = obj.realms;
      this.permissions = obj.permissions;
      this.owner = obj.owner;
    }
  }

}
