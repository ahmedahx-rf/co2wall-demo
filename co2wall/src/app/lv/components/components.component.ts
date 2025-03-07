import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ComponentService } from '../../services/component.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
@Component({
    selector: 'app-components',
    imports: [CommonModule, TableModule, IconFieldModule, InputIconModule],
    templateUrl: './components.component.html',
    styleUrl: './components.component.scss',
    providers: [ComponentService]
})
export class ComponentsComponent implements OnInit {
    @ViewChild('filter') filter!: ElementRef;
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
}
