import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhaseService } from '../../core/services/phase.service';
import { Phase } from '../../core/models/phase.model';
import { Exercise } from '../../core/models/exercise.model';
import { SessionTableComponent } from './session-table/session-table.component';
import { LogModalComponent } from '../registro/log-modal/log-modal.component';
import { AnatomyModalComponent } from './anatomy-modal/anatomy-modal.component';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [CommonModule, SessionTableComponent, LogModalComponent, AnatomyModalComponent],
  template: `
    <div class="plan-page">
      <h1 class="page-title">PLAN DE ENTRENAMIENTO</h1>
      <p class="subtitle">16 semanas · Hipertrofia + Tonificación</p>

      <!-- Phase Selector -->
      <div class="phase-selector">
        @for (phase of phases(); track phase.id) {
          <button
            class="phase-btn"
            [class.active]="selectedPhase()?.id === phase.id"
            [attr.data-phase]="phase.num"
            (click)="selectPhase(phase)">
            <span class="phase-num">F{{ phase.num }}</span>
            <span class="phase-name">{{ phase.name }}</span>
            <span class="phase-weeks">S{{ phase.weeksStart }}-{{ phase.weeksEnd }}</span>
          </button>
        }
      </div>

      <!-- Phase Header -->
      @if (selectedPhase()) {
        <div class="phase-header card">
          <div class="phase-info">
            <h2>Fase {{ selectedPhase()!.num }}: {{ selectedPhase()!.name }}</h2>
            <p class="phase-desc">{{ selectedPhase()!.description }}</p>
          </div>
          <div class="phase-stats">
            <div class="stat">
              <span class="stat-label">Series/músculo</span>
              <span class="stat-value mono">{{ selectedPhase()!.seriesPerMuscle }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Reps</span>
              <span class="stat-value mono">{{ selectedPhase()!.repRange }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">RIR</span>
              <span class="stat-value mono">{{ selectedPhase()!.rirTarget }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Descanso</span>
              <span class="stat-value mono">{{ selectedPhase()!.restSecondsMin }}-{{ selectedPhase()!.restSecondsMax }}s</span>
            </div>
          </div>
        </div>

        <!-- Week Type -->
        <div class="week-grid">
          <div class="day-card" [class.active-day]="true">
            <span class="day-label">LUN</span>
            <span class="day-type badge pull">PULL</span>
          </div>
          <div class="day-card rest">
            <span class="day-label">MAR</span>
            <span class="day-type">Descanso</span>
          </div>
          <div class="day-card">
            <span class="day-label">MIÉ</span>
            <span class="day-type badge push">PUSH</span>
          </div>
          <div class="day-card">
            <span class="day-label">JUE</span>
            <span class="day-type badge cardio">CARDIO</span>
          </div>
          <div class="day-card">
            <span class="day-label">VIE</span>
            <span class="day-type badge legs">LEGS</span>
          </div>
          <div class="day-card">
            <span class="day-label">SÁB</span>
            <span class="day-type badge cardio">TRAIL</span>
          </div>
          <div class="day-card rest">
            <span class="day-label">DOM</span>
            <span class="day-type">Descanso</span>
          </div>
        </div>

        <!-- Session Tabs -->
        <div class="session-tabs">
          <button
            class="tab-btn pull"
            [class.active]="selectedSession() === 'pull'"
            (click)="selectSession('pull')">
            Tracción
          </button>
          <button
            class="tab-btn push"
            [class.active]="selectedSession() === 'push'"
            (click)="selectSession('push')">
            Empuje
          </button>
          <button
            class="tab-btn legs"
            [class.active]="selectedSession() === 'legs'"
            (click)="selectSession('legs')">
            Pierna
          </button>
        </div>

        <!-- Exercise Table -->
        <app-session-table
          [exercises]="exercises()"
          [sessionType]="selectedSession()"
          (logExercise)="openLogModal($event)"
          (viewAnatomy)="openAnatomyModal($event)"
        />
      }

      <!-- Log Modal -->
      @if (showLogModal()) {
        <app-log-modal
          [exercise]="selectedExercise()!"
          (close)="showLogModal.set(false)"
        />
      }

      <!-- Anatomy Modal -->
      @if (showAnatomyModal()) {
        <app-anatomy-modal
          [muscleGroup]="selectedMuscleGroup()"
          [muscleDesc]="selectedMuscleDesc()"
          (close)="showAnatomyModal.set(false)"
        />
      }
    </div>
  `,
  styles: [`
    .page-title {
      font-size: 2.5rem;
      color: var(--accent);
    }
    .subtitle {
      color: var(--muted);
      margin-bottom: 2rem;
    }
    .phase-selector {
      display: flex;
      gap: 0.8rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .phase-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.8rem 1.2rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--muted);
      transition: all 0.2s;
      min-width: 100px;

      &:hover { border-color: var(--accent); color: var(--text); }
      &.active {
        border-color: var(--accent);
        background: rgba(232, 255, 71, 0.05);
        color: var(--text);
      }

      .phase-num { font-family: 'Bebas Neue'; font-size: 1.3rem; color: var(--accent); }
      .phase-name { font-size: 0.8rem; font-weight: 500; }
      .phase-weeks { font-size: 0.7rem; color: var(--muted); font-family: 'JetBrains Mono'; }
    }
    .phase-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      gap: 2rem;

      h2 { font-size: 1.6rem; margin-bottom: 0.3rem; }
      .phase-desc { color: var(--muted); font-size: 0.85rem; }
      .phase-stats {
        display: flex;
        gap: 1.5rem;
        .stat {
          text-align: center;
          .stat-label { display: block; font-size: 0.7rem; color: var(--muted); text-transform: uppercase; }
          .stat-value { display: block; font-size: 1.1rem; color: var(--accent); margin-top: 0.2rem; }
        }
      }
    }
    .week-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.5rem;
      margin-bottom: 1.5rem;

      .day-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 0.8rem 0.5rem;
        text-align: center;

        &.rest { opacity: 0.5; }
        &.active-day { border-color: var(--accent); }

        .day-label { display: block; font-size: 0.7rem; color: var(--muted); margin-bottom: 0.3rem; }
        .day-type { font-size: 0.75rem; }
      }
    }
    .session-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;

      .tab-btn {
        padding: 0.6rem 1.5rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        color: var(--muted);
        font-weight: 500;
        transition: all 0.2s;

        &:hover { color: var(--text); }
        &.pull.active { border-color: var(--pull); color: var(--pull); background: rgba(71, 196, 255, 0.05); }
        &.push.active { border-color: var(--push); color: var(--push); background: rgba(255, 107, 71, 0.05); }
        &.legs.active { border-color: var(--legs); color: var(--legs); background: rgba(180, 127, 255, 0.05); }
      }
    }
  `]
})
export class PlanComponent implements OnInit {
  private phaseService = inject(PhaseService);

  phases = signal<Phase[]>([]);
  selectedPhase = signal<Phase | null>(null);
  selectedSession = signal<'pull' | 'push' | 'legs'>('pull');
  exercises = signal<Exercise[]>([]);

  showLogModal = signal(false);
  selectedExercise = signal<Exercise | null>(null);

  showAnatomyModal = signal(false);
  selectedMuscleGroup = signal('');
  selectedMuscleDesc = signal('');

  ngOnInit() {
    this.phaseService.getPhases().subscribe(phases => {
      // Map snake_case from API to camelCase
      const mapped = phases.map((p: any) => ({
        id: p.id,
        num: p.num,
        name: p.name,
        weeksStart: p.weeks_start,
        weeksEnd: p.weeks_end,
        focus: p.focus,
        description: p.description,
        seriesPerMuscle: p.series_per_muscle,
        repRange: p.rep_range,
        rirTarget: p.rir_target,
        restSecondsMin: p.rest_seconds_min,
        restSecondsMax: p.rest_seconds_max,
      }));
      this.phases.set(mapped);
      if (mapped.length) {
        this.selectPhase(mapped[0]);
      }
    });
  }

  selectPhase(phase: Phase) {
    this.selectedPhase.set(phase);
    this.loadExercises();
  }

  selectSession(session: 'pull' | 'push' | 'legs') {
    this.selectedSession.set(session);
    this.loadExercises();
  }

  private loadExercises() {
    const phase = this.selectedPhase();
    if (!phase) return;
    this.phaseService.getPhaseExercises(phase.id, this.selectedSession()).subscribe(exercises => {
      const mapped = exercises.map((e: any) => ({
        id: e.id,
        phaseId: e.phase_id,
        sessionType: e.session_type,
        name: e.name,
        muscleGroup: e.muscle_group,
        muscleDesc: e.muscle_desc,
        defaultSets: e.default_sets,
        defaultReps: e.default_reps,
        rir: e.rir,
        notes: e.notes,
        sortOrder: e.sort_order,
      }));
      this.exercises.set(mapped);
    });
  }

  openLogModal(exercise: Exercise) {
    this.selectedExercise.set(exercise);
    this.showLogModal.set(true);
  }

  openAnatomyModal(exercise: Exercise) {
    this.selectedMuscleGroup.set(exercise.muscleGroup);
    this.selectedMuscleDesc.set(exercise.muscleDesc);
    this.showAnatomyModal.set(true);
  }
}
