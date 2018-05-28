import { Component, ViewChild, ElementRef, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { EventsService, DialogsService, ClipboardService } from '@brickchain/integrity-angular';
import { DocumentHandlerService } from '../../../handlers/document-handler.service';
import { SessionService, CryptoService } from '../../../shared/services';
import { ControllersClient, RealmsClient } from '../../../shared/api-clients';
import { Controller, ControllerDescriptor } from './../../../shared/models/';
import { ControllerSettingsDialogComponent } from './controller-settings-dialog.component';

import { structuralClone } from './../../../shared';

@Component({
  selector: 'app-controller',
  templateUrl: './controller.component.html',
  styleUrls: ['./controller.component.scss']
})
export class ControllerComponent implements OnInit, OnDestroy {

  @ViewChild('iframe') iframe: ElementRef;

  isSnackBarOpen = false;

  resumeHandler: Function;
  stopListening: Function;

  realmId: string;
  controller: Controller;
  uri: SafeResourceUrl;

  ready = false;

  snackBarErrorConfig: MatSnackBarConfig = {
    duration: 5000,
    panelClass: 'error'
  };

  constructor(
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private sanitizer: DomSanitizer,
    private session: SessionService,
    private dialogs: DialogsService,
    private translate: TranslateService,
    private clipboard: ClipboardService,
    public events: EventsService,
    private dialog: MatDialog,
    private documentHandler: DocumentHandlerService,
    private controllersClient: ControllersClient,
    private realmsClient: RealmsClient,
    private cryptoService: CryptoService,
    private snackBar: MatSnackBar
  ) {
    this.resumeHandler = () => this.resume();
  }

  ngOnInit() {
    this.realmId = this.session.realm;
    this.route.paramMap.subscribe(paramMap => this.loadController(paramMap.get('id')));
    this.events.subscribe('session_resumed', this.resumeHandler);
  }

  ngOnDestroy() {
    if (this.stopListening !== undefined) {
      this.stopListening();
    }
    this.events.unsubscribe('session_resumed', this.resumeHandler);
  }

  loadController(controllerId: string) {
    this.controllersClient.getController(this.realmId, controllerId)
      .then(controller => this.cryptoService.filterMandates(controller.adminRoles)
        .then(mandates => this.cryptoService.createMandateToken(
          controller.descriptor.adminUI,
          mandates,
          (this.session.expires - Date.now()) / 1000
        ).then(token => {
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
        })));
  }

  resume() {
    this.cryptoService.filterMandates(this.controller.adminRoles)
      .then(mandates => this.cryptoService.createMandateToken(
        this.controller.descriptor.adminUI,
        mandates,
        (this.session.expires - Date.now()) / 1000
      ).then(token => {
        console.log(`New token: ${token}`);
        const message = {
          '@type': 'token-refresh',
          'token': token
        };
        const contentWindow = this.iframe.nativeElement.contentWindow;
        contentWindow.postMessage(message, this.controller.descriptor.adminUI);
      }));
  }

  edit() {
    structuralClone(this.controller, Controller)
      .then(clone => {
        const dialogRef = this.dialog.open(ControllerSettingsDialogComponent, { data: clone });
        return dialogRef.afterClosed().toPromise();
      })
      .then(updated => {
        if (updated) {
          this.controllersClient.updateController(updated)
            .then(() => this.controller = updated)
            .catch(error => this.snackBarOpen(
              this.translate.instant('general.error_updating', { value: this.controller.name }),
              this.translate.instant('label.close'),
              this.snackBarErrorConfig));
        }
      });
  }

  delete() {
    this.dialogs.openConfirm({
      message: this.translate.instant('controllers.delete_controller', { value: this.controller.name }),
      ok: this.translate.instant('label.ok'),
      cancel: this.translate.instant('label.cancel')
    }).then(confirmed => {
      if (confirmed) {
        this.controllersClient.deleteController(this.controller)
          .then(() => this.events.publish('controllers_updated'))
          .then(() => this.router.navigateByUrl(`/${this.session.realm}/home`))
          .catch(error => this.snackBarOpen(
            this.translate.instant('general.error_deleting', { value: this.controller.name }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig));
      }
    });
  }

  sync() {
    this.controllersClient.syncController(this.controller)
      .catch(error => this.snackBarOpen(
        this.translate.instant('controllers.error_syncing_controller', { value: this.controller.name }),
        this.translate.instant('label.close'),
        this.snackBarErrorConfig));
  }

  binding() {
    // Synchronous HTTP to enable clipboard
    const xhr = new XMLHttpRequest();
    xhr.open('post', this.controller.descriptor.addBindingEndpoint, false);
    xhr.setRequestHeader('Authorization', `Mandate ${this.session.mandate}`);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 201) {
          const obj = JSON.parse(xhr.responseText);
          this.clipboard.copy(obj.url)
            .then(value => this.snackBarOpen(
              this.translate.instant('binding.url_copied', { value: this.controller.name }),
              this.translate.instant('label.close'),
              { duration: 2000 }))
            .catch(() => this.snackBarOpen(obj.url, 'Close'));
        } else {
          this.snackBarOpen(
            this.translate.instant('general.error_calling', { value: this.controller.descriptor.addBindingEndpoint }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig);
        }
      }
    };
    xhr.send();
  }

  load(event) {
    if (this.iframe) {
      this.ready = true;
      const layoutChanges = this.breakpointObserver.observe(Breakpoints.HandsetPortrait);
      layoutChanges.subscribe(result => {
        if (result.matches) {
          this.iframe.nativeElement.contentWindow.postMessage('realm-admin-narrow', '*');
        } else {
          this.iframe.nativeElement.contentWindow.postMessage('realm-admin-wide', '*');
        }
      });
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
        .then(result => {
          contentWindow.postMessage(this.buildResponse(event, result, false), event.origin);
        })
        .catch(error => {
          console.error(error, context, event.data);
          contentWindow.postMessage(this.buildResponse(event, error, true), event.origin);
        });
    }
  }

  buildResponse(event: MessageEvent, data: any, isError: boolean = false): any {
    let message: any;
    if (event.data && event.data['@correlationId']) {
      message = {};
      message['@correlationId'] = event.data['@correlationId'];
      message[isError ? 'error' : 'data'] = data;
    } else {
      message = data;
    }
    return message;
  }

  snackBarOpen(message: string, action?: string, config?: MatSnackBarConfig) {
    this.isSnackBarOpen = true;
    const snackbarRef = this.snackBar.open(message, action, config);
    snackbarRef.afterDismissed().toPromise().then(() => this.isSnackBarOpen = false);
  }

}
