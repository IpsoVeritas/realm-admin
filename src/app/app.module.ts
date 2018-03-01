import { environment } from '../environments/environment';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { EventsModule, QRCodeModule, DialogsModule, ClipboardModule, DragAndDropModule } from '@brickchain/integrity-angular';
import { WebviewClientModule } from '@brickchain/integrity-webview-client';

import { Ng2ImgToolsModule } from 'ng2-img-tools';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { DocumentHandlerService } from './handlers/document-handler.service';
import { TokenInterceptor, LoaderInterceptor, LanguageInterceptor } from './shared/interceptors';
import {
  AuthClient, AccessClient, RealmsClient, MandatesClient,
  ControllersClient, RolesClient, InvitesClient, ServicesClient
} from './shared/api-clients';
import { SessionService, PlatformService, ConfigService, CryptoService } from './shared/services';

import { BootstrapComponent } from './pages/bootstrap/bootstrap.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/home/dashboard/dashboard.component';
import { RealmsComponent } from './pages/home/realms/realms.component';
import { RolesComponent } from './pages/home/roles/roles.component';
import { RoleInviteDialogComponent } from './pages/home/roles/role-invite-dialog.component';
import { MandatesComponent } from './pages/home/mandates/mandates.component';
import { ControllersComponent } from './pages/home/controllers/controllers.component';
import { ControllerComponent } from './pages/home/controller/controller.component';
import { ControllerAddDialogComponent } from './pages/home/controllers/controller-add-dialog.component';
import { ControllerBindDialogComponent } from './pages/home/controllers/controller-bind-dialog.component';
import { ControllerSettingsDialogComponent } from './pages/home/controllers/controller-settings-dialog.component';
import { SettingsComponent } from './pages/home/settings/settings.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    BootstrapComponent,
    LoginComponent,
    HomeComponent,
    DashboardComponent,
    RealmsComponent,
    RolesComponent,
    RoleInviteDialogComponent,
    MandatesComponent,
    ControllersComponent,
    ControllerComponent,
    ControllerAddDialogComponent,
    ControllerBindDialogComponent,
    ControllerSettingsDialogComponent,
    SettingsComponent
  ],
  entryComponents: [
    ControllerAddDialogComponent,
    ControllerBindDialogComponent,
    ControllerSettingsDialogComponent,
    RoleInviteDialogComponent
  ],
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('/ngsw-worker.js', {
      enabled: environment.production
    }),
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    LayoutModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSortModule,
    MatDialogModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatListModule,
    MatSidenavModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatMenuModule,
    MatTableModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    WebviewClientModule,
    QRCodeModule,
    EventsModule,
    DialogsModule,
    ClipboardModule,
    DragAndDropModule,
    Ng2ImgToolsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    AppRoutingModule
  ],
  providers: [
    AuthClient,
    AccessClient,
    RealmsClient,
    RolesClient,
    MandatesClient,
    ControllersClient,
    InvitesClient,
    ServicesClient,
    SessionService,
    PlatformService,
    ConfigService,
    CryptoService,
    DocumentHandlerService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LanguageInterceptor,
      multi: true
    }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
