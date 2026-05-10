import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  access_token: string;
  token_type: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  onboardingCompleted?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = environment.apiUrl;

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());
  needsOnboarding = computed(() => {
    const user = this.currentUser();
    return user !== null && !user.onboardingCompleted;
  });

  constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      this.loadUser();
    }
  }

  async login(username: string, password: string): Promise<void> {
    const response = await firstValueFrom(this.http.post<AuthResponse>(
      `${this.baseUrl}/auth/login`,
      { username, password }
    ));

    if (response) {
      localStorage.setItem('token', response.access_token);
      await this.loadUser();
      
      // Redirigir según estado de onboarding
      if (this.needsOnboarding()) {
        this.router.navigate(['/onboarding']);
      } else {
        this.router.navigate(['/plan']);
      }
    }
  }

  async register(username: string, email: string, password: string): Promise<void> {
    await firstValueFrom(this.http.post(
      `${this.baseUrl}/auth/register`,
      { username, email, password }
    ));
    await this.login(username, password);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async loadUser(): Promise<void> {
    try {
      const user = await firstValueFrom(this.http.get<User>(
        `${this.baseUrl}/auth/me`,
        { headers: { Authorization: `Bearer ${this.getToken()}` } }
      ));
      if (user) {
        this.currentUser.set(user);
      }
    } catch {
      this.logout();
    }
  }

  async refreshUser(): Promise<void> {
    await this.loadUser();
  }

  markOnboardingComplete(): void {
    const user = this.currentUser();
    if (user) {
      this.currentUser.set({ ...user, onboardingCompleted: true });
    }
  }
}
