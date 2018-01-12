import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatInputModule, MatButtonModule } from '@angular/material';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

import { WebviewClientService } from 'integrity-webview-client';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { PlatformService } from './platform.service';
import { RequestService } from './request.service';
import { ConfigService } from './config.service';
import { LoginService } from './login.service';
import { RealmsService } from './realms.service';

import { BootstrapComponent } from './bootstrap/bootstrap.component';
import { LoginComponent } from './login/login.component';
import { QrCodeDialogComponent } from './qr-code-dialog/qr-code-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    BootstrapComponent,
    LoginComponent,
    QrCodeDialogComponent
  ],
  entryComponents: [
    QrCodeDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatToolbarModule,
    MatIconModule,
    AppRoutingModule
  ],
  providers: [
    WebviewClientService,
    PlatformService,
    RequestService,
    ConfigService,
    LoginService,
    RealmsService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
