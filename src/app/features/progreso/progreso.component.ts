import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { StatsService } from '../../core/services/stats.service';
import { PhaseService } from '../../core/services/phase.service';
import { ExerciseProgress } from '../../core/models/log.model';
import { Exercise } from '../../core/models/exercise.model';
import { Phase } from '../../core/models/phase.model';

@Component({
  selector: 'app-progreso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="progreso-page">
      <h1 class="page-title">PROGRESO</h1>
      <p class="subtitle">Evolución de cargas y rendimiento</p>

      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card card">
          <span class="summary-label">Sesiones Totales</span>
          <span class="summary-value mono">{{ summary()?.total_sessions || 0 }}</span>
        </div>
        <div class="summary-card card">
          <span class="summary-label">Registros</span>
          <span class="summary-value mono">{{ summary()?.total_logs || 0 }}</span>
        </div>
        <div class="summary-card card">
          <span class="summary-label">Última Sesión</span>
          <span class="summary-value mono">{{ summary()?.last_session || '-' }}</span>
        </div>
      </div>

      <!-- PRs -->
      @if (maxes().length) {
        <div class="section">
          <h2>PRs por Ejercicio</h2>
          <div class="pr-grid">
            @for (pr of maxes(); track pr.exercise_id) {
              <div class="pr-card card">
                <span class="pr-name">{{ pr.exercise_name }}</span>
                <span class="pr-value mono">{{ pr.max_weight }}kg</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Exercise Progress -->
      <div class="section">
        <h2>Progresión por Ejercicio</h2>

        <!-- Filters -->
        <div class="filters">
          <select [(ngModel)]="selectedPhaseId" (ngModelChange)="onPhaseChange()">
            <option [ngValue]="null">Todas las fases</option>
            @for (phase of phases(); track phase.id) {
              <option [ngValue]="phase.id">F{{ phase.num }}: {{ phase.name }}</option>
            }
          </select>
          <select [(ngModel)]="selectedSession" (ngModelChange)="onSessionChange()">
            <option value="">Todas</option>
            <option value="pull">Tracción</option>
            <option value="push">Empuje</option>
            <option value="legs">Pierna</option>
          </select>
        </div>

        <!-- Progress Cards -->
        <div class="progress-list">
          @for (progress of exerciseProgress(); track progress.exerciseId) {
            <div class="progress-card card">
              <div class="progress-header">
                <span class="progress-name">{{ progress.exerciseName }}</span>
                <span class="trend-badge" [ngClass]="progress.trend">
                  {{ progress.trend === 'up' ? '↑' : progress.trend === 'down' ? '↓' : '→' }}
                  {{ progress.deltaKg > 0 ? '+' : '' }}{{ progress.deltaKg }}kg
                </span>
              </div>

              <!-- Simple bar chart -->
              <div class="chart-bars">
                @for (point of progress.points; track point.logDate) {
                  <div class="bar-container">
                    <div
                      class="bar"
                      [style.height.%]="getBarHeight(point.weightKg, progress.maxWeight)"
                      [class.max-bar]="point.weightKg === progress.maxWeight"
                    ></div>
                    <span class="bar-label mono">{{ point.weightKg }}</span>
                  </div>
                }
              </div>

              <div class="progress-footer">
                <span>Máximo: <strong class="mono">{{ progress.maxWeight }}kg</strong></span>
                <span>1RM est: <strong class="mono">{{ getEstimated1RM(progress) }}kg</strong></span>
              </div>
            </div>
          }
          @if (!exerciseProgress().length) {
            <div class="empty-state">
              <p>Registra entrenamientos para ver tu progresión aquí.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title { font-size: 2.5rem; color: var(--accent); }
    .subtitle { color: var(--muted); margin-bottom: 2rem; }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .summary-card {
      text-align: center;
      padding: 1.2rem;
      .summary-label { display: block; font-size: 0.75rem; color: var(--muted); text-transform: uppercase; margin-bottom: 0.3rem; }
      .summary-value { font-size: 1.8rem; color: var(--accent); }
    }

    .section {
      margin-bottom: 2rem;
      h2 { font-size: 1.5rem; margin-bottom: 1rem; }
    }

    .pr-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.8rem;
    }
    .pr-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem 1rem;
      .pr-name { font-size: 0.85rem; }
      .pr-value { color: var(--accent); font-size: 1.1rem; font-weight: 700; }
    }

    .filters {
      display: flex;
      gap: 0.8rem;
      margin-bottom: 1.5rem;
      select { max-width: 200px; }
    }

    .progress-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .progress-card {
      .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        .progress-name { font-weight: 600; font-size: 1rem; }
        .trend-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          &.up { background: rgba(46, 213, 115, 0.15); color: var(--success); }
          &.down { background: rgba(255, 71, 87, 0.15); color: var(--danger); }
          &.stable { background: rgba(85, 85, 102, 0.15); color: var(--muted); }
        }
      }
    }

    .chart-bars {
      display: flex;
      align-items: flex-end;
      gap: 4px;
      height: 100px;
      padding: 0 0.5rem;
      margin-bottom: 1rem;
    }
    .bar-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      justify-content: flex-end;

      .bar {
        width: 100%;
        max-width: 30px;
        background: var(--accent);
        border-radius: 3px 3px 0 0;
        opacity: 0.7;
        transition: opacity 0.2s;
        min-height: 4px;

        &.max-bar { opacity: 1; }
        &:hover { opacity: 1; }
      }
      .bar-label {
        font-size: 0.65rem;
        color: var(--muted);
        margin-top: 0.3rem;
      }
    }

    .progress-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--muted);
      strong { color: var(--text); }
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--muted);
    }
  `]
})
export class ProgresoComponent implements OnInit {
  private statsService = inject(StatsService);
  private phaseService = inject(PhaseService);

  summary = signal<any>(null);
  maxes = signal<any[]>([]);
  phases = signal<Phase[]>([]);
  exercises = signal<Exercise[]>([]);
  exerciseProgress = signal<ExerciseProgress[]>([]);

  selectedPhaseId: number | null = null;
  selectedSession = '';

  ngOnInit() {
    this.statsService.getSummary().subscribe(s => this.summary.set(s));
    this.statsService.getMaxes().subscribe(m => this.maxes.set(m));
    this.phaseService.getPhases().subscribe(phases => {
      const mapped = phases.map((p: any) => ({
        id: p.id, num: p.num, name: p.name,
        weeksStart: p.weeks_start, weeksEnd: p.weeks_end,
        focus: p.focus, description: p.description,
        seriesPerMuscle: p.series_per_muscle, repRange: p.rep_range,
        rirTarget: p.rir_target, restSecondsMin: p.rest_seconds_min,
        restSecondsMax: p.rest_seconds_max,
      }));
      this.phases.set(mapped);
      this.loadExercisesAndProgress();
    });
  }

  onPhaseChange() { this.loadExercisesAndProgress(); }
  onSessionChange() { this.loadExercisesAndProgress(); }

  private loadExercisesAndProgress() {
    this.statsService.getMaxes().subscribe(maxes => {
      const progressPromises = maxes.map(m =>
        firstValueFrom(this.statsService.getProgress(m.exercise_id))
      );
      Promise.all(progressPromises).then(results => {
        const mapped = results
          .filter((r: any) => r && r.points && r.points.length > 0)
          .map((r: any) => ({
            exerciseId: r.exercise_id,
            exerciseName: r.exercise_name,
            points: r.points.map((p: any) => ({
              logDate: p.log_date,
              weightKg: p.weight_kg,
              setsDone: p.sets_done,
              repsDone: p.reps_done,
              estimated1rm: p.estimated_1rm,
            })),
            maxWeight: r.max_weight,
            firstWeight: r.first_weight,
            deltaKg: r.delta_kg,
            trend: r.trend,
          }));
        this.exerciseProgress.set(mapped);
      });
    });
  }

  getBarHeight(weight: number, maxWeight: number): number {
    if (!maxWeight) return 0;
    return Math.max((weight / maxWeight) * 100, 5);
  }

  getEstimated1RM(progress: ExerciseProgress): number {
    const lastPoint = progress.points[progress.points.length - 1];
    return lastPoint?.estimated1rm ? Math.round(lastPoint.estimated1rm) : 0;
  }
}
