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
      -webkit-overflow-scrolling: touch;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 600px;
    }
    thead {
      th {
        text-align: left;
        padding: 0.6rem 0.8rem;
        font-size: 0.7rem;
        text-transform: uppercase;
        color: var(--muted);
        border-bottom: 1px solid var(--border);
        white-space: nowrap;
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
      white-space: nowrap;

      &.back { background: rgba(0, 112, 255, 0.15); color: var(--pull); }
      &.chest { background: rgba(255, 140, 0, 0.15); color: var(--push); }
      &.shoulders { background: rgba(255, 184, 0, 0.15); color: var(--core); }
      &.arms { background: rgba(168, 85, 247, 0.15); color: var(--legs); }
      &.legs { background: rgba(168, 85, 247, 0.15); color: var(--legs); }
      &.glutes { background: rgba(16, 217, 160, 0.15); color: var(--cardio); }
    }
    .mono {
      font-family: var(--font-mono);
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
      white-space: nowrap;

      &:hover {
        transform: scale(1.05);
      }
    }

    /* Mobile card layout */
    @media (max-width: 768px) {
      table {
        min-width: auto;
      }
      thead {
        display: none;
      }
      tbody tr {
        display: flex;
        flex-direction: column;
        padding: 1rem;
        margin-bottom: 0.5rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 10px;

        td {
          padding: 0.3rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      }
      .col-name {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 0.3rem;
      }
      .col-muscle {
        margin-bottom: 0.5rem;
      }
      .col-sets, .col-reps, .col-rir {
        &::before {
          color: var(--muted);
          font-size: 0.7rem;
          text-transform: uppercase;
          min-width: 60px;
        }
      }
      .col-sets::before { content: 'Series: '; }
      .col-reps::before { content: 'Reps: '; }
      .col-rir::before { content: 'RIR: '; }
      .col-notes {
        max-width: none;
        font-style: italic;
        padding-top: 0.5rem;
        border-top: 1px solid var(--border);
        margin-top: 0.5rem;
      }
      .col-action {
        margin-top: 0.5rem;
        .btn-log {
          width: 100%;
          padding: 0.5rem;
          text-align: center;
        }
      }
    }

    @media (max-width: 480px) {
      tbody tr {
        padding: 0.8rem;
      }
      .col-name {
        font-size: 0.95rem;
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
