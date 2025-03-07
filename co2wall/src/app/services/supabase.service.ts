import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { createClient, SignUpWithPasswordCredentials, SupabaseClient, User } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient;
    private router = inject(Router);
    private _user$ = new BehaviorSubject<User | null>(null);
    public user$ = this._user$.asObservable();

    constructor() {
        this.supabase = createClient(environment.supabase.url, environment.supabase.key);
        this.initializeAuth();
    }

    get client() {
        return this.supabase;
    }

    private initializeAuth() {
        this.supabase.auth.getSession().then(({ data: { session } }) => {
            this._user$.next(session?.user ?? null);
        });

        this.supabase.auth.onAuthStateChange((event, session) => {
            this._user$.next(session?.user ?? null);
        });
    }

    // Login with email and password
    login(email: string, password: string): Observable<User> {
        return from(this.supabase.auth.signInWithPassword({ email, password })).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data.user as User;
            }),
            tap((user) => this._user$.next(user)),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }

    // Register new user
    register(cred: SignUpWithPasswordCredentials): Observable<User> {
        return from(this.supabase.auth.signUp(cred)).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data.user as User;
            }),
            tap((user) => this._user$.next(user)),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }

    // Logout
    logout(): Observable<void> {
        return from(this.supabase.auth.signOut()).pipe(
            tap(() => {
                this._user$.next(null);
                this.router.navigate(['/login']);
            }),
            map(() => void 0),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }

    // Get current user
    getCurrentUser(): User | null {
        return this._user$.value;
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return !!this._user$.value;
    }

    // Password reset
    resetPassword(email: string): Observable<void> {
        return from(this.supabase.auth.resetPasswordForEmail(email)).pipe(
            map(({ error }) => {
                if (error) throw error;
                return void 0;
            }),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }

    // Update password
    updatePassword(newPassword: string): Observable<void> {
        return from(this.supabase.auth.updateUser({ password: newPassword })).pipe(
            map(({ error }) => {
                if (error) throw error;
                return void 0;
            }),
            catchError((error) => throwError(() => new Error(error.message)))
        );
    }
}
