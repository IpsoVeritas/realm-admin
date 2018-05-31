import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RealmGuard, BootmodeGuard, LoginGuard, RealmRedirectGuard } from './shared/guards';

import { AppComponent } from './app.component';
import { BootstrapComponent } from './pages/bootstrap/bootstrap.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/home/dashboard/dashboard.component';
import { RealmsComponent } from './pages/home/realms/realms.component';
import { MandatesComponent } from './pages/home/mandates/mandates.component';
import { ControllerComponent } from './pages/home/controller/controller.component';
import { SettingsComponent } from './pages/home/settings/settings.component';

const appRoutes: Routes = [
  { path: ':realm/bootstrap', component: BootstrapComponent, canActivate: [RealmGuard, BootmodeGuard] },
  { path: ':realm/login', component: LoginComponent, canActivate: [RealmGuard, BootmodeGuard, LoginGuard] },
  {
    path: ':realm/home', component: HomeComponent, canActivate: [RealmGuard, BootmodeGuard, LoginGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'realms', component: RealmsComponent },
      { path: 'mandates/:id', component: MandatesComponent },
      { path: 'controller/:id', component: ControllerComponent },
      { path: 'settings', component: SettingsComponent }
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
    BootmodeGuard,
    LoginGuard,
    RealmRedirectGuard
  ]
})
export class AppRoutingModule { }
