import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BootmodeGuardService as BootGuard } from './bootmode-guard.service';
import { LoginGuardService as LoginGuard } from './login-guard.service';

import { BootstrapComponent } from './bootstrap/bootstrap.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RealmsComponent } from './home/realms/realms.component';
import { RolesComponent } from './home/roles/roles.component';
import { ServicesComponent } from './home/services/services.component';
import { SettingsComponent } from './home/settings/settings.component';

const appRoutes: Routes = [
  { path: 'bootstrap', component: BootstrapComponent, canActivate: [BootGuard] },
  { path: 'login', component: LoginComponent, canActivate: [BootGuard, LoginGuard] },
  {
    path: 'home', component: HomeComponent, canActivate: [BootGuard, LoginGuard],
    children: [
      { path: 'realms', component: RealmsComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'services', component: ServicesComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { enableTracing: false, useHash: false })
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
