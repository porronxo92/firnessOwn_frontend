import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of, map, catchError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { OnboardingService } from '../services/onboarding.service';

@Injectable({
  providedIn: 'root'
})
export class OnboardingGuard implements CanActivate {
  private router = inject(Router);
  private authService = inject(AuthService);
  private onboardingService = inject(OnboardingService);

  canActivate(): Observable<boolean | UrlTree> {
    // Si no está autenticado, permitir acceso (el auth guard se encargará)
    if (!this.authService.isAuthenticated()) {
      return of(true);
    }

    // Verificar estado del onboarding
    return this.onboardingService.getOnboardingStatus().pipe(
      map(status => {
        if (!status.onboardingCompleted) {
          // Redirigir al onboarding
          return this.router.createUrlTree(['/onboarding']);
        }
        return true;
      }),
      catchError(() => {
        // Si hay error, asumir que necesita onboarding
        return of(this.router.createUrlTree(['/onboarding']));
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingCompleteGuard implements CanActivate {
  private router = inject(Router);
  private authService = inject(AuthService);
  private onboardingService = inject(OnboardingService);

  canActivate(): Observable<boolean | UrlTree> {
    // Si no está autenticado, redirigir a login
    if (!this.authService.isAuthenticated()) {
      return of(this.router.createUrlTree(['/login']));
    }

    // Verificar si ya completó el onboarding Y tiene plan activo
    return this.onboardingService.getOnboardingStatus().pipe(
      map(status => {
        // Solo redirigir si completó el onboarding Y tiene un plan activo
        if (status.onboardingCompleted && status.hasActivePlan) {
          // Ya completó y tiene plan, redirigir a mi-plan
          return this.router.createUrlTree(['/mi-plan']);
        }
        // Permitir acceso al onboarding si:
        // - No ha completado el onboarding, o
        // - Completó pero no tiene plan activo (necesita regenerar)
        return true;
      }),
      catchError(() => of(true))
    );
  }
}
