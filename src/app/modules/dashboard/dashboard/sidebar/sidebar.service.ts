import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private _isCollapsed = new BehaviorSubject<boolean>(false);
  private _isMobile = new BehaviorSubject<boolean>(false);
  private _sidebarOpen = new BehaviorSubject<boolean>(false);

  public isCollapsed$ = this._isCollapsed.asObservable();
  public isMobile$ = this._isMobile.asObservable();
  public sidebarOpen$ = this._sidebarOpen.asObservable();

  get isCollapsed(): boolean {
    return this._isCollapsed.value;
  }

  get isMobile(): boolean {
    return this._isMobile.value;
  }

  get sidebarOpen(): boolean {
    return this._sidebarOpen.value;
  }

  setCollapsed(collapsed: boolean): void {
    this._isCollapsed.next(collapsed);
  }

  setMobile(mobile: boolean): void {
    this._isMobile.next(mobile);
  }

  setSidebarOpen(open: boolean): void {
    this._sidebarOpen.next(open);
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      this.setSidebarOpen(!this.sidebarOpen);
    } else {
      this.setCollapsed(!this.isCollapsed);
    }
  }

  closeSidebarOnMobile(): void {
    if (this.isMobile) {
      this.setSidebarOpen(false);
    }
  }
}