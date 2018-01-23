import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';

import { MatInputModule, MatButtonModule } from '@angular/material';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';

import { WebviewClientService } from 'integrity-webview-client';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { QrCodeDialogComponent } from './shared/components/qr-code-dialog/qr-code-dialog.component';

import { TokenInterceptor } from './shared/interceptors/token.interceptor';

import { PlatformService } from './shared/services/platform.service';
import { EventsService } from './shared/services/events.service';
import { ConfigService } from './shared/services/config.service';
import { LoginService } from './shared/services/login.service';

import { BootstrapComponent } from './pages/bootstrap/bootstrap.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RolesComponent } from './pages/home/roles/roles.component';
import { ServicesComponent } from './pages/home/services/services.component';
import { RealmsComponent } from './pages/home/realms/realms.component';
import { SettingsComponent } from './pages/home/settings/settings.component';

@NgModule({
  declarations: [
    AppComponent,
    QrCodeDialogComponent,
    BootstrapComponent,
    LoginComponent,
    HomeComponent,
    RolesComponent,
    ServicesComponent,
    RealmsComponent,
    SettingsComponent
  ],
  entryComponents: [
    QrCodeDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    LayoutModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatListModule,
    MatSidenavModule,
    AppRoutingModule
  ],
  providers: [
    WebviewClientService,
    PlatformService,
    EventsService,
    ConfigService,
    LoginService,
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
