import { Component, ViewChild, ElementRef, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentHandlerService } from '../../../handlers/document-handler.service';
import { SessionService, CryptoService } from '../../../shared/services';
import { ControllersClient, RealmsClient } from '../../../shared/api-clients';
import { Controller, ControllerDescriptor } from './../../../shared/models/';

@Component({
  selector: 'app-controller',
  templateUrl: './controller.component.html',
  styleUrls: ['./controller.component.scss']
})
export class ControllerComponent implements OnInit, OnDestroy {

  @ViewChild('iframe') iframe: ElementRef;

  stopListening: Function;

  realmId: string;
  controllerId: string;
  controller: Controller;
  uri: SafeResourceUrl;

  ready = false;

  constructor(
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private session: SessionService,
    private documentHandler: DocumentHandlerService,
    private controllersClient: ControllersClient,
    private realmsClient: RealmsClient,
    private cryptoService: CryptoService
  ) {
  }

  ngOnInit() {
    this.realmId = this.session.realm;
    this.controllerId = this.route.snapshot.paramMap.get('id');
    this.controllersClient.getController(this.realmId, this.controllerId)
      .then(controller => this.cryptoService.createMandateToken(controller.descriptor.adminUI, (this.session.expires - Date.now()) / 1000)
        .then(token => {
          this.controller = controller;
          if (controller.descriptor.adminUI) {
            let hash = controller.descriptor.adminUI.split('#')[1];
            hash = hash ? hash : '';
            const delim = hash.length > 0 ? (hash.indexOf('?') === -1 ? '?' : '&') : '?';
            const referer = encodeURIComponent(window.location.href);
            const uri = `${controller.descriptor.adminUI}#${delim}token=${token}&referer=${referer}&language=${this.session.language}`;
            this.stopListening = this.renderer.listen('window', 'message', this.handleMessage.bind(this));
            this.uri = this.sanitizer.bypassSecurityTrustResourceUrl(uri);
          }
        }));
  }

  ngOnDestroy() {
    if (this.stopListening !== undefined) {
      this.stopListening();
    }
  }

  load(event) {
    if (this.iframe) {
      this.ready = true;
    }
  }

  handleMessage(event: MessageEvent) {

    if (event.origin && this.controller.descriptor.adminUI.startsWith(event.origin)) {

      const contentWindow = this.iframe.nativeElement.contentWindow;

      const context = {
        realmId: this.realmId,
        controller: this.controller
      };

      this.documentHandler.handleData(context, event.data)
        .then(result => contentWindow.postMessage(result, event.origin))
        .catch(error => console.error(error));

    }
  }

}
