import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';

import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { MatInputModule, MatButtonModule, MatSortModule } from '@angular/material';
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

import { EventsModule, QRCodeModule, DialogsModule, ClipboardModule, DragAndDropModule } from '@brickchain/integrity-angular';
import { WebviewClientModule } from '@brickchain/integrity-webview-client';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { DocumentHandlerService } from './handlers/document-handler.service';
import { TokenInterceptor, LoaderInterceptor } from './shared/interceptors';
import { AuthClient, AccessClient, RealmsClient, MandatesClient, ControllersClient } from './shared/api-clients';
import { RolesClient, InvitesClient } from './shared/api-clients';
import { SessionService, PlatformService, ConfigService } from './shared/services';

import { BootstrapComponent } from './pages/bootstrap/bootstrap.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RolesComponent } from './pages/home/roles/roles.component';
import { ControllersComponent } from './pages/home/controllers/controllers.component';
import { RealmsComponent } from './pages/home/realms/realms.component';
import { SettingsComponent } from './pages/home/settings/settings.component';

import { ControllerBindDialogComponent } from './pages/home/controllers/controller-bind-dialog.component';
import { ControllerSettingsDialogComponent } from './pages/home/controllers/controller-settings-dialog.component';
import { ControllerComponent } from './pages/home/controller/controller.component';
import { RoleInviteDialogComponent } from './pages/home/roles/role-invite-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    BootstrapComponent,
    LoginComponent,
    HomeComponent,
    RolesComponent,
    ControllersComponent,
    RealmsComponent,
    SettingsComponent,
    ControllerBindDialogComponent,
    ControllerSettingsDialogComponent,
    ControllerComponent,
    RoleInviteDialogComponent
  ],
  entryComponents: [
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
    WebviewClientModule,
    QRCodeModule,
    EventsModule,
    DialogsModule,
    ClipboardModule,
    DragAndDropModule,
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
    SessionService,
    PlatformService,
    ConfigService,
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
    }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
