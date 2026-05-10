// Enums para el perfil de usuario
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_say';

export type Goal = 
  | 'hypertrophy' 
  | 'strength' 
  | 'weight_loss' 
  | 'endurance' 
  | 'marathon' 
  | 'half_marathon' 
  | 'bodyweight' 
  | 'general_fitness';

export type TrainingPeriod = 'short' | 'medium' | 'long';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'other';

export type BikeType = 'road' | 'mtb' | 'indoor' | 'gravel';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Interfaz principal del perfil de usuario
export interface UserProfile {
  id: number;
  userId: number;
  
  // Datos físicos
  age?: number;
  gender?: Gender;
  heightCm?: number;
  weightKg?: number;
  bodyFatPercentage?: number;
  
  // Objetivos
  primaryGoal?: Goal;
  secondaryGoals?: Goal[];
  targetWeightKg?: number;
  
  // Disponibilidad
  trainingDaysPerWeek?: number;
  preferredDays?: DayOfWeek[];
  sessionDurationMinutes?: number;
  
  // Periodo
  trainingPeriod?: TrainingPeriod;
  startDate?: string;
  targetEventDate?: string;
  targetEventName?: string;
  
  // Recursos
  hasGymAccess: boolean;
  hasHomeEquipment: boolean;
  homeEquipmentList?: string[];
  hasBike: boolean;
  bikeType?: BikeType;
  hasRunningGear: boolean;
  outdoorSpaceAvailable: boolean;
  poolAccess: boolean;
  
  // Experiencia
  fitnessLevel?: FitnessLevel;
  yearsTraining?: number;
  previousInjuries?: string;
  healthConditions?: string;
  
  // Alimentación
  dietType?: DietType;
  mealsPerDay?: number;
  tracksCalories: boolean;
  dailyCalorieTarget?: number;
  proteinTargetGrams?: number;
  
  // Preferencias
  preferredTrainingTypes?: string[];
  dislikedExercises?: string[];
  favoriteExercises?: string[];
  
  // Estado
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interfaces para los pasos del onboarding
export interface OnboardingStep1 {
  age?: number;
  gender?: Gender;
  heightCm?: number;
  weightKg?: number;
  bodyFatPercentage?: number;
}

export interface OnboardingStep2 {
  primaryGoal: Goal;
  secondaryGoals?: Goal[];
  targetWeightKg?: number;
}

export interface OnboardingStep3 {
  trainingDaysPerWeek: number;
  preferredDays?: DayOfWeek[];
  sessionDurationMinutes?: number;
  trainingPeriod: TrainingPeriod;
  targetEventDate?: string;
  targetEventName?: string;
}

export interface OnboardingStep4 {
  hasGymAccess: boolean;
  hasHomeEquipment: boolean;
  homeEquipmentList?: string[];
  hasBike: boolean;
  bikeType?: BikeType;
  hasRunningGear: boolean;
  outdoorSpaceAvailable: boolean;
  poolAccess: boolean;
}

export interface OnboardingStep5 {
  fitnessLevel: FitnessLevel;
  yearsTraining?: number;
  previousInjuries?: string;
  healthConditions?: string;
}

export interface OnboardingStep6 {
  dietType?: DietType;
  mealsPerDay?: number;
  tracksCalories: boolean;
  dailyCalorieTarget?: number;
  proteinTargetGrams?: number;
  preferredTrainingTypes?: string[];
  dislikedExercises?: string[];
  favoriteExercises?: string[];
}

// Estado del onboarding
export interface OnboardingStatus {
  onboardingCompleted: boolean;
  hasProfile: boolean;
  stepsCompleted: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
    step4: boolean;
    step5: boolean;
    step6: boolean;
  };
  nextStep: number;
  hasActivePlan: boolean;
}

// Opciones de UI
export const GOAL_OPTIONS: { value: Goal; label: string; description: string }[] = [
  { value: 'hypertrophy', label: 'Hipertrofia', description: 'Ganar masa muscular' },
  { value: 'strength', label: 'Fuerza', description: 'Aumentar fuerza máxima' },
  { value: 'weight_loss', label: 'Pérdida de peso', description: 'Bajar grasa corporal' },
  { value: 'endurance', label: 'Resistencia', description: 'Mejorar capacidad cardiovascular' },
  { value: 'marathon', label: 'Maratón', description: 'Preparar maratón (42km)' },
  { value: 'half_marathon', label: 'Medio Maratón', description: 'Preparar medio maratón (21km)' },
  { value: 'bodyweight', label: 'Calistenia', description: 'Entrenamiento con peso corporal' },
  { value: 'general_fitness', label: 'Fitness General', description: 'Mejorar salud y forma física' }
];

export const FITNESS_LEVEL_OPTIONS: { value: FitnessLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Principiante', description: 'Menos de 1 año entrenando' },
  { value: 'intermediate', label: 'Intermedio', description: '1-3 años de experiencia' },
  { value: 'advanced', label: 'Avanzado', description: 'Más de 3 años de experiencia' }
];

export const TRAINING_PERIOD_OPTIONS: { value: TrainingPeriod; label: string; weeks: string }[] = [
  { value: 'short', label: 'Corto plazo', weeks: '4-8 semanas' },
  { value: 'medium', label: 'Medio plazo', weeks: '12-16 semanas' },
  { value: 'long', label: 'Largo plazo', weeks: '20-24 semanas' }
];

export const DIET_OPTIONS: { value: DietType; label: string }[] = [
  { value: 'omnivore', label: 'Omnívora' },
  { value: 'vegetarian', label: 'Vegetariana' },
  { value: 'vegan', label: 'Vegana' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'other', label: 'Otra' }
];

export const EQUIPMENT_OPTIONS: string[] = [
  'Mancuernas',
  'Barra olímpica',
  'Discos/pesas',
  'Banco ajustable',
  'Rack de sentadillas',
  'Barra de dominadas',
  'Kettlebells',
  'Bandas elásticas',
  'TRX/Suspensión',
  'Máquina de poleas',
  'Cinta de correr',
  'Bicicleta estática',
  'Remo indoor',
  'Colchoneta/Mat'
];

export const TRAINING_TYPE_OPTIONS: string[] = [
  'Fuerza/Pesas',
  'Cardio',
  'HIIT',
  'Running',
  'Ciclismo',
  'Natación',
  'Yoga/Stretching',
  'CrossFit',
  'Calistenia',
  'Artes marciales',
  'Deportes de equipo'
];

export const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
  { value: 'monday', label: 'Lunes', short: 'L' },
  { value: 'tuesday', label: 'Martes', short: 'M' },
  { value: 'wednesday', label: 'Miércoles', short: 'X' },
  { value: 'thursday', label: 'Jueves', short: 'J' },
  { value: 'friday', label: 'Viernes', short: 'V' },
  { value: 'saturday', label: 'Sábado', short: 'S' },
  { value: 'sunday', label: 'Domingo', short: 'D' }
];
