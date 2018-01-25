import { DOCUMENT } from '@angular/platform-browser';
import { Inject } from '@angular/core';
import { Injectable } from '@angular/core';

@Injectable()
export class ClipboardService {

  constructor( @Inject(DOCUMENT) private dom: Document) {
  }

  public copy(value: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let textarea = null;
      try {
        textarea = this.dom.createElement('textarea');
        textarea.style.width = '0px';
        textarea.style.height = '0px';
        textarea.style.position = 'fixed';
        textarea.style.top = '-100px';
        textarea.style.left = '-100px';
        textarea.style.opacity = '0';
        this.dom.body.appendChild(textarea);
        textarea.value = value;
        textarea.select();
        this.dom.execCommand('copy') ? resolve(value) : reject('command not supported');
      } catch (err) {
        reject(err);
      } finally {
        if (textarea && textarea.parentNode) {
          textarea.parentNode.removeChild(textarea);
        }
      }
    });
  }

}
