// Tipos para el tracking estructurado del plan IA

// === Exercise Log (registro de series) ===

export interface ExerciseLogCreate {
  setNumber: number;
  weightKg?: number | null;
  repsDone?: number | null;
  rirActual?: string | null;
  rpe?: number | null;
  completed?: boolean;
  notes?: string | null;
}

export interface ExerciseLogUpdate {
  weightKg?: number | null;
  repsDone?: number | null;
  rirActual?: string | null;
  rpe?: number | null;
  completed?: boolean;
  notes?: string | null;
}

export interface ExerciseLogResponse {
  id: number;
  planExerciseId: number;
  userId: number;
  setNumber: number;
  weightKg?: number | null;
  repsDone?: number | null;
  rirActual?: string | null;
  rpe?: number | null;
  completed: boolean;
  notes?: string | null;
  createdAt?: string;
}

// === Plan Exercise (ejercicio planificado) ===

export interface PlanExerciseResponse {
  id: number;
  dayId: number;
  name: string;
  muscleGroup?: string | null;
  sets: number;
  reps: string;
  rir?: string | null;
  restSeconds?: number | null;
  tempo?: string | null;
  notes?: string | null;
  alternatives?: string | null;
  sortOrder: number;
}

export interface PlanExerciseWithLogs extends PlanExerciseResponse {
  logs: ExerciseLogResponse[];
  bestWeight?: number | null;
  lastWeight?: number | null;
}

// === Plan Day (día de entrenamiento) ===

export interface PlanDayResponse {
  id: number;
  weekId: number;
  dayNumber: number;
  dayName: string;
  type: string;
  sessionName?: string | null;
  durationMinutes?: number | null;
  sessionNotes?: string | null;
  cardioType?: string | null;
  cardioDurationMin?: number | null;
  cardioIntensity?: string | null;
  cardioDistanceKm?: number | null;
  cardioNotes?: string | null;
  status: 'pending' | 'completed' | 'skipped';
  completedAt?: string | null;
}

export interface PlanDayWithExercises extends PlanDayResponse {
  exercises: PlanExerciseWithLogs[];
}

// === Plan Week (semana del plan) ===

export interface PlanWeekResponse {
  id: number;
  planId: number;
  weekNumber: number;
  phaseName?: string | null;
  isDeload: boolean;
  focus?: string | null;
  progressionNotes?: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface PlanWeekWithDays extends PlanWeekResponse {
  days: PlanDayResponse[];
}

// === Progression / Stats ===

export interface ExerciseProgressionPoint {
  weekNumber: number;
  phaseName?: string | null;
  maxWeight?: number | null;
  avgWeight?: number | null;
  maxReps?: number | null;
  avgReps?: number | null;
  totalSetsLogged: number;
  estimated1rm?: number | null;
}

export interface ExerciseProgression {
  exerciseName: string;
  planId: number;
  points: ExerciseProgressionPoint[];
  bestWeightEver?: number | null;
  best1rmEver?: number | null;
  trend: 'up' | 'down' | 'stable';
}

export interface PlanProgressSummary {
  planId: number;
  totalWeeks: number;
  weeksCompleted: number;
  totalDays: number;
  daysCompleted: number;
  totalExercises: number;
  totalSetsLogged: number;
  uniqueExercises: number;
  completionPercent: number;
}

// === Requests ===

export interface CompleteDayRequest {
  notes?: string | null;
}

export interface CompleteWeekRequest {
  energyLevel?: number | null;
  sorenessLevel?: number | null;
  motivationLevel?: number | null;
  notes?: string | null;
}

// === Exercise History (cross-week) ===

export interface ExerciseHistoryEntry {
  weekNumber: number;
  dayName: string;
  setNumber: number;
  weightKg?: number | null;
  repsDone?: number | null;
  rirActual?: string | null;
  rpe?: number | null;
  createdAt?: string | null;
}
