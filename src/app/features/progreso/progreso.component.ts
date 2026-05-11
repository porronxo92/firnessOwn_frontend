import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanTrackingService } from '../../core/services/plan-tracking.service';
import { OnboardingService } from '../../core/services/onboarding.service';
import { ExerciseProgression, PlanProgressSummary } from '../../core/models/plan-tracking.model';

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
          <span class="summary-label">Sesiones completadas</span>
          <span class="summary-value mono">{{ planSummary()?.daysCompleted || 0 }}</span>
        </div>
        <div class="summary-card card">
          <span class="summary-label">Series registradas</span>
          <span class="summary-value mono">{{ planSummary()?.totalSetsLogged || 0 }}</span>
        </div>
        <div class="summary-card card">
          <span class="summary-label">Progreso del plan</span>
          <span class="summary-value mono">{{ planSummary()?.completionPercent || 0 }}%</span>
        </div>
      </div>

      <!-- PRs -->
      @if (topPRs().length) {
        <div class="section">
          <h2>PRs por Ejercicio</h2>
          <div class="pr-grid">
            @for (pr of topPRs(); track pr.exerciseName) {
              <div class="pr-card card">
                <span class="pr-name">{{ pr.exerciseName }}</span>
                <span class="pr-value mono">{{ pr.bestWeightEver }}kg</span>
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
          <select [(ngModel)]="filterPhase" (ngModelChange)="applyFilter()">
            <option value="">Todas las fases</option>
            @for (phase of availablePhases(); track phase) {
              <option [value]="phase">{{ phase }}</option>
            }
          </select>
          <input type="text" [(ngModel)]="filterName" (ngModelChange)="applyFilter()"
            placeholder="Buscar ejercicio..." style="flex:1; min-width:140px;" />
        </div>

        <!-- Progress Cards -->
        <div class="progress-list">
          @for (progress of filteredProgressions(); track progress.exerciseName) {
            <div class="progress-card card">
              <div class="progress-header">
                <span class="progress-name">{{ progress.exerciseName }}</span>
                <span class="trend-badge" [ngClass]="progress.trend">
                  {{ progress.trend === 'up' ? '↑' : progress.trend === 'down' ? '↓' : '→' }}
                  {{ getDeltaKg(progress) > 0 ? '+' : '' }}{{ getDeltaKg(progress) }}kg
                </span>
              </div>

              <!-- Simple bar chart by week -->
              <div class="chart-bars">
                @for (point of progress.points; track point.weekNumber) {
                  <div class="bar-container" [title]="'Sem ' + point.weekNumber + ': ' + (point.maxWeight || 0) + 'kg'">
                    <div
                      class="bar"
                      [style.height.%]="getBarHeight(point.maxWeight || 0, progress.bestWeightEver || 0)"
                      [class.max-bar]="point.maxWeight === progress.bestWeightEver"
                    ></div>
                    <span class="bar-label mono">{{ point.maxWeight || 0 }}</span>
                  </div>
                }
              </div>

              <div class="progress-footer">
                <span>Mejor: <strong class="mono">{{ progress.bestWeightEver || 0 }}kg</strong></span>
                <span>1RM est: <strong class="mono">{{ getEstimated1RM(progress) }}kg</strong></span>
                <span>Fase: <strong>{{ progress.points[0]?.phaseName || '-' }}</strong></span>
              </div>
            </div>
          }
          @if (!filteredProgressions().length) {
            <div class="empty-state">
              @if (!activePlanId()) {
                <p>Necesitas un plan activo para ver tu progresión.</p>
              } @else {
                <p>Registra entrenamientos para ver tu progresión aquí.</p>
              }
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
      flex-wrap: wrap;
      select { max-width: 200px; min-width: 120px; }
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
        flex-wrap: wrap;
        gap: 0.5rem;
        .progress-name { font-weight: 600; font-size: 1rem; }
        .trend-badge {
          font-family: var(--font-mono);
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
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .bar-container {
      flex: 1;
      min-width: 25px;
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

        &.max-bar {
          opacity: 1;
          background: var(--accent-secondary);
          box-shadow: 0 0 8px rgba(0, 112, 255, 0.4);
        }
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
      flex-wrap: wrap;
      gap: 0.5rem;
      strong { color: var(--text); }
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--muted);
    }

    /* Responsive styles */
    @media (max-width: 768px) {
      .page-title { font-size: 2rem; }
      .subtitle { margin-bottom: 1.5rem; }

      .summary-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
      }
      .summary-card {
        padding: 0.8rem 0.5rem;
        .summary-label { font-size: 0.65rem; }
        .summary-value { font-size: 1.3rem; }
      }

      .section h2 { font-size: 1.3rem; }

      .pr-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 0.5rem;
      }
      .pr-card {
        padding: 0.6rem 0.8rem;
        .pr-name { font-size: 0.8rem; }
        .pr-value { font-size: 1rem; }
      }

      .filters {
        gap: 0.5rem;
        select { 
          max-width: none;
          flex: 1;
          min-width: 100px;
        }
      }

      .chart-bars {
        height: 80px;
      }
    }

    @media (max-width: 480px) {
      .page-title { font-size: 1.6rem; }

      .summary-grid {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
      .summary-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.8rem 1rem;
        text-align: left;
        .summary-label { margin-bottom: 0; }
        .summary-value { font-size: 1.5rem; }
      }

      .pr-grid {
        grid-template-columns: 1fr;
      }

      .filters {
        flex-direction: column;
        select {
          width: 100%;
          max-width: none;
        }
      }

      .progress-card {
        .progress-header {
          flex-direction: column;
          align-items: flex-start;
        }
      }

      .chart-bars {
        height: 70px;
        gap: 2px;
      }
      .bar-container {
        min-width: 20px;
        .bar-label { font-size: 0.55rem; }
      }

      .progress-footer {
        flex-direction: column;
        gap: 0.3rem;
      }

      .empty-state {
        padding: 2rem 1rem;
      }
    }
  `]
})
export class ProgresoComponent implements OnInit {
  private planTrackingService = inject(PlanTrackingService);
  private onboardingService = inject(OnboardingService);

  planSummary = signal<PlanProgressSummary | null>(null);
  progressions = signal<ExerciseProgression[]>([]);
  activePlanId = signal<number | null>(null);

  filterPhase = '';
  filterName = '';

  availablePhases = computed(() => {
    const phases = new Set<string>();
    for (const p of this.progressions()) {
      for (const pt of p.points) {
        if (pt.phaseName) phases.add(pt.phaseName);
      }
    }
    return [...phases];
  });

  topPRs = computed(() =>
    this.progressions()
      .filter(p => p.bestWeightEver)
      .sort((a, b) => (b.bestWeightEver || 0) - (a.bestWeightEver || 0))
      .slice(0, 12)
  );

  filteredProgressions = computed(() => {
    let list = this.progressions().filter(p => p.points.length > 0);
    if (this.filterPhase) {
      list = list.filter(p => p.points.some(pt => pt.phaseName === this.filterPhase));
    }
    if (this.filterName) {
      const lower = this.filterName.toLowerCase();
      list = list.filter(p => p.exerciseName.toLowerCase().includes(lower));
    }
    return list;
  });

  ngOnInit() {
    this.onboardingService.getActivePlan().subscribe(plan => {
      if (plan?.id) {
        this.activePlanId.set(plan.id);
        this.loadData(plan.id);
      }
    });
  }

  applyFilter() {
    // Signals + computed handle the filtering automatically
  }

  private loadData(planId: number) {
    this.planTrackingService.getPlanSummary(planId).subscribe({
      next: summary => this.planSummary.set(summary),
      error: err => console.error('getPlanSummary error:', err)
    });

    this.planTrackingService.getProgression(planId).subscribe({
      next: progressions => this.progressions.set(progressions),
      error: err => console.error('getProgression error:', err)
    });
  }

  getDeltaKg(progress: ExerciseProgression): number {
    const pts = progress.points;
    if (pts.length < 2) return 0;
    const first = pts[0].maxWeight || 0;
    const last = pts[pts.length - 1].maxWeight || 0;
    return Math.round((last - first) * 10) / 10;
  }

  getBarHeight(weight: number, maxWeight: number): number {
    if (!maxWeight) return 0;
    return Math.max((weight / maxWeight) * 100, 5);
  }

  getEstimated1RM(progress: ExerciseProgression): number {
    const lastPoint = progress.points[progress.points.length - 1];
    return lastPoint?.estimated1rm ? Math.round(lastPoint.estimated1rm) : 0;
  }
}
