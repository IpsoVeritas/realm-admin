import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BootmodeGuardService as BootGuard } from './bootmode-guard.service';

import { BootstrapComponent } from './bootstrap/bootstrap.component';
import { LoginComponent } from './login/login.component';

const appRoutes: Routes = [
  { path: 'bootstrap', component: BootstrapComponent, canActivate: [BootGuard] },
  { path: 'login', component: LoginComponent, canActivate: [BootGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { enableTracing: true, useHash: false })
  ],
  exports: [
    RouterModule
  ],
  providers: [
    BootGuard
  ]
})
export class AppRoutingModule { }
