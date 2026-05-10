export interface Exercise {
  id: number;
  phaseId: number;
  sessionType: 'pull' | 'push' | 'legs' | 'cardio';
  name: string;
  muscleGroup: string;
  muscleDesc: string;
  defaultSets: number;
  defaultReps: string;
  rir: string;
  notes: string;
  sortOrder: number;
  lastLog?: WorkoutLog;
}

export interface CustomExercise {
  id: number;
  userId: number;
  phaseId: number;
  sessionType: string;
  name: string;
  muscleGroup: string;
  defaultSets: number;
  defaultReps: string;
  rir: string;
  notes: string;
}

export interface WorkoutLog {
  id?: number;
  exerciseId?: number;
  customExerciseId?: number;
  logDate: string;
  weightKg: number | null;
  setsDone: number | null;
  repsDone: string | null;
  rirActual?: string;
  rpe?: number;
  notes?: string;
  createdAt?: string;
  exerciseName?: string;
  sessionType?: string;
}

export interface CardioLog {
  id?: number;
  logDate: string;
  type: string;
  durationMin: number | null;
  distanceKm: number | null;
  zone: string | null;
  elevationM: number | null;
  notes: string | null;
}
