import { inject, Injectable } from '@angular/core';
import { Observable, from, map, catchError, throwError, switchMap } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface Footprint {
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
export class FootprintService {
    private readonly auth = inject(SupabaseService);
    private readonly supabase = this.auth.client;

    getFootprints(keys?: string[]): Observable<Footprint[]> {
        const columns = keys ? keys.join(',') : '*';

        return from(this.supabase.from('footprints').select(columns)).pipe(
            map(({ data, error }) => {
                if (error) {
                    throw error;
                }
                return data as unknown as Footprint[];
            }),
            catchError((error) => throwError(() => error))
        );
    }

    createFootprint(footprint: Partial<Footprint>): Observable<Footprint> {
        return from(this.supabase.from('footprints').insert(footprint).select()).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data?.[0] as Footprint;
            }),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }

    updateFootprint(footprint: Partial<Footprint>): Observable<Footprint> {
        const { id, ...updateData } = footprint;
        return from(this.supabase.from('footprints').update(updateData).eq('id', id).select()).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data?.[0] as Footprint;
            }),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }

    deleteFootprint(id: number): Observable<boolean> {
        return from(this.supabase.from('footprints').delete().eq('id', id)).pipe(
            map(({ error }) => {
                if (error) throw error;
                return true;
            }),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }

    searchFootprints(query: string): Observable<Footprint[]> {
        return from(this.supabase.from('footprints').select('id, name, description').ilike('name', `%${query}%`).limit(10)).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data as Footprint[];
            }),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }
}
