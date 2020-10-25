import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  isWebExtension: boolean = false;
  links: any = {
    github: 'https://github.com/AXeL-dev/firestore-manager',
    releases: 'https://github.com/AXeL-dev/firestore-manager/releases',
    issueTracker: 'https://github.com/AXeL-dev/firestore-manager/issues',
    firefoxAddon: 'https://addons.mozilla.org/firefox/addon/firestore-manager'
  };

  constructor() {
    try {
      this.isWebExtension = !!browser;
    } catch(error) {
      // console.log(error.message);
      // this.isWebExtension = false;
    }
  }

  getUrl(path?: string) {
    let url = this.isWebExtension ? 'index.html' : './';
    if (path?.length) {
      const sanitizedPath = path.replace('/^[.|\/]+/', '');
      url += this.isWebExtension ? '?page=' + sanitizedPath : sanitizedPath;
    }
    return this.isWebExtension ? browser.extension.getURL(url) : url;
  }

  openUrl(url: string, isActive: boolean = true): Promise<any>|any {
    if (this.isWebExtension) {
      return browser.tabs.create({
        url: url,
        active: isActive
      });
    } else {
      return window.open(url, '_blank');
    }
  }

}
