import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { OnboardingService } from '../../core/services/onboarding.service';
import {
  Gender,
  Goal,
  TrainingPeriod,
  FitnessLevel,
  DietType,
  BikeType,
  DayOfWeek,
  GOAL_OPTIONS,
  FITNESS_LEVEL_OPTIONS,
  TRAINING_PERIOD_OPTIONS,
  DIET_OPTIONS,
  EQUIPMENT_OPTIONS,
  TRAINING_TYPE_OPTIONS,
  DAYS_OF_WEEK
} from '../../core/models/user-profile.model';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="onboarding-container">
      <!-- Progress Bar -->
      <div class="progress-bar">
        <div class="progress-track">
          <div class="progress-fill" [style.width.%]="progressPercentage()"></div>
        </div>
        <div class="step-indicators">
          @for (step of steps; track step.number) {
            <div 
              class="step-indicator" 
              [class.active]="currentStep() === step.number"
              [class.completed]="currentStep() > step.number"
              (click)="canNavigateToStep(step.number) && goToStep(step.number)"
            >
              <span class="step-number">{{ step.number }}</span>
              <span class="step-label">{{ step.label }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Step Content -->
      <div class="step-content">
        @switch (currentStep()) {
          @case (1) {
            <!-- Paso 1: Datos Físicos -->
            <div class="step-panel">
              <h2>Cuéntanos sobre ti</h2>
              <p class="step-description">Estos datos nos ayudarán a personalizar tu plan de entrenamiento.</p>
              
              <form [formGroup]="step1Form" class="form-grid">
                <div class="form-group">
                  <label for="age">Edad</label>
                  <input 
                    type="number" 
                    id="age" 
                    formControlName="age" 
                    placeholder="Ej: 30"
                    min="14" 
                    max="100"
                  >
                </div>

                <div class="form-group">
                  <label>Género</label>
                  <div class="radio-group">
                    @for (option of genderOptions; track option.value) {
                      <label class="radio-option" [class.selected]="step1Form.get('gender')?.value === option.value">
                        <input type="radio" formControlName="gender" [value]="option.value">
                        <span>{{ option.label }}</span>
                      </label>
                    }
                  </div>
                </div>

                <div class="form-group">
                  <label for="height">Altura (cm)</label>
                  <input 
                    type="number" 
                    id="height" 
                    formControlName="heightCm" 
                    placeholder="Ej: 175"
                    min="100"
                    max="250"
                  >
                </div>

                <div class="form-group">
                  <label for="weight">Peso actual (kg)</label>
                  <input 
                    type="number" 
                    id="weight" 
                    formControlName="weightKg" 
                    placeholder="Ej: 75"
                    min="30"
                    max="300"
                    step="0.1"
                  >
                </div>

                <div class="form-group full-width">
                  <label for="bodyFat">% Grasa corporal (opcional)</label>
                  <input 
                    type="number" 
                    id="bodyFat" 
                    formControlName="bodyFatPercentage" 
                    placeholder="Ej: 18"
                    min="3"
                    max="60"
                    step="0.1"
                  >
                  <small>Si no lo conoces, déjalo vacío</small>
                </div>
              </form>
            </div>
          }

          @case (2) {
            <!-- Paso 2: Objetivos -->
            <div class="step-panel">
              <h2>¿Cuál es tu objetivo principal?</h2>
              <p class="step-description">Selecciona el objetivo que más se ajuste a lo que quieres conseguir.</p>
              
              <form [formGroup]="step2Form">
                <div class="goal-grid">
                  @for (goal of goalOptions; track goal.value) {
                    <div 
                      class="goal-card" 
                      [class.selected]="step2Form.get('primaryGoal')?.value === goal.value"
                      (click)="selectGoal(goal.value)"
                    >
                      <div class="goal-icon">{{ getGoalIcon(goal.value) }}</div>
                      <h3>{{ goal.label }}</h3>
                      <p>{{ goal.description }}</p>
                    </div>
                  }
                </div>

                <div class="form-group" style="margin-top: 2rem;">
                  <label>Objetivos secundarios (opcional)</label>
                  <div class="checkbox-group">
                    @for (goal of goalOptions; track goal.value) {
                      @if (goal.value !== step2Form.get('primaryGoal')?.value) {
                        <label class="checkbox-option" [class.selected]="isSecondaryGoalSelected(goal.value)">
                          <input 
                            type="checkbox" 
                            [checked]="isSecondaryGoalSelected(goal.value)"
                            (change)="toggleSecondaryGoal(goal.value)"
                          >
                          <span>{{ goal.label }}</span>
                        </label>
                      }
                    }
                  </div>
                </div>

                @if (showTargetWeight()) {
                  <div class="form-group" style="margin-top: 1.5rem;">
                    <label for="targetWeight">Peso objetivo (kg)</label>
                    <input 
                      type="number" 
                      id="targetWeight" 
                      formControlName="targetWeightKg" 
                      placeholder="Ej: 70"
                      min="30"
                      max="200"
                      step="0.1"
                    >
                  </div>
                }
              </form>
            </div>
          }

          @case (3) {
            <!-- Paso 3: Disponibilidad -->
            <div class="step-panel">
              <h2>¿Cuánto tiempo puedes dedicar?</h2>
              <p class="step-description">Adaptaremos el plan a tu disponibilidad real.</p>
              
              <form [formGroup]="step3Form">
                <div class="form-group">
                  <label>Días de entrenamiento por semana</label>
                  <div class="number-selector">
                    @for (num of [1,2,3,4,5,6,7]; track num) {
                      <button 
                        type="button"
                        class="number-btn"
                        [class.selected]="step3Form.get('trainingDaysPerWeek')?.value === num"
                        (click)="selectTrainingDays(num)"
                      >
                        {{ num }}
                      </button>
                    }
                  </div>
                </div>

                <div class="form-group">
                  <label>¿Qué días prefieres entrenar?</label>
                  <div class="days-selector">
                    @for (day of daysOfWeek; track day.value) {
                      <button 
                        type="button"
                        class="day-btn"
                        [class.selected]="isPreferredDaySelected(day.value)"
                        (click)="togglePreferredDay(day.value)"
                      >
                        {{ day.short }}
                      </button>
                    }
                  </div>
                </div>

                <div class="form-group">
                  <label for="sessionDuration">Duración de cada sesión (minutos)</label>
                  <input 
                    type="range" 
                    id="sessionDuration" 
                    formControlName="sessionDurationMinutes"
                    min="15"
                    max="120"
                    step="15"
                  >
                  <div class="range-value">{{ step3Form.get('sessionDurationMinutes')?.value }} min</div>
                </div>

                <div class="form-group">
                  <label>Duración del plan</label>
                  <div class="period-cards">
                    @for (period of trainingPeriodOptions; track period.value) {
                      <div 
                        class="period-card"
                        [class.selected]="step3Form.get('trainingPeriod')?.value === period.value"
                        (click)="selectTrainingPeriod(period.value)"
                      >
                        <h4>{{ period.label }}</h4>
                        <span>{{ period.weeks }}</span>
                      </div>
                    }
                  </div>
                </div>

                @if (showEventFields()) {
                  <div class="form-group">
                    <label for="eventName">Nombre del evento (opcional)</label>
                    <input 
                      type="text" 
                      id="eventName" 
                      formControlName="targetEventName" 
                      placeholder="Ej: Maratón de Madrid"
                    >
                  </div>
                  <div class="form-group">
                    <label for="eventDate">Fecha del evento</label>
                    <input 
                      type="date" 
                      id="eventDate" 
                      formControlName="targetEventDate"
                    >
                  </div>
                }
              </form>
            </div>
          }

          @case (4) {
            <!-- Paso 4: Recursos -->
            <div class="step-panel">
              <h2>¿Qué recursos tienes disponibles?</h2>
              <p class="step-description">Adaptaremos los ejercicios a lo que tengas acceso.</p>
              
              <form [formGroup]="step4Form">
                <div class="resource-toggles">
                  <label class="toggle-card" [class.active]="step4Form.get('hasGymAccess')?.value">
                    <input type="checkbox" formControlName="hasGymAccess">
                    <div class="toggle-content">
                      <span class="toggle-icon">🏋️</span>
                      <span class="toggle-label">Acceso a gimnasio</span>
                    </div>
                  </label>

                  <label class="toggle-card" [class.active]="step4Form.get('hasHomeEquipment')?.value">
                    <input type="checkbox" formControlName="hasHomeEquipment">
                    <div class="toggle-content">
                      <span class="toggle-icon">🏠</span>
                      <span class="toggle-label">Equipamiento en casa</span>
                    </div>
                  </label>

                  <label class="toggle-card" [class.active]="step4Form.get('hasBike')?.value">
                    <input type="checkbox" formControlName="hasBike">
                    <div class="toggle-content">
                      <span class="toggle-icon">🚴</span>
                      <span class="toggle-label">Bicicleta</span>
                    </div>
                  </label>

                  <label class="toggle-card" [class.active]="step4Form.get('hasRunningGear')?.value">
                    <input type="checkbox" formControlName="hasRunningGear">
                    <div class="toggle-content">
                      <span class="toggle-icon">🏃</span>
                      <span class="toggle-label">Equipamiento running</span>
                    </div>
                  </label>

                  <label class="toggle-card" [class.active]="step4Form.get('outdoorSpaceAvailable')?.value">
                    <input type="checkbox" formControlName="outdoorSpaceAvailable">
                    <div class="toggle-content">
                      <span class="toggle-icon">🌳</span>
                      <span class="toggle-label">Espacio al aire libre</span>
                    </div>
                  </label>

                  <label class="toggle-card" [class.active]="step4Form.get('poolAccess')?.value">
                    <input type="checkbox" formControlName="poolAccess">
                    <div class="toggle-content">
                      <span class="toggle-icon">🏊</span>
                      <span class="toggle-label">Acceso a piscina</span>
                    </div>
                  </label>
                </div>

                @if (step4Form.get('hasHomeEquipment')?.value) {
                  <div class="form-group" style="margin-top: 1.5rem;">
                    <label>¿Qué equipamiento tienes en casa?</label>
                    <div class="equipment-grid">
                      @for (equip of equipmentOptions; track equip) {
                        <label class="checkbox-option" [class.selected]="isEquipmentSelected(equip)">
                          <input 
                            type="checkbox" 
                            [checked]="isEquipmentSelected(equip)"
                            (change)="toggleEquipment(equip)"
                          >
                          <span>{{ equip }}</span>
                        </label>
                      }
                    </div>
                  </div>
                }

                @if (step4Form.get('hasBike')?.value) {
                  <div class="form-group" style="margin-top: 1.5rem;">
                    <label>Tipo de bicicleta</label>
                    <div class="radio-group">
                      @for (type of bikeTypes; track type.value) {
                        <label class="radio-option" [class.selected]="step4Form.get('bikeType')?.value === type.value">
                          <input type="radio" formControlName="bikeType" [value]="type.value">
                          <span>{{ type.label }}</span>
                        </label>
                      }
                    </div>
                  </div>
                }
              </form>
            </div>
          }

          @case (5) {
            <!-- Paso 5: Experiencia -->
            <div class="step-panel">
              <h2>¿Cuál es tu nivel de experiencia?</h2>
              <p class="step-description">Esto nos ayuda a ajustar la intensidad inicial.</p>
              
              <form [formGroup]="step5Form">
                <div class="level-cards">
                  @for (level of fitnessLevelOptions; track level.value) {
                    <div 
                      class="level-card"
                      [class.selected]="step5Form.get('fitnessLevel')?.value === level.value"
                      (click)="selectFitnessLevel(level.value)"
                    >
                      <div class="level-icon">{{ getLevelIcon(level.value) }}</div>
                      <h3>{{ level.label }}</h3>
                      <p>{{ level.description }}</p>
                    </div>
                  }
                </div>

                <div class="form-group" style="margin-top: 2rem;">
                  <label for="yearsTraining">Años entrenando (aproximado)</label>
                  <input 
                    type="number" 
                    id="yearsTraining" 
                    formControlName="yearsTraining"
                    placeholder="Ej: 2"
                    min="0"
                    max="50"
                    step="0.5"
                  >
                </div>

                <div class="form-group">
                  <label for="injuries">Lesiones previas (opcional)</label>
                  <textarea 
                    id="injuries" 
                    formControlName="previousInjuries"
                    placeholder="Ej: Esguince de tobillo hace 2 años, ya recuperado"
                    rows="3"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label for="health">Condiciones de salud a tener en cuenta (opcional)</label>
                  <textarea 
                    id="health" 
                    formControlName="healthConditions"
                    placeholder="Ej: Hipertensión controlada con medicación"
                    rows="3"
                  ></textarea>
                </div>
              </form>
            </div>
          }

          @case (6) {
            <!-- Paso 6: Alimentación y preferencias -->
            <div class="step-panel">
              <h2>Alimentación y preferencias</h2>
              <p class="step-description">Información adicional para personalizar tu plan.</p>
              
              <form [formGroup]="step6Form">
                <div class="form-group">
                  <label>Tipo de dieta</label>
                  <div class="radio-group">
                    @for (diet of dietOptions; track diet.value) {
                      <label class="radio-option" [class.selected]="step6Form.get('dietType')?.value === diet.value">
                        <input type="radio" formControlName="dietType" [value]="diet.value">
                        <span>{{ diet.label }}</span>
                      </label>
                    }
                  </div>
                </div>

                <div class="form-group">
                  <label for="meals">Comidas al día</label>
                  <input 
                    type="number" 
                    id="meals" 
                    formControlName="mealsPerDay"
                    placeholder="Ej: 4"
                    min="1"
                    max="8"
                  >
                </div>

                <div class="form-group">
                  <label>Tipos de entrenamiento preferidos</label>
                  <div class="checkbox-group">
                    @for (type of trainingTypeOptions; track type) {
                      <label class="checkbox-option" [class.selected]="isTrainingTypeSelected(type)">
                        <input 
                          type="checkbox" 
                          [checked]="isTrainingTypeSelected(type)"
                          (change)="toggleTrainingType(type)"
                        >
                        <span>{{ type }}</span>
                      </label>
                    }
                  </div>
                </div>

                <div class="form-group">
                  <label for="disliked">Ejercicios que prefieres evitar (opcional)</label>
                  <textarea 
                    id="disliked" 
                    formControlName="dislikedExercises"
                    placeholder="Ej: Burpees, correr en cinta..."
                    rows="2"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label for="favorite">Ejercicios favoritos (opcional)</label>
                  <textarea 
                    id="favorite" 
                    formControlName="favoriteExercises"
                    placeholder="Ej: Sentadillas, dominadas..."
                    rows="2"
                  ></textarea>
                </div>
              </form>
            </div>
          }

          @case (7) {
            <!-- Paso 7: Resumen y Generación -->
            <div class="step-panel summary-panel">
              <h2>¡Todo listo!</h2>
              <p class="step-description">Hemos recopilado toda la información. Ahora generaremos tu plan personalizado con IA.</p>
              
              <div class="summary-card">
                <h3>Resumen de tu perfil</h3>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="label">Objetivo principal</span>
                    <span class="value">{{ getGoalLabel(step2Form.get('primaryGoal')?.value) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Días de entrenamiento</span>
                    <span class="value">{{ step3Form.get('trainingDaysPerWeek')?.value }} días/semana</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Duración del plan</span>
                    <span class="value">{{ getTrainingPeriodLabel(step3Form.get('trainingPeriod')?.value) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Nivel</span>
                    <span class="value">{{ getFitnessLevelLabel(step5Form.get('fitnessLevel')?.value) }}</span>
                  </div>
                </div>
              </div>

              @if (!isGenerating() && !planGenerated()) {
                <button class="generate-btn" (click)="generatePlan()">
                  <span class="btn-icon">✨</span>
                  Generar mi plan con IA
                </button>
              }

              @if (isGenerating()) {
                <div class="generating-state">
                  <div class="spinner"></div>
                  <h3>Tu plan personalizado con IA está siendo creado</h3>
                  <p>
                    Nuestro sistema está analizando tu perfil, objetivos, disponibilidad y recursos
                    para diseñar un programa de entrenamiento completamente adaptado a ti.
                    Esto puede tardar entre 1 y 3 minutos.
                  </p>
                  <p class="generating-hint">No cierres esta ventana. Te avisaremos cuando esté listo.</p>
                </div>
              }

              @if (planGenerated()) {
                <div class="success-state">
                  <div class="success-icon">🎉</div>
                  <h3>¡Tu plan está listo!</h3>
                  <p>Hemos creado un plan de {{ generatedPlan()?.totalWeeks }} semanas adaptado a ti.</p>
                  <button class="start-btn" (click)="goToPlan()">
                    Comenzar entrenamiento
                  </button>
                </div>
              }

              @if (generationError()) {
                <div class="error-state">
                  <div class="error-icon">⚠️</div>
                  <h3>Error al generar el plan</h3>
                  <p>{{ generationError() }}</p>
                  <button class="retry-btn" (click)="generatePlan()">
                    Reintentar
                  </button>
                </div>
              }
            </div>
          }
        }
      </div>

      <!-- Navigation Buttons -->
      @if (currentStep() < 7) {
        <div class="navigation-buttons">
          @if (currentStep() > 1) {
            <button class="btn-secondary" (click)="previousStep()">
              ← Anterior
            </button>
          }
          <button 
            class="btn-primary" 
            [disabled]="!canProceed()"
            (click)="nextStep()"
          >
            {{ currentStep() === 6 ? 'Finalizar' : 'Siguiente →' }}
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .onboarding-container {
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      padding: 2rem;
      max-width: 900px;
      margin: 0 auto;
    }

    /* Progress Bar */
    .progress-bar {
      margin-bottom: 3rem;
    }

    .progress-track {
      height: 4px;
      background: var(--surface2);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 1rem;
    }

    .progress-fill {
      height: 100%;
      background: var(--accent);
      transition: width 0.3s ease;
    }

    .step-indicators {
      display: flex;
      justify-content: space-between;
    }

    .step-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      opacity: 0.5;
      transition: opacity 0.2s;
    }

    .step-indicator.active, .step-indicator.completed {
      opacity: 1;
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--surface2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .step-indicator.active .step-number {
      background: var(--accent);
      color: var(--bg);
    }

    .step-indicator.completed .step-number {
      background: var(--accent);
      color: var(--bg);
    }

    .step-indicator.completed .step-number::after {
      content: '✓';
    }

    .step-label {
      font-size: 0.75rem;
      color: var(--muted);
    }

    .step-indicator.active .step-label {
      color: var(--text);
    }

    /* Step Content */
    .step-panel {
      background: var(--surface);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .step-panel h2 {
      font-family: var(--font-header);
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: var(--accent);
    }

    .step-description {
      color: var(--muted);
      margin-bottom: 2rem;
    }

    /* Forms */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: span 2;
    }

    .form-group label {
      font-weight: 500;
      color: var(--text);
    }

    .form-group small {
      color: var(--muted);
      font-size: 0.75rem;
    }

    input[type="text"],
    input[type="number"],
    input[type="date"],
    textarea {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      color: var(--text);
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    input:focus, textarea:focus {
      outline: none;
      border-color: var(--accent);
    }

    input[type="range"] {
      width: 100%;
      accent-color: var(--accent);
    }

    .range-value {
      text-align: center;
      font-family: var(--font-mono);
      color: var(--accent);
      font-size: 1.25rem;
      margin-top: 0.5rem;
    }

    /* Radio & Checkbox Groups */
    .radio-group, .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .radio-option, .checkbox-option {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .radio-option input, .checkbox-option input {
      display: none;
    }

    .radio-option.selected, .checkbox-option.selected {
      background: var(--accent);
      color: var(--bg);
      border-color: var(--accent);
    }

    /* Goal Grid */
    .goal-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .goal-card {
      background: var(--surface2);
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }

    .goal-card:hover {
      border-color: var(--accent);
    }

    .goal-card.selected {
      border-color: var(--accent);
      background: rgba(255, 95, 31, 0.1);
    }

    .goal-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .goal-card h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
    }

    .goal-card p {
      color: var(--muted);
      font-size: 0.875rem;
      margin: 0;
    }

    /* Number Selector */
    .number-selector {
      display: flex;
      gap: 0.5rem;
    }

    .number-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--surface2);
      border: 2px solid var(--border);
      color: var(--text);
      font-size: 1.25rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .number-btn:hover {
      border-color: var(--accent);
    }

    .number-btn.selected {
      background: var(--accent);
      color: var(--bg);
      border-color: var(--accent);
    }

    /* Days Selector */
    .days-selector {
      display: flex;
      gap: 0.5rem;
    }

    .day-btn {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      background: var(--surface2);
      border: 2px solid var(--border);
      color: var(--text);
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }

    .day-btn:hover {
      border-color: var(--accent);
    }

    .day-btn.selected {
      background: var(--accent);
      color: var(--bg);
      border-color: var(--accent);
    }

    /* Period Cards */
    .period-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .period-card {
      background: var(--surface2);
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .period-card:hover {
      border-color: var(--accent);
    }

    .period-card.selected {
      border-color: var(--accent);
      background: rgba(255, 95, 31, 0.1);
    }

    .period-card h4 {
      margin: 0 0 0.5rem 0;
    }

    .period-card span {
      color: var(--muted);
      font-size: 0.875rem;
    }

    /* Resource Toggles */
    .resource-toggles {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }

    .toggle-card {
      background: var(--surface2);
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .toggle-card input {
      display: none;
    }

    .toggle-card.active {
      border-color: var(--accent);
      background: rgba(255, 95, 31, 0.1);
    }

    .toggle-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      text-align: center;
    }

    .toggle-icon {
      font-size: 2rem;
    }

    .toggle-label {
      font-size: 0.875rem;
    }

    /* Equipment Grid */
    .equipment-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.5rem;
    }

    /* Level Cards */
    .level-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .level-card {
      background: var(--surface2);
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .level-card:hover {
      border-color: var(--accent);
    }

    .level-card.selected {
      border-color: var(--accent);
      background: rgba(255, 95, 31, 0.1);
    }

    .level-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .level-card h3 {
      margin: 0 0 0.5rem 0;
    }

    .level-card p {
      color: var(--muted);
      font-size: 0.875rem;
      margin: 0;
    }

    /* Summary Panel */
    .summary-panel {
      text-align: center;
    }

    .summary-card {
      background: var(--surface2);
      border-radius: 12px;
      padding: 1.5rem;
      margin: 2rem 0;
      text-align: left;
    }

    .summary-card h3 {
      margin: 0 0 1rem 0;
      color: var(--accent);
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .summary-item .label {
      color: var(--muted);
      font-size: 0.875rem;
    }

    .summary-item .value {
      font-weight: 500;
    }

    /* Generate Button */
    .generate-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--accent-gradient);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      padding: 1rem 2rem;
      font-size: 1.25rem;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .generate-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(255, 95, 31, 0.35);
    }

    .btn-icon {
      font-size: 1.5rem;
    }

    /* Generating State */
    .generating-state {
      padding: 2rem;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--surface2);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1.5rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .generating-state h3 {
      color: var(--accent);
      margin-bottom: 0.5rem;
    }

    .generating-state p {
      color: var(--muted);
    }

    .generating-hint {
      color: var(--accent);
      font-size: 0.875rem;
      margin-top: 1rem;
      opacity: 0.85;
    }

    /* Success State */
    .success-state {
      padding: 2rem;
    }

    .success-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .success-state h3 {
      color: var(--accent);
      margin-bottom: 0.5rem;
    }

    .start-btn {
      background: var(--accent);
      color: var(--bg);
      border: none;
      border-radius: 12px;
      padding: 1rem 2rem;
      font-size: 1.1rem;
      font-weight: bold;
      cursor: pointer;
      margin-top: 1.5rem;
      transition: transform 0.2s;
    }

    .start-btn:hover {
      transform: translateY(-2px);
    }

    /* Error State */
    .error-state {
      padding: 2rem;
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .error-state h3 {
      color: #ff6b6b;
      margin-bottom: 0.5rem;
    }

    .retry-btn {
      background: var(--surface2);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      cursor: pointer;
      margin-top: 1rem;
    }

    /* Navigation Buttons */
    .navigation-buttons {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }

    .btn-primary, .btn-secondary {
      padding: 0.875rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--accent);
      color: var(--bg);
      border: none;
      margin-left: auto;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: transparent;
      color: var(--text);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover {
      border-color: var(--accent);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .onboarding-container {
        padding: 1rem;
      }

      .progress-bar {
        margin-bottom: 2rem;
      }

      .step-indicators {
        display: none;
      }

      .step-panel {
        padding: 1.5rem;
      }

      .step-panel h2 {
        font-size: 1.6rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .form-group.full-width {
        grid-column: span 1;
      }

      .goal-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.8rem;
      }

      .goal-card {
        padding: 1rem;
      }

      .goal-card h3 {
        font-size: 0.95rem;
      }

      .goal-card p {
        font-size: 0.8rem;
      }

      .number-selector, .days-selector {
        flex-wrap: wrap;
        justify-content: center;
      }

      .number-btn, .day-btn {
        width: 42px;
        height: 42px;
        font-size: 1rem;
      }

      .period-cards {
        grid-template-columns: 1fr;
        gap: 0.8rem;
      }

      .period-card {
        padding: 1rem;
      }

      .resource-toggles {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.8rem;
      }

      .toggle-card {
        padding: 1rem;
      }

      .toggle-icon {
        font-size: 1.5rem;
      }

      .toggle-label {
        font-size: 0.8rem;
      }

      .equipment-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .level-cards {
        grid-template-columns: 1fr;
        gap: 0.8rem;
      }

      .level-card {
        padding: 1rem;
        display: flex;
        flex-direction: row;
        align-items: center;
        text-align: left;
        gap: 1rem;
      }

      .level-icon {
        font-size: 2rem;
        margin-bottom: 0;
      }

      .level-card h3 {
        margin-bottom: 0.2rem;
      }

      .radio-group, .checkbox-group {
        gap: 0.5rem;
      }

      .radio-option, .checkbox-option {
        padding: 0.6rem 0.8rem;
        font-size: 0.9rem;
      }

      .summary-grid {
        grid-template-columns: 1fr;
        gap: 0.8rem;
      }

      .summary-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: row;
      }

      .generate-btn {
        width: 100%;
        justify-content: center;
        padding: 1rem;
        font-size: 1.1rem;
      }

      .navigation-buttons {
        flex-direction: column-reverse;
        gap: 0.8rem;
      }

      .btn-primary, .btn-secondary {
        width: 100%;
        text-align: center;
        margin-left: 0;
      }
    }

    @media (max-width: 480px) {
      .onboarding-container {
        padding: 0.75rem;
      }

      .step-panel {
        padding: 1rem;
        border-radius: 12px;
      }

      .step-panel h2 {
        font-size: 1.4rem;
      }

      .step-description {
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
      }

      .goal-grid {
        grid-template-columns: 1fr;
      }

      .goal-icon {
        font-size: 1.5rem;
      }

      .number-btn, .day-btn {
        width: 38px;
        height: 38px;
        font-size: 0.9rem;
      }

      .resource-toggles {
        grid-template-columns: 1fr;
      }

      .equipment-grid {
        grid-template-columns: 1fr;
      }

      .generating-state, .success-state, .error-state {
        padding: 1.5rem 1rem;
      }

      .success-icon {
        font-size: 3rem;
      }

      .start-btn {
        width: 100%;
        padding: 0.875rem;
      }

      textarea {
        min-height: 80px;
      }
    }
  `]
})
export class OnboardingComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private onboardingService = inject(OnboardingService);

  // Estado
  currentStep = signal(1);
  isGenerating = signal(false);
  planGenerated = signal(false);
  generatedPlan = signal<any>(null);
  generationError = signal<string | null>(null);
  /** ID del plan placeholder creado al lanzar la generación */
  pendingPlanId = signal<number | null>(null);
  /** Intervalo de polling */
  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  // Opciones
  genderOptions = [
    { value: 'male', label: 'Hombre' },
    { value: 'female', label: 'Mujer' },
    { value: 'other', label: 'Otro' },
    { value: 'prefer_not_say', label: 'Prefiero no decir' }
  ];
  goalOptions = GOAL_OPTIONS;
  fitnessLevelOptions = FITNESS_LEVEL_OPTIONS;
  trainingPeriodOptions = TRAINING_PERIOD_OPTIONS;
  dietOptions = DIET_OPTIONS;
  equipmentOptions = EQUIPMENT_OPTIONS;
  trainingTypeOptions = TRAINING_TYPE_OPTIONS;
  daysOfWeek = DAYS_OF_WEEK;
  bikeTypes = [
    { value: 'road', label: 'Carretera' },
    { value: 'mtb', label: 'Montaña' },
    { value: 'indoor', label: 'Indoor/Estática' },
    { value: 'gravel', label: 'Gravel' }
  ];

  steps = [
    { number: 1, label: 'Datos' },
    { number: 2, label: 'Objetivos' },
    { number: 3, label: 'Tiempo' },
    { number: 4, label: 'Recursos' },
    { number: 5, label: 'Nivel' },
    { number: 6, label: 'Dieta' },
    { number: 7, label: 'Generar' }
  ];

  // Formularios
  step1Form: FormGroup;
  step2Form: FormGroup;
  step3Form: FormGroup;
  step4Form: FormGroup;
  step5Form: FormGroup;
  step6Form: FormGroup;

  // Computed
  progressPercentage = computed(() => ((this.currentStep() - 1) / 6) * 100);

  constructor() {
    // Paso 1: Datos físicos
    this.step1Form = this.fb.group({
      age: [null],
      gender: [null],
      heightCm: [null],
      weightKg: [null],
      bodyFatPercentage: [null]
    });

    // Paso 2: Objetivos
    this.step2Form = this.fb.group({
      primaryGoal: [null, Validators.required],
      secondaryGoals: [[]],
      targetWeightKg: [null]
    });

    // Paso 3: Disponibilidad
    this.step3Form = this.fb.group({
      trainingDaysPerWeek: [3, Validators.required],
      preferredDays: [[]],
      sessionDurationMinutes: [60],
      trainingPeriod: ['medium', Validators.required],
      targetEventDate: [null],
      targetEventName: [null]
    });

    // Paso 4: Recursos
    this.step4Form = this.fb.group({
      hasGymAccess: [false],
      hasHomeEquipment: [false],
      homeEquipmentList: [[]],
      hasBike: [false],
      bikeType: [null],
      hasRunningGear: [true],
      outdoorSpaceAvailable: [false],
      poolAccess: [false]
    });

    // Paso 5: Experiencia
    this.step5Form = this.fb.group({
      fitnessLevel: ['intermediate', Validators.required],
      yearsTraining: [null],
      previousInjuries: [null],
      healthConditions: [null]
    });

    // Paso 6: Alimentación
    this.step6Form = this.fb.group({
      dietType: ['omnivore'],
      mealsPerDay: [null],
      tracksCalories: [false],
      dailyCalorieTarget: [null],
      proteinTargetGrams: [null],
      preferredTrainingTypes: [[]],
      dislikedExercises: [''],
      favoriteExercises: ['']
    });
  }

  ngOnInit() {
    // Si ya completó onboarding y tiene plan activo, redirigir a Mi Plan
    this.onboardingService.getOnboardingStatus(true).subscribe(status => {
      if (status.onboardingCompleted && status.hasActivePlan) {
        this.router.navigate(['/mi-plan']);
      } else if (status.nextStep > 1) {
        this.currentStep.set(status.nextStep);
      }
    });
  }

  // Navegación
  canNavigateToStep(step: number): boolean {
    return step <= this.currentStep();
  }

  goToStep(step: number) {
    if (this.canNavigateToStep(step)) {
      this.currentStep.set(step);
    }
  }

  nextStep() {
    const current = this.currentStep();
    if (current < 7 && this.canProceed()) {
      this.saveCurrentStep();
      this.currentStep.set(current + 1);
    }
  }

  previousStep() {
    const current = this.currentStep();
    if (current > 1) {
      this.currentStep.set(current - 1);
    }
  }

  canProceed(): boolean {
    const step = this.currentStep();
    switch (step) {
      case 1: return true; // Todos los campos son opcionales
      case 2: return this.step2Form.valid;
      case 3: return this.step3Form.valid;
      case 4: return true;
      case 5: return this.step5Form.valid;
      case 6: return true;
      default: return false;
    }
  }

  saveCurrentStep() {
    const step = this.currentStep();
    let observable;
    
    switch (step) {
      case 1:
        observable = this.onboardingService.submitStep1(this.step1Form.value);
        break;
      case 2:
        observable = this.onboardingService.submitStep2(this.step2Form.value);
        break;
      case 3:
        observable = this.onboardingService.submitStep3(this.step3Form.value);
        break;
      case 4:
        observable = this.onboardingService.submitStep4(this.step4Form.value);
        break;
      case 5:
        observable = this.onboardingService.submitStep5(this.step5Form.value);
        break;
      case 6:
        const step6Data = {
          ...this.step6Form.value,
          dislikedExercises: this.parseTextToArray(this.step6Form.get('dislikedExercises')?.value),
          favoriteExercises: this.parseTextToArray(this.step6Form.get('favoriteExercises')?.value)
        };
        observable = this.onboardingService.submitStep6(step6Data);
        break;
    }

    if (observable) {
      observable.subscribe({
        error: (err) => console.error('Error saving step:', err)
      });
    }
  }

  // Helpers para formularios
  selectGoal(goal: Goal) {
    this.step2Form.patchValue({ primaryGoal: goal });
    // Quitar de secundarios si estaba seleccionado
    const secondary = this.step2Form.get('secondaryGoals')?.value || [];
    this.step2Form.patchValue({ 
      secondaryGoals: secondary.filter((g: Goal) => g !== goal) 
    });
  }

  isSecondaryGoalSelected(goal: Goal): boolean {
    const secondary = this.step2Form.get('secondaryGoals')?.value || [];
    return secondary.includes(goal);
  }

  toggleSecondaryGoal(goal: Goal) {
    const secondary = this.step2Form.get('secondaryGoals')?.value || [];
    if (secondary.includes(goal)) {
      this.step2Form.patchValue({ secondaryGoals: secondary.filter((g: Goal) => g !== goal) });
    } else {
      this.step2Form.patchValue({ secondaryGoals: [...secondary, goal] });
    }
  }

  showTargetWeight(): boolean {
    const goal = this.step2Form.get('primaryGoal')?.value;
    return goal === 'weight_loss' || goal === 'hypertrophy';
  }

  selectTrainingDays(days: number) {
    this.step3Form.patchValue({ trainingDaysPerWeek: days });
  }

  isPreferredDaySelected(day: DayOfWeek): boolean {
    const days = this.step3Form.get('preferredDays')?.value || [];
    return days.includes(day);
  }

  togglePreferredDay(day: DayOfWeek) {
    const days = this.step3Form.get('preferredDays')?.value || [];
    if (days.includes(day)) {
      this.step3Form.patchValue({ preferredDays: days.filter((d: DayOfWeek) => d !== day) });
    } else {
      this.step3Form.patchValue({ preferredDays: [...days, day] });
    }
  }

  selectTrainingPeriod(period: TrainingPeriod) {
    this.step3Form.patchValue({ trainingPeriod: period });
  }

  showEventFields(): boolean {
    const goal = this.step2Form.get('primaryGoal')?.value;
    return goal === 'marathon' || goal === 'half_marathon';
  }

  isEquipmentSelected(equip: string): boolean {
    const list = this.step4Form.get('homeEquipmentList')?.value || [];
    return list.includes(equip);
  }

  toggleEquipment(equip: string) {
    const list = this.step4Form.get('homeEquipmentList')?.value || [];
    if (list.includes(equip)) {
      this.step4Form.patchValue({ homeEquipmentList: list.filter((e: string) => e !== equip) });
    } else {
      this.step4Form.patchValue({ homeEquipmentList: [...list, equip] });
    }
  }

  selectFitnessLevel(level: FitnessLevel) {
    this.step5Form.patchValue({ fitnessLevel: level });
  }

  isTrainingTypeSelected(type: string): boolean {
    const types = this.step6Form.get('preferredTrainingTypes')?.value || [];
    return types.includes(type);
  }

  toggleTrainingType(type: string) {
    const types = this.step6Form.get('preferredTrainingTypes')?.value || [];
    if (types.includes(type)) {
      this.step6Form.patchValue({ preferredTrainingTypes: types.filter((t: string) => t !== type) });
    } else {
      this.step6Form.patchValue({ preferredTrainingTypes: [...types, type] });
    }
  }

  // Icons
  getGoalIcon(goal: Goal): string {
    const icons: Record<Goal, string> = {
      hypertrophy: '💪',
      strength: '🏋️',
      weight_loss: '⚖️',
      endurance: '❤️',
      marathon: '🏃',
      half_marathon: '🏃‍♀️',
      bodyweight: '🤸',
      general_fitness: '🎯'
    };
    return icons[goal] || '🎯';
  }

  getLevelIcon(level: FitnessLevel): string {
    const icons: Record<FitnessLevel, string> = {
      beginner: '🌱',
      intermediate: '🌿',
      advanced: '🌳'
    };
    return icons[level] || '🌿';
  }

  // Labels
  getGoalLabel(goal: Goal): string {
    return this.goalOptions.find(g => g.value === goal)?.label || goal;
  }

  getTrainingPeriodLabel(period: TrainingPeriod): string {
    return this.trainingPeriodOptions.find(p => p.value === period)?.label || period;
  }

  getFitnessLevelLabel(level: FitnessLevel): string {
    return this.fitnessLevelOptions.find(l => l.value === level)?.label || level;
  }

  // Parse text to array
  parseTextToArray(text: string): string[] {
    if (!text) return [];
    return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  // Generar plan (asíncrono: el backend devuelve 202 inmediatamente)
  async generatePlan() {
    this.isGenerating.set(true);
    this.generationError.set(null);
    this.pendingPlanId.set(null);

    try {
      // Completar el onboarding si no está completo
      await firstValueFrom(this.onboardingService.completeOnboarding());

      // Lanzar generación → recibimos plan_id y 202 inmediatamente
      const accepted = await firstValueFrom(
        this.onboardingService.generatePlan({ regenerate: true })
      );
      this.pendingPlanId.set(accepted.planId);

      // Iniciar polling cada 5 segundos
      this.startPolling(accepted.planId);
    } catch (error: any) {
      this.isGenerating.set(false);
      this.generationError.set(
        error?.error?.detail || 'Error al iniciar la generación del plan. Por favor, inténtalo de nuevo.'
      );
    }
  }

  private startPolling(planId: number) {
    // Limpiar cualquier polling previo
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(async () => {
      try {
        const statusResp = await firstValueFrom(
          this.onboardingService.getGenerationStatus(planId)
        );

        if (statusResp.generationStatus === 'completed') {
          this.stopPolling();
          // Cargar el plan completo
          const plan = await firstValueFrom(
            this.onboardingService.getActivePlan(true)
          );
          this.generatedPlan.set(plan);
          this.isGenerating.set(false);
          this.planGenerated.set(true);
        } else if (statusResp.generationStatus === 'error') {
          this.stopPolling();
          this.isGenerating.set(false);
          this.generationError.set(
            statusResp.generationError || 'Error al generar el plan. Por favor, inténtalo de nuevo.'
          );
        }
        // Si sigue 'generating' o 'pending', continuamos esperando
      } catch {
        // Error de red puntual: no detener el polling, lo reintentará
      }
    }, 5000);
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  goToPlan() {
    this.stopPolling();
    this.router.navigate(['/mi-plan']);
  }
}