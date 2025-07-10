
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SidebarService } from '../sidebar/sidebar.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
 isCollapsed = false;
  isMobile = false;
  sidebarOpen = false;
  isDropdownOpen = false;
  currentRoute = '';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private sidebarService: SidebarService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkScreenSize();
    this.subscribeToServices();
    this.subscribeToRouteChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private subscribeToServices() {
    this.subscriptions.push(
      this.sidebarService.isCollapsed$.subscribe(collapsed => {
        this.isCollapsed = collapsed;
      }),
      this.sidebarService.isMobile$.subscribe(mobile => {
        this.isMobile = mobile;
      }),
      this.sidebarService.sidebarOpen$.subscribe(open => {
        this.sidebarOpen = open;
      })
    );
  }

  private subscribeToRouteChanges() {
    // this.subscriptions.push(
    //   this.router.events.pipe(
    //     filter(event => event instanceof NavigationEnd)
    //   ).subscribe((event: NavigationEnd) => {
    //     this.currentRoute = event.urlAfterRedirects;
    //     this.closeDropdown();
    //   })
    // );
  }

  checkScreenSize() {
    const isMobile = window.innerWidth < 1024;
    this.sidebarService.setMobile(isMobile);
    
    if (isMobile) {
      this.sidebarService.setSidebarOpen(false);
    }
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  closeSidebarOnMobile() {
    this.sidebarService.closeSidebarOnMobile();
  }

  isRouteActive(route: string): boolean {
    return this.currentRoute.includes(route);
  }

  logout() {
    // Implement logout logic
    this.router.navigate(['/login']);
  }
}
