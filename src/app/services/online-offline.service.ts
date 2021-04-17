import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OnlineOfflineService {

  private statusConnect$ = new Subject<boolean>();

  constructor() { 
    window.addEventListener('online', () => this.atualizaStatusConnexao());
    window.addEventListener('offline', () => this.atualizaStatusConnexao());
  }

  get isOnline(): boolean {
    return !!window.navigator.onLine;
  }

  get statusConnect(): Observable<boolean>{
    return this.statusConnect$.asObservable();
  } 

  atualizaStatusConnexao() {
    this.statusConnect$.next(this.isOnline);
  }
}
