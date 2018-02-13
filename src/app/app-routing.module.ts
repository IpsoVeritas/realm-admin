import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BootmodeGuard, LoginGuard } from './shared/guards';

import { BootstrapComponent } from './pages/bootstrap/bootstrap.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RealmsComponent } from './pages/home/realms/realms.component';
import { RolesComponent } from './pages/home/roles/roles.component';
import { ControllersComponent } from './pages/home/controllers/controllers.component';
import { ControllerComponent } from './pages/home/controller/controller.component';
import { SettingsComponent } from './pages/home/settings/settings.component';

const appRoutes: Routes = [
  { path: 'bootstrap', component: BootstrapComponent, canActivate: [BootmodeGuard] },
  { path: 'login', component: LoginComponent, canActivate: [BootmodeGuard, LoginGuard] },
  {
    path: 'home', component: HomeComponent, canActivate: [BootmodeGuard, LoginGuard],
    children: [
      { path: 'realms', component: RealmsComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'controllers', component: ControllersComponent },
      { path: 'controller/:id', component: ControllerComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { enableTracing: false, useHash: true })
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
