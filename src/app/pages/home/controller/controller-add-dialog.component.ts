import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { Service } from './../../../shared/models/';
import { ServicesClient } from '../../../shared/api-clients';

@Component({
  selector: 'app-controller-service-dialog',
  template: `
  <div class="app-controller-service-dialog">
    <h2 mat-dialog-title translate>controllers.add_service</h2>
    <mat-dialog-content>
      <mat-form-field>
        <mat-select [(value)]="service" (selectionChange)="selectService($event.value)" #matSelect>
          <mat-option *ngFor="let service of services" [value]="service">{{service.name}}</mat-option>
          <mat-option [value]="customService">{{'controllers.custom_binding_url' | translate}}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field [class.hidden]="service !== customService">
        <input #custom
        matInput
        [(ngModel)]="customService.url"
        placeholder="{{'controllers.binding_url_placeholder' | translate}}">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="null" color="accent">{{'label.cancel' | translate}}</button>
      <button mat-raised-button
        [mat-dialog-close]="service"
        color="accent"
        [disabled]="service === customService && !customService.url">
        {{'label.ok' | translate}}
      </button>
    </mat-dialog-actions>
  </div>`,
  styles: [`
  .app-controller-service-dialog {
    padding: 10px;
  }
  `, `
    mat-dialog-content {
      display: flex;
      flex-direction: column;
    }`, `
    .hidden {
      display: none !important;
    }
  `, `
  .mat-dialog-actions {
    padding: 20px 0;
  }
`]
})
export class ControllerAddDialogComponent implements OnInit {

  service: Service;
  services: Service[];
  customService: Service;

  @ViewChild(MatInput) customInput: MatInput;

  constructor(public dialogRef: MatDialogRef<ControllerAddDialogComponent>,
    private servicesClient: ServicesClient) {
    this.customService = new Service();
    this.customService.mode = 'custom';
  }

  ngOnInit() {
    this.servicesClient.getServices()
      .then(services => {
        this.service = services && services.length > 0 ? services[0] : this.customService;
        this.services = services;
      })
      .catch(error => console.warn(error));
  }

  selectService(service: Service) {
    if (service === this.customService) {
      setTimeout(() => this.customInput.focus(), 100);
    }
  }

  @HostListener('keydown.enter')
  public onEnter(): void {
    this.dialogRef.close(this.service);
  }

}
