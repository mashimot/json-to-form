import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoadingAction$ = this.isLoadingSubject.asObservable();

  constructor() {}

  public isLoading(state: boolean) {
    this.isLoadingSubject.next(state);
  }
}
