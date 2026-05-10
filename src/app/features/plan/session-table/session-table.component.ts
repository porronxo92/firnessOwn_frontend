import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Exercise } from '../../../core/models/exercise.model';

@Component({
  selector: 'app-session-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="session-table">
      <table>
        <thead>
          <tr>
            <th class="col-name">Ejercicio</th>
            <th class="col-muscle">Músculo</th>
            <th class="col-sets">Series</th>
            <th class="col-reps">Reps</th>
            <th class="col-rir">RIR</th>
            <th class="col-notes">Notas</th>
            <th class="col-action"></th>
          </tr>
        </thead>
        <tbody>
          @for (exercise of exercises; track exercise.id) {
            <tr>
              <td class="col-name">
                <a class="exercise-name" (click)="viewAnatomy.emit(exercise)">
                  {{ exercise.name }}
                </a>
              </td>
              <td class="col-muscle">
                <span class="badge" [ngClass]="exercise.muscleGroup">
                  {{ exercise.muscleGroup }}
                </span>
              </td>
              <td class="col-sets mono">{{ exercise.defaultSets }}</td>
              <td class="col-reps mono">{{ exercise.defaultReps }}</td>
              <td class="col-rir mono">{{ exercise.rir }}</td>
              <td class="col-notes">{{ exercise.notes }}</td>
              <td class="col-action">
                <button class="btn-log" (click)="logExercise.emit(exercise)">LOG</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .session-table {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead {
      th {
        text-align: left;
        padding: 0.6rem 0.8rem;
        font-size: 0.7rem;
        text-transform: uppercase;
        color: var(--muted);
        border-bottom: 1px solid var(--border);
      }
    }
    tbody tr {
      border-bottom: 1px solid var(--border);
      transition: background 0.15s;

      &:hover {
        background: var(--surface2);
      }

      td {
        padding: 0.8rem;
        font-size: 0.9rem;
      }
    }
    .exercise-name {
      cursor: pointer;
      color: var(--text);
      font-weight: 500;

      &:hover {
        color: var(--accent);
      }
    }
    .badge {
      font-size: 0.7rem;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;

      &.back { background: rgba(71, 196, 255, 0.15); color: var(--pull); }
      &.chest { background: rgba(255, 107, 71, 0.15); color: var(--push); }
      &.shoulders { background: rgba(255, 209, 71, 0.15); color: var(--core); }
      &.arms { background: rgba(180, 127, 255, 0.15); color: var(--legs); }
      &.legs { background: rgba(180, 127, 255, 0.15); color: var(--legs); }
      &.glutes { background: rgba(71, 255, 180, 0.15); color: var(--cardio); }
    }
    .mono {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
    }
    .col-notes {
      color: var(--muted);
      font-size: 0.8rem;
      max-width: 150px;
    }
    .btn-log {
      background: var(--accent);
      color: var(--bg);
      padding: 0.3rem 0.8rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;

      &:hover {
        transform: scale(1.05);
      }
    }
  `]
})
export class SessionTableComponent {
  @Input() exercises: Exercise[] = [];
  @Input() sessionType: string = '';
  @Output() logExercise = new EventEmitter<Exercise>();
  @Output() viewAnatomy = new EventEmitter<Exercise>();
}
