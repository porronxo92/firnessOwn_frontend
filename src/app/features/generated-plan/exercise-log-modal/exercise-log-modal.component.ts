import { Component, EventEmitter, Input, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanTrackingService } from '../../../core/services/plan-tracking.service';
import { PlanExerciseWithLogs, ExerciseLogCreate, ExerciseHistoryEntry } from '../../../core/models/plan-tracking.model';
import { firstValueFrom } from 'rxjs';

interface SetForm {
  setNumber: number;
  weightKg: number | null;
  repsDone: number | null;
  rirActual: string;
  rpe: number | null;
  completed: boolean;
}

@Component({
  selector: 'app-exercise-log-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ exercise.name }}</h2>
          <button class="btn-close" (click)="close.emit()">×</button>
        </div>

        <div class="modal-body">
          <!-- Exercise info -->
          <div class="exercise-info">
            <span class="info-badge">{{ exercise.sets }} series × {{ exercise.reps }} reps</span>
            @if (exercise.rir) {
              <span class="info-badge">RIR {{ exercise.rir }}</span>
            }
            @if (exercise.restSeconds) {
              <span class="info-badge">{{ exercise.restSeconds }}s descanso</span>
            }
          </div>

          <!-- Last weight reference -->
          @if (lastWeight()) {
            <div class="last-weight-ref">
              <span class="ref-label">Última vez:</span>
              <span class="ref-value">{{ lastWeight() }} kg</span>
            </div>
          }

          <!-- Notes from plan -->
          @if (exercise.notes) {
            <div class="exercise-notes">
              <strong>Nota:</strong> {{ exercise.notes }}
            </div>
          }

          <!-- Sets form -->
          <div class="sets-form">
            <div class="sets-header">
              <span class="col-set">#</span>
              <span class="col-weight">Peso (kg)</span>
              <span class="col-reps">Reps</span>
              <span class="col-rir">RIR</span>
              <span class="col-done">✓</span>
            </div>

            @for (set of sets(); track set.setNumber) {
              <div class="set-row" [class.completed]="set.completed">
                <span class="col-set">{{ set.setNumber }}</span>
                <input
                  type="number"
                  class="input-weight"
                  [(ngModel)]="set.weightKg"
                  [placeholder]="lastWeight() ? lastWeight()!.toString() : '0'"
                  step="0.5"
                  min="0"
                />
                <input
                  type="number"
                  class="input-reps"
                  [(ngModel)]="set.repsDone"
                  [placeholder]="exercise.reps"
                  min="0"
                  max="100"
                />
                <input
                  type="text"
                  class="input-rir"
                  [(ngModel)]="set.rirActual"
                  [placeholder]="exercise.rir || '2'"
                  maxlength="5"
                />
                <label class="checkbox-done">
                  <input type="checkbox" [(ngModel)]="set.completed" />
                  <span class="checkmark"></span>
                </label>
              </div>
            }
          </div>

          <!-- Add/Remove set buttons -->
          <div class="sets-actions">
            <button class="btn-add-set" (click)="addSet()" [disabled]="sets().length >= 10">
              + Añadir serie
            </button>
            <button class="btn-remove-set" (click)="removeSet()" [disabled]="sets().length <= 1">
              − Quitar serie
            </button>
          </div>

          <!-- History preview -->
          @if (history().length > 0) {
            <div class="history-section">
              <h4>Historial reciente</h4>
              <div class="history-list">
                @for (entry of history().slice(0, 5); track $index) {
                  <div class="history-entry">
                    <span class="hist-week">S{{ entry.weekNumber }}</span>
                    <span class="hist-weight">{{ entry.weightKg || '-' }} kg</span>
                    <span class="hist-reps">{{ entry.repsDone || '-' }} reps</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" (click)="close.emit()">Cancelar</button>
          <button class="btn-save" (click)="save()" [disabled]="isSaving()">
            @if (isSaving()) {
              Guardando...
            } @else {
              Guardar
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: var(--surface);
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--accent);
    }

    .btn-close {
      background: none;
      border: none;
      color: var(--muted);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }

    .btn-close:hover {
      color: var(--text);
    }

    .modal-body {
      padding: 1.5rem;
    }

    .exercise-info {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .info-badge {
      background: var(--surface2);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      color: var(--muted);
    }

    .last-weight-ref {
      background: var(--accent);
      color: var(--bg);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .ref-label {
      font-size: 0.85rem;
    }

    .ref-value {
      font-weight: bold;
      font-family: 'JetBrains Mono', monospace;
    }

    .exercise-notes {
      background: var(--surface2);
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.85rem;
      color: var(--muted);
      margin-bottom: 1rem;
    }

    .sets-form {
      margin-bottom: 1rem;
    }

    .sets-header {
      display: grid;
      grid-template-columns: 40px 1fr 80px 60px 40px;
      gap: 0.5rem;
      padding: 0.5rem 0;
      font-size: 0.75rem;
      color: var(--muted);
      text-transform: uppercase;
      border-bottom: 1px solid var(--border);
    }

    .set-row {
      display: grid;
      grid-template-columns: 40px 1fr 80px 60px 40px;
      gap: 0.5rem;
      padding: 0.75rem 0;
      align-items: center;
      border-bottom: 1px solid var(--border);
    }

    .set-row.completed {
      opacity: 0.6;
    }

    .col-set {
      font-weight: bold;
      color: var(--accent);
      text-align: center;
    }

    input[type="number"],
    input[type="text"] {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.5rem;
      color: var(--text);
      font-family: 'JetBrains Mono', monospace;
      width: 100%;
    }

    input[type="number"]:focus,
    input[type="text"]:focus {
      outline: none;
      border-color: var(--accent);
    }

    .input-weight {
      text-align: right;
    }

    .input-reps {
      text-align: center;
    }

    .input-rir {
      text-align: center;
    }

    .checkbox-done {
      display: flex;
      justify-content: center;
      cursor: pointer;
    }

    .checkbox-done input {
      display: none;
    }

    .checkmark {
      width: 24px;
      height: 24px;
      border: 2px solid var(--border);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .checkbox-done input:checked + .checkmark {
      background: var(--accent);
      border-color: var(--accent);
    }

    .checkbox-done input:checked + .checkmark::after {
      content: '✓';
      color: var(--bg);
      font-weight: bold;
    }

    .sets-actions {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .btn-add-set,
    .btn-remove-set {
      flex: 1;
      padding: 0.5rem;
      border: 1px dashed var(--border);
      background: transparent;
      color: var(--muted);
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .btn-add-set:hover:not(:disabled),
    .btn-remove-set:hover:not(:disabled) {
      border-color: var(--accent);
      color: var(--accent);
    }

    .btn-add-set:disabled,
    .btn-remove-set:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .history-section {
      border-top: 1px solid var(--border);
      padding-top: 1rem;
    }

    .history-section h4 {
      font-size: 0.85rem;
      color: var(--muted);
      margin-bottom: 0.5rem;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .history-entry {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
      color: var(--muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .hist-week {
      color: var(--accent);
    }

    .modal-footer {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid var(--border);
    }

    .btn-cancel,
    .btn-save {
      flex: 1;
      padding: 0.75rem;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      border: none;
    }

    .btn-cancel {
      background: var(--surface2);
      color: var(--text);
    }

    .btn-save {
      background: var(--accent);
      color: var(--bg);
    }

    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ExerciseLogModalComponent implements OnInit {
  @Input() exercise!: PlanExerciseWithLogs;
  @Input() planId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private trackingService = inject(PlanTrackingService);

  sets = signal<SetForm[]>([]);
  history = signal<ExerciseHistoryEntry[]>([]);
  lastWeight = signal<number | null>(null);
  isSaving = signal(false);

  ngOnInit() {
    this.initializeSets();
    this.loadHistory();
  }

  private initializeSets() {
    // If exercise already has logs, use them
    if (this.exercise.logs && this.exercise.logs.length > 0) {
      const existingSets = this.exercise.logs.map(log => ({
        setNumber: log.setNumber,
        weightKg: log.weightKg ?? null,
        repsDone: log.repsDone ?? null,
        rirActual: log.rirActual || '',
        rpe: log.rpe ?? null,
        completed: log.completed,
      }));
      this.sets.set(existingSets);

      // Set last weight from existing logs
      const weights = existingSets.filter(s => s.weightKg).map(s => s.weightKg!);
      if (weights.length > 0) {
        this.lastWeight.set(weights[weights.length - 1]);
      }
    } else {
      // Create empty sets based on exercise definition
      const numSets = this.exercise.sets || 3;
      const emptySets: SetForm[] = [];
      for (let i = 1; i <= numSets; i++) {
        emptySets.push({
          setNumber: i,
          weightKg: this.exercise.lastWeight ?? null,
          repsDone: null,
          rirActual: '',
          rpe: null,
          completed: false,
        });
      }
      this.sets.set(emptySets);

      // Use lastWeight from exercise if available
      if (this.exercise.lastWeight) {
        this.lastWeight.set(this.exercise.lastWeight);
      }
    }
  }

  private async loadHistory() {
    try {
      const entries = await firstValueFrom(
        this.trackingService.getExerciseHistory(this.planId, this.exercise.name)
      );
      this.history.set(entries || []);

      // If we don't have a lastWeight yet, try to get it from history
      if (!this.lastWeight() && entries.length > 0) {
        const lastWithWeight = entries.find(e => e.weightKg);
        if (lastWithWeight) {
          this.lastWeight.set(lastWithWeight.weightKg!);
        }
      }
    } catch (e) {
      console.error('Error loading history:', e);
    }
  }

  addSet() {
    const current = this.sets();
    if (current.length >= 10) return;

    const newSetNumber = current.length + 1;
    this.sets.set([
      ...current,
      {
        setNumber: newSetNumber,
        weightKg: this.lastWeight(),
        repsDone: null,
        rirActual: '',
        rpe: null,
        completed: false,
      }
    ]);
  }

  removeSet() {
    const current = this.sets();
    if (current.length <= 1) return;
    this.sets.set(current.slice(0, -1));
  }

  async save() {
    this.isSaving.set(true);

    try {
      const logs: ExerciseLogCreate[] = this.sets().map(set => ({
        setNumber: set.setNumber,
        weightKg: set.weightKg,
        repsDone: set.repsDone,
        rirActual: set.rirActual || null,
        rpe: set.rpe,
        completed: set.completed,
      }));

      await firstValueFrom(
        this.trackingService.logExerciseBatch(this.exercise.id, logs)
      );

      this.saved.emit();
      this.close.emit();
    } catch (e) {
      console.error('Error saving logs:', e);
      alert('Error al guardar. Inténtalo de nuevo.');
    } finally {
      this.isSaving.set(false);
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
