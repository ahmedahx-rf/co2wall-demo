import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { from, map, catchError, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly auth = inject(SupabaseService);
    private readonly supabase = this.auth.client;

    getUsers(keys?: string[]) {
        return from(
            this.supabase.from('users').select(keys ? keys.join(',') : '*') // Fix here
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data as any[]; // Ensure correct return type
            }),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }
}
