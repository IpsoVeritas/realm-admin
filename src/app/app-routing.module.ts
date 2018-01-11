import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BootstrapComponent } from './bootstrap/bootstrap.component';
import { LoginComponent } from './login/login.component';

const appRoutes: Routes = [
  { path: 'bootstrap', component: BootstrapComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', component: LoginComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
