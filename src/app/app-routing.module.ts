import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RealmGuard, LoginGuard, RealmRedirectGuard } from './shared/guards';

import { AppComponent } from './app.component';
import { BootstrapComponent } from './pages/bootstrap/bootstrap.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/home/dashboard/dashboard.component';
import { RealmsComponent } from './pages/home/realms/realms.component';
import { InviteComponent } from './pages/home/invite/invite.component';
import { MandatesComponent } from './pages/home/mandates/mandates.component';
import { ControllerComponent } from './pages/home/controller/controller.component';
import { SettingsComponent } from './pages/home/settings/settings.component';

const appRoutes: Routes = [
  { path: 'other/login', component: LoginComponent },
  { path: ':realm/bootstrap', component: BootstrapComponent, canActivate: [RealmGuard] },
  { path: ':realm/login', component: LoginComponent, canActivate: [RealmGuard, LoginGuard] },
  {
    path: ':realm/home', component: HomeComponent, canActivate: [RealmGuard, LoginGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'realms', component: RealmsComponent },
      { path: 'invite/:realm/:role', component: InviteComponent },
      { path: 'invite/:role', component: InviteComponent },
      { path: 'invite', component: InviteComponent },
      { path: 'mandates/:id', component: MandatesComponent },
      { path: 'controller/:id', component: ControllerComponent },
      { path: 'settings', component: SettingsComponent },
    ]
  },
  { path: ':realm', component: AppComponent, canActivate: [RealmRedirectGuard], pathMatch: 'full' },
  { path: '**', component: AppComponent, canActivate: [RealmRedirectGuard] }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { enableTracing: false, useHash: true })
  ],
  exports: [
    RouterModule
  ],
  providers: [
    RealmGuard,
    LoginGuard,
    RealmRedirectGuard
  ]
})
export class AppRoutingModule { }
