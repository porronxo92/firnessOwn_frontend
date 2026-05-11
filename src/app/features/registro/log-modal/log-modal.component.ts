import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Exercise, WorkoutLog } from '../../../core/models/exercise.model';
import { LogService } from '../../../core/services/log.service';

@Component({
  selector: 'app-log-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ exercise.name }}</h3>
          <button class="close-btn" (click)="close.emit()">✕</button>
        </div>

        <div class="exercise-meta">
          <span class="badge" [ngClass]="exercise.sessionType">{{ exercise.sessionType }}</span>
          <span class="mono">{{ exercise.defaultSets }}×{{ exercise.defaultReps }} · RIR {{ exercise.rir }}</span>
        </div>

        <!-- Form -->
        <form (ngSubmit)="saveLog()" class="log-form">
          <div class="form-row">
            <div class="form-group">
              <label>Fecha</label>
              <input type="date" [(ngModel)]="logDate" name="logDate" />
            </div>
            <div class="form-group">
              <label>Peso (kg)</label>
              <input type="number" step="0.5" [(ngModel)]="weightKg" name="weightKg" placeholder="0.0" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Series</label>
              <input type="number" [(ngModel)]="setsDone" name="setsDone" [placeholder]="exercise.defaultSets" />
            </div>
            <div class="form-group">
              <label>Reps</label>
              <input type="text" [(ngModel)]="repsDone" name="repsDone" [placeholder]="exercise.defaultReps" />
            </div>
            <div class="form-group">
              <label>RIR</label>
              <input type="text" [(ngModel)]="rirActual" name="rirActual" [placeholder]="exercise.rir" />
            </div>
          </div>

          <div class="form-group">
            <label>Notas</label>
            <textarea [(ngModel)]="notes" name="notes" rows="2"></textarea>
          </div>

          <button type="submit" class="btn-primary full-width">Guardar Registro</button>
        </form>

        <!-- Recent history -->
        @if (recentLogs().length) {
          <div class="history">
            <h4>Últimas entradas</h4>
            @for (log of recentLogs(); track log.id) {
              <div class="history-item">
                <span class="hist-date mono">{{ log.logDate }}</span>
                <span class="hist-weight mono">{{ log.weightKg }}kg</span>
                <span class="hist-reps mono">{{ log.setsDone }}×{{ log.repsDone }}</span>
                <button class="btn-delete" (click)="deleteLog(log.id!)">✕</button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;

      h3 { font-size: 1.3rem; }
      .close-btn { background: transparent; color: var(--muted); font-size: 1.2rem; &:hover { color: var(--text); }}
    }
    .exercise-meta {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      margin-bottom: 1.5rem;
      color: var(--muted);
      font-size: 0.85rem;
      flex-wrap: wrap;
    }
    .log-form {
      margin-bottom: 1.5rem;
    }
    .form-row {
      display: flex;
      gap: 0.8rem;
      margin-bottom: 0.8rem;
    }
    .form-group {
      flex: 1;
      margin-bottom: 0.5rem;
      min-width: 0;

      label {
        display: block;
        font-size: 0.75rem;
        color: var(--muted);
        margin-bottom: 0.2rem;
        text-transform: uppercase;
      }
    }
    .full-width { width: 100%; }
    .history {
      border-top: 1px solid var(--border);
      padding-top: 1rem;

      h4 {
        font-size: 0.85rem;
        color: var(--muted);
        margin-bottom: 0.5rem;
      }
    }
    .history-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.85rem;
      flex-wrap: wrap;

      .hist-date { color: var(--muted); }
      .hist-weight { color: var(--accent); font-weight: 500; }
      .hist-reps { color: var(--text); }
      .btn-delete {
        margin-left: auto;
        background: transparent;
        color: var(--muted);
        font-size: 0.8rem;
        &:hover { color: var(--danger); }
      }
    }
    .badge {
      font-size: 0.7rem;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      &.pull { background: rgba(0, 112, 255, 0.15); color: var(--pull); }
      &.push { background: rgba(255, 140, 0, 0.15); color: var(--push); }
      &.legs { background: rgba(168, 85, 247, 0.15); color: var(--legs); }
    }

    /* Responsive */
    @media (max-width: 480px) {
      .modal-header h3 {
        font-size: 1.1rem;
      }
      .form-row {
        flex-direction: column;
        gap: 0.5rem;
      }
      .form-group {
        width: 100%;
      }
      .history-item {
        gap: 0.5rem;
        .hist-date, .hist-weight, .hist-reps {
          font-size: 0.8rem;
        }
      }
    }
  `]
})
export class LogModalComponent implements OnInit {
  @Input() exercise!: Exercise;
  @Output() close = new EventEmitter<void>();

  private logService = inject(LogService);

  recentLogs = signal<WorkoutLog[]>([]);

  logDate = new Date().toISOString().split('T')[0];
  weightKg: number | null = null;
  setsDone: number | null = null;
  repsDone: string = '';
  rirActual: string = '';
  notes: string = '';

  ngOnInit() {
    this.loadHistory();
  }

  private loadHistory() {
    this.logService.getLogs({ exercise_id: this.exercise.id, limit: 5 }).subscribe(logs => {
      const mapped = logs.map((l: any) => ({
        id: l.id,
        exerciseId: l.exercise_id,
        logDate: l.log_date,
        weightKg: l.weight_kg,
        setsDone: l.sets_done,
        repsDone: l.reps_done,
        rirActual: l.rir_actual,
        notes: l.notes,
      }));
      this.recentLogs.set(mapped);

      // Pre-fill with last entry
      if (mapped.length) {
        const last = mapped[0];
        this.weightKg = last.weightKg;
        this.setsDone = last.setsDone;
        this.repsDone = last.repsDone || '';
      }
    });
  }

  saveLog() {
    this.logService.createLog({
      exerciseId: this.exercise.id,
      logDate: this.logDate,
      weightKg: this.weightKg,
      setsDone: this.setsDone,
      repsDone: this.repsDone,
      rirActual: this.rirActual,
      notes: this.notes,
    }).subscribe(() => {
      this.loadHistory();
      // Reset form
      this.weightKg = null;
      this.setsDone = null;
      this.repsDone = '';
      this.rirActual = '';
      this.notes = '';
    });
  }

  deleteLog(id: number) {
    this.logService.deleteLog(id).subscribe(() => {
      this.loadHistory();
    });
  }
}
