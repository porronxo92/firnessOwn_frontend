import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogService } from '../../core/services/log.service';
import { WorkoutLog, CardioLog } from '../../core/models/exercise.model';
import { CalendarPickerComponent } from './calendar-picker/calendar-picker.component';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarPickerComponent],
  template: `
    <div class="registro-page">
      <h1 class="page-title">REGISTRO</h1>
      <p class="subtitle">Historial de entrenamientos</p>

      <!-- Tabs -->
      <div class="reg-tabs">
        <button [class.active]="activeTab() === 'fuerza'" (click)="activeTab.set('fuerza')">Fuerza</button>
        <button [class.active]="activeTab() === 'cardio'" (click)="activeTab.set('cardio')">Cardio</button>
      </div>

      @if (activeTab() === 'fuerza') {
        <!-- Filters -->
        <div class="filters-bar">
          <!-- Inline Calendar -->
          <app-calendar-picker
            [logs]="workoutLogs()"
            [selectedDate]="filterDate()"
            (dateChange)="filterDate.set($event)">
          </app-calendar-picker>

          <!-- Session filter -->
          <div class="filter-session">
            <label>Sesión</label>
            <div class="session-pills">
              <button [class.active]="filterSession() === 'all'" (click)="filterSession.set('all')">Todos</button>
              <button [class.active]="filterSession() === 'pull'" (click)="filterSession.set('pull')" class="pill-pull">Pull</button>
              <button [class.active]="filterSession() === 'push'" (click)="filterSession.set('push')" class="pill-push">Push</button>
              <button [class.active]="filterSession() === 'legs'" (click)="filterSession.set('legs')" class="pill-legs">Pierna</button>
            </div>
          </div>
        </div>

        <!-- Grouped logs -->
        <div class="logs-list">
          @if (!groupedLogs().length) {
            <div class="empty-state">
              <p>No hay registros para los filtros seleccionados.</p>
            </div>
          }
          @for (group of groupedLogs(); track group.date) {
            <div class="day-group">
              <div class="day-header">
                <span class="day-date mono">{{ formatDate(group.date) }}</span>
                <div class="day-badges">
                  @for (type of group.sessionTypes; track type) {
                    <span class="badge sm" [ngClass]="type">{{ type }}</span>
                  }
                </div>
                <span class="day-count">{{ group.logs.length }} ejercicios</span>
              </div>
              @for (log of group.logs; track log.id) {
                <div class="log-card card">
                  <div class="log-header">
                    <div class="log-title">
                      <span class="badge xs" [ngClass]="log.sessionType">{{ log.sessionType }}</span>
                      <span class="log-name">{{ log.exerciseName || 'Ejercicio' }}</span>
                    </div>
                    <button class="btn-delete" (click)="deleteWorkoutLog(log.id!)">✕</button>
                  </div>
                  <div class="log-data">
                    <span class="data-item">
                      <span class="label">Peso</span>
                      <span class="value mono">{{ log.weightKg }}kg</span>
                    </span>
                    <span class="data-item">
                      <span class="label">Series×Reps</span>
                      <span class="value mono">{{ log.setsDone }}×{{ log.repsDone }}</span>
                    </span>
                    <span class="data-item">
                      <span class="label">RIR</span>
                      <span class="value mono">{{ log.rirActual || '-' }}</span>
                    </span>
                  </div>
                  @if (log.notes) {
                    <p class="log-notes">{{ log.notes }}</p>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      @if (activeTab() === 'cardio') {
        <!-- Cardio Form -->
        <div class="cardio-form card">
          <h3>Nueva sesión de cardio</h3>
          <form (ngSubmit)="saveCardio()">
            <div class="form-row">
              <div class="form-group">
                <label>Fecha</label>
                <input type="date" [(ngModel)]="cardioDate" name="cardioDate" />
              </div>
              <div class="form-group">
                <label>Tipo</label>
                <select [(ngModel)]="cardioType" name="cardioType">
                  <option value="bici">Bici</option>
                  <option value="bici_carretera">Bicicleta carretera</option>
                  <option value="mtb">MTB</option>
                  <option value="trail">Trail</option>
                  <option value="carrera">Carrera</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Duración (min)</label>
                <input type="number" [(ngModel)]="cardioDuration" name="cardioDuration" />
              </div>
              <div class="form-group">
                <label>Distancia (km)</label>
                <input type="number" step="0.1" [(ngModel)]="cardioDistance" name="cardioDistance" />
              </div>
              <div class="form-group">
                <label>Zona</label>
                <select [(ngModel)]="cardioZone" name="cardioZone">
                  <option value="">-</option>
                  <option value="Z1">Z1</option>
                  <option value="Z2">Z2</option>
                  <option value="Z3">Z3</option>
                  <option value="Z4">Z4</option>
                  <option value="Z5">Z5</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Desnivel (m)</label>
                <input type="number" [(ngModel)]="cardioElevation" name="cardioElevation" />
              </div>
              <div class="form-group">
                <label>Notas</label>
                <input type="text" [(ngModel)]="cardioNotes" name="cardioNotes" />
              </div>
            </div>
            <button type="submit" class="btn-primary">Guardar Cardio</button>
          </form>
        </div>

        <!-- Cardio history -->
        <div class="logs-list">
          @for (log of cardioLogs(); track log.id) {
            <div class="log-card card">
              <div class="log-header">
                <span class="log-name badge cardio">{{ log.type }}</span>
                <span class="log-date mono">{{ log.logDate }}</span>
              </div>
              <div class="log-data">
                @if (log.durationMin) {
                  <span class="data-item">
                    <span class="label">Duración</span>
                    <span class="value mono">{{ log.durationMin }}min</span>
                  </span>
                }
                @if (log.distanceKm) {
                  <span class="data-item">
                    <span class="label">Distancia</span>
                    <span class="value mono">{{ log.distanceKm }}km</span>
                  </span>
                }
                @if (log.zone) {
                  <span class="data-item">
                    <span class="label">Zona</span>
                    <span class="value mono">{{ log.zone }}</span>
                  </span>
                }
                @if (log.elevationM) {
                  <span class="data-item">
                    <span class="label">D+</span>
                    <span class="value mono">{{ log.elevationM }}m</span>
                  </span>
                }
              </div>
              <button class="btn-delete" (click)="deleteCardioLog(log.id!)">Eliminar</button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-title { font-size: 2.5rem; color: var(--accent); }
    .subtitle { color: var(--muted); margin-bottom: 1.5rem; }
    .reg-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;

      button {
        padding: 0.5rem 1.5rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        color: var(--muted);

        &.active { border-color: var(--accent); color: var(--accent); background: rgba(232, 255, 71, 0.05); }
      }
    }

    /* Filters */
    .filters-bar {
      display: flex;
      gap: 2rem;
      align-items: flex-start;
      flex-wrap: wrap;
      padding: 1.2rem 1.5rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    /* Calendar */
    .cal-wrapper {
      min-width: 240px;
    }
    .cal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.6rem;
    }
    .cal-month-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text);
      text-transform: capitalize;
    }
    .btn-icon {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--muted);
      width: 26px; height: 26px;
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem;
      &:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
      &:disabled { opacity: 0.3; cursor: default; }
    }
    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
    }
    .cal-dow {
      text-align: center;
      font-size: 0.65rem;
      color: var(--muted);
      padding: 0.2rem 0;
      font-weight: 600;
      text-transform: uppercase;
    }
    .cal-empty { height: 34px; }
    .cal-day {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 34px;
      border-radius: 6px;
      background: transparent;
      border: 1px solid transparent;
      color: var(--text);
      cursor: pointer;
      font-size: 0.8rem;
      gap: 1px;
      transition: all 0.15s;

      &:hover { background: rgba(255,255,255,0.05); border-color: var(--border); }
      &.today .cal-num { color: var(--accent); font-weight: 700; }
      &.selected { background: rgba(232,255,71,0.12); border-color: var(--accent) !important; color: var(--accent); }
      &.has-logs { border-color: rgba(255,255,255,0.08); }
    }
    .cal-num { line-height: 1; }
    .cal-dots {
      display: flex;
      gap: 2px;
    }
    .dot {
      width: 4px; height: 4px;
      border-radius: 50%;
      &.pull { background: var(--pull); }
      &.push { background: var(--push); }
      &.legs { background: var(--legs); }
    }
    .btn-clear-cal {
      margin-top: 0.5rem;
      background: transparent;
      border: none;
      color: var(--muted);
      font-size: 0.75rem;
      cursor: pointer;
      padding: 0;
      &:hover { color: var(--danger); }
    }

    .filter-session {
      label {
        display: block;
        font-size: 0.7rem;
        text-transform: uppercase;
        color: var(--muted);
        margin-bottom: 0.4rem;
        letter-spacing: 0.05em;
      }
    }
    .session-pills {
      display: flex;
      gap: 0.4rem;

      button {
        padding: 0.3rem 0.8rem;
        background: var(--bg);
        border: 1px solid var(--border);
        color: var(--muted);
        border-radius: 20px;
        font-size: 0.8rem;
        &.active { background: rgba(232,255,71,0.08); border-color: var(--accent); color: var(--accent); }
        &.pill-pull.active { background: rgba(71,196,255,0.1); border-color: var(--pull); color: var(--pull); }
        &.pill-push.active { background: rgba(255,107,71,0.1); border-color: var(--push); color: var(--push); }
        &.pill-legs.active { background: rgba(180,127,255,0.1); border-color: var(--legs); color: var(--legs); }
      }
    }

    /* Day groups */
    .logs-list {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }
    .day-group {}
    .day-header {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      margin-bottom: 0.6rem;
      padding-bottom: 0.4rem;
      border-bottom: 1px solid var(--border);

      .day-date { font-size: 0.9rem; color: var(--accent); font-weight: 600; }
      .day-badges { display: flex; gap: 0.3rem; }
      .day-count { margin-left: auto; font-size: 0.75rem; color: var(--muted); }
    }
    .log-card {
      padding: 0.8rem 1.2rem;
      margin-bottom: 0.5rem;

      .log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;

        .log-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .log-name { font-weight: 600; font-size: 0.95rem; }
      }
      .log-data {
        display: flex;
        gap: 2rem;
        .data-item {
          .label { display: block; font-size: 0.7rem; color: var(--muted); text-transform: uppercase; }
          .value { font-size: 0.95rem; color: var(--text); }
        }
      }
      .log-notes { color: var(--muted); font-size: 0.8rem; margin-top: 0.5rem; font-style: italic; }
      .btn-delete {
        background: transparent;
        color: var(--muted);
        font-size: 0.9rem;
        &:hover { color: var(--danger); }
      }
    }

    /* Badge sizes */
    .badge {
      font-size: 0.7rem;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
      &.pull { background: rgba(71,196,255,0.15); color: var(--pull); }
      &.push { background: rgba(255,107,71,0.15); color: var(--push); }
      &.legs { background: rgba(180,127,255,0.15); color: var(--legs); }
      &.cardio { background: rgba(71,255,180,0.15); color: var(--cardio); }
      &.sm { font-size: 0.65rem; padding: 0.1rem 0.4rem; }
      &.xs { font-size: 0.6rem; padding: 0.1rem 0.35rem; }
    }

    /* Cardio */
    .cardio-form {
      margin-bottom: 1.5rem;
      h3 { font-size: 1.2rem; margin-bottom: 1rem; }
    }
    .form-row {
      display: flex;
      gap: 0.8rem;
      margin-bottom: 0.8rem;
    }
    .form-group {
      flex: 1;
      label {
        display: block;
        font-size: 0.75rem;
        color: var(--muted);
        margin-bottom: 0.2rem;
        text-transform: uppercase;
      }
    }
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--muted);
    }
  `]
})
export class RegistroComponent implements OnInit {
  private logService = inject(LogService);

  activeTab = signal<'fuerza' | 'cardio'>('fuerza');
  workoutLogs = signal<WorkoutLog[]>([]);
  cardioLogs = signal<CardioLog[]>([]);

  filterDate = signal<string>('');
  filterSession = signal<'all' | 'pull' | 'push' | 'legs'>('all');

  filteredLogs = computed(() => {
    let logs = this.workoutLogs();
    const date = this.filterDate();
    const session = this.filterSession();
    if (date) logs = logs.filter(l => l.logDate === date);
    if (session !== 'all') logs = logs.filter(l => l.sessionType === session);
    return logs;
  });

  groupedLogs = computed(() => {
    const map = new Map<string, WorkoutLog[]>();
    for (const log of this.filteredLogs()) {
      if (!map.has(log.logDate)) map.set(log.logDate, []);
      map.get(log.logDate)!.push(log);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, logs]) => ({
        date,
        logs,
        sessionTypes: [...new Set(logs.map(l => l.sessionType).filter(Boolean))] as string[]
      }));
  });

  // Cardio form
  cardioDate = new Date().toISOString().split('T')[0];
  cardioType = 'bici';
  cardioDuration: number | null = null;
  cardioDistance: number | null = null;
  cardioZone = '';
  cardioElevation: number | null = null;
  cardioNotes = '';

  ngOnInit() {
    this.loadWorkoutLogs();
    this.loadCardioLogs();
  }

  prevMonth() { /* moved to CalendarPickerComponent */ }
  nextMonth() { /* moved to CalendarPickerComponent */ }
  selectDay(_iso: string) { /* moved to CalendarPickerComponent */ }

  formatDate(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  private loadWorkoutLogs() {
    this.logService.getLogs({ limit: 200 }).subscribe({ next: logs => {
      const mapped = logs.map((l: any) => ({
        id: l.id,
        exerciseId: l.exercise_id,
        logDate: l.log_date,
        weightKg: l.weight_kg,
        setsDone: l.sets_done,
        repsDone: l.reps_done,
        rirActual: l.rir_actual,
        notes: l.notes,
        exerciseName: l.exercise_name,
        sessionType: l.session_type,
      }));
      this.workoutLogs.set(mapped);
    }, error: (e) => console.error('loadWorkoutLogs error:', e) });
  }

  private loadCardioLogs() {
    this.logService.getCardioLogs({ limit: 20 }).subscribe(logs => {
      const mapped = logs.map((l: any) => ({
        id: l.id,
        logDate: l.log_date,
        type: l.type,
        durationMin: l.duration_min,
        distanceKm: l.distance_km,
        zone: l.zone,
        elevationM: l.elevation_m,
        notes: l.notes,
      }));
      this.cardioLogs.set(mapped);
    });
  }

  saveCardio() {
    this.logService.createCardioLog({
      logDate: this.cardioDate,
      type: this.cardioType,
      durationMin: this.cardioDuration,
      distanceKm: this.cardioDistance,
      zone: this.cardioZone || null,
      elevationM: this.cardioElevation,
      notes: this.cardioNotes || null,
    }).subscribe(() => {
      this.loadCardioLogs();
      this.cardioDuration = null;
      this.cardioDistance = null;
      this.cardioZone = '';
      this.cardioElevation = null;
      this.cardioNotes = '';
    });
  }

  deleteWorkoutLog(id: number) {
    this.logService.deleteLog(id).subscribe(() => this.loadWorkoutLogs());
  }

  deleteCardioLog(id: number) {
    this.logService.deleteCardioLog(id).subscribe(() => this.loadCardioLogs());
  }
}
