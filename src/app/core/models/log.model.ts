export interface ProgressPoint {
  logDate: string;
  weightKg: number;
  setsDone: number;
  repsDone: string;
  estimated1rm: number | null;
}

export interface ExerciseProgress {
  exerciseId: number;
  exerciseName: string;
  points: ProgressPoint[];
  maxWeight: number;
  firstWeight: number;
  deltaKg: number;
  trend: 'up' | 'down' | 'stable';
}
