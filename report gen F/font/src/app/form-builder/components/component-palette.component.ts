import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ComponentType } from '../../core/models/form.model';

interface PaletteItem {
  type: ComponentType;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-component-palette',
  standalone: true,
  imports: [
    CommonModule,
    CdkDrag,
    CdkDropList,
    MatIconModule,
    MatCardModule,
    MatTooltipModule
  ],
  template: `
    <div class="palette-container">
      <!-- Basic Input Fields -->
      <div class="palette-section">
        <div class="section-header">
          <mat-icon>text_fields</mat-icon>
          <h4 class="section-title">Text Inputs</h4>
        </div>
        <div 
          cdkDropList 
          #paletteDropList1="cdkDropList"
          [cdkDropListData]="basicFields"
          [cdkDropListConnectedTo]="cdkDropListConnectedTo"
          cdkDropListSortingDisabled="true"
          class="palette-grid">
          <div 
            *ngFor="let item of basicFields" 
            class="palette-item"
            cdkDrag
            [cdkDragData]="item.type"
            [matTooltip]="item.description">
            <div class="item-icon">
              <mat-icon>{{ item.icon }}</mat-icon>
            </div>
            <div class="item-content">
              <span class="item-label">{{ item.label }}</span>
              <span class="item-description">{{ item.description }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Choice Fields -->
      <div class="palette-section">
        <div class="section-header">
          <mat-icon>list</mat-icon>
          <h4 class="section-title">Choice Fields</h4>
        </div>
        <div 
          cdkDropList 
          #paletteDropList2="cdkDropList"
          [cdkDropListData]="choiceFields"
          [cdkDropListConnectedTo]="cdkDropListConnectedTo"
          cdkDropListSortingDisabled="true"
          class="palette-grid">
          <div 
            *ngFor="let item of choiceFields" 
            class="palette-item"
            cdkDrag
            [cdkDragData]="item.type"
            [matTooltip]="item.description">
            <div class="item-icon">
              <mat-icon>{{ item.icon }}</mat-icon>
            </div>
            <div class="item-content">
              <span class="item-label">{{ item.label }}</span>
              <span class="item-description">{{ item.description }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Date Fields -->
      <div class="palette-section">
        <div class="section-header">
          <mat-icon>event</mat-icon>
          <h4 class="section-title">Date & Time</h4>
        </div>
        <div 
          cdkDropList 
          #paletteDropList3="cdkDropList"
          [cdkDropListData]="dateFields"
          [cdkDropListConnectedTo]="cdkDropListConnectedTo"
          cdkDropListSortingDisabled="true"
          class="palette-grid">
          <div 
            *ngFor="let item of dateFields" 
            class="palette-item"
            cdkDrag
            [cdkDragData]="item.type"
            [matTooltip]="item.description">
            <div class="item-icon">
              <mat-icon>{{ item.icon }}</mat-icon>
            </div>
            <div class="item-content">
              <span class="item-label">{{ item.label }}</span>
              <span class="item-description">{{ item.description }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Fields -->
      <div class="palette-section">
        <div class="section-header">
          <mat-icon>extension</mat-icon>
          <h4 class="section-title">Advanced</h4>
        </div>
        <div 
          cdkDropList 
          #paletteDropList4="cdkDropList"
          [cdkDropListData]="advancedFields"
          [cdkDropListConnectedTo]="cdkDropListConnectedTo"
          cdkDropListSortingDisabled="true"
          class="palette-grid">
          <div 
            *ngFor="let item of advancedFields" 
            class="palette-item"
            cdkDrag
            [cdkDragData]="item.type"
            [matTooltip]="item.description">
            <div class="item-icon">
              <mat-icon>{{ item.icon }}</mat-icon>
            </div>
            <div class="item-content">
              <span class="item-label">{{ item.label }}</span>
              <span class="item-description">{{ item.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .palette-container {
      padding: 0;
      background: transparent;
      height: 100%;
      overflow-y: auto;
    }

    .palette-section {
      margin-bottom: var(--spacing-xl);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
      padding: 0 var(--spacing-sm);
      
      mat-icon {
        color: var(--primary-red);
        font-size: 1.125rem;
        width: 1.125rem;
        height: 1.125rem;
      }
    }

    .section-title {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--gray-700);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .palette-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--spacing-sm);
    }

    .palette-item {
      display: flex;
      align-items: center;
      padding: var(--spacing-md);
      background: var(--white);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      cursor: grab;
      transition: all 0.3s ease;
      box-shadow: var(--shadow-sm);
      
      &:hover {
        border-color: var(--primary-red);
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
        background: var(--primary-red-50);
      }

      &:active {
        cursor: grabbing;
        transform: scale(0.98);
      }
    }

    .item-icon {
      width: 40px;
      height: 40px;
      background: var(--primary-red-100);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: var(--spacing-md);
      flex-shrink: 0;
      
      mat-icon {
        color: var(--primary-red);
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
      }
    }

    .item-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .item-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--gray-900);
      line-height: 1.2;
    }

    .item-description {
      font-size: 0.75rem;
      color: var(--gray-600);
      line-height: 1.3;
    }

    .palette-item.cdk-drag-preview {
      box-sizing: border-box;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      background: var(--white);
      border: 2px solid var(--primary-red);
      transform: rotate(5deg);
      z-index: 9999 !important;
      position: relative;
    }

    .palette-item.cdk-drag-placeholder {
      opacity: 0.3;
      background: var(--primary-red-100);
      border: 2px dashed var(--primary-red);
    }

    .palette-item.cdk-drag-animating {
      transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .palette-grid {
        grid-template-columns: 1fr 1fr;
      }
      
      .palette-item {
        flex-direction: column;
        text-align: center;
        padding: var(--spacing-sm);
      }
      
      .item-icon {
        margin-right: 0;
        margin-bottom: var(--spacing-xs);
      }
    }
  `]
})
export class ComponentPaletteComponent {
  @Input() cdkDropListConnectedTo: any[] = [];

  basicFields: PaletteItem[] = [
    {
      type: 'TEXT',
      label: 'Text Field',
      icon: 'short_text',
      description: 'Single-line text input field'
    },
    {
      type: 'EMAIL',
      label: 'Email Field',
      icon: 'email',
      description: 'Email input with validation'
    },
    {
      type: 'NUMBER',
      label: 'Number Field',
      icon: 'pin',
      description: 'Numeric input field'
    },
    {
      type: 'TEXTAREA',
      label: 'Text Area',
      icon: 'notes',
      description: 'Multi-line text input'
    }
  ];

  choiceFields: PaletteItem[] = [
    {
      type: 'DROPDOWN',
      label: 'Dropdown',
      icon: 'arrow_drop_down_circle',
      description: 'Select from a list of options'
    },
    {
      type: 'RADIO',
      label: 'Radio Buttons',
      icon: 'radio_button_checked',
      description: 'Select one option from many'
    },
    {
      type: 'CHECKBOX',
      label: 'Checkboxes',
      icon: 'check_box',
      description: 'Select multiple options'
    }
  ];

  dateFields: PaletteItem[] = [
    {
      type: 'DATE',
      label: 'Date Picker',
      icon: 'calendar_today',
      description: 'Date selection input'
    }
  ];

  advancedFields: PaletteItem[] = [
    {
      type: 'FILE',
      label: 'File Upload',
      icon: 'attach_file',
      description: 'Upload files and documents'
    },
    {
      type: 'RATING',
      label: 'Rating Scale',
      icon: 'star',
      description: 'Star rating or scale input'
    },
    {
      type: 'SIGNATURE',
      label: 'Signature',
      icon: 'gesture',
      description: 'Digital signature capture'
    },
    {
      type: 'CALCULATED',
      label: 'Calculated Field',
      icon: 'calculate',
      description: 'Auto-calculated values'
    }
  ];
}
