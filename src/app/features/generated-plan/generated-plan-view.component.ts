import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OnboardingService } from '../../core/services/onboarding.service';
import { PlanTrackingService } from '../../core/services/plan-tracking.service';
import { GeneratedPlan, WeekPlan, DayPlan, WeeklyProgress } from '../../core/models/generated-plan.model';
import { PlanExerciseWithLogs, PlanDayWithExercises, PlanWeekResponse } from '../../core/models/plan-tracking.model';
import { ExerciseLogModalComponent } from './exercise-log-modal/exercise-log-modal.component';

@Component({
  selector: 'app-generated-plan-view',
  standalone: true,
  imports: [CommonModule, ExerciseLogModalComponent],
  template: `
    <div class="generated-plan-view">
      @if (isLoading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Cargando tu plan personalizado...</p>
        </div>
      }

      @if (!isLoading() && plan()) {
        <!-- Plan Header -->
        <div class="plan-header">
          <div class="plan-info">
            <h1>{{ plan()!.name }}</h1>
            <p class="plan-description">{{ plan()!.planStructure?.overview | slice:0:200 }}</p>
          </div>
          <div class="plan-meta">
            <div class="meta-item">
              <span class="meta-label">Semana actual</span>
              <span class="meta-value">{{ plan()!.currentWeek }} / {{ plan()!.totalWeeks }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Tipo</span>
              <span class="meta-value">{{ getPlanTypeLabel(plan()!.planType) }}</span>
            </div>
          </div>
        </div>

        <!-- Week Progress Bar -->
        <div class="week-progress">
          <div class="progress-track">
            <div class="progress-fill" [style.width.%]="weekProgressPercent()"></div>
          </div>
          <div class="week-indicators">
            @for (week of weekNumbers(); track week) {
              <div 
                class="week-dot" 
                [class.completed]="week < plan()!.currentWeek"
                [class.current]="week === plan()!.currentWeek"
                [class.deload]="isDeloadWeek(week)"
                (click)="goToWeek(week)"
                [title]="'Semana ' + week"
              ></div>
            }
          </div>
        </div>

        <!-- Current Phase Info -->
        @if (currentPhase()) {
          <div class="phase-banner">
            <div class="phase-badge">{{ currentPhase()?.name }}</div>
            <span class="phase-focus">{{ currentPhase()?.focus }}</span>
          </div>
        }

        <!-- Deload Alert -->
        @if (currentWeekData()?.isDeload) {
          <div class="deload-alert">
            <span class="alert-icon">🔄</span>
            <div class="alert-content">
              <strong>Semana de descarga</strong>
              <p>Reduce el volumen y mantén la intensidad para recuperarte.</p>
            </div>
          </div>
        }

        <!-- Week View -->
        <div class="week-view">
          <div class="week-header">
            <h2>Semana {{ plan()!.currentWeek }}</h2>
            @if (currentWeekData()?.focus) {
              <span class="week-focus">{{ currentWeekData()?.focus }}</span>
            }
          </div>

          <!-- Days Grid -->
          <div class="days-grid">
            @for (day of currentWeekData()?.days || []; track day.dayNumber) {
              <div 
                class="day-card" 
                [class.rest-day]="day.type === 'rest' || day.type === 'active_recovery'"
                [class.selected]="selectedDay() === day.dayNumber"
                (click)="selectDay(day.dayNumber)"
              >
                <div class="day-header">
                  <span class="day-name">{{ day.dayName }}</span>
                  <span class="day-type-badge" [attr.data-type]="day.type">
                    {{ getTypeLabel(day.type) }}
                  </span>
                </div>
                <div class="day-preview">
                  @if (day.type === 'rest' || day.type === 'active_recovery') {
                    <span class="rest-text">{{ day.notes || 'Descanso' }}</span>
                  } @else {
                    <span class="session-name">{{ day.sessionName }}</span>
                    @if (day.durationMinutes) {
                      <span class="duration">{{ day.durationMinutes }} min</span>
                    }
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Selected Day Detail -->
        @if (selectedDayData()) {
          <div class="day-detail">
            <div class="detail-header">
              <h3>{{ selectedDayData()!.dayName }} - {{ selectedDayData()!.sessionName }}</h3>
              @if (selectedDayData()!.durationMinutes) {
                <span class="duration-badge">{{ selectedDayData()!.durationMinutes }} min</span>
              }
            </div>

            <!-- Warmup -->
            @if (selectedDayData()!.warmup?.length) {
              <div class="section warmup-section">
                <h4>🔥 Calentamiento</h4>
                <div class="warmup-list">
                  @for (item of selectedDayData()!.warmup; track item.name) {
                    <div class="warmup-item">
                      <span class="item-name">{{ item.name }}</span>
                      <span class="item-duration">{{ item.duration }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Exercises -->
            @if (selectedDayData()!.exercises?.length) {
              <div class="section exercises-section">
                <h4>💪 Ejercicios</h4>
                <div class="exercise-list">
                  @for (exercise of getExercisesWithTracking(); track exercise.name; let i = $index) {
                    <div class="exercise-card">
                      <div class="exercise-number">{{ i + 1 }}</div>
                      <div class="exercise-info">
                        <div class="exercise-header">
                          <span class="exercise-name">{{ exercise.name }}</span>
                          @if (exercise.muscleGroup) {
                            <span class="muscle-badge">{{ exercise.muscleGroup }}</span>
                          }
                        </div>
                        <div class="exercise-params">
                          <span class="param">{{ exercise.sets }} series</span>
                          <span class="param">{{ exercise.reps }} reps</span>
                          @if (exercise.rir) {
                            <span class="param">RIR {{ exercise.rir }}</span>
                          }
                          @if (exercise.restSeconds) {
                            <span class="param">{{ exercise.restSeconds }}s descanso</span>
                          }
                        </div>
                        <!-- Last weight info -->
                        @if (exercise.lastWeight || exercise.bestWeight) {
                          <div class="weight-info">
                            @if (exercise.lastWeight) {
                              <span class="weight-badge last">Último: {{ exercise.lastWeight }} kg</span>
                            }
                            @if (exercise.bestWeight && exercise.bestWeight !== exercise.lastWeight) {
                              <span class="weight-badge best">PR: {{ exercise.bestWeight }} kg</span>
                            }
                          </div>
                        }
                        @if (exercise.notes) {
                          <p class="exercise-notes">{{ exercise.notes }}</p>
                        }
                        @if (exercise.alternatives) {
                          <div class="alternatives">
                            <span class="alt-label">Alternativas:</span>
                            {{ exercise.alternatives }}
                          </div>
                        }
                      </div>
                      <button class="btn-log" (click)="openLogModal(exercise); $event.stopPropagation()">
                        Registrar
                      </button>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Cardio -->
            @if (selectedDayData()!.cardio) {
              <div class="section cardio-section">
                <h4>🏃 Cardio</h4>
                <div class="cardio-card">
                  <div class="cardio-type">{{ selectedDayData()!.cardio!.type }}</div>
                  <div class="cardio-params">
                    <span class="param">{{ selectedDayData()!.cardio!.durationMinutes }} min</span>
                    @if (selectedDayData()!.cardio!.intensity) {
                      <span class="param intensity">{{ selectedDayData()!.cardio!.intensity }}</span>
                    }
                    @if (selectedDayData()!.cardio!.distanceKm) {
                      <span class="param">{{ selectedDayData()!.cardio!.distanceKm }} km</span>
                    }
                  </div>
                  @if (selectedDayData()!.cardio!.notes) {
                    <p class="cardio-notes">{{ selectedDayData()!.cardio!.notes }}</p>
                  }
                </div>
              </div>
            }

            <!-- Cooldown -->
            @if (selectedDayData()!.cooldown?.length) {
              <div class="section cooldown-section">
                <h4>🧘 Vuelta a la calma</h4>
                <div class="cooldown-list">
                  @for (item of selectedDayData()!.cooldown; track item.name) {
                    <div class="cooldown-item">
                      <span class="item-name">{{ item.name }}</span>
                      <span class="item-duration">{{ item.duration }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Session Notes -->
            @if (selectedDayData()!.sessionNotes) {
              <div class="session-notes">
                <h4>📝 Notas</h4>
                <p>{{ selectedDayData()!.sessionNotes }}</p>
              </div>
            }

            <!-- Complete Day Button -->
            <div class="day-actions">
              <button 
                class="btn-complete-day" 
                (click)="completeCurrentDay()"
                [disabled]="isDayCompleted()"
              >
                @if (isDayCompleted()) {
                  ✓ Día completado
                } @else {
                  Completar día
                }
              </button>
            </div>
          </div>
        }

        <!-- Exercise Log Modal -->
        @if (showLogModal() && selectedExercise()) {
          <app-exercise-log-modal
            [exercise]="selectedExercise()!"
            [planId]="plan()!.id"
            (close)="closeLogModal()"
            (saved)="onLogSaved()"
          />
        }

        <!-- Weekly Goals -->
        @if (currentWeekData()?.weeklyGoals?.length) {
          <div class="weekly-goals">
            <h4>🎯 Objetivos de la semana</h4>
            <ul>
              @for (goal of currentWeekData()!.weeklyGoals; track goal) {
                <li>{{ goal }}</li>
              }
            </ul>
          </div>
        }

        <!-- Navigation Buttons -->
        <div class="week-navigation">
          <button 
            class="nav-btn prev"
            [disabled]="plan()!.currentWeek <= 1"
            (click)="previousWeek()"
          >
            ← Semana anterior
          </button>
          <button 
            class="nav-btn next"
            (click)="completeWeekAndAdvance()"
          >
            Completar semana →
          </button>
        </div>
      }

      @if (!isLoading() && !plan()) {
        <div class="no-plan-state">
          <div class="empty-icon">📋</div>
          <h2>No tienes un plan activo</h2>
          <p>Completa el onboarding para generar tu plan personalizado con IA.</p>
          <button class="cta-btn" (click)="goToOnboarding()">
            Comenzar onboarding
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .generated-plan-view {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      gap: 1rem;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--surface2);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Plan Header */
    .plan-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      gap: 2rem;
    }

    .plan-info h1 {
      font-family: var(--font-header);
      font-size: 2.5rem;
      color: var(--accent);
      margin-bottom: 0.5rem;
    }

    .plan-description {
      color: var(--muted);
      max-width: 600px;
    }

    .plan-meta {
      display: flex;
      gap: 1.5rem;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem 1.5rem;
      background: var(--surface);
      border-radius: 12px;
    }

    .meta-label {
      font-size: 0.75rem;
      color: var(--muted);
      text-transform: uppercase;
    }

    .meta-value {
      font-family: var(--font-mono);
      font-size: 1.25rem;
      font-weight: bold;
    }

    /* Week Progress */
    .week-progress {
      margin-bottom: 2rem;
    }

    .progress-track {
      height: 6px;
      background: var(--surface2);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 0.75rem;
    }

    .progress-fill {
      height: 100%;
      background: var(--accent);
      transition: width 0.3s ease;
    }

    .week-indicators {
      display: flex;
      justify-content: space-between;
    }

    .week-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--surface2);
      cursor: pointer;
      transition: all 0.2s;
    }

    .week-dot:hover {
      transform: scale(1.3);
    }

    .week-dot.completed {
      background: var(--accent);
    }

    .week-dot.current {
      background: var(--accent-secondary);
      box-shadow: 0 0 0 4px rgba(0, 112, 255, 0.3);
      animation: pulse-blue 2s ease-in-out infinite;
    }

    @keyframes pulse-blue {
      0%, 100% { box-shadow: 0 0 0 4px rgba(0, 112, 255, 0.3); }
      50% { box-shadow: 0 0 0 8px rgba(0, 112, 255, 0.15); }
    }

    .week-dot.deload {
      background: var(--cardio);
    }

    /* Phase Banner */
    .phase-banner {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      background: var(--surface);
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    .phase-badge {
      background: var(--accent);
      color: var(--bg);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: bold;
      font-size: 0.875rem;
    }

    .phase-focus {
      color: var(--muted);
    }

    /* Deload Alert */
    .deload-alert {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      background: rgba(71, 255, 180, 0.1);
      border: 1px solid var(--cardio);
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    .alert-icon {
      font-size: 1.5rem;
    }

    .alert-content strong {
      color: var(--cardio);
    }

    .alert-content p {
      color: var(--muted);
      margin-top: 0.25rem;
      font-size: 0.875rem;
    }

    /* Week View */
    .week-view {
      background: var(--surface);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .week-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .week-header h2 {
      font-family: var(--font-header);
      font-size: 1.75rem;
    }

    .week-focus {
      color: var(--muted);
      font-size: 0.875rem;
    }

    /* Days Grid */
    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.75rem;
    }

    .day-card {
      background: var(--surface2);
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .day-card:hover {
      border-color: var(--accent);
    }

    .day-card.selected {
      border-color: var(--accent);
      background: rgba(255, 95, 31, 0.1);
    }

    .day-card.rest-day {
      opacity: 0.6;
    }

    .day-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .day-name {
      font-weight: bold;
      font-size: 0.875rem;
    }

    .day-type-badge {
      font-size: 0.625rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: bold;
    }

    .day-type-badge[data-type="strength"] {
      background: var(--push);
      color: var(--bg);
    }

    .day-type-badge[data-type="cardio"] {
      background: var(--cardio);
      color: var(--bg);
    }

    .day-type-badge[data-type="rest"],
    .day-type-badge[data-type="active_recovery"] {
      background: var(--surface);
      color: var(--muted);
    }

    .day-type-badge[data-type="hybrid"] {
      background: var(--legs);
      color: var(--bg);
    }

    .day-preview {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .session-name {
      font-size: 0.75rem;
      color: var(--text);
    }

    .duration {
      font-size: 0.625rem;
      color: var(--muted);
    }

    .rest-text {
      font-size: 0.75rem;
      color: var(--muted);
    }

    /* Day Detail */
    .day-detail {
      background: var(--surface);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }

    .detail-header h3 {
      font-family: var(--font-header);
      font-size: 1.5rem;
    }

    .duration-badge {
      background: var(--accent);
      color: var(--bg);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: bold;
    }

    /* Sections */
    .section {
      margin-bottom: 1.5rem;
    }

    .section h4 {
      margin-bottom: 1rem;
      color: var(--accent);
    }

    /* Warmup/Cooldown */
    .warmup-list, .cooldown-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .warmup-item, .cooldown-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: var(--surface2);
      border-radius: 8px;
    }

    .item-duration {
      color: var(--muted);
      font-family: var(--font-mono);
    }

    /* Exercise List */
    .exercise-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .exercise-card {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: var(--surface2);
      border-radius: 12px;
    }

    .exercise-number {
      width: 32px;
      height: 32px;
      background: var(--accent);
      color: var(--bg);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
    }

    .exercise-info {
      flex: 1;
    }

    .exercise-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .exercise-name {
      font-weight: bold;
    }

    .muscle-badge {
      font-size: 0.625rem;
      padding: 0.25rem 0.5rem;
      background: var(--surface);
      border-radius: 4px;
      color: var(--muted);
      text-transform: uppercase;
    }

    .exercise-params {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .param {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      background: var(--surface);
      border-radius: 4px;
      font-family: var(--font-mono);
    }

    .exercise-notes {
      font-size: 0.875rem;
      color: var(--muted);
      margin-bottom: 0.5rem;
    }

    .alternatives {
      font-size: 0.75rem;
      color: var(--muted);
    }

    .alt-label {
      font-weight: 500;
    }

    /* Weight Info */
    .weight-info {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .weight-badge {
      font-size: 0.7rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-family: var(--font-mono);
    }

    .weight-badge.last {
      background: var(--accent);
      color: var(--bg);
    }

    .weight-badge.best {
      background: var(--cardio);
      color: var(--bg);
    }

    /* Log Button */
    .btn-log {
      background: var(--surface);
      color: var(--accent);
      border: 1px solid var(--accent);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      font-size: 0.75rem;
      white-space: nowrap;
      transition: all 0.2s;
      align-self: flex-start;
    }

    .btn-log:hover {
      background: var(--accent);
      color: var(--bg);
    }

    .exercise-card {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: var(--surface2);
      border-radius: 12px;
      align-items: flex-start;
    }

    /* Day Actions */
    .day-actions {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: center;
    }

    .btn-complete-day {
      background: var(--accent);
      color: var(--bg);
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-complete-day:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .btn-complete-day:disabled {
      background: var(--cardio);
      cursor: default;
    }

    /* Cardio */
    .cardio-card {
      padding: 1rem;
      background: var(--surface2);
      border-radius: 12px;
    }

    .cardio-type {
      font-weight: bold;
      text-transform: capitalize;
      margin-bottom: 0.5rem;
    }

    .cardio-params {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .cardio-params .intensity {
      background: var(--cardio);
      color: var(--bg);
    }

    .cardio-notes {
      font-size: 0.875rem;
      color: var(--muted);
    }

    /* Session Notes */
    .session-notes {
      padding: 1rem;
      background: rgba(255, 95, 31, 0.08);
      border-radius: 8px;
      margin-top: 1.5rem;
    }

    .session-notes h4 {
      margin-bottom: 0.5rem;
    }

    .session-notes p {
      color: var(--muted);
    }

    /* Weekly Goals */
    .weekly-goals {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .weekly-goals h4 {
      margin-bottom: 1rem;
      color: var(--accent);
    }

    .weekly-goals ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .weekly-goals li {
      padding: 0.5rem 0;
      padding-left: 1.5rem;
      position: relative;
    }

    .weekly-goals li::before {
      content: '→';
      position: absolute;
      left: 0;
      color: var(--accent);
    }

    /* Navigation */
    .week-navigation {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }

    .nav-btn {
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }

    .nav-btn.prev {
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
    }

    .nav-btn.prev:hover:not(:disabled) {
      border-color: var(--accent);
    }

    .nav-btn.prev:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .nav-btn.next {
      background: var(--accent);
      color: var(--bg);
      border: none;
    }

    .nav-btn.next:hover {
      transform: translateY(-2px);
    }

    /* No Plan State */
    .no-plan-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      text-align: center;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .no-plan-state h2 {
      font-family: var(--font-header);
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .no-plan-state p {
      color: var(--muted);
      margin-bottom: 2rem;
    }

    .cta-btn {
      background: var(--accent);
      color: var(--bg);
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .generated-plan-view {
        padding: 1rem;
      }

      .plan-header {
        flex-direction: column;
        gap: 1rem;
      }

      .plan-info h1 {
        font-size: 2rem;
      }

      .plan-meta {
        width: 100%;
        justify-content: space-between;
      }

      .meta-item {
        flex: 1;
        padding: 0.75rem;
      }

      .days-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 0.5rem;
      }

      .day-card {
        padding: 0.75rem;
      }

      .day-name {
        font-size: 0.75rem;
      }

      .day-type-badge {
        font-size: 0.5rem;
        padding: 0.15rem 0.35rem;
      }

      .session-name {
        font-size: 0.65rem;
      }

      .exercise-card {
        flex-direction: column;
        gap: 0.75rem;
      }

      .exercise-number {
        width: 28px;
        height: 28px;
        font-size: 0.875rem;
      }

      .btn-log {
        width: 100%;
        text-align: center;
      }

      .week-navigation {
        flex-direction: column;
      }

      .nav-btn {
        width: 100%;
        text-align: center;
      }
    }

    @media (max-width: 480px) {
      .plan-info h1 {
        font-size: 1.6rem;
      }

      .plan-description {
        font-size: 0.9rem;
      }

      .meta-item {
        padding: 0.5rem;
      }

      .meta-label {
        font-size: 0.65rem;
      }

      .meta-value {
        font-size: 1rem;
      }

      .week-indicators {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        gap: 4px;
      }

      .week-dot {
        width: 10px;
        height: 10px;
        flex-shrink: 0;
      }

      .phase-banner {
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
      }

      .days-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .day-preview {
        display: none;
      }

      .week-view {
        padding: 1rem;
      }

      .week-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .week-header h2 {
        font-size: 1.4rem;
      }

      .day-detail {
        padding: 1rem;
      }

      .detail-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .detail-header h3 {
        font-size: 1.2rem;
      }

      .exercise-params {
        flex-direction: column;
        gap: 0.3rem;
      }

      .param {
        display: inline-block;
      }

      .weight-info {
        flex-direction: column;
        gap: 0.3rem;
      }

      .warmup-item, .cooldown-item {
        flex-direction: column;
        gap: 0.25rem;
        text-align: left;
      }

      .weekly-goals {
        padding: 1rem;
      }

      .cta-btn {
        width: 100%;
        padding: 0.875rem 1.5rem;
      }

      .no-plan-state h2 {
        font-size: 1.6rem;
      }
    }
  `]
})
export class GeneratedPlanViewComponent implements OnInit {
  private router = inject(Router);
  private onboardingService = inject(OnboardingService);
  private trackingService = inject(PlanTrackingService);

  isLoading = signal(true);
  plan = signal<GeneratedPlan | null>(null);
  selectedDay = signal(1);

  // Tracking-related signals
  showLogModal = signal(false);
  selectedExercise = signal<PlanExerciseWithLogs | null>(null);
  trackingDayData = signal<PlanDayWithExercises | null>(null);
  trackingWeeks = signal<PlanWeekResponse[]>([]);

  weekProgressPercent = computed(() => {
    const p = this.plan();
    if (!p) return 0;
    return ((p.currentWeek - 1) / p.totalWeeks) * 100;
  });

  weekNumbers = computed(() => {
    const p = this.plan();
    if (!p) return [];
    return Array.from({ length: p.totalWeeks }, (_, i) => i + 1);
  });

  currentWeekData = computed<WeekPlan | undefined>(() => {
    const p = this.plan();
    if (!p) return undefined;
    return p.planStructure?.weeks?.find(w => w.weekNumber === p.currentWeek);
  });

  currentPhase = computed(() => {
    const p = this.plan();
    const week = this.currentWeekData();
    if (!p || !week) return null;
    
    return p.planStructure?.phases?.find(phase => 
      phase.weeks.includes(p.currentWeek)
    ) || null;
  });

  selectedDayData = computed<DayPlan | undefined>(() => {
    const week = this.currentWeekData();
    if (!week) return undefined;
    return week.days.find(d => d.dayNumber === this.selectedDay());
  });

  ngOnInit() {
    this.loadPlan();
  }

  async loadPlan() {
    this.isLoading.set(true);
    try {
      const plan = await firstValueFrom(this.onboardingService.getActivePlan());

      if (!plan) {
        // Sin plan activo: redirigir al onboarding para crearlo
        this.router.navigate(['/onboarding']);
        return;
      }

      this.plan.set(plan);

      // Populate tracking data (idempotent)
      try {
        await firstValueFrom(this.trackingService.populatePlan(plan.id));
      } catch (e) {
        // Already populated or error - continue
        console.log('Tracking tables already populated or error:', e);
      }

      // Load tracking weeks
      try {
        const weeks = await firstValueFrom(this.trackingService.getWeeks(plan.id));
        this.trackingWeeks.set(weeks);
      } catch (e) {
        console.error('Error loading tracking weeks:', e);
      }

      // Seleccionar el primer día que no sea descanso
      if (plan.planStructure?.weeks) {
        const currentWeek = plan.planStructure.weeks.find(w => w.weekNumber === plan.currentWeek);
        if (currentWeek) {
          const firstActiveDay = currentWeek.days.find(d => d.type !== 'rest' && d.type !== 'active_recovery');
          if (firstActiveDay) {
            this.selectedDay.set(firstActiveDay.dayNumber);
            await this.loadDayTracking(firstActiveDay.dayNumber);
          }
        }
      }
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadDayTracking(dayNumber: number) {
    const p = this.plan();
    if (!p) return;

    const weeks = this.trackingWeeks();
    const currentTrackingWeek = weeks.find(w => w.weekNumber === p.currentWeek);
    if (!currentTrackingWeek) return;

    try {
      const days = await firstValueFrom(this.trackingService.getWeekDays(p.id, p.currentWeek));
      const dayTracking = days.find(d => d.dayNumber === dayNumber);
      if (dayTracking) {
        const detail = await firstValueFrom(this.trackingService.getDayDetail(dayTracking.id));
        this.trackingDayData.set(detail);
      }
    } catch (e) {
      console.error('Error loading day tracking:', e);
    }
  }

  selectDay(dayNumber: number) {
    this.selectedDay.set(dayNumber);
    this.loadDayTracking(dayNumber);
  }

  goToWeek(weekNumber: number) {
    // Solo permitir ver semanas pasadas o la actual
    const p = this.plan();
    if (p && weekNumber <= p.currentWeek) {
      // En el futuro se podría mostrar el detalle de semanas pasadas
      console.log('Navigate to week', weekNumber);
    }
  }

  isDeloadWeek(weekNumber: number): boolean {
    const p = this.plan();
    if (!p) return false;
    const week = p.planStructure?.weeks?.find(w => w.weekNumber === weekNumber);
    return week?.isDeload || false;
  }

  async previousWeek() {
    // Solo para navegación visual, no cambia el progreso real
    console.log('Previous week view');
  }

  async completeWeekAndAdvance() {
    const p = this.plan();
    if (!p) return;

    try {
      const result = await firstValueFrom(this.onboardingService.advanceWeek(p.id));
      if (result?.completed) {
        // Plan completado
        alert('¡Felicidades! Has completado tu plan de entrenamiento.');
        this.router.navigate(['/progreso']);
      } else {
        // Recargar plan con nueva semana
        await this.loadPlan();
      }
    } catch (error) {
      console.error('Error advancing week:', error);
    }
  }

  goToOnboarding() {
    this.router.navigate(['/onboarding']);
  }

  getPlanTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      strength: 'Fuerza',
      running: 'Running',
      cycling: 'Ciclismo',
      hybrid: 'Híbrido',
      bodyweight: 'Peso corporal'
    };
    return labels[type] || type;
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      strength: 'Fuerza',
      cardio: 'Cardio',
      rest: 'Descanso',
      active_recovery: 'Recuperación',
      hybrid: 'Mixto'
    };
    return labels[type] || type;
  }

  // === Tracking methods ===

  getExercisesWithTracking(): PlanExerciseWithLogs[] {
    const dayTracking = this.trackingDayData();
    if (dayTracking?.exercises?.length) {
      return dayTracking.exercises;
    }
    // Fallback to plan structure exercises without tracking
    const day = this.selectedDayData();
    if (!day?.exercises) return [];
    return day.exercises.map((ex, i) => ({
      id: 0, // Not tracked yet
      dayId: 0,
      name: ex.name,
      muscleGroup: ex.muscleGroup || null,
      sets: ex.sets,
      reps: ex.reps,
      rir: ex.rir || null,
      restSeconds: ex.restSeconds || null,
      tempo: null,
      notes: ex.notes || null,
      alternatives: ex.alternatives?.join(', ') || null,
      sortOrder: i,
      logs: [],
      bestWeight: null,
      lastWeight: null,
    }));
  }

  openLogModal(exercise: PlanExerciseWithLogs) {
    if (exercise.id === 0) {
      alert('Este ejercicio aún no tiene seguimiento. Espera a que se cargue el tracking.');
      return;
    }
    this.selectedExercise.set(exercise);
    this.showLogModal.set(true);
  }

  closeLogModal() {
    this.showLogModal.set(false);
    this.selectedExercise.set(null);
  }

  async onLogSaved() {
    // Reload day tracking data to get updated weights
    await this.loadDayTracking(this.selectedDay());
  }

  isDayCompleted(): boolean {
    const dayTracking = this.trackingDayData();
    return dayTracking?.status === 'completed';
  }

  async completeCurrentDay() {
    const dayTracking = this.trackingDayData();
    if (!dayTracking || dayTracking.id === 0) {
      alert('No se puede completar el día porque no hay datos de tracking.');
      return;
    }

    try {
      await firstValueFrom(this.trackingService.completeDay(dayTracking.id));
      await this.loadDayTracking(this.selectedDay());
    } catch (e) {
      console.error('Error completing day:', e);
      alert('Error al completar el día. Inténtalo de nuevo.');
    }
  }
}
