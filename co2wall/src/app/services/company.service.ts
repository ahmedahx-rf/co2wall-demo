import { inject, Injectable } from '@angular/core';
import { Observable, from, map, catchError, throwError, switchMap } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface Company {
    id?: number;
    name?: string;
    abbreviation?: string;
    parent_id?: number | null;
    updated_at?: string;
    updated_by?: string;
    created_at?: string;
    created_by?: string;
    aliases?: string[] | null;
}

@Injectable({
    providedIn: 'root'
})
export class CompanyService {
    private readonly auth = inject(SupabaseService);
    private readonly supabase = this.auth.client;

    getCompanies(keys?: string[]): Observable<Company[]> {
        const columns = keys ? keys.join(',') : '*';

        return from(this.supabase.from('companies_view').select(columns)).pipe(
            map(({ data, error }) => {
                if (error) {
                    throw new Error(error.message);
                }
                return data as Company[];
            }),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }

    createCompany(company: Partial<Company>): Observable<Company> {
        return from(this.supabase.from('companies').insert(company).select('id')).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data?.[0];
            }),
            switchMap((newCompany) =>
                from(this.supabase.from('companies_view').select('*').eq('id', newCompany.id)).pipe(
                    map(({ data, error }) => {
                        if (error) throw error;
                        return data?.[0] as Company;
                    })
                )
            ),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }

    updateCompany(company: Partial<Company>): Observable<Company> {
        const { id, ...updateData } = company;
        return from(this.supabase.from('companies').update(updateData).eq('id', id).select('id')).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data?.[0];
            }),
            switchMap((updatedCompany) =>
                from(this.supabase.from('companies_view').select('*').eq('id', updatedCompany.id)).pipe(
                    map(({ data, error }) => {
                        if (error) throw error;
                        return data?.[0] as Company;
                    })
                )
            ),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }

    deleteCompany(id: string): Observable<boolean> {
        return from(this.supabase.from('companies').delete().eq('id', id)).pipe(
            map(({ error }) => {
                if (error) throw error;
                return true;
            }),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }

    searchCompanies(query: string): Observable<Company[]> {
        return from(this.supabase.from('companies_view').select('id, name').ilike('name', `%${query}%`).limit(10)).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data as Company[];
            }),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }
}
