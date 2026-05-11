import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard básico de autenticación
 * Redirige a login si el usuario no está autenticado
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private router = inject(Router);
  private authService = inject(AuthService);

  canActivate(): boolean | UrlTree {
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/login']);
    }
    return true;
  }
}

/**
 * Guard para /mi-plan: solo requiere autenticación.
 * El componente GeneratedPlanViewComponent gestiona internamente
 * si debe mostrar el plan, redirigir a onboarding, etc.
 */
@Injectable({
  providedIn: 'root'
})
export class OnboardingGuard implements CanActivate {
  private router = inject(Router);
  private authService = inject(AuthService);

  canActivate(): boolean | UrlTree {
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/login']);
    }
    return true;
  }
}

/**
 * Guard para la ruta de onboarding.
 * Solo requiere autenticación; el componente OnboardingComponent
 * gestiona internamente si ya hay plan activo y redirige a /mi-plan.
 */
@Injectable({
  providedIn: 'root'
})
export class OnboardingCompleteGuard implements CanActivate {
  private router = inject(Router);
  private authService = inject(AuthService);

  canActivate(): boolean | UrlTree {
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/login']);
    }
    return true;
  }
}

/**
 * Guard para rutas que solo requieren autenticación
 * Usado para: /registro, /progreso, /perfil
 */
@Injectable({
  providedIn: 'root'
})
export class RequiresAuthGuard implements CanActivate {
  private router = inject(Router);
  private authService = inject(AuthService);

  canActivate(): boolean | UrlTree {
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/login']);
    }
    return true;
  }
}
