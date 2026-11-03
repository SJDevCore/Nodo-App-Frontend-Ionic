import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { computed, inject, Service, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';
import { User } from '../models/user.model';
import { Preferences } from '@capacitor/preferences';

/** Clave con la que se guarda el token en el almacenamiento del dispositivo. */
const TOKEN_KEY = 'auth_token';
/**
 * Autenticación del usuario: registro, inicio de sesión y manejo del token.
 * Es un servicio raíz (una sola instancia en toda la app).
 */

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/auth`;
  private readonly token = signal<string | null>(null);

  /** Indica si el usuario está autenticado. */
  readonly isLoggedIn = computed(() => !!this.token());

  /** Registra un usuario nuevo. POST /auth/register */
  register(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.url}/register`, data);
  }

  /** Inicia sesión con credenciales existentes. POST /auth/login */
  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/login`, data).pipe(
      tap((response) => {
        this.token.set(response.accessToken);
        Preferences.set({ key: TOKEN_KEY, value: response.accessToken });
      }),
    );
  }
  /** Obtiene el token de autenticación. */
  getToken(): string | null {
    return this.token();
  }

  /**
   * Cierra la sesión: borra el token de memoria y del dispositivo.
   * Es async para que quien lo llame pueda esperar a que termine antes de navegar al login.
   */
  async logout(): Promise<void> {
    this.token.set(null);
    await Preferences.remove({ key: TOKEN_KEY });
  }
  /**
   * Recupera la sesión guardada en el dispositivo y la carga en memoria.
   * Debe llamarse al arrancar la app, antes de mostrar cualquier pantalla,
   * para que el usuario que ya había iniciado sesión no tenga que volver a hacerlo.
   */
  async loadSession(): Promise<void> {
    const { value } = await Preferences.get({ key: TOKEN_KEY });

    if (value) {
      this.token.set(value);
    }
  }
}
