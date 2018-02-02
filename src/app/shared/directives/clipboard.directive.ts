import { Directive, Input, Output, HostListener } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ClipboardService } from '../services';

@Directive({
  selector: '[appClipboard]'
})
export class ClipboardDirective {

  @Input() appClipboard: string;
  @Output() copySuccess: EventEmitter<string> = new EventEmitter();
  @Output() copyError: EventEmitter<Error> = new EventEmitter();

  constructor(private clipboardService: ClipboardService) { }

  @HostListener('click') copyToClipboard(): void {
    this.clipboardService.copy(this.appClipboard)
      .then(value => this.copySuccess.emit(value))
      .catch(error => this.copyError.emit(error));
  }

}
