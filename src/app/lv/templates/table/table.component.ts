import { Component, computed, ElementRef, inject, input, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { Table, TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';
import { ComponentService } from '../../../services/component.service';

export interface TableColumn {
    header: string;
    field: string;
    width?: string;
    sort?: boolean;
    filter?: boolean;
    globalFilter?: boolean;
    searchPlaceholder?: string;
}

@Component({
    selector: 'app-table',
    imports: [
        TableModule,
        MultiSelectModule,
        SelectModule,
        InputIconModule,
        TagModule,
        InputTextModule,
        SliderModule,
        ProgressBarModule,
        ToggleButtonModule,
        ToastModule,
        CommonModule,
        FormsModule,
        ButtonModule,
        RatingModule,
        RippleModule,
        IconFieldModule
    ],
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss',
    providers: [ComponentService]
})
export class TableComponent implements OnInit {
    @ViewChild('filter') filter!: ElementRef;
    title = input.required<string>();
    columns = input.required<TableColumn[]>();
    data = input.required<any[]>();
    globalFilterKey = computed(() => {
        return this.columns().reduce<string[]>((accumulator, column) => {
            if (column.globalFilter) {
                accumulator.push(column.field);
            }
            return accumulator;
        }, []);
    });
    componentService = inject(ComponentService);
    components!: any[];
    loading = false;
    cols = [
        { header: 'Part No.', field: 'rffe_no', width: '15%', sort: true },
        { header: 'Description', field: 'description', width: '40%' },
        { header: 'Category.', field: 'category', width: '10%', sort: true },
        { header: 'Footprint', field: 'footprint', width: '10%', sort: true }
    ];

    constructor() {}

    ngOnInit() {
        this.loadComponents();
    }

    loadComponents() {
        this.componentService.getComponents().subscribe({
            next: (components) => (this.components = components),
            error: (error) => console.error('Error loading projects:', error)
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    getSearchPlaceholder(col: TableColumn): string {
        return col.searchPlaceholder ?? `Search by ${col.header}`;
    }
}
