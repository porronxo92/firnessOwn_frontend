import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ExerciseProgress } from '../models/log.model';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private api = inject(ApiService);

  getProgress(exerciseId: number, limit: number = 10): Observable<ExerciseProgress> {
    return this.api.get<ExerciseProgress>(`/stats/progress/${exerciseId}`, { limit });
  }

  getMaxes(): Observable<any[]> {
    return this.api.get<any[]>('/stats/maxes');
  }

  getVolume(week?: number): Observable<any> {
    const params: any = {};
    if (week) params.week = week;
    return this.api.get('/stats/volume', params);
  }

  getSummary(): Observable<any> {
    return this.api.get('/stats/summary');
  }
}
