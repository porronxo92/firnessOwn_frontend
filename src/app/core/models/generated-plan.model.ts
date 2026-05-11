// Tipos para la estructura del plan generado

export interface ExerciseDetail {
  name: string;
  muscleGroup?: string;
  sets: number;
  reps: string;
  rir?: string;
  restSeconds?: number;
  tempo?: string;
  notes?: string;
  alternatives?: string[];
}

export interface CardioDetail {
  type: string;
  durationMinutes: number;
  intensity?: string;
  distanceKm?: number;
  notes?: string;
}

export interface WarmupCooldown {
  name: string;
  duration: string;
  notes?: string;
}

export interface DayPlan {
  dayNumber: number;
  dayName: string;
  type: 'strength' | 'cardio' | 'rest' | 'active_recovery' | 'hybrid';
  sessionName: string;
  durationMinutes?: number;
  warmup?: WarmupCooldown[];
  exercises?: ExerciseDetail[];
  cardio?: CardioDetail;
  cooldown?: WarmupCooldown[];
  sessionNotes?: string;
  notes?: string;
}

export interface WeekPlan {
  weekNumber: number;
  phase: string;
  isDeload: boolean;
  focus?: string;
  days: DayPlan[];
  weeklyVolume?: {
    totalSets?: number;
    strengthSessions?: number;
    cardioSessions?: number;
  };
  weeklyGoals?: string[];
  weeklyNotes?: string;
}

export interface PhasePlan {
  phaseNumber: number;
  name: string;
  weeks: number[];
  focus: string;
  description?: string;
  volumeAdjustment?: string;
  intensityAdjustment?: string;
}

export interface NutritionGuidelines {
  dailyCalories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  preWorkoutMeal?: string;
  postWorkoutMeal?: string;
  hydrationLiters?: number;
  supplementsSuggested?: string[];
}

export interface ProgressionRules {
  strength?: string;
  cardio?: string;
  deloadProtocol?: string;
}

export interface PlanStructure {
  planName: string;
  overview: string;
  totalWeeks: number;
  phases: PhasePlan[];
  weeks: WeekPlan[];
  nutritionGuidelines?: NutritionGuidelines;
  progressionRules?: ProgressionRules;
  importantNotes?: string[];
}

export interface GeneratedPlan {
  id: number;
  userProfileId: number;
  name: string;
  description?: string;
  totalWeeks: number;
  currentWeek: number;
  planType: 'strength' | 'running' | 'cycling' | 'hybrid' | 'bodyweight';
  primaryFocus?: string;
  planStructure: PlanStructure;
  isActive: boolean;
  generationStatus: 'pending' | 'generating' | 'completed' | 'error';
  generationError?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GeneratedPlanSummary {
  id: number;
  name: string;
  description?: string;
  totalWeeks: number;
  currentWeek: number;
  planType: string;
  primaryFocus?: string;
  isActive: boolean;
  startedAt?: string;
  createdAt?: string;
}

export interface WeeklyProgress {
  id: number;
  planId: number;
  weekNumber: number;
  sessionsPlanned: number;
  sessionsCompleted: number;
  userNotes?: string;
  energyLevel?: number;
  sorenessLevel?: number;
  motivationLevel?: number;
  aiFeedback?: string;
  suggestedAdjustments?: any;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
}

export interface CurrentWeekResponse {
  planId: number;
  planName: string;
  weekNumber: number;
  totalWeeks: number;
  phaseName: string;
  isDeload: boolean;
  weekPlan: WeekPlan;
  progress?: WeeklyProgress;
}

export interface AdjustmentFeedback {
  weekNumber: number;
  sessionsCompleted: number;
  sessionsPlanned: number;
  energyLevel: number;
  sorenessLevel: number;
  motivationLevel: number;
  userNotes?: string;
}

export interface AdjustmentSuggestion {
  analysis: string;
  adjustments: {
    type: string;
    suggestion: string;
    reason: string;
  }[];
  motivationMessage: string;
  warnings?: string[];
  nextWeekFocus: string;
}

export interface GeneratePlanRequest {
  regenerate?: boolean;
}

export interface PlanGenerationAccepted {
  planId: number;
  status: 'generating';
  message: string;
}

export interface PlanGenerationStatus {
  id: number;
  generationStatus: 'pending' | 'generating' | 'completed' | 'error';
  generationError?: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
}
