import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-anatomy-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Anatomía: {{ muscleGroup | titlecase }}</h3>
          <button class="close-btn" (click)="close.emit()">✕</button>
        </div>

        <div class="anatomy-body">
          <!-- SVG Body Front/Back -->
          <div class="body-svg">
            <svg viewBox="0 0 200 400" class="anatomy-svg">
              <!-- Simplified body outline -->
              <ellipse cx="100" cy="40" rx="25" ry="30" fill="var(--surface2)" stroke="var(--border)"/>
              <!-- Torso -->
              <path d="M65 70 Q60 120 65 180 L135 180 Q140 120 135 70 Z" fill="var(--surface2)" stroke="var(--border)"/>
              <!-- Arms -->
              <path d="M65 75 Q40 110 35 160 L45 162 Q55 115 70 80 Z" fill="var(--surface2)" stroke="var(--border)"
                [attr.fill]="muscleGroup === 'arms' ? 'var(--legs)' : 'var(--surface2)'" [style.opacity]="muscleGroup === 'arms' ? 0.6 : 1"/>
              <path d="M135 75 Q160 110 165 160 L155 162 Q145 115 130 80 Z" fill="var(--surface2)" stroke="var(--border)"
                [attr.fill]="muscleGroup === 'arms' ? 'var(--legs)' : 'var(--surface2)'" [style.opacity]="muscleGroup === 'arms' ? 0.6 : 1"/>
              <!-- Chest region -->
              <ellipse cx="85" cy="100" rx="15" ry="12"
                [attr.fill]="muscleGroup === 'chest' ? 'var(--push)' : 'transparent'" [style.opacity]="0.5"/>
              <ellipse cx="115" cy="100" rx="15" ry="12"
                [attr.fill]="muscleGroup === 'chest' ? 'var(--push)' : 'transparent'" [style.opacity]="0.5"/>
              <!-- Back region -->
              <rect x="75" y="90" width="50" height="50" rx="8"
                [attr.fill]="muscleGroup === 'back' ? 'var(--pull)' : 'transparent'" [style.opacity]="0.4"/>
              <!-- Shoulders -->
              <circle cx="62" cy="78" r="10"
                [attr.fill]="muscleGroup === 'shoulders' ? 'var(--core)' : 'transparent'" [style.opacity]="0.5"/>
              <circle cx="138" cy="78" r="10"
                [attr.fill]="muscleGroup === 'shoulders' ? 'var(--core)' : 'transparent'" [style.opacity]="0.5"/>
              <!-- Legs -->
              <path d="M70 180 Q68 260 72 340 L92 340 Q88 260 85 180 Z" fill="var(--surface2)" stroke="var(--border)"
                [attr.fill]="muscleGroup === 'legs' ? 'var(--legs)' : 'var(--surface2)'" [style.opacity]="muscleGroup === 'legs' ? 0.6 : 1"/>
              <path d="M115 180 Q112 260 108 340 L128 340 Q132 260 130 180 Z" fill="var(--surface2)" stroke="var(--border)"
                [attr.fill]="muscleGroup === 'legs' ? 'var(--legs)' : 'var(--surface2)'" [style.opacity]="muscleGroup === 'legs' ? 0.6 : 1"/>
              <!-- Glutes -->
              <ellipse cx="88" cy="188" rx="15" ry="12"
                [attr.fill]="muscleGroup === 'glutes' ? 'var(--cardio)' : 'transparent'" [style.opacity]="0.5"/>
              <ellipse cx="112" cy="188" rx="15" ry="12"
                [attr.fill]="muscleGroup === 'glutes' ? 'var(--cardio)' : 'transparent'" [style.opacity]="0.5"/>
            </svg>
          </div>

          <div class="muscle-info">
            <h4>Músculos implicados</h4>
            <p class="desc">{{ muscleDesc }}</p>

            <div class="legend">
              <div class="legend-item">
                <span class="dot principal"></span>
                <span>Principal</span>
              </div>
              <div class="legend-item">
                <span class="dot synergist"></span>
                <span>Sinergista</span>
              </div>
              <div class="legend-item">
                <span class="dot stabilizer"></span>
                <span>Estabilizador</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      h3 { font-size: 1.5rem; }
      .close-btn {
        background: transparent;
        color: var(--muted);
        font-size: 1.2rem;
        &:hover { color: var(--text); }
      }
    }
    .anatomy-body {
      display: flex;
      gap: 2rem;
      align-items: flex-start;
    }
    .body-svg {
      flex-shrink: 0;
    }
    .anatomy-svg {
      width: 150px;
      height: 300px;
    }
    .muscle-info {
      flex: 1;

      h4 {
        font-size: 1rem;
        margin-bottom: 0.5rem;
        color: var(--accent);
      }
      .desc {
        color: var(--text);
        font-size: 0.9rem;
        line-height: 1.6;
        margin-bottom: 1.5rem;
      }
    }
    .legend {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: var(--muted);
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;

      &.principal { background: var(--accent); }
      &.synergist { background: var(--pull); }
      &.stabilizer { background: var(--muted); }
    }
  `]
})
export class AnatomyModalComponent {
  @Input() muscleGroup: string = '';
  @Input() muscleDesc: string = '';
  @Output() close = new EventEmitter<void>();
}
