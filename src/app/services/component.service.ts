import { inject, Injectable } from '@angular/core';
import { Observable, from, map, catchError, throwError, switchMap } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { CompanyService } from './company.service';
import { FootprintService } from './footprint.service';

export interface _Component {
    category_id: any;
    id?: string;
    part_no?: string;
    description?: string;
    category?: any;
    footprint_id?: number;
    footprint?: any;
    manufacturer_id?: number;
    manufacturer?: any;
    current_quantity?: number;
    reserved_quantity?: number;
    ordered_quantity?: number;
    projected_quantity?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ComponentService {
    private readonly auth = inject(SupabaseService);
    private readonly supabase = this.auth.client;

    getComponents(keys?: string[]): Observable<_Component[]> {
        const columns = keys ? keys.join(',') : '*';

        return from(this.supabase.from('components_view').select(columns)).pipe(
            map(({ data, error }) => {
                if (error) {
                    throw new Error(error.message);
                }
                return data as unknown as _Component[];
            }),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }

    createComponent(component: any): Observable<any> {
        return from(this.supabase.from('components').insert(component).select('id')).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data?.[0];
            }),
            switchMap((newComponent) =>
                from(this.supabase.from('components_view').select('*').eq('id', newComponent.id)).pipe(
                    map(({ data, error }) => {
                        if (error) throw error;
                        return data?.[0];
                    })
                )
            ),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }

    updateComponent(component: any): Observable<any> {
        const { id, ...updateData } = component;
        return from(this.supabase.from('components').update(updateData).eq('id', id).select('id')).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data?.[0];
            }),
            switchMap((updatedComponent) =>
                from(this.supabase.from('components_view').select('*').eq('id', updatedComponent.id)).pipe(
                    map(({ data, error }) => {
                        if (error) throw error;
                        return data?.[0];
                    })
                )
            ),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }

    deleteComponent(id: string): Observable<any> {
        return from(this.supabase.from('components').delete().eq('id', id)).pipe(
            map(({ error }) => {
                if (error) throw error;
                return true;
            }),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }

    searchCategories(query: string): Observable<any[]> {
        return from(this.supabase.from('categories').select('id, name').ilike('name', `%${query}%`).limit(10)).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data;
            }),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }
}
