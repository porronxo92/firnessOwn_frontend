import { Routes } from '@angular/router';
import { OnboardingGuard, OnboardingCompleteGuard } from './core/guards/onboarding.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'plan', pathMatch: 'full' },
  {
    path: 'onboarding',
    loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent),
    canActivate: [OnboardingCompleteGuard]
  },
  {
    path: 'plan',
    loadComponent: () => import('./features/plan/plan.component').then(m => m.PlanComponent),
    canActivate: [OnboardingGuard]
  },
  {
    path: 'mi-plan',
    loadComponent: () => import('./features/generated-plan/generated-plan-view.component').then(m => m.GeneratedPlanViewComponent),
    canActivate: [OnboardingGuard]
  },
  {
    path: 'registro',
    loadComponent: () => import('./features/registro/registro.component').then(m => m.RegistroComponent),
    canActivate: [OnboardingGuard]
  },
  {
    path: 'progreso',
    loadComponent: () => import('./features/progreso/progreso.component').then(m => m.ProgresoComponent),
    canActivate: [OnboardingGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./features/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [OnboardingGuard]
  },
];
