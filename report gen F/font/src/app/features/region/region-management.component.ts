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

import { Region, Zone, User } from '../../core/models/enterprise.model';
import { RegionService } from '../../core/services/region.service';
import { UserService } from '../../core/services/user.service';
import { DialogService } from '../../shared/services/dialog.service';

@Component({
  selector: 'app-region-management',
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
  templateUrl: './region-management.component.html',
  styleUrls: ['./region-management.component.scss']
})
export class RegionManagementComponent implements OnInit {
  regions: Region[] = [];
  zones: Zone[] = [];
  users: User[] = [];
  displayedColumns: string[] = ['name', 'headOfRegion', 'zonesCount', 'createdDate', 'actions'];
  isLoading = false;
  showCreateForm = false;
  showEditForm = false;
  selectedRegion: Region | null = null;

  regionForm: FormGroup;

  constructor(
    private regionService: RegionService,
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogService: DialogService
  ) {
    this.regionForm = this.fb.group({
      regionName: ['', Validators.required],
      headOfRegionId: [null]
    });
  }

  ngOnInit(): void {
    this.loadRegions();
    this.loadUsers();
  }

  loadRegions(): void {
    this.isLoading = true;
    this.regionService.getAllRegions().subscribe({
      next: (page) => {
        this.regions = page.content;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading regions:', error);
        let errorMessage = 'Failed to load regions. Please refresh the page.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to view regions.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
        this.isLoading = false;
      }
    });
  }

  loadUsers(): void {
    this.userService.getAvailableHeadsByRole('HEAD_OF_REGION').subscribe({
      next: (page) => {
        this.users = page.content;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  onCreateRegion(): void {
    this.showCreateForm = true;
    this.regionForm.reset();
  }

  onEditRegion(region: Region): void {
    this.selectedRegion = region;
    this.showEditForm = true;
    this.regionForm.patchValue({
      regionName: region.regionName,
      headOfRegionId: region.headOfRegion?.id
    });
  }

  onSubmitForm(): void {
    if (this.regionForm.valid) {
      const formData = this.regionForm.value;
      
      if (this.showCreateForm) {
        this.createRegion(formData);
      } else if (this.showEditForm && this.selectedRegion) {
        this.updateRegion(this.selectedRegion.id!, formData);
      }
    }
  }

  createRegion(formData: any): void {
    const regionData: any = {
      regionName: formData.regionName
    };
    
    // Add headOfRegion if provided
    if (formData.headOfRegionId) {
      regionData.headOfRegion = { id: formData.headOfRegionId };
    }
    
    this.regionService.createRegion(regionData).subscribe({
      next: (region) => {
        this.snackBar.open('Region created successfully', 'Close', { duration: 3000 });
        this.loadRegions();
        this.showCreateForm = false;
        this.regionForm.reset();
      },
      error: (error) => {
        console.error('Error creating region:', error);
        let errorMessage = 'Failed to create region. Please check your input and try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 400) {
          errorMessage = 'Invalid region data. Please check all required fields.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to create regions.';
        } else if (error.status === 409) {
          errorMessage = 'A region with this name already exists. Please use a different name.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  updateRegion(id: number, formData: any): void {
    const regionData: any = {
      regionName: formData.regionName
    };
    
    // Add headOfRegion if provided
    if (formData.headOfRegionId) {
      regionData.headOfRegion = { id: formData.headOfRegionId };
    }
    
    this.regionService.updateRegion(id, regionData).subscribe({
      next: (region) => {
        this.snackBar.open('Region updated successfully', 'Close', { duration: 3000 });
        this.loadRegions();
        this.showEditForm = false;
        this.selectedRegion = null;
        this.regionForm.reset();
      },
      error: (error) => {
        console.error('Error updating region:', error);
        let errorMessage = 'Failed to update region. Please check your input and try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 400) {
          errorMessage = 'Invalid region data. Please check all required fields.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to update this region.';
        } else if (error.status === 404) {
          errorMessage = 'Region not found. It may have been deleted.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  onDeleteRegion(region: Region): void {
    this.dialogService.confirm({
      title: 'Delete Region',
      message: `Are you sure you want to delete "${region.regionName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.regionService.deleteRegion(region.id!).subscribe({
        next: () => {
          this.snackBar.open('Region deleted successfully', 'Close', { duration: 3000 });
          this.loadRegions();
        },
      error: (error) => {
        console.error('Error deleting region:', error);
        let errorMessage = 'Failed to delete region. Please try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to delete this region.';
        } else if (error.status === 404) {
          errorMessage = 'Region not found. It may have already been deleted.';
        } else if (error.status === 409) {
          errorMessage = 'Cannot delete region. It may have associated zones. Please remove them first.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
        });
      }
    });
  }

  onAssignHead(region: Region, userId: number): void {
    this.regionService.assignHeadToRegion(region.id!, userId).subscribe({
      next: (updatedRegion) => {
        this.snackBar.open('Head assigned to region successfully', 'Close', { duration: 3000 });
        this.loadRegions();
      },
      error: (error) => {
        console.error('Error assigning head:', error);
        let errorMessage = 'Failed to assign head to region. Please try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to assign heads to regions.';
        } else if (error.status === 404) {
          errorMessage = 'User or region not found.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  loadZonesForRegion(region: Region): void {
    this.regionService.getZonesByRegionId(region.id!).subscribe({
      next: (zones: Zone[]) => {
        region.zones = zones;
      },
      error: (error: any) => {
        console.error('Error loading zones:', error);
      }
    });
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.selectedRegion = null;
    this.regionForm.reset();
  }

  getHeadName(region: Region): string {
    return region.headOfRegion ? `${region.headOfRegion.first_Name} ${region.headOfRegion.last_Name}` : 'No Head';
  }

  getZonesCount(region: Region): number {
    return region.zones ? region.zones.length : 0;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }
}
