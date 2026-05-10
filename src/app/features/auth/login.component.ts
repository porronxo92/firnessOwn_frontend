import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card card">
        <h2>{{ isRegister() ? 'Crear Cuenta' : 'Iniciar Sesión' }}</h2>

        @if (error()) {
          <div class="error-msg">{{ error() }}</div>
        }

        <form (ngSubmit)="submit()">
          <div class="form-group">
            <label>Usuario</label>
            <input type="text" [(ngModel)]="username" name="username" required />
          </div>

          @if (isRegister()) {
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="email" name="email" required />
            </div>
          }

          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" [(ngModel)]="password" name="password" required />
          </div>

          <button type="submit" class="btn-primary full-width">
            {{ isRegister() ? 'Registrarse' : 'Entrar' }}
          </button>
        </form>

        <p class="toggle-text">
          {{ isRegister() ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?' }}
          <a (click)="isRegister.set(!isRegister())">
            {{ isRegister() ? 'Inicia sesión' : 'Regístrate' }}
          </a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
    }
    .login-card {
      max-width: 400px;
      width: 100%;

      h2 {
        font-size: 2rem;
        margin-bottom: 1.5rem;
        text-align: center;
      }
    }
    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        margin-bottom: 0.3rem;
        color: var(--muted);
        font-size: 0.85rem;
      }
    }
    .full-width {
      width: 100%;
      margin-top: 1rem;
    }
    .toggle-text {
      text-align: center;
      margin-top: 1.5rem;
      color: var(--muted);
      font-size: 0.85rem;

      a {
        cursor: pointer;
        color: var(--accent);
      }
    }
    .error-msg {
      background: rgba(255, 71, 87, 0.1);
      color: var(--danger);
      padding: 0.6rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.85rem;
    }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);

  isRegister = signal(false);
  error = signal('');
  username = '';
  email = '';
  password = '';

  async submit() {
    this.error.set('');
    try {
      if (this.isRegister()) {
        await this.auth.register(this.username, this.email, this.password);
      } else {
        await this.auth.login(this.username, this.password);
      }
    } catch (err: any) {
      this.error.set(err?.error?.detail || 'Error de autenticación');
    }
  }
}
