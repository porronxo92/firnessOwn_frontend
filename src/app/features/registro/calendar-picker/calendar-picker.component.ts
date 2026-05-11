import { Component, Input, Output, EventEmitter, OnChanges, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface LogEntry {
  logDate: string;
  sessionType?: string | null;
}

interface CalCell {
  empty: boolean;
  idx: number;
  iso: string;
  day: number;
  isToday: boolean;
  types: string[];
}

@Component({
  selector: 'app-calendar-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cal-wrapper">
      <div class="cal-header">
        <button class="btn-icon" (click)="prevMonth()">&#x2039;</button>
        <span class="cal-month-label">{{ calMonthLabel() }}</span>
        <button class="btn-icon" (click)="nextMonth()">&#x203a;</button>
      </div>
      <div class="cal-grid">
        <span class="cal-dow" *ngFor="let d of DOW">{{ d }}</span>
        <ng-container *ngFor="let cell of calCells()">
          <span *ngIf="cell.empty" class="cal-empty"></span>
          <button
            *ngIf="!cell.empty"
            class="cal-day"
            [class.selected]="selectedDate === cell.iso"
            [class.today]="cell.isToday"
            [class.has-logs]="cell.types.length > 0"
            (click)="selectDay(cell.iso)">
            <span class="cal-num">{{ cell.day }}</span>
            <span *ngIf="cell.types.length > 0" class="cal-dots">
              <span *ngFor="let t of cell.types" class="dot" [ngClass]="t"></span>
            </span>
          </button>
        </ng-container>
      </div>
      <button *ngIf="selectedDate" class="btn-clear-cal" (click)="dateChange.emit('')">✕ Ver todos los días</button>
    </div>
  `,
  styles: [`
    .cal-wrapper { min-width: 240px; }
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
      cursor: pointer;
      &:hover { border-color: var(--accent); color: var(--accent); }
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
      &.selected { background: rgba(255, 95, 31, 0.12); border-color: var(--accent) !important; color: var(--accent); }
      &.has-logs { border-color: rgba(255,255,255,0.08); }
    }
    .cal-num { line-height: 1; }
    .cal-dots { display: flex; gap: 2px; }
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

    /* Responsive */
    @media (max-width: 480px) {
      .cal-wrapper {
        min-width: auto;
        width: 100%;
      }
      .cal-month-label {
        font-size: 0.8rem;
      }
      .cal-dow {
        font-size: 0.6rem;
      }
      .cal-day {
        height: 32px;
        font-size: 0.75rem;
      }
      .cal-empty {
        height: 32px;
      }
      .dot {
        width: 3px;
        height: 3px;
      }
    }
  `]
})
export class CalendarPickerComponent implements OnChanges {
  @Input() logs: LogEntry[] = [];
  @Input() selectedDate = '';
  @Output() dateChange = new EventEmitter<string>();

  readonly DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  calYear = signal(new Date().getFullYear());
  calMonth = signal(new Date().getMonth());

  calMonthLabel = computed(() =>
    new Date(this.calYear(), this.calMonth(), 1)
      .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  );

  private logsByDate = computed(() => {
    const map = new Map<string, Set<string>>();
    for (const log of this.logs) {
      if (!map.has(log.logDate)) map.set(log.logDate, new Set());
      if (log.sessionType) map.get(log.logDate)!.add(log.sessionType);
    }
    return map;
  });

  calCells = computed((): CalCell[] => {
    const year = this.calYear();
    const month = this.calMonth();
    const today = new Date().toISOString().split('T')[0];
    const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const map = this.logsByDate();

    const cells: CalCell[] = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push({ empty: true, idx: i, iso: '', day: 0, isToday: false, types: [] });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ empty: false, idx: startOffset + d - 1, iso, day: d, isToday: iso === today, types: map.has(iso) ? [...map.get(iso)!] : [] });
    }
    return cells;
  });

  ngOnChanges() {
    // trigger recompute on logs change — signals handle this automatically
  }

  prevMonth() {
    const m = this.calMonth();
    if (m === 0) { this.calMonth.set(11); this.calYear.update(y => y - 1); }
    else this.calMonth.update(m => m - 1);
  }

  nextMonth() {
    const m = this.calMonth();
    if (m === 11) { this.calMonth.set(0); this.calYear.update(y => y + 1); }
    else this.calMonth.update(m => m + 1);
  }

  selectDay(iso: string) {
    this.dateChange.emit(this.selectedDate === iso ? '' : iso);
  }
}
