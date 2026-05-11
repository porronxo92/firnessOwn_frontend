import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PlanWeekResponse,
  PlanDayResponse,
  PlanDayWithExercises,
  PlanExerciseWithLogs,
  ExerciseLogCreate,
  ExerciseLogResponse,
  ExerciseProgression,
  PlanProgressSummary,
  CompleteDayRequest,
  CompleteWeekRequest,
  ExerciseHistoryEntry,
  PlanRecentLogEntry,
} from '../models/plan-tracking.model';

@Injectable({ providedIn: 'root' })
export class PlanTrackingService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/tracking';

  // === Helper: snake_case → camelCase ===
  private toCamelCase(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(item => this.toCamelCase(item));
    if (typeof obj !== 'object') return obj;

    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = this.toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }

  // === Populate plan structure into tracking tables ===
  populatePlan(planId: number): Observable<{ message: string; weeksCount?: number; weeksCreated?: number }> {
    return this.http.post<any>(`${this.baseUrl}/plans/${planId}/populate`, {}).pipe(
      map(res => this.toCamelCase(res))
    );
  }

  // === Get all weeks of a plan ===
  getWeeks(planId: number): Observable<PlanWeekResponse[]> {
    return this.http.get<any[]>(`${this.baseUrl}/plans/${planId}/weeks`).pipe(
      map(weeks => weeks.map(w => this.toCamelCase(w)))
    );
  }

  // === Get days of a specific week ===
  getWeekDays(planId: number, weekNumber: number): Observable<PlanDayResponse[]> {
    return this.http.get<any[]>(`${this.baseUrl}/plans/${planId}/weeks/${weekNumber}/days`).pipe(
      map(days => days.map(d => this.toCamelCase(d)))
    );
  }

  // === Get day detail with exercises and logs ===
  getDayDetail(dayId: number): Observable<PlanDayWithExercises> {
    return this.http.get<any>(`${this.baseUrl}/plan-days/${dayId}`).pipe(
      map(day => this.toCamelCase(day))
    );
  }

  // === Log a single set ===
  logExerciseSet(exerciseId: number, data: ExerciseLogCreate): Observable<ExerciseLogResponse> {
    const snakeData = {
      set_number: data.setNumber,
      weight_kg: data.weightKg,
      reps_done: data.repsDone,
      rir_actual: data.rirActual,
      rpe: data.rpe,
      completed: data.completed ?? true,
      notes: data.notes,
    };
    return this.http.post<any>(`${this.baseUrl}/plan-exercises/${exerciseId}/log`, snakeData).pipe(
      map(log => this.toCamelCase(log))
    );
  }

  // === Log multiple sets at once (replaces existing) ===
  logExerciseBatch(exerciseId: number, logs: ExerciseLogCreate[]): Observable<ExerciseLogResponse[]> {
    const snakeLogs = logs.map(data => ({
      set_number: data.setNumber,
      weight_kg: data.weightKg,
      reps_done: data.repsDone,
      rir_actual: data.rirActual,
      rpe: data.rpe,
      completed: data.completed ?? true,
      notes: data.notes,
    }));
    return this.http.post<any[]>(`${this.baseUrl}/plan-exercises/${exerciseId}/log-batch`, snakeLogs).pipe(
      map(res => res.map(l => this.toCamelCase(l)))
    );
  }

  // === Update a log ===
  updateLog(logId: number, data: Partial<ExerciseLogCreate>): Observable<ExerciseLogResponse> {
    const snakeData: any = {};
    if (data.weightKg !== undefined) snakeData.weight_kg = data.weightKg;
    if (data.repsDone !== undefined) snakeData.reps_done = data.repsDone;
    if (data.rirActual !== undefined) snakeData.rir_actual = data.rirActual;
    if (data.rpe !== undefined) snakeData.rpe = data.rpe;
    if (data.completed !== undefined) snakeData.completed = data.completed;
    if (data.notes !== undefined) snakeData.notes = data.notes;

    return this.http.put<any>(`${this.baseUrl}/exercise-logs/${logId}`, snakeData).pipe(
      map(log => this.toCamelCase(log))
    );
  }

  // === Delete a log ===
  deleteLog(logId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/exercise-logs/${logId}`);
  }

  // === Get logs for a specific exercise ===
  getExerciseLogs(exerciseId: number): Observable<ExerciseLogResponse[]> {
    return this.http.get<any[]>(`${this.baseUrl}/plan-exercises/${exerciseId}/logs`).pipe(
      map(logs => logs.map(l => this.toCamelCase(l)))
    );
  }

  // === Complete a day ===
  completeDay(dayId: number, request?: CompleteDayRequest): Observable<PlanDayResponse> {
    const body = request ? { notes: request.notes } : {};
    return this.http.post<any>(`${this.baseUrl}/plan-days/${dayId}/complete`, body).pipe(
      map(day => this.toCamelCase(day))
    );
  }

  // === Complete a week ===
  completeWeek(weekId: number, request?: CompleteWeekRequest): Observable<PlanWeekResponse> {
    const body: any = {};
    if (request?.energyLevel) body.energy_level = request.energyLevel;
    if (request?.sorenessLevel) body.soreness_level = request.sorenessLevel;
    if (request?.motivationLevel) body.motivation_level = request.motivationLevel;
    if (request?.notes) body.notes = request.notes;

    return this.http.post<any>(`${this.baseUrl}/plan-weeks/${weekId}/complete`, body).pipe(
      map(week => this.toCamelCase(week))
    );
  }

  // === Get progression for exercises ===
  getProgression(planId: number, exerciseName?: string): Observable<ExerciseProgression[]> {
    let url = `${this.baseUrl}/plans/${planId}/progression`;
    if (exerciseName) {
      url += `?exercise_name=${encodeURIComponent(exerciseName)}`;
    }
    return this.http.get<any[]>(url).pipe(
      map(progs => progs.map(p => this.toCamelCase(p)))
    );
  }

  // === Get plan summary ===
  getPlanSummary(planId: number): Observable<PlanProgressSummary> {
    return this.http.get<any>(`${this.baseUrl}/plans/${planId}/summary`).pipe(
      map(summary => this.toCamelCase(summary))
    );
  }

  // === Get exercise history by name (cross-week) ===
  getExerciseHistory(planId: number, exerciseName: string): Observable<ExerciseHistoryEntry[]> {
    const url = `${this.baseUrl}/plans/${planId}/exercise-history/${encodeURIComponent(exerciseName)}`;
    return this.http.get<any[]>(url).pipe(
      map(entries => entries.map(e => this.toCamelCase(e)))
    );
  }

  // === Get all recent exercise logs (for Registro view) ===
  getRecentLogs(planId: number, limit: number = 200): Observable<PlanRecentLogEntry[]> {
    return this.http.get<any[]>(`${this.baseUrl}/plans/${planId}/recent-logs`, {
      params: { limit: limit.toString() }
    }).pipe(
      map(logs => logs.map(l => this.toCamelCase(l)))
    );
  }
}
