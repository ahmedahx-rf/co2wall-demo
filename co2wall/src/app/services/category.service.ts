import { inject, Injectable } from '@angular/core';
import { Observable, from, map, catchError, throwError } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface Category {
    id?: number;
    name: string;
    description?: string | null;
    parent_id?: number | null;
    created_at?: string;
    updated_at?: string | null;
    created_by?: string;
    updated_by?: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private readonly auth = inject(SupabaseService);
    private readonly supabase = this.auth.client;

    getCategories(keys?: string[]): Observable<Category[]> {
        const columns = keys ? keys.join(',') : '*';

        return from(this.supabase.from('categories').select(columns)).pipe(
            map(({ data, error }) => {
                if (error) {
                    throw error;
                }
                return data as unknown as Category[];
            }),
            catchError((error) => throwError(() => error))
        );
    }

    createCategory(category: Partial<Category>): Observable<Category> {
        return from(this.supabase.from('categories').insert(category).select()).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data?.[0] as Category;
            }),
            catchError((error) => throwError(() => error))
        );
    }

    searchCategories(query: string): Observable<Category[]> {
        return from(this.supabase.from('categories').select('id, name, description').ilike('name', `%${query}%`).limit(10)).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data as Category[];
            }),
            catchError((error) => throwError(() => error))
        );
    }
}
