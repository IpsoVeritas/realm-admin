import { Component, ViewChild, ElementRef, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { EventsService, DialogsService, ClipboardService } from '@brickchain/integrity-angular';
import { DocumentHandlerService } from '../../../handlers/document-handler.service';
import { SessionService, CryptoService } from '../../../shared/services';
import { ControllersClient } from '../../../shared/api-clients';
import { Controller, ActionDescriptor, Action } from '../../../shared/models/';
import { ControllerSettingsDialogComponent } from './controller-settings-dialog.component';
import { v4 } from 'uuid/v4';

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
  actions: ActionDescriptor[];
  uri: SafeResourceUrl;

  addBindingAction: ActionDescriptor;

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
    private cryptoService: CryptoService,
    private snackBar: MatSnackBar,
    protected http: HttpClient,
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
    this.ready = false;
    this.uri = undefined;
    if (this.stopListening !== undefined) {
      this.stopListening();
      this.stopListening = undefined;
    }
    this.controllersClient.getController(this.realmId, controllerId)
      .then(controller => {
        this.controller = controller;
        this.addBindingAction = undefined;
        this.controllersClient.getParsedControllerActions(controller, ['https://interfaces.brickchain.com/v1/add-binding.json'])
          .then(a => this.addBindingAction = a.length > 0 ? a[0] : undefined)
          .catch(err => console.warn(err));
        return controller;
      })
      .then(controller => {
        if (controller.descriptor.adminUI) {
          this.cryptoService.filterMandates(controller.adminRoles)
            .then(mandates => this.cryptoService.createMandateToken(
              controller.descriptor.adminUI,
              mandates,
              (this.session.expires - Date.now()) / 1000
            ).then(token => {
              let hash = controller.descriptor.adminUI.split('#')[1];
              hash = hash ? hash : '';
              const delim = hash.length > 0 ? (hash.indexOf('?') === -1 ? '?' : '&') : '?';
              const referer = encodeURIComponent(window.location.href);
              const uri = `${controller.descriptor.adminUI}#${delim}token=${token}&referer=${referer}&language=${this.session.language}`;
              this.stopListening = this.renderer.listen('window', 'message', this.handleMessage.bind(this));
              this.uri = this.sanitizer.bypassSecurityTrustResourceUrl(uri);
            }));
        } else {
          this.controllersClient.getParsedControllerActions(controller)
            .then(actions => this.actions = actions)
            .then(() => this.ready = true);
        }
      });
  }

  resume() {
    if (this.controller && this.controller.descriptor.adminUI) {
      this.cryptoService.filterMandates(this.controller.adminRoles)
        .then(mandates => this.cryptoService.createMandateToken(
          this.controller.descriptor.adminUI,
          mandates,
          (this.session.expires - Date.now()) / 1000
        ).then(token => {
          const message = {
            '@type': 'token-refresh',
            'token': token
          };
          const contentWindow = this.iframe.nativeElement.contentWindow;
          contentWindow.postMessage(message, this.controller.descriptor.adminUI);
        }));
    }
  }

  edit() {
    this.controllersClient.cloneController(this.controller)
      .then(clone => {
        const dialogRef = this.dialog.open(ControllerSettingsDialogComponent, { data: clone });
        return dialogRef.afterClosed().toPromise();
      })
      .then(updated => {
        if (updated) {
          this.controllersClient.updateController(updated)
            .then(() => this.controller = updated)
            .catch(error => this.snackBarOpen(
              this.translate.instant('error.updating', { value: this.controller.name }),
              this.translate.instant('label.close'),
              this.snackBarErrorConfig));
        }
      });
  }

  delete() {
    this.dialogs.openConfirm({
      message: this.translate.instant('controllers.delete_controller', { controller: this.controller.name }),
      ok: this.translate.instant('label.delete'),
      okColor: 'warn',
      okIcon: 'delete',
      cancel: this.translate.instant('label.cancel')
    }).then(confirmed => {
      if (confirmed) {
        this.controllersClient.deleteController(this.controller)
          .then(() => this.events.publish('controllers_updated'))
          .then(() => this.router.navigateByUrl(`/${this.session.realm}/home`))
          .catch(error => this.snackBarOpen(
            this.translate.instant('error.deleting', { value: this.controller.name }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig));
      }
    });
  }

  sync() {
    this.controllersClient.syncController(this.controller)
      .catch(error => this.snackBarOpen(
        this.translate.instant('controllers.error_syncing_controller', { controller: this.controller.name }),
        this.translate.instant('label.close'),
        this.snackBarErrorConfig));
  }

  binding() {
    const action = new Action();
    action.certificate = this.session.chain;
    action.mandates = this.session.mandates;
    action.nonce = v4();
    action.params = this.addBindingAction.params;
    this.cryptoService.signCompact(action)
      .then(jws => this.http.post(this.addBindingAction.actionURI, jws).toPromise())
      .then((response: any) => {
        if ((<any>navigator).clipboard) {
          (<any>navigator).clipboard.writeText(response.url)
            .then(() => this.snackBarOpen(
              this.translate.instant('message.copied_to_clipboard', { value: response.url }),
              this.translate.instant('label.close'),
              { duration: 2000 }))
            .catch(() => this.snackBarOpen(
              this.translate.instant('message.copy_to_clipboard_failed', { value: response.url }),
              this.translate.instant('label.close'),
              this.snackBarErrorConfig));
        } else {
          const snackbarRef = this.snackBarOpen(
            response.url,
            this.translate.instant('label.copy'),
            { duration: 5000 });
          snackbarRef.onAction().toPromise()
            .then(() => this.clipboard.copy(response.url));
        }
      })
      .catch(() => this.snackBarOpen(
        this.translate.instant('error.calling', { value: this.addBindingAction.actionURI }),
        this.translate.instant('label.close'),
        this.snackBarErrorConfig));
  }

  load(event) {
    if (this.iframe) {
      this.ready = true;
      const layoutChanges = this.breakpointObserver.observe(Breakpoints.HandsetPortrait);
      const contentWindow = this.iframe.nativeElement.contentWindow;
      layoutChanges.subscribe(result => {
        const message = {
          '@type': 'layout-change',
          'layout': result.matches ? 'narrow' : 'wide'
        };
        contentWindow.postMessage(message, this.controller.descriptor.adminUI);
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

  snackBarOpen(message: string, action?: string, config?: MatSnackBarConfig): MatSnackBarRef<SimpleSnackBar> {
    this.isSnackBarOpen = true;
    const snackbarRef = this.snackBar.open(message, action, config);
    snackbarRef.afterDismissed().toPromise().then(() => this.isSnackBarOpen = false);
    return snackbarRef;
  }

}
