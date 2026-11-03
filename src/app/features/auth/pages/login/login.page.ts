import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonText,
  IonTitle,
  IonToolbar,
  IonInputPasswordToggle,
} from '@ionic/angular';
import { AuthService } from '../../../../core/services/auth';

/**
 * Pantalla de inicio de sesión.
 * Valida el formulario en el dispositivo (respuesta inmediata al usuario) y envía
 * las credenciales al backend, que es quien valida de verdad.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonButton,
    IonText,
    IonInputPasswordToggle,
  ],
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * Mismas reglas que el LoginDto del backend: correo válido y contraseña no vacía.
   * Sin longitud mínima a propósito (ver decisión 018 del backend).
   * protected: la plantilla HTML necesita acceder al formulario.
   */
  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  /** Mensaje de error del backend para mostrar en pantalla. */
  protected readonly errorMessage = signal<string | null>(null);

  submit(): void {
    // Si hay errores, se marcan todos los campos para que el HTML los muestre
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      // replaceUrl: el botón "atrás" no vuelve al login después de entrar
      next: () => this.router.navigateByUrl('/home', { replaceUrl: true }),
      error: (err: HttpErrorResponse) => {
        // status 0: no hubo respuesta (servidor apagado, sin internet o bloqueo de CORS)
        if (err.status === 0) {
          this.errorMessage.set('No se pudo conectar con el servidor');
          return;
        }

        // Respuesta del backend: 401 → texto; 400 → arreglo de mensajes
        const message = err.error?.message;
        this.errorMessage.set(Array.isArray(message) ? message[0] : (message ?? 'Ocurrió un error inesperado'));
      },
    });
  }
}
