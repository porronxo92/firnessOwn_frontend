# 🎨 Training Tracker — Frontend Angular

Aplicación web progresiva (PWA) construida con Angular 17+ para el seguimiento personalizado de entrenamientos de fuerza e hipertrofia. Interfaz moderna con tema oscuro neón y visualizaciones interactivas.

## 🛠 Stack Tecnológico

- **Angular** 17+ — Framework principal (standalone components)
- **TypeScript** 5+ — Lenguaje tipado
- **RxJS** — Programación reactiva
- **Angular Signals** — Gestión de estado reactivo
- **Chart.js / ng2-charts** — Gráficos de progresión
- **SCSS** — Estilos con variables CSS
- **HttpClient** — Cliente HTTP con interceptores
- **Angular Router** — Navegación SPA

## 📦 Instalación

### Requisitos
- Node.js 18+ y npm
- Angular CLI 17+

### Setup

```bash
# Instalar Angular CLI globalmente (si no está instalado)
npm install -g @angular/cli

# Instalar dependencias
npm install
```

### Configuración

Editar `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'  // URL del backend
};
```

Para producción, editar `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend.railway.app/api'
};
```

## 🚀 Ejecución

### Desarrollo

```bash
# Servidor de desarrollo con recarga automática
ng serve

# Con host y puerto custom
ng serve --host 0.0.0.0 --port 4200

# Abrir navegador automáticamente
ng serve --open
```

Acceder a: **http://localhost:4200**

### Build de Producción

```bash
# Build optimizado
ng build --configuration production

# Output en: dist/frontend/browser/
```

### Preview de Build

```bash
# Servir build de producción localmente
npx http-server dist/frontend/browser -p 4200
```

## 📁 Estructura del Proyecto

```
frontend/src/
├── app/
│   ├── app.component.ts          # Componente raíz
│   ├── app.routes.ts             # Configuración de rutas
│   ├── app.config.ts             # Configuración de app (providers)
│   │
│   ├── core/                     # Servicios y modelos centrales
│   │   ├── guards/
│   │   │   └── onboarding.guard.ts    # Protección de rutas
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts    # Interceptor JWT
│   │   ├── models/
│   │   │   ├── phase.model.ts         # Interfaces TypeScript
│   │   │   ├── exercise.model.ts
│   │   │   ├── log.model.ts
│   │   │   └── ...
│   │   └── services/
│   │       ├── api.service.ts         # Cliente HTTP base
│   │       ├── auth.service.ts        # Autenticación y JWT
│   │       ├── phase.service.ts       # Gestión de fases
│   │       ├── log.service.ts         # Logs de entrenamiento
│   │       └── stats.service.ts       # Estadísticas y progreso
│   │
│   ├── features/                 # Componentes por funcionalidad
│   │   ├── auth/
│   │   │   └── login.component.ts
│   │   ├── onboarding/
│   │   │   └── onboarding.component.ts
│   │   ├── plan/
│   │   │   ├── plan.component.ts           # Vista principal del plan
│   │   │   ├── anatomy-modal/
│   │   │   ├── phase-header/
│   │   │   ├── week-grid/
│   │   │   └── session-table/
│   │   ├── registro/
│   │   │   ├── registro.component.ts       # Vista de logs
│   │   │   └── log-modal/
│   │   └── progreso/
│   │       ├── progreso.component.ts       # Vista de estadísticas
│   │       └── progress-chart/
│   │
│   └── shared/                   # Componentes compartidos
│       ├── components/
│       └── pipes/
│
├── assets/                       # Imágenes, iconos, fuentes
├── environments/                 # Configuración por entorno
├── styles/
│   └── theme.scss               # Variables y tema global
└── index.html
```

## 🎨 Sistema de Diseño

### Paleta de Colores

```scss
:root {
  // Backgrounds
  --bg: #09090f;            // Background principal
  --surface: #111118;       // Tarjetas y contenedores
  --surface2: #18181f;      // Elevación 2
  --border: #1e1e2a;        // Bordes

  // Colores de Sesión
  --accent: #e8ff47;        // Amarillo neón (accent principal)
  --pull: #47c4ff;          // Azul (sesiones de tracción)
  --push: #ff6b47;          // Naranja (sesiones de empuje)
  --legs: #b47fff;          // Violeta (sesiones de pierna)
  --cardio: #47ffb4;        // Verde (sesiones cardio)
  --core: #ffd147;          // Dorado (core)

  // Texto
  --text: #f0f0f5;          // Texto principal
  --muted: #555566;         // Texto secundario
}
```

### Tipografía

- **Bebas Neue** → Títulos y headings (bold, mayúsculas)
- **DM Sans** → Cuerpo de texto (regular, medium)
- **JetBrains Mono** → Datos numéricos, pesos, métricas

### Componentes

Los componentes siguen el patrón standalone de Angular 17+:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss'
})
export class ExampleComponent {
  // Usar signals para estado reactivo
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);
}
```

## 🔌 Servicios Principales

### AuthService

```typescript
// Login
authService.login(username, password).subscribe(token => {
  // Token guardado automáticamente
});

// Usuario actual (signal)
const user = authService.currentUser();

// Logout
authService.logout();
```

### PhaseService

```typescript
// Obtener todas las fases
phaseService.getPhases().subscribe(phases => { ... });

// Obtener ejercicios de una fase
phaseService.getPhaseWithExercises(phaseId, sessionType).subscribe(exercises => { ... });
```

### LogService

```typescript
// Crear log de entrenamiento
logService.createLog({
  exerciseId: 1,
  logDate: '2026-05-10',
  weightKg: 75.5,
  setsDone: 4,
  repsDone: '8,8,7,7',
  rirActual: '2'
}).subscribe(log => { ... });

// Obtener logs recientes
logService.getRecentLogs(7).subscribe(logs => { ... });
```

### StatsService

```typescript
// Progreso de un ejercicio
statsService.getProgress(exerciseId, limit).subscribe(progress => {
  console.log(progress.trend); // 'up', 'down', 'stable'
  console.log(progress.deltaKg); // Incremento total
});

// PRs personales
statsService.getMaxes().subscribe(maxes => { ... });
```

## 🧭 Rutas

```typescript
const routes: Routes = [
  { path: '', redirectTo: 'plan', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'onboarding', 
    component: OnboardingComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'plan', 
    component: PlanComponent,
    canActivate: [AuthGuard, OnboardingGuard]
  },
  { 
    path: 'registro', 
    component: RegistroComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'progreso', 
    component: ProgresoComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'plan' }
];
```

## 🔐 Autenticación

El `AuthInterceptor` añade automáticamente el token JWT a todas las peticiones:

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    // ...
  ]
};
```

El token se guarda en `localStorage` y se incluye en el header:
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

## 📊 Gráficos de Progreso

Usando Chart.js con ng2-charts:

```bash
npm install chart.js ng2-charts
```

```typescript
import { BaseChartDirective } from 'ng2-charts';

export class ProgressChartComponent {
  chartData: ChartData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3'],
    datasets: [{
      label: 'Peso (kg)',
      data: [60, 65, 70],
      borderColor: 'var(--pull)',
      tension: 0.3
    }]
  };
}
```

```html
<canvas baseChart [data]="chartData" type="line"></canvas>
```

## 🧪 Testing (TODO)

```bash
# Unit tests con Karma
ng test

# End-to-end tests con Cypress
npm run e2e
```

## 🐳 Docker

### Build

```bash
docker build -t training-tracker-frontend .
```

### Run

```bash
docker run -p 4200:4200 training-tracker-frontend
```

O usar `docker-compose.yml` desde la raíz:

```bash
docker-compose up frontend
```

## 🌐 Despliegue

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Configuración en vercel.json:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/frontend/browser"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**Environment Variables en Vercel:**
- `API_URL` → URL del backend (ej: `https://tu-backend.railway.app/api`)

### Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist/frontend/browser
```

**netlify.toml:**

```toml
[build]
  command = "ng build --configuration production"
  publish = "dist/frontend/browser"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Firebase Hosting

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy
ng build --configuration production
firebase deploy
```

## 🎯 Funcionalidades Principales

### 1. Vista de Plan
- Selector de 4 fases (Adaptación, Acumulación, Intensificación, Resolución)
- Grid semanal (L-D) con días clicables
- Tabla de ejercicios por sesión (Pull/Push/Legs/Cardio)
- Modal anatómico con SVG interactivo
- Botón de logging por ejercicio

### 2. Registro de Entrenamientos
- Modal de log con form reactivo
- Historial de últimas 5 entradas por ejercicio
- Pre-relleno con última carga registrada
- Edición y eliminación de logs
- Sugerencias de progresión basadas en RIR

### 3. Vista de Progreso
- Gráficos de barras/línea por ejercicio
- Filtros por fase y tipo de sesión
- Tarjetas de resumen (PRs, deltas, % mejora)
- Tendencia visual (↑ up / ↓ down / → stable)
- Cálculo de 1RM estimado (fórmula Epley)

### 4. Modal Anatómico
- SVG inline con músculos coloreados
- Grupos: back, chest, legs, glutes, shoulders, arms
- Leyenda: principal / sinergista / estabilizador
- Descripción de músculos implicados

## 🔧 Scripts Útiles

```json
{
  "scripts": {
    "start": "ng serve",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "lint": "ng lint"
  }
}
```

## 🐛 Troubleshooting

### Error CORS en desarrollo

Si el backend está en puerto distinto y hay errores CORS:

```typescript
// proxy.conf.json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true
  }
}
```

```bash
ng serve --proxy-config proxy.conf.json
```

### Error de importación de módulos

```
Error: 'NgModule' is not part of the '@angular/core' public API
```

**Solución:** Asegurar que todos los componentes son standalone y no usan NgModules.

### Signals no actualizan la vista

```typescript
// ❌ Mal
this.count = 5;

// ✅ Bien
this.count.set(5);
// o
this.count.update(val => val + 1);
```

## 📚 Recursos

- [Angular Docs](https://angular.dev)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Chart.js Docs](https://www.chartjs.org)
- [SCSS Docs](https://sass-lang.com/documentation)

## 📄 Licencia

Proyecto personal de uso privado.

## 👤 Autor

Frontend desarrollado para Training Tracker — Plan de Fuerza Personal.

---

**Versión:** 1.0.0  
**Última actualización:** Mayo 2026
