import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { MatMenuModule, MatButtonModule, MatIconModule, MatCardModule } from '@angular/material';
import { MatListModule, MatToolbarModule, MatSidenavModule } from '@angular/material';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { ConfigService } from './config.service';
import { LoginService } from './login.service';

import { BootstrapComponent } from './bootstrap/bootstrap.component';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    BootstrapComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatListModule,
    MatToolbarModule,
    MatSidenavModule,
    AppRoutingModule
  ],
  providers: [
    ConfigService,
    LoginService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
