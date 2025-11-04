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

import { Sector, POS, Zone, User } from '../../core/models/enterprise.model';
import { SectorService } from '../../core/services/sector.service';
import { ZoneService } from '../../core/services/zone.service';
import { UserService } from '../../core/services/user.service';
import { DialogService } from '../../shared/services/dialog.service';

@Component({
  selector: 'app-sector-management',
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
  templateUrl: './sector-management.component.html',
  styleUrls: ['./sector-management.component.scss']
})
export class SectorManagementComponent implements OnInit {
  sectors: Sector[] = [];
  zones: Zone[] = [];
  users: User[] = [];
  displayedColumns: string[] = ['name', 'zone', 'headOfSector', 'posCount', 'createdDate', 'actions'];
  isLoading = false;
  showCreateForm = false;
  showEditForm = false;
  selectedSector: Sector | null = null;

  sectorForm: FormGroup;

  constructor(
    private sectorService: SectorService,
    private zoneService: ZoneService,
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogService: DialogService
  ) {
    this.sectorForm = this.fb.group({
      sectorName: ['', Validators.required],
      zoneId: [null, Validators.required],
      headOfSectorId: [null]
    });
  }

  ngOnInit(): void {
    this.loadSectors();
    this.loadZones();
    this.loadUsers();
  }

  loadSectors(): void {
    this.isLoading = true;
    this.sectorService.getAllSectors().subscribe({
      next: (page) => {
        this.sectors = page.content;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sectors:', error);
        this.snackBar.open('Error loading sectors', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadZones(): void {
    this.zoneService.getAllZones().subscribe({
      next: (page) => {
        this.zones = page.content;
      },
      error: (error) => {
        console.error('Error loading zones:', error);
      }
    });
  }

  loadUsers(): void {
    this.userService.getAvailableHeadsByRole('HEAD_OF_SECTOR').subscribe({
      next: (page) => {
        this.users = page.content;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  onCreateSector(): void {
    this.showCreateForm = true;
    this.sectorForm.reset();
  }

  onEditSector(sector: Sector): void {
    this.selectedSector = sector;
    this.showEditForm = true;
    this.sectorForm.patchValue({
      sectorName: sector.sectorName,
      zoneId: sector.zone?.id,
      headOfSectorId: sector.headOfSector?.id
    });
  }

  onSubmitForm(): void {
    if (this.sectorForm.valid) {
      const formData = this.sectorForm.value;
      
      if (this.showCreateForm) {
        this.createSector(formData);
      } else if (this.showEditForm && this.selectedSector) {
        this.updateSector(this.selectedSector.id!, formData);
      }
    }
  }

  createSector(formData: any): void {
    const sectorData: any = {
      sectorName: formData.sectorName,
      zone: { id: formData.zoneId }
    };
    
    // Add headOfSector if provided
    if (formData.headOfSectorId) {
      sectorData.headOfSector = { id: formData.headOfSectorId };
    }
    
    this.sectorService.createSector(sectorData).subscribe({
      next: (sector) => {
        this.snackBar.open('Sector created successfully', 'Close', { duration: 3000 });
        this.loadSectors();
        this.showCreateForm = false;
        this.sectorForm.reset();
      },
      error: (error) => {
        console.error('Error creating sector:', error);
        let errorMessage = 'Failed to create sector. Please check your input and try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 400) {
          errorMessage = 'Invalid sector data. Please check all required fields.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to create sectors.';
        } else if (error.status === 409) {
          errorMessage = 'A sector with this name already exists. Please use a different name.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  updateSector(id: number, formData: any): void {
    const sectorData: any = {
      sectorName: formData.sectorName,
      zone: { id: formData.zoneId }
    };
    
    // Add headOfSector if provided
    if (formData.headOfSectorId) {
      sectorData.headOfSector = { id: formData.headOfSectorId };
    }
    
    this.sectorService.updateSector(id, sectorData).subscribe({
      next: (sector) => {
        this.snackBar.open('Sector updated successfully', 'Close', { duration: 3000 });
        this.loadSectors();
        this.showEditForm = false;
        this.selectedSector = null;
        this.sectorForm.reset();
      },
      error: (error) => {
        console.error('Error updating sector:', error);
        let errorMessage = 'Failed to update sector. Please check your input and try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 400) {
          errorMessage = 'Invalid sector data. Please check all required fields.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to update this sector.';
        } else if (error.status === 404) {
          errorMessage = 'Sector not found. It may have been deleted.';
        } else if (error.status === 0 || error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  onDeleteSector(sector: Sector): void {
    this.dialogService.confirm({
      title: 'Delete Sector',
      message: `Are you sure you want to delete "${sector.sectorName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.sectorService.deleteSector(sector.id!).subscribe({
        next: () => {
          this.snackBar.open('Sector deleted successfully', 'Close', { duration: 3000 });
          this.loadSectors();
        },
        error: (error) => {
          console.error('Error deleting sector:', error);
          let errorMessage = 'Failed to delete sector. Please try again.';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to delete this sector.';
          } else if (error.status === 404) {
            errorMessage = 'Sector not found. It may have already been deleted.';
          } else if (error.status === 409) {
            errorMessage = 'Cannot delete sector. It may have associated POS. Please remove them first.';
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
    this.selectedSector = null;
    this.sectorForm.reset();
  }

  getZoneName(sector: Sector): string {
    return sector.zone?.zoneName || 'No Zone';
  }

  getHeadName(sector: Sector): string {
    return sector.headOfSector ? `${sector.headOfSector.first_Name} ${sector.headOfSector.last_Name}` : 'No Head';
  }

  getPOSCount(sector: Sector): number {
    return sector.posInSector ? sector.posInSector.length : 0;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  loadPOSForSector(sector: Sector): void {
    if (!sector.id) return;
    this.sectorService.getPOSBySectorId(sector.id).subscribe({
      next: (pos: POS[]) => {
        sector.posInSector = pos;
      },
      error: (error: any) => {
        console.error('Error loading POS:', error);
      }
    });
  }
}
