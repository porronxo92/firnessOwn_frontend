import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { WorkoutLog, CardioLog } from '../models/exercise.model';

@Injectable({ providedIn: 'root' })
export class LogService {
  private api = inject(ApiService);

  getLogs(params?: { exercise_id?: number; limit?: number; date_from?: string }): Observable<WorkoutLog[]> {
    return this.api.get<WorkoutLog[]>('/logs', params as any);
  }

  createLog(log: Partial<WorkoutLog>): Observable<WorkoutLog> {
    return this.api.post<WorkoutLog>('/logs', {
      exercise_id: log.exerciseId,
      custom_exercise_id: log.customExerciseId,
      log_date: log.logDate,
      weight_kg: log.weightKg,
      sets_done: log.setsDone,
      reps_done: log.repsDone,
      rir_actual: log.rirActual,
      rpe: log.rpe,
      notes: log.notes,
    });
  }

  updateLog(id: number, log: Partial<WorkoutLog>): Observable<WorkoutLog> {
    return this.api.put<WorkoutLog>(`/logs/${id}`, {
      log_date: log.logDate,
      weight_kg: log.weightKg,
      sets_done: log.setsDone,
      reps_done: log.repsDone,
      rir_actual: log.rirActual,
      rpe: log.rpe,
      notes: log.notes,
    });
  }

  deleteLog(id: number): Observable<any> {
    return this.api.delete(`/logs/${id}`);
  }

  getTodayLogs(): Observable<WorkoutLog[]> {
    return this.api.get<WorkoutLog[]>('/logs/today');
  }

  getRecentLogs(days: number = 7): Observable<WorkoutLog[]> {
    return this.api.get<WorkoutLog[]>('/logs/recent', { days });
  }

  // Cardio
  getCardioLogs(params?: { limit?: number; date_from?: string }): Observable<CardioLog[]> {
    return this.api.get<CardioLog[]>('/stats/cardio', params as any);
  }

  createCardioLog(log: Partial<CardioLog>): Observable<CardioLog> {
    return this.api.post<CardioLog>('/stats/cardio', {
      log_date: log.logDate,
      type: log.type,
      duration_min: log.durationMin,
      distance_km: log.distanceKm,
      zone: log.zone,
      elevation_m: log.elevationM,
      notes: log.notes,
    });
  }

  deleteCardioLog(id: number): Observable<any> {
    return this.api.delete(`/stats/cardio/${id}`);
  }
}
