import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Observable, throwError, from, map, catchError } from 'rxjs';

export interface ProjectBase {
    id: number;
    name: string;
    customer_id: number | null;
    parent_id: number | null;
    created_at: string; // ISO date format (e.g., "2024-02-22T12:34:56Z")
    updated_at: string; // ISO date format
    customer: string | null;
    created_by: string | null;
    revision_count: number;
    revisions: { id: number; name: string }[];
}

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private readonly auth = inject(SupabaseService);
    private readonly supabase = this.auth.client;
    constructor() {}

    // Read all projects for current user
    getProjects(): Observable<ProjectBase[]> {
        const currentUser = this.auth.getCurrentUser();
        if (!currentUser) {
            //return throwError(() => new Error('User must be authenticated'));
        }

        return from(this.supabase.from('projects_base').select('*')).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data as ProjectBase[];
            }),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }
}
