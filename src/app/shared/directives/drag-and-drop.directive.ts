import { forEach } from '@angular/router/src/utils/collection';
import { Directive, HostListener, HostBinding, EventEmitter, Output, Input } from '@angular/core';

@Directive({
  selector: '[appDragAndDrop]'
})
export class DragAndDropDirective {

  @Input() private includeData: Boolean = false;
  @Input() private extensions: Array<string> = [];
  @Output() private filesDropped: EventEmitter<File[]> = new EventEmitter();
  @Output() private filesInvalid: EventEmitter<File[]> = new EventEmitter();

  @HostBinding('style.background') private background = '#eee';

  constructor() { }

  @HostListener('dragover', ['$event']) public onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#999';
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#eee';
  }

  @HostListener('drop', ['$event']) public onDrop(evt) {

    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#eee';

    const files = evt.dataTransfer.files;
    const validFiles: Array<File> = [];
    const invalidFiles: Array<File> = [];

    if (files.length > 0) {
      Array.from(files).forEach((file: File) => {
        const extension = file.name.split('.')[file.name.split('.').length - 1];
        this.extensions.includes(extension) ? validFiles.push(file) : invalidFiles.push(file);
      });
      if (validFiles.length) {
        if (this.includeData) {
          Promise.all(validFiles.map(file => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                file['dataURL'] = reader.result;
                resolve(file);
              };
              reader.readAsDataURL(file);
            });
          })).then((filesWithData: File[]) => this.filesDropped.emit(filesWithData));
        } else {
          this.filesDropped.emit(validFiles);
        }
      }
      if (invalidFiles.length) {
        this.filesInvalid.emit(invalidFiles);
      }
    }

  }

}
