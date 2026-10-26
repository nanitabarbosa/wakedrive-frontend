import { Component, HostListener, effect, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { GuidePlacement, GuideRect, GuideStep } from '../../interfaces/guide.interface';
import { ModuleGuideService } from '../../services/module-guide.service';

const SPOTLIGHT_PADDING = 6;
const TOOLTIP_GAP = 12;
const TOOLTIP_WIDTH = 340;
const VIEWPORT_MARGIN = 16;
const MIN_TOOLTIP_SPACE = 200;

@Component({
  selector: 'app-guide-tour',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './guide-tour.component.html',
})
export class GuideTourComponent {
  readonly rect = signal<GuideRect | null>(null);
  readonly placement = signal<GuidePlacement>('center');
  readonly tooltipStyle = signal<Record<string, string>>({});

  constructor(readonly guide: ModuleGuideService) {
    effect(() => {
      const step = this.guide.step();
      if (step) setTimeout(() => this.position(step));
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    const step = this.guide.step();
    if (step) this.position(step);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.guide.active()) return;
    if (event.key === 'Escape') this.guide.close();
    if (event.key === 'ArrowRight') this.guide.next();
    if (event.key === 'ArrowLeft') this.guide.previous();
  }

  private position(step: GuideStep): void {
    const element = step.selector ? document.querySelector<HTMLElement>(step.selector) : null;
    if (!element) {
      this.rect.set(null);
      this.placement.set('center');
      this.tooltipStyle.set({});
      return;
    }

    element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const box = element.getBoundingClientRect();
    const top = Math.max(box.top - SPOTLIGHT_PADDING, 0);
    const left = Math.max(box.left - SPOTLIGHT_PADDING, 0);
    const bottom = Math.min(box.bottom + SPOTLIGHT_PADDING, window.innerHeight);
    const right = Math.min(box.right + SPOTLIGHT_PADDING, window.innerWidth);
    this.rect.set({ top, left, width: right - left, height: bottom - top });

    const width = Math.min(TOOLTIP_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
    const tooltipLeft = Math.min(Math.max(left, VIEWPORT_MARGIN), window.innerWidth - width - VIEWPORT_MARGIN);

    if (window.innerHeight - bottom >= MIN_TOOLTIP_SPACE) {
      this.placement.set('bottom');
      this.tooltipStyle.set({ top: `${bottom + TOOLTIP_GAP}px`, left: `${tooltipLeft}px` });
    } else if (top >= MIN_TOOLTIP_SPACE) {
      this.placement.set('top');
      this.tooltipStyle.set({ bottom: `${window.innerHeight - top + TOOLTIP_GAP}px`, left: `${tooltipLeft}px` });
    } else {
      this.placement.set('center');
      this.tooltipStyle.set({});
    }
  }
}
