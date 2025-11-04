import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';

import { Zone, Sector, Region, User } from '../../core/models/enterprise.model';
import { ZoneService } from '../../core/services/zone.service';
import { RegionService } from '../../core/services/region.service';
import { UserService } from '../../core/services/user.service';
import { DialogService } from '../../shared/services/dialog.service';

@Component({
  selector: 'app-zone-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatExpansionModule
  ],
  templateUrl: './zone-management.component.html',
  styleUrls: ['./zone-management.component.scss']
})
export class ZoneManagementComponent implements OnInit {
  zones: Zone[] = [];
  regions: Region[] = [];
  users: User[] = [];
  displayedColumns: string[] = ['name', 'region', 'headOfZone', 'sectorsCount', 'createdDate', 'actions'];
  isLoading = false;
  showCreateForm = false;
  showEditForm = false;
  selectedZone: Zone | null = null;

  zoneForm: FormGroup;

  constructor(
    private zoneService: ZoneService,
    private regionService: RegionService,
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogService: DialogService
  ) {
    this.zoneForm = this.fb.group({
      zoneName: ['', Validators.required],
      regionId: [null, Validators.required],
      headOfZoneId: [null]
    });
  }

  ngOnInit(): void {
    this.loadZones();
    this.loadRegions();
    this.loadUsers();
  }

  loadZones(): void {
    this.isLoading = true;
    this.zoneService.getAllZones().subscribe({
      next: (page) => {
        this.zones = page.content;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading zones:', error);
        this.snackBar.open('Error loading zones', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadRegions(): void {
    this.regionService.getAllRegions().subscribe({
      next: (page) => {
        this.regions = page.content;
      },
      error: (error) => {
        console.error('Error loading regions:', error);
      }
    });
  }

  loadUsers(): void {
    this.userService.getAvailableHeadsByRole('HEAD_OF_ZONE').subscribe({
      next: (page) => {
        this.users = page.content;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  onCreateZone(): void {
    this.showCreateForm = true;
    this.zoneForm.reset();
  }

  onEditZone(zone: Zone): void {
    this.selectedZone = zone;
    this.showEditForm = true;
    this.zoneForm.patchValue({
      zoneName: zone.zoneName,
      regionId: zone.region?.id,
      headOfZoneId: zone.headOfZone?.id
    });
  }

  onSubmitForm(): void {
    if (this.zoneForm.valid) {
      const formData = this.zoneForm.value;
      
      if (this.showCreateForm) {
        this.createZone(formData);
      } else if (this.showEditForm && this.selectedZone) {
        this.updateZone(this.selectedZone.id!, formData);
      }
    }
  }

  createZone(formData: any): void {
    const zoneData: any = {
      zoneName: formData.zoneName,
      region: { id: formData.regionId }
    };
    
    // Add headOfZone if provided
    if (formData.headOfZoneId) {
      zoneData.headOfZone = { id: formData.headOfZoneId };
    }
    
    this.zoneService.createZone(zoneData).subscribe({
      next: (zone) => {
        this.snackBar.open('Zone created successfully', 'Close', { duration: 3000 });
        this.loadZones();
        this.showCreateForm = false;
        this.zoneForm.reset();
      },
      error: (error) => {
        console.error('Error creating zone:', error);
        let errorMessage = 'Failed to create zone. Please check your input and try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 400) {
          errorMessage = 'Invalid zone data. Please check all required fields.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to create zones.';
        } else if (error.status === 409) {
          errorMessage = 'A zone with this name already exists. Please use a different name.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  updateZone(id: number, formData: any): void {
    const zoneData: any = {
      zoneName: formData.zoneName,
      region: { id: formData.regionId }
    };
    
    // Add headOfZone if provided
    if (formData.headOfZoneId) {
      zoneData.headOfZone = { id: formData.headOfZoneId };
    }
    
    this.zoneService.updateZone(id, zoneData).subscribe({
      next: (zone) => {
        this.snackBar.open('Zone updated successfully', 'Close', { duration: 3000 });
        this.loadZones();
        this.showEditForm = false;
        this.selectedZone = null;
        this.zoneForm.reset();
      },
      error: (error) => {
        console.error('Error updating zone:', error);
        let errorMessage = 'Failed to update zone. Please check your input and try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 400) {
          errorMessage = 'Invalid zone data. Please check all required fields.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to update this zone.';
        } else if (error.status === 404) {
          errorMessage = 'Zone not found. It may have been deleted.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  onDeleteZone(zone: Zone): void {
    this.dialogService.confirm({
      title: 'Delete Zone',
      message: `Are you sure you want to delete "${zone.zoneName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.zoneService.deleteZone(zone.id!).subscribe({
        next: () => {
          this.snackBar.open('Zone deleted successfully', 'Close', { duration: 3000 });
          this.loadZones();
        },
        error: (error) => {
          console.error('Error deleting zone:', error);
          let errorMessage = 'Failed to delete zone. Please try again.';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to delete this zone.';
          } else if (error.status === 404) {
            errorMessage = 'Zone not found. It may have already been deleted.';
          } else if (error.status === 409) {
            errorMessage = 'Cannot delete zone. It may have associated sectors. Please remove them first.';
          } else if (error.status === 0 || error.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }
          
          this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
        }
        });
      }
    });
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.selectedZone = null;
    this.zoneForm.reset();
  }

  getRegionName(zone: Zone): string {
    return zone.region?.regionName || 'No Region';
  }

  getHeadName(zone: Zone): string {
    return zone.headOfZone ? `${zone.headOfZone.first_Name} ${zone.headOfZone.last_Name}` : 'No Head';
  }

  getSectorsCount(zone: Zone): number {
    return zone.sectors ? zone.sectors.length : 0;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  loadSectorsForZone(zone: Zone): void {
    if (!zone.id) return;
    this.zoneService.getSectorsByZoneId(zone.id).subscribe({
      next: (sectors: Sector[]) => {
        zone.sectors = sectors;
      },
      error: (error: any) => {
        console.error('Error loading sectors:', error);
      }
    });
  }
}
