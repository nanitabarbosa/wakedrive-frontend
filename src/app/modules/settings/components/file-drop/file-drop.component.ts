import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { FileRules, StoredFile } from '../../interfaces/settings.interface';

@Component({
  selector: 'app-file-drop',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './file-drop.component.html',
})
export class FileDropComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) rules!: FileRules;
  @Input() file: StoredFile | null = null;
  @Input() inputId = '';
  @Output() fileSelected = new EventEmitter<File>();
  @Output() removed = new EventEmitter<void>();

  readonly dragging = signal(false);
  readonly error = signal('');
  readonly playing = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);

  private _audio: HTMLAudioElement | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['file']) this.loadAudio();
  }

  ngOnDestroy(): void {
    this.stopAudio();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    const target = event.currentTarget as HTMLElement;
    if (!target.contains(event.relatedTarget as Node)) this.dragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.pick(file);
  }

  onInputChange(input: HTMLInputElement): void {
    const file = input.files?.[0];
    input.value = '';
    if (file) this.pick(file);
  }

  remove(): void {
    this.stopAudio();
    this.error.set('');
    this.removed.emit();
  }

  togglePlay(): void {
    if (!this._audio) return;
    if (this.playing()) this._audio.pause();
    else this._audio.play();
  }

  seek(value: string): void {
    if (!this._audio) return;
    this._audio.currentTime = Number(value);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  formatTime(seconds: number): string {
    const total = Math.floor(seconds || 0);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  }

  private pick(file: File): void {
    const error = this.validate(file);
    this.error.set(error);
    if (!error) this.fileSelected.emit(file);
  }

  private validate(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const validType = this.rules.extensions.includes(extension) && (!file.type || this.rules.mimeTypes.includes(file.type));
    if (!validType) return `Formato no permitido. Solo se aceptan archivos ${this.rules.label}.`;
    if (file.size > this.rules.maxSizeMb * 1024 * 1024) return `El archivo supera el tamaño máximo de ${this.rules.maxSizeMb} MB.`;
    return '';
  }

  private loadAudio(): void {
    this.stopAudio();
    if (this.rules.kind !== 'audio' || !this.file) return;
    const audio = new Audio(this.file.url);
    audio.addEventListener('loadedmetadata', () => this.duration.set(audio.duration));
    audio.addEventListener('timeupdate', () => this.currentTime.set(audio.currentTime));
    audio.addEventListener('play', () => this.playing.set(true));
    audio.addEventListener('pause', () => this.playing.set(false));
    audio.addEventListener('ended', () => this.currentTime.set(0));
    this._audio = audio;
  }

  private stopAudio(): void {
    this._audio?.pause();
    this._audio = null;
    this.playing.set(false);
    this.currentTime.set(0);
    this.duration.set(0);
  }
}
