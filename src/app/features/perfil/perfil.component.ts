import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { firstValueFrom } from 'rxjs';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="perfil-container">
      <div class="perfil-header">
        <h1>Mi Perfil</h1>
        <p class="subtitle">Gestiona tus datos de cuenta</p>
      </div>

      @if (loading()) {
        <div class="loading">Cargando...</div>
      } @else if (profile()) {
        <div class="perfil-grid">

          <!-- Tarjeta avatar / info -->
          <div class="card avatar-card">
            <div class="avatar">
              {{ profile()!.username.charAt(0).toUpperCase() }}
            </div>
            <div class="user-info">
              <h2>{{ profile()!.username }}</h2>
              <p class="user-email">{{ profile()!.email }}</p>
              <p class="user-since">Miembro desde {{ formatDate(profile()!.created_at) }}</p>
            </div>
            <button class="btn-danger" (click)="logout()">Cerrar sesión</button>
          </div>

          <!-- Formulario datos personales -->
          <div class="card form-card">
            <h3>Datos de cuenta</h3>

            @if (profileSuccess()) {
              <div class="alert alert-success">{{ profileSuccess() }}</div>
            }
            @if (profileError()) {
              <div class="alert alert-error">{{ profileError() }}</div>
            }

            <form (ngSubmit)="saveProfile()">
              <div class="form-group">
                <label>Nombre de usuario</label>
                <input type="text" [(ngModel)]="editUsername" name="username" required />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="editEmail" name="email" required />
              </div>
              <button type="submit" class="btn-primary" [disabled]="saving()">
                {{ saving() ? 'Guardando…' : 'Guardar cambios' }}
              </button>
            </form>
          </div>

          <!-- Formulario cambiar contraseña -->
          <div class="card form-card">
            <h3>Cambiar contraseña</h3>

            @if (passwordSuccess()) {
              <div class="alert alert-success">{{ passwordSuccess() }}</div>
            }
            @if (passwordError()) {
              <div class="alert alert-error">{{ passwordError() }}</div>
            }

            <form (ngSubmit)="changePassword()">
              <div class="form-group">
                <label>Contraseña actual</label>
                <input type="password" [(ngModel)]="currentPassword" name="currentPassword" required />
              </div>
              <div class="form-group">
                <label>Nueva contraseña</label>
                <input type="password" [(ngModel)]="newPassword" name="newPassword" required minlength="6" />
              </div>
              <div class="form-group">
                <label>Confirmar nueva contraseña</label>
                <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required />
              </div>
              <button type="submit" class="btn-primary" [disabled]="changingPassword()">
                {{ changingPassword() ? 'Actualizando…' : 'Cambiar contraseña' }}
              </button>
            </form>
          </div>

        </div>
      }
    </div>
  `,
  styles: [`
    .perfil-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }

    .perfil-header {
      margin-bottom: 2rem;

      h1 {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 2.5rem;
        letter-spacing: 0.05em;
        color: var(--text);
      }

      .subtitle {
        color: var(--muted);
        margin-top: 0.25rem;
      }
    }

    .loading {
      color: var(--muted);
      padding: 2rem;
      text-align: center;
    }

    .perfil-grid {
      display: grid;
      grid-template-columns: 280px 1fr;
      grid-template-rows: auto auto;
      gap: 1.5rem;

      .avatar-card {
        grid-row: 1 / 3;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1rem;
        padding: 2rem 1.5rem;
      }
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--accent);
      color: #09090f;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-info {
      h2 {
        font-size: 1.3rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
      }

      .user-email {
        color: var(--muted);
        font-size: 0.85rem;
        margin-bottom: 0.25rem;
      }

      .user-since {
        color: var(--muted);
        font-size: 0.75rem;
        font-family: 'JetBrains Mono', monospace;
      }
    }

    .form-card {
      h3 {
        font-size: 1rem;
        font-weight: 700;
        margin-bottom: 1.25rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--muted);
      }
    }

    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        margin-bottom: 0.3rem;
        color: var(--muted);
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }

    .alert {
      padding: 0.6rem 0.9rem;
      border-radius: 6px;
      font-size: 0.85rem;
      margin-bottom: 1rem;

      &.alert-success {
        background: rgba(46, 213, 115, 0.12);
        color: var(--success);
        border: 1px solid rgba(46, 213, 115, 0.3);
      }

      &.alert-error {
        background: rgba(255, 71, 87, 0.1);
        color: var(--danger);
        border: 1px solid rgba(255, 71, 87, 0.25);
      }
    }

    .btn-danger {
      width: 100%;
      padding: 0.6rem 1rem;
      background: transparent;
      color: var(--danger);
      border: 1px solid rgba(255, 71, 87, 0.4);
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s;
      margin-top: auto;

      &:hover {
        background: rgba(255, 71, 87, 0.1);
        border-color: var(--danger);
      }
    }

    @media (max-width: 700px) {
      .perfil-grid {
        grid-template-columns: 1fr;

        .avatar-card {
          grid-row: auto;
        }
      }
    }
  `]
})
export class PerfilComponent implements OnInit {
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);

  profile = signal<UserProfile | null>(null);
  loading = signal(true);
  saving = signal(false);
  changingPassword = signal(false);

  editUsername = '';
  editEmail = '';
  profileSuccess = signal('');
  profileError = signal('');

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordSuccess = signal('');
  passwordError = signal('');

  async ngOnInit() {
    try {
      const p = await firstValueFrom(this.api.get<UserProfile>('/auth/me'));
      this.profile.set(p);
      this.editUsername = p.username;
      this.editEmail = p.email;
    } catch {
      this.router.navigate(['/login']);
    } finally {
      this.loading.set(false);
    }
  }

  async saveProfile() {
    this.profileSuccess.set('');
    this.profileError.set('');
    this.saving.set(true);
    try {
      const updated = await firstValueFrom(
        this.api.put<UserProfile>('/auth/me', {
          username: this.editUsername,
          email: this.editEmail
        })
      );
      this.profile.set(updated);
      await this.auth.refreshUser();
      this.profileSuccess.set('Datos actualizados correctamente.');
    } catch (err: any) {
      this.profileError.set(err?.error?.detail || 'Error al guardar los cambios.');
    } finally {
      this.saving.set(false);
    }
  }

  async changePassword() {
    this.passwordSuccess.set('');
    this.passwordError.set('');

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('Las contraseñas no coinciden.');
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordError.set('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.changingPassword.set(true);
    try {
      await firstValueFrom(
        this.api.put<void>('/auth/me/password', {
          current_password: this.currentPassword,
          new_password: this.newPassword
        })
      );
      this.passwordSuccess.set('Contraseña actualizada correctamente.');
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    } catch (err: any) {
      this.passwordError.set(err?.error?.detail || 'Error al cambiar la contraseña.');
    } finally {
      this.changingPassword.set(false);
    }
  }

  logout() {
    this.auth.logout();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }
}
