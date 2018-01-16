import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TokenInterceptor } from './token.interceptor';

import { MatInputModule, MatButtonModule } from '@angular/material';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { WebviewClientService } from 'integrity-webview-client';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { PlatformService } from './platform.service';
import { EventsService } from './events.service';
import { RequestService } from './request.service';
import { ConfigService } from './config.service';
import { LoginService } from './login.service';
import { RealmsService } from './realms.service';

import { BootstrapComponent } from './bootstrap/bootstrap.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';

import { QrCodeDialogComponent } from './qr-code-dialog/qr-code-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    BootstrapComponent,
    LoginComponent,
    HomeComponent,
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
    MatCardModule,
    MatExpansionModule,
    MatProgressBarModule,
    AppRoutingModule
  ],
  providers: [
    WebviewClientService,
    PlatformService,
    EventsService,
    RequestService,
    ConfigService,
    LoginService,
    RealmsService,
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
