import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular';
import { environment } from '../../environments/environment.prod';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage implements OnInit {
  private readonly http = inject(HttpClient);

  ngOnInit(): void {
    // PRUEBA TEMPORAL: verifica que la app llega al backend. Borrar después.
    this.http.get(`${environment.apiUrl}/health`).subscribe({
      next: (res) => console.log('Backend OK:', res),
      error: (err) => console.error('Error al conectar con el backend:', err),
    });
  }

  constructor() {}
}
