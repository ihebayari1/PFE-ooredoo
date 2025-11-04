import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';

import { EnterpriseService } from '../../core/services/enterprise.service';
import { UserService } from '../../core/services/user.service';
import { RegionService } from '../../core/services/region.service';
import { ZoneService } from '../../core/services/zone.service';
import { SectorService } from '../../core/services/sector.service';
import { POSService } from '../../core/services/pos.service';
import { RoleService } from '../../core/services/role.service';
import { RoleActionService } from '../../core/services/role-action.service';
import { FlashService } from '../../core/services/flash.service';
import { ComponentService } from '../../core/services/component.service';

@Component({
  selector: 'app-main-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatToolbarModule
  ],
  templateUrl: './main-admin-dashboard.component.html',
  styleUrls: ['./main-admin-dashboard.component.scss']
})
export class MainAdminDashboardComponent implements OnInit {
  isLoading = false;
  stats = {
    enterprises: 0,
    users: 0,
    regions: 0,
    zones: 0,
    sectors: 0,
    pos: 0,
    roles: 0,
    roleActions: 0,
    flashes: 0,
    components: 0
  };

  managementModules = [
    {
      title: 'Enterprise Management',
      description: 'Manage enterprise organizations, managers, and user assignments',
      icon: 'business',
      route: '/management/enterprises',
      color: 'primary',
      stats: 'enterprises'
    },
    {
      title: 'User Management',
      description: 'Manage system users, roles, and organizational assignments',
      icon: 'people',
      route: '/management/users',
      color: 'accent',
      stats: 'users'
    },
    {
      title: 'Region Management',
      description: 'Manage geographical regions and their zone hierarchy',
      icon: 'location_on',
      route: '/management/regions',
      color: 'primary',
      stats: 'regions'
    },
    {
      title: 'Zone Management',
      description: 'Manage zones within regions and sector assignments',
      icon: 'place',
      route: '/management/zones',
      color: 'accent',
      stats: 'zones'
    },
    {
      title: 'Sector Management',
      description: 'Manage sectors within zones and POS assignments',
      icon: 'domain',
      route: '/management/sectors',
      color: 'primary',
      stats: 'sectors'
    },
    {
      title: 'POS Management',
      description: 'Manage point of sale locations and user assignments',
      icon: 'store',
      route: '/management/pos',
      color: 'accent',
      stats: 'pos'
    },
    {
      title: 'Role Management',
      description: 'Manage user roles and permission assignments',
      icon: 'security',
      route: '/management/roles',
      color: 'primary',
      stats: 'roles'
    },
    {
      title: 'Role Action Management',
      description: 'Define system permissions and action keys',
      icon: 'task',
      route: '/management/role-actions',
      color: 'accent',
      stats: 'roleActions'
    },
    {
      title: 'Flash Management',
      description: 'Manage flash content with file uploads (PDF, images, videos)',
      icon: 'flash_on',
      route: '/management/flash',
      color: 'primary',
      stats: 'flashes'
    },
    {
      title: 'Component Management',
      description: 'Create and manage reusable form components',
      icon: 'widgets',
      route: '/management/components',
      color: 'accent',
      stats: 'components'
    }
  ];

  constructor(
    private enterpriseService: EnterpriseService,
    private userService: UserService,
    private regionService: RegionService,
    private zoneService: ZoneService,
    private sectorService: SectorService,
    private posService: POSService,
    private roleService: RoleService,
    private roleActionService: RoleActionService,
    private flashService: FlashService,
    private componentService: ComponentService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    
    Promise.all([
      this.enterpriseService.getAllEnterprises(0, 1000).toPromise().then(p => p?.content || []),
      this.userService.getAllUsers(0, 1000).toPromise().then(p => p?.content || []),
      this.regionService.getAllRegions(0, 1000).toPromise().then(p => p?.content || []),
      this.zoneService.getAllZones(0, 1000).toPromise().then(p => p?.content || []),
      this.sectorService.getAllSectors(0, 1000).toPromise().then(p => p?.content || []),
      this.posService.getAllPOS(0, 1000).toPromise().then(p => p?.content || []),
      this.roleService.getAllRoles(0, 1000).toPromise().then(p => p?.content || []),
      this.roleActionService.getAllRoleActions().toPromise(),
      this.flashService.getAllFlashes().toPromise(),
      this.componentService.getAllComponentsForAdmin().toPromise().then(c => c || [])
    ]).then(([enterprises, users, regions, zones, sectors, pos, roles, roleActions, flashes, components]) => {
      this.stats.enterprises = enterprises?.length || 0;
      this.stats.users = users?.length || 0;
      this.stats.regions = regions?.length || 0;
      this.stats.zones = zones?.length || 0;
      this.stats.sectors = sectors?.length || 0;
      this.stats.pos = pos?.length || 0;
      this.stats.roles = roles?.length || 0;
      this.stats.roleActions = roleActions?.length || 0;
      this.stats.flashes = flashes?.length || 0;
      this.stats.components = components?.length || 0;
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading dashboard stats:', error);
      this.isLoading = false;
    });
  }

  getStatsForModule(moduleStats: string): number {
    return this.stats[moduleStats as keyof typeof this.stats] || 0;
  }

  getStatIcon(statKey: string): string {
    const iconMap: { [key: string]: string } = {
      enterprises: 'business',
      users: 'people',
      regions: 'location_on',
      zones: 'place',
      sectors: 'domain',
      pos: 'store',
      roles: 'security',
      roleActions: 'task',
      flashes: 'flash_on',
      components: 'widgets'
    };
    return iconMap[statKey] || 'help';
  }

  getStatLabel(statKey: string): string {
    const labelMap: { [key: string]: string } = {
      enterprises: 'Enterprises',
      users: 'Users',
      regions: 'Regions',
      zones: 'Zones',
      sectors: 'Sectors',
      pos: 'POS',
      roles: 'Roles',
      roleActions: 'Actions',
      flashes: 'Flashes',
      components: 'Components'
    };
    return labelMap[statKey] || statKey;
  }
}