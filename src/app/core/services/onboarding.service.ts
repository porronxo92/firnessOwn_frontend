import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UserProfile,
  OnboardingStep1,
  OnboardingStep2,
  OnboardingStep3,
  OnboardingStep4,
  OnboardingStep5,
  OnboardingStep6,
  OnboardingStatus
} from '../models/user-profile.model';
import {
  GeneratedPlan,
  GeneratedPlanSummary,
  WeeklyProgress,
  CurrentWeekResponse,
  AdjustmentFeedback,
  AdjustmentSuggestion,
  GeneratePlanRequest,
  PlanGenerationAccepted,
  PlanGenerationStatus
} from '../models/generated-plan.model';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/onboarding`;

  // Signals para estado reactivo
  private _profile = signal<UserProfile | null>(null);
  private _onboardingStatus = signal<OnboardingStatus | null>(null);
  private _activePlan = signal<GeneratedPlan | null>(null);
  private _isLoading = signal(false);
  private _isGeneratingPlan = signal(false);

  // Computed values
  profile = computed(() => this._profile());
  onboardingStatus = computed(() => this._onboardingStatus());
  activePlan = computed(() => this._activePlan());
  isLoading = computed(() => this._isLoading());
  isGeneratingPlan = computed(() => this._isGeneratingPlan());
  
  isOnboardingCompleted = computed(() => 
    this._onboardingStatus()?.onboardingCompleted ?? false
  );
  
  hasActivePlan = computed(() => 
    this._activePlan() !== null && this._activePlan()?.isActive
  );

  currentStep = computed(() => 
    this._onboardingStatus()?.nextStep ?? 1
  );

  // === Métodos para invalidar cache ===
  
  clearStatusCache(): void {
    this._onboardingStatus.set(null);
  }

  clearPlanCache(): void {
    this._activePlan.set(null);
  }

  clearAllCache(): void {
    this._profile.set(null);
    this._onboardingStatus.set(null);
    this._activePlan.set(null);
  }

  // === Métodos de Perfil ===

  getProfile(): Observable<UserProfile | null> {
    this._isLoading.set(true);
    return this.http.get<UserProfile>(`${this.baseUrl}/profile`).pipe(
      tap(profile => {
        this._profile.set(profile);
        this._isLoading.set(false);
      }),
      catchError(() => {
        this._isLoading.set(false);
        return of(null);
      })
    );
  }

  createProfile(data: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.baseUrl}/profile`, this.toSnakeCase(data)).pipe(
      tap(profile => this._profile.set(profile))
    );
  }

  updateProfile(data: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/profile`, this.toSnakeCase(data)).pipe(
      tap(profile => this._profile.set(profile))
    );
  }

  // === Métodos de Onboarding por pasos ===

  getOnboardingStatus(forceRefresh = false): Observable<OnboardingStatus> {
    // Usar cache si existe y no se fuerza refresh
    const cached = this._onboardingStatus();
    if (cached && !forceRefresh) {
      return of(cached);
    }

    return this.http.get<OnboardingStatus>(`${this.baseUrl}/status`).pipe(
      map(status => this.toCamelCase(status) as OnboardingStatus),
      tap(status => this._onboardingStatus.set(status))
    );
  }

  submitStep1(data: OnboardingStep1): Observable<UserProfile> {
    return this.http.post<UserProfile>(
      `${this.baseUrl}/step1`, 
      this.toSnakeCase(data)
    ).pipe(
      tap(profile => {
        this._profile.set(this.toCamelCase(profile) as UserProfile);
        this.updateStepStatus(1);
      })
    );
  }

  submitStep2(data: OnboardingStep2): Observable<UserProfile> {
    return this.http.post<UserProfile>(
      `${this.baseUrl}/step2`,
      this.toSnakeCase(data)
    ).pipe(
      tap(profile => {
        this._profile.set(this.toCamelCase(profile) as UserProfile);
        this.updateStepStatus(2);
      })
    );
  }

  submitStep3(data: OnboardingStep3): Observable<UserProfile> {
    return this.http.post<UserProfile>(
      `${this.baseUrl}/step3`,
      this.toSnakeCase(data)
    ).pipe(
      tap(profile => {
        this._profile.set(this.toCamelCase(profile) as UserProfile);
        this.updateStepStatus(3);
      })
    );
  }

  submitStep4(data: OnboardingStep4): Observable<UserProfile> {
    return this.http.post<UserProfile>(
      `${this.baseUrl}/step4`,
      this.toSnakeCase(data)
    ).pipe(
      tap(profile => {
        this._profile.set(this.toCamelCase(profile) as UserProfile);
        this.updateStepStatus(4);
      })
    );
  }

  submitStep5(data: OnboardingStep5): Observable<UserProfile> {
    return this.http.post<UserProfile>(
      `${this.baseUrl}/step5`,
      this.toSnakeCase(data)
    ).pipe(
      tap(profile => {
        this._profile.set(this.toCamelCase(profile) as UserProfile);
        this.updateStepStatus(5);
      })
    );
  }

  submitStep6(data: OnboardingStep6): Observable<UserProfile> {
    return this.http.post<UserProfile>(
      `${this.baseUrl}/step6`,
      this.toSnakeCase(data)
    ).pipe(
      tap(profile => {
        this._profile.set(this.toCamelCase(profile) as UserProfile);
        this.updateStepStatus(6);
      })
    );
  }

  completeOnboarding(): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.baseUrl}/complete`, {}).pipe(
      map(profile => this.toCamelCase(profile) as UserProfile),
      tap(profile => {
        this._profile.set(profile);
        const currentStatus = this._onboardingStatus();
        if (currentStatus) {
          this._onboardingStatus.set({
            ...currentStatus,
            onboardingCompleted: true
          });
        }
      })
    );
  }

  // === Métodos de Plan Generado ===

  /** Lanza la generación en segundo plano. Devuelve plan_id y 202 inmediatamente. */
  generatePlan(request: GeneratePlanRequest = {}): Observable<PlanGenerationAccepted> {
    this._isGeneratingPlan.set(true);
    return this.http.post<PlanGenerationAccepted>(`${this.baseUrl}/generate-plan`, request).pipe(
      map(resp => this.toCamelCase(resp) as PlanGenerationAccepted),
      tap(() => {
        // No desactivamos isGeneratingPlan aquí — lo hace el componente tras el polling
      }),
      catchError(error => {
        this._isGeneratingPlan.set(false);
        throw error;
      })
    );
  }

  /** Consulta el estado de generación de un plan (para polling). */
  getGenerationStatus(planId: number): Observable<PlanGenerationStatus> {
    return this.http.get<PlanGenerationStatus>(
      `${this.baseUrl}/plans/${planId}/generation-status`
    ).pipe(
      map(resp => this.toCamelCase(resp) as PlanGenerationStatus)
    );
  }

  getPlans(): Observable<GeneratedPlanSummary[]> {
    return this.http.get<GeneratedPlanSummary[]>(`${this.baseUrl}/plans`).pipe(
      map(plans => plans.map(p => this.toCamelCase(p) as GeneratedPlanSummary))
    );
  }

  getActivePlan(forceRefresh = false): Observable<GeneratedPlan | null> {
    // Usar cache si existe y no se fuerza refresh
    const cached = this._activePlan();
    if (cached && !forceRefresh) {
      return of(cached);
    }

    return this.http.get<GeneratedPlan>(`${this.baseUrl}/plans/active`).pipe(
      map(plan => plan ? this.toCamelCase(plan) as GeneratedPlan : null),
      tap(plan => {
        if (plan) {
          this._activePlan.set(plan);
        }
      }),
      catchError(() => of(null))
    );
  }

  getPlanById(planId: number): Observable<GeneratedPlan> {
    return this.http.get<GeneratedPlan>(`${this.baseUrl}/plans/${planId}`).pipe(
      map(plan => this.toCamelCase(plan) as GeneratedPlan)
    );
  }

  getCurrentWeek(planId: number): Observable<CurrentWeekResponse> {
    return this.http.get<CurrentWeekResponse>(`${this.baseUrl}/plans/${planId}/current-week`).pipe(
      map(data => this.toCamelCase(data) as CurrentWeekResponse)
    );
  }

  advanceWeek(planId: number): Observable<{ message: string; currentWeek?: number; completed?: boolean }> {
    return this.http.put<{ message: string; currentWeek?: number; completed?: boolean }>(
      `${this.baseUrl}/plans/${planId}/advance-week`,
      {}
    );
  }

  // === Métodos de Progreso ===

  getPlanProgress(planId: number): Observable<WeeklyProgress[]> {
    return this.http.get<WeeklyProgress[]>(`${this.baseUrl}/plans/${planId}/progress`);
  }

  updateWeeklyProgress(
    planId: number, 
    weekNumber: number, 
    data: Partial<WeeklyProgress>
  ): Observable<WeeklyProgress> {
    return this.http.put<WeeklyProgress>(
      `${this.baseUrl}/plans/${planId}/progress/${weekNumber}`,
      this.toSnakeCase(data)
    );
  }

  getAdjustmentSuggestions(
    planId: number,
    weekNumber: number,
    feedback: AdjustmentFeedback
  ): Observable<AdjustmentSuggestion> {
    return this.http.post<AdjustmentSuggestion>(
      `${this.baseUrl}/plans/${planId}/progress/${weekNumber}/get-suggestions`,
      this.toSnakeCase(feedback)
    );
  }

  // === Helpers ===

  private updateStepStatus(stepNumber: number): void {
    const currentStatus = this._onboardingStatus();
    if (currentStatus) {
      const stepsCompleted = { ...currentStatus.stepsCompleted };
      (stepsCompleted as any)[`step${stepNumber}`] = true;
      
      // Calcular siguiente paso
      let nextStep = stepNumber + 1;
      if (nextStep > 6) nextStep = 7;
      
      this._onboardingStatus.set({
        ...currentStatus,
        stepsCompleted,
        nextStep
      });
    }
  }

  // Conversión snake_case <-> camelCase
  private toSnakeCase(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(item => this.toSnakeCase(item));
    if (typeof obj !== 'object') return obj;
    
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      acc[snakeKey] = this.toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }

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

  // Método para inicializar el estado
  async initializeState(): Promise<void> {
    try {
      await Promise.all([
        firstValueFrom(this.getOnboardingStatus()),
        firstValueFrom(this.getProfile()),
        firstValueFrom(this.getActivePlan())
      ]);
    } catch (error) {
      console.error('Error initializing onboarding state:', error);
    }
  }
}
