/**
 * Stolen from: https://stackoverflow.com/a/41187919
 */

import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { TranslateService } from '../services/translate.service';
import { ComponentCanDeactivate } from '../models/component-can-deactivate.model';

@Injectable({
  providedIn: 'root'
})
export class PendingChangesGuard implements CanDeactivate<ComponentCanDeactivate> {

  private message: string;

  constructor(private translation: TranslateService) {
    this.message = this.translation.get('PendingChangesAlert');
  }

  canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
    // if there are no pending changes, just allow deactivation; else confirm first
    return component.canDeactivate() ? true : confirm(this.message);
  }
}
