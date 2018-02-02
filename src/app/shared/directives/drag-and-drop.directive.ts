import { OnInit, ElementRef } from '@angular/core';
import { Directive, HostListener, HostBinding, EventEmitter, Output, Input } from '@angular/core';

@Directive({
  selector: '[appDragAndDrop]'
})
export class DragAndDropDirective implements OnInit {

  @Input() private includeDataURL: Boolean = false;
  @Input() private extensions: Array<string>;
  @Output() private filesDropped: EventEmitter<File[]> = new EventEmitter();
  @Output() private filesSkipped: EventEmitter<File[]> = new EventEmitter();

  @HostBinding('class.dnd-hover') hover = false;

  input: any;

  constructor(private el: ElementRef) { }

  ngOnInit() {
    const input = this.el.nativeElement.querySelector('input[type="file"]');
    if (input) {
      input.onchange = (event) => this.processFiles(event.target.files);
      this.input = input;
    }
  }

  @HostListener('click', ['$event']) public onClick(event) {
    if (this.input) {
      event.stopPropagation();
      this.input.click();
    }
  }

  @HostListener('dragover', ['$event']) public onDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    this.hover = true;
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    this.hover = false;
  }

  @HostListener('drop', ['$event']) public onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    this.hover = false;
    this.processFiles(event.dataTransfer.files);
  }

  processFiles(files: FileList) {

    const droppedFiles: Array<File> = [];
    const skippedFiles: Array<File> = [];

    Array.from(files).forEach((file: File) => {
      const extension = file.name.split('.')[file.name.split('.').length - 1];
      (!this.extensions || this.extensions.includes(extension)) ? droppedFiles.push(file) : skippedFiles.push(file);
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
