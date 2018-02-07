import { Component, ViewChild, ElementRef, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentHandlerService } from '../../../handlers/document-handler.service';
import { SessionService } from '../../../shared/services';
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

  constructor(
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private session: SessionService,
    private documentHandler: DocumentHandlerService,
    private controllersClient: ControllersClient,
    private realmsClient: RealmsClient
  ) {
  }

  ngOnInit() {
    this.realmId = this.session.realm;
    this.controllerId = this.route.snapshot.paramMap.get('id');
    this.controllersClient.getController(this.realmId, this.controllerId)
      .then(controller => this.realmsClient.createSSOToken(controller)
        .then(token => {
          this.controller = controller;
          if (controller.descriptor.adminUI) {
            const delim = controller.descriptor.adminUI.indexOf('?') === -1 ? '?' : '&';
            const referer = encodeURIComponent(window.location.href);
            const uri = `${controller.descriptor.adminUI}${delim}token=${token}&referer=${referer}`;
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

  handleMessage(event: MessageEvent) {
    const message = event as MessageEvent;
    const contentWindow = this.iframe.nativeElement.contentWindow;
    this.documentHandler.receiveMessage(contentWindow, this.realmId, this.controller, event)
      .catch(err => console.warn(err));
  }

}
