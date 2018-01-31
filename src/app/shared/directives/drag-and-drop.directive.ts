import { forEach } from '@angular/router/src/utils/collection';
import { Directive, HostListener, HostBinding, EventEmitter, Output, Input } from '@angular/core';

@Directive({
  selector: '[appDragAndDrop]'
})
export class DragAndDropDirective {

  @Input() private includeDataURL: Boolean = false;
  @Input() private extensions: Array<string> = [];
  @Output() private filesDropped: EventEmitter<File[]> = new EventEmitter();
  @Output() private filesSkipped: EventEmitter<File[]> = new EventEmitter();

  @HostBinding('class.dnd-hover') hover = false;

  constructor() { }

  @HostListener('dragover', ['$event']) public onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.hover = true;
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.hover = false;
  }

  @HostListener('drop', ['$event']) public onDrop(evt) {

    evt.preventDefault();
    evt.stopPropagation();
    this.hover = false;

    const files = evt.dataTransfer.files;
    const droppedFiles: Array<File> = [];
    const skippedFiles: Array<File> = [];

    Array.from(files).forEach((file: File) => {
      const extension = file.name.split('.')[file.name.split('.').length - 1];
      this.extensions.includes(extension) ? droppedFiles.push(file) : skippedFiles.push(file);
    });

    if (droppedFiles.length) {
      if (this.includeDataURL) {
        Promise.all(droppedFiles.map(file => {
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
        this.filesDropped.emit(droppedFiles);
      }
    }

    if (skippedFiles.length) {
      this.filesSkipped.emit(skippedFiles);
    }

  }

}
