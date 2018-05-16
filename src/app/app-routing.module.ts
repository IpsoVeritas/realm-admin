import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BootmodeGuard, LoginGuard } from './shared/guards';

import { BootstrapComponent } from './pages/bootstrap/bootstrap.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/home/dashboard/dashboard.component';
import { MandatesComponent } from './pages/home/mandates/mandates.component';
import { ControllerComponent } from './pages/home/controller/controller.component';
import { SettingsComponent } from './pages/home/settings/settings.component';

const appRoutes: Routes = [
  { path: 'bootstrap', component: BootstrapComponent, canActivate: [BootmodeGuard] },
  { path: ':realm/login', component: LoginComponent, canActivate: [] },
  {
    path: ':realm/home', component: HomeComponent, canActivate: [],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'mandates/:id', component: MandatesComponent },
      { path: 'controller/:id', component: ControllerComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  }
  // { path: '**', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { enableTracing: false, useHash: true, onSameUrlNavigation: 'reload' })
  ],
  exports: [
    RouterModule
  ],
  providers: [
    BootmodeGuard,
    LoginGuard
  ]
})
export class AppRoutingModule { }
