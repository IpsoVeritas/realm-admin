import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BootmodeGuardService as BootGuard } from './bootmode-guard.service';
import { LoginGuardService as LoginGuard } from './login-guard.service';

import { BootstrapComponent } from './bootstrap/bootstrap.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';

const appRoutes: Routes = [
  { path: 'bootstrap', component: BootstrapComponent, canActivate: [BootGuard] },
  { path: 'login', component: LoginComponent, canActivate: [BootGuard, LoginGuard] },
  { path: 'home', component: HomeComponent, canActivate: [BootGuard, LoginGuard] },
  { path: '**', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { enableTracing: true, useHash: false })
  ],
  exports: [
    RouterModule
  ],
  providers: [
    BootGuard,
    LoginGuard
  ]
})
export class AppRoutingModule { }
