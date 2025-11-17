import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  constructor() {}

  public isLoading(state: boolean): void {
    this.isLoadingSubject.next(state);
  }

  public getLoading(): Observable<boolean> {
    return this.isLoadingSubject.asObservable();
  }
}
