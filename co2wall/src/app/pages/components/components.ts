import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { _Component, ComponentService } from '../../services/component.service';
import { CompanyService, Company } from '../../services/company.service';
import { FootprintService, Footprint } from '../../services/footprint.service';
import { CategoryService, Category } from '../../services/category.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-components',
    standalone: true,
    imports: [CommonModule, TableModule, FormsModule, ButtonModule, RippleModule, ToastModule, ToolbarModule, InputTextModule, DialogModule, TagModule, InputIconModule, IconFieldModule, ConfirmDialogModule, AutoCompleteModule],
    template: `
        <p-toast></p-toast>

        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                <p-button severity="secondary" label="Delete" icon="pi pi-trash" outlined (onClick)="deleteSelectedComponents()" [disabled]="!selectedComponents || !selectedComponents.length" />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="components()"
            [rows]="10"
            [paginator]="true"
            [globalFilterFields]="['rffe_no', 'description', 'category.name', 'footprint.name']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedComponents"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} components"
            [showCurrentPageReport]="true"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Manage Components</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width: 3rem">
                        <p-tableHeaderCheckbox />
                    </th>
                    <th pSortableColumn="rffe_no">RFFE No.<p-sortIcon field="rffe_no" /></th>
                    <th pSortableColumn="description">Description<p-sortIcon field="description" /></th>
                    <th pSortableColumn="category.name">Category<p-sortIcon field="category.name" /></th>
                    <th pSortableColumn="footprint.name">Footprint<p-sortIcon field="footprint.name" /></th>
                    <th pSortableColumn="current_quantity">Current Qty<p-sortIcon field="current_quantity" /></th>
                    <th pSortableColumn="reserved_quantity">Reserved Qty<p-sortIcon field="reserved_quantity" /></th>
                    <th pSortableColumn="ordered_quantity">Ordered Qty<p-sortIcon field="ordered_quantity" /></th>
                    <th pSortableColumn="projected_quantity">Projected Qty<p-sortIcon field="projected_quantity" /></th>
                    <th style="min-width: 12rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-component>
                <tr>
                    <td>
                        <p-tableCheckbox [value]="component" />
                    </td>
                    <td>{{ component.rffe_no }}</td>
                    <td>{{ component.description }}</td>
                    <td>{{ component.category?.name }}</td>
                    <td>{{ component.footprint?.name }}</td>
                    <td>{{ component.current_quantity }}</td>
                    <td>{{ component.reserved_quantity }}</td>
                    <td>{{ component.ordered_quantity }}</td>
                    <td>{{ component.projected_quantity }}</td>
                    <td>
                        <p-button label="Small" icon="pi pi-check" size="small" />
                        <p-button icon="pi pi-pencil" size="small" class="mr-2" [rounded]="true" [outlined]="true" (click)="editComponent(component)" />
                        <p-button icon="pi pi-trash" severity="danger" small="small" [rounded]="true" [outlined]="true" (click)="deleteComponent(component)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="componentDialog" [style]="{ width: '450px' }" header="Component Details" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div>
                        <label for="part_no" class="block font-bold mb-2">Part No.</label>
                        <input type="text" pInputText id="part_no" [(ngModel)]="component.part_no" required autofocus class="w-full" />
                        <small class="text-red-500" *ngIf="submitted && !component.part_no">Part No. is required.</small>
                    </div>

                    <div>
                        <label for="manufacturer" class="block font-bold mb-2">Manufacturer</label>
                        <p-autoComplete
                            [(ngModel)]="component.manufacturer"
                            [suggestions]="manufacturerSuggestions"
                            (completeMethod)="searchManufacturers($event)"
                            field="name"
                            [dropdown]="true"
                            [showClear]="true"
                            [forceSelection]="false"
                            placeholder="Select or type new manufacturer name"
                            class="w-full"
                        >
                            <ng-template let-company pTemplate="item">
                                <div>
                                    <div>{{ company.name }}</div>
                                    <small *ngIf="company.abbreviation">({{ company.abbreviation }})</small>
                                </div>
                            </ng-template>
                        </p-autoComplete>
                    </div>

                    <div>
                        <label for="category" class="block font-bold mb-2">Category</label>
                        <p-autoComplete
                            [(ngModel)]="component.category"
                            [suggestions]="categorySuggestions"
                            (completeMethod)="searchCategories($event)"
                            field="name"
                            [dropdown]="true"
                            [showClear]="true"
                            [forceSelection]="false"
                            placeholder="Select or type new category name"
                            class="w-full"
                        >
                            <ng-template let-category pTemplate="item">
                                <div>{{ category.name }}</div>
                            </ng-template>
                        </p-autoComplete>
                    </div>

                    <div>
                        <label for="footprint" class="block font-bold mb-2">Footprint</label>
                        <p-autoComplete
                            [(ngModel)]="component.footprint"
                            [suggestions]="footprintSuggestions"
                            (completeMethod)="searchFootprints($event)"
                            field="name"
                            [dropdown]="true"
                            [showClear]="true"
                            [forceSelection]="false"
                            placeholder="Select or type new footprint name"
                            class="w-full"
                        >
                            <ng-template let-footprint pTemplate="item">
                                <div>
                                    <div>{{ footprint.name }}</div>
                                    <small *ngIf="footprint.description">{{ footprint.description }}</small>
                                </div>
                            </ng-template>
                        </p-autoComplete>
                    </div>

                    <div>
                        <label for="description" class="block font-bold mb-2">Description</label>
                        <textarea pInputTextarea id="description" [(ngModel)]="component.description" required rows="3" class="w-full"></textarea>
                        <small class="text-red-500" *ngIf="submitted && !component.description">Description is required.</small>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (click)="saveComponent()" />
            </ng-template>
        </p-dialog>

        <!-- New Manufacturer Dialog -->
        <p-dialog [(visible)]="showNewManufacturerDialog" header="Create New Manufacturer" [modal]="true" [style]="{ width: '450px' }">
            <div class="flex flex-col gap-4">
                <div>
                    <label for="new-manufacturer-name" class="block font-bold mb-2">Name</label>
                    <input type="text" pInputText id="new-manufacturer-name" [(ngModel)]="newManufacturer.name" class="w-full" />
                </div>
                <div>
                    <label for="new-manufacturer-abbreviation" class="block font-bold mb-2">Abbreviation</label>
                    <input type="text" pInputText id="new-manufacturer-abbreviation" [(ngModel)]="newManufacturer.abbreviation" class="w-full" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancel" icon="pi pi-times" (onClick)="showNewManufacturerDialog = false" styleClass="p-button-text"></p-button>
                <p-button label="Save" icon="pi pi-check" (onClick)="saveNewManufacturer()" [disabled]="!newManufacturer.name"></p-button>
            </ng-template>
        </p-dialog>

        <!-- New Category Dialog -->
        <p-dialog [(visible)]="showNewCategoryDialog" header="Create New Category" [modal]="true" [style]="{ width: '450px' }">
            <div class="flex flex-col gap-4">
                <div>
                    <label for="new-category-name" class="block font-bold mb-2">Name</label>
                    <input type="text" pInputText id="new-category-name" [(ngModel)]="newCategory.name" class="w-full" />
                </div>
                <div>
                    <label for="new-category-description" class="block font-bold mb-2">Description</label>
                    <textarea pInputTextarea id="new-category-description" [(ngModel)]="newCategory.description" rows="3" class="w-full"></textarea>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancel" icon="pi pi-times" (onClick)="showNewCategoryDialog = false" styleClass="p-button-text"></p-button>
                <p-button label="Save" icon="pi pi-check" (onClick)="saveNewCategory()" [disabled]="!newCategory.name"></p-button>
            </ng-template>
        </p-dialog>

        <!-- New Footprint Dialog -->
        <p-dialog [(visible)]="showNewFootprintDialog" header="Create New Footprint" [modal]="true" [style]="{ width: '450px' }">
            <div class="flex flex-col gap-4">
                <div>
                    <label for="new-footprint-name" class="block font-bold mb-2">Name</label>
                    <input type="text" pInputText id="new-footprint-name" [(ngModel)]="newFootprint.name" class="w-full" />
                </div>
                <div>
                    <label for="new-footprint-description" class="block font-bold mb-2">Description</label>
                    <textarea pInputTextarea id="new-footprint-description" [(ngModel)]="newFootprint.description" rows="3" class="w-full"></textarea>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancel" icon="pi pi-times" (onClick)="showNewFootprintDialog = false" styleClass="p-button-text"></p-button>
                <p-button label="Save" icon="pi pi-check" (onClick)="saveNewFootprint()" [disabled]="!newFootprint.name"></p-button>
            </ng-template>
        </p-dialog>

        <p-confirmDialog [style]="{ width: '450px' }" />
    `,
    providers: [MessageService, ComponentService, CompanyService, FootprintService, CategoryService, ConfirmationService]
})
export class ComponentsPage implements OnInit {
    componentDialog: boolean = false;
    components = signal<_Component[]>([]);
    component: any = {};
    selectedComponents!: _Component[] | null;
    submitted: boolean = false;

    manufacturerSuggestions: Company[] = [];
    categorySuggestions: Category[] = [];
    footprintSuggestions: Footprint[] = [];

    showNewManufacturerDialog = false;
    showNewCategoryDialog = false;
    showNewFootprintDialog = false;

    newManufacturer: Partial<Company> = {};
    newCategory: Partial<Category> = {};
    newFootprint: Partial<Footprint> = {};

    @ViewChild('dt') dt!: Table;

    constructor(
        private componentService: ComponentService,
        private companyService: CompanyService,
        private categoryService: CategoryService,
        private footprintService: FootprintService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadComponents();
    }

    loadComponents() {
        this.componentService.getComponents().subscribe({
            next: (data) => this.components.set(data),
            error: (error) => {
                console.error('Error loading components:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load components'
                });
            }
        });
    }

    searchManufacturers(event: any) {
        this.companyService.searchCompanies(event.query).subscribe({
            next: (data) => {
                this.manufacturerSuggestions = data;
            },
            error: (error) => {
                console.error('Error searching manufacturers:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to search manufacturers'
                });
            }
        });
    }

    searchCategories(event: any) {
        // Implement category search/autocomplete logic
        this.componentService.searchCategories(event.query).subscribe((data) => {
            this.categorySuggestions = data;
        });
    }

    searchFootprints(event: any) {
        this.footprintService.searchFootprints(event.query).subscribe({
            next: (data) => {
                this.footprintSuggestions = data;
            },
            error: (error) => {
                console.error('Error searching footprints:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to search footprints'
                });
            }
        });
    }

    openNew() {
        this.component = {};
        this.submitted = false;
        this.componentDialog = true;
    }

    deleteSelectedComponents() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected components?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    if (this.selectedComponents) {
                        for (const component of this.selectedComponents) {
                            await firstValueFrom(this.componentService.deleteComponent(component.id!));
                            // Remove from UI
                            const currentComponents = this.components();
                            this.components.set(currentComponents.filter((c) => c.id !== component.id));
                        }

                        this.selectedComponents = null;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Components Deleted',
                            life: 3000
                        });
                    }
                } catch (error) {
                    console.error('Error deleting components:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to delete components'
                    });
                }
            }
        });
    }

    editComponent(component: _Component) {
        // Transform the component data to have proper object structure
        this.component = {
            ...component,
            manufacturer: component.manufacturer_id
                ? {
                      id: component.manufacturer_id,
                      name: component.manufacturer
                  }
                : null,
            category: component.category_id
                ? {
                      id: component.category_id,
                      name: component.category
                  }
                : null,
            footprint: component.footprint_id
                ? {
                      id: component.footprint_id,
                      name: component.footprint
                  }
                : null
        };
        this.componentDialog = true;
    }

    deleteComponent(component: _Component) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this component?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await firstValueFrom(this.componentService.deleteComponent(component.id!));

                    // Remove from UI
                    const currentComponents = this.components();
                    this.components.set(currentComponents.filter((c) => c.id !== component.id));

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Component Deleted',
                        life: 3000
                    });
                } catch (error) {
                    console.error('Error deleting component:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to delete component'
                    });
                }
            }
        });
    }

    hideDialog() {
        this.componentDialog = false;
        this.submitted = false;
    }

    async saveComponent() {
        this.submitted = true;

        if (!this.component.part_no?.trim()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Part No. is required'
            });
            return;
        }

        try {
            console.log(this.component);

            const componentToSave: any = {
                part_no: this.component.part_no,
                description: this.component.description
            };

            // Handle manufacturer
            if (this.component.manufacturer) {
                if (!this.component.manufacturer.id) {
                    // New manufacturer to create
                    const newManufacturer = await firstValueFrom(
                        this.companyService.createCompany({
                            name: this.component.manufacturer.name || this.component.manufacturer
                        })
                    );
                    componentToSave.manufacturer_id = newManufacturer.id;
                } else {
                    componentToSave.manufacturer_id = this.component.manufacturer.id;
                }
            } else if (this.component.manufacturer_id) {
                componentToSave.manufacturer_id = this.component.manufacturer_id;
            }

            // Handle category
            if (this.component.category) {
                if (!this.component.category.id) {
                    const newCategory = await firstValueFrom(
                        this.categoryService.createCategory({
                            name: this.component.category.name || this.component.category
                        })
                    );
                    componentToSave.category_id = newCategory.id;
                } else {
                    componentToSave.category_id = this.component.category.id;
                }
            } else if (this.component.category_id) {
                componentToSave.category_id = this.component.category_id;
            }

            // Handle footprint
            if (this.component.footprint) {
                if (!this.component.footprint.id) {
                    const newFootprint = await firstValueFrom(
                        this.footprintService.createFootprint({
                            name: this.component.footprint.name || this.component.footprint
                        })
                    );
                    componentToSave.footprint_id = newFootprint.id;
                } else {
                    componentToSave.footprint_id = this.component.footprint.id;
                }
            } else if (this.component.footprint_id) {
                componentToSave.footprint_id = this.component.footprint_id;
            }

            let savedComponent;
            if (this.component.id) {
                // Get the updated component from view after update
                savedComponent = await firstValueFrom(this.componentService.updateComponent({ ...componentToSave, id: this.component.id }));

                // Update in UI - merge with existing data to preserve view structure
                const currentComponents = this.components();
                const index = currentComponents.findIndex((c) => c.id === this.component.id);
                if (index !== -1) {
                    // Merge the saved component with existing view data
                    currentComponents[index] = {
                        ...currentComponents[index], // Keep existing view structure
                        ...savedComponent, // Update with new values
                        manufacturer: savedComponent.manufacturer, // Explicitly update related objects
                        category: savedComponent.category,
                        footprint: savedComponent.footprint
                    };
                    this.components.set([...currentComponents]);
                }

                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Component Updated',
                    life: 3000
                });
            } else {
                // Create new component
                savedComponent = await firstValueFrom(this.componentService.createComponent(componentToSave));
                this.components.set([...this.components(), savedComponent]);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Component Created',
                    life: 3000
                });
            }

            this.componentDialog = false;
            this.component = {};
        } catch (error) {
            console.error('Error saving component:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to save component'
            });
        }
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    handleManufacturerSelect(event: any) {
        if (event.value === 'create-new') {
            this.showNewManufacturerDialog = true;
        }
    }

    handleCategorySelect(event: any) {
        if (event.value === 'create-new') {
            this.showNewCategoryDialog = true;
        }
    }

    handleFootprintSelect(event: any) {
        if (event.value === 'create-new') {
            this.showNewFootprintDialog = true;
        }
    }

    saveNewManufacturer() {
        if (this.newManufacturer.name) {
            this.companyService.createCompany(this.newManufacturer).subscribe({
                next: (company) => {
                    this.component.manufacturer = company;
                    this.showNewManufacturerDialog = false;
                    this.newManufacturer = {};
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'New manufacturer created'
                    });
                },
                error: (error) => {
                    console.error('Error creating manufacturer:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to create manufacturer'
                    });
                }
            });
        }
    }

    saveNewCategory() {
        if (this.newCategory.name) {
            this.categoryService.createCategory(this.newCategory).subscribe({
                next: (category) => {
                    this.component.category = category;
                    this.showNewCategoryDialog = false;
                    this.newCategory = {};
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'New category created'
                    });
                },
                error: (error) => {
                    console.error('Error creating category:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to create category'
                    });
                }
            });
        }
    }

    saveNewFootprint() {
        if (this.newFootprint.name) {
            this.footprintService.createFootprint(this.newFootprint).subscribe({
                next: (footprint) => {
                    this.component.footprint = footprint;
                    this.showNewFootprintDialog = false;
                    this.newFootprint = {};
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'New footprint created'
                    });
                },
                error: (error) => {
                    console.error('Error creating footprint:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to create footprint'
                    });
                }
            });
        }
    }
}
