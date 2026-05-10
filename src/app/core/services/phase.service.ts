import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Phase } from '../models/phase.model';
import { Exercise } from '../models/exercise.model';

@Injectable({ providedIn: 'root' })
export class PhaseService {
  private api = inject(ApiService);

  getPhases(): Observable<Phase[]> {
    return this.api.get<Phase[]>('/phases');
  }

  getPhase(id: number): Observable<Phase> {
    return this.api.get<Phase>(`/phases/${id}`);
  }

  getPhaseExercises(phaseId: number, sessionType?: string): Observable<Exercise[]> {
    const params: any = {};
    if (sessionType) params.session_type = sessionType;
    return this.api.get<Exercise[]>(`/phases/${phaseId}/exercises`, params);
  }
}
