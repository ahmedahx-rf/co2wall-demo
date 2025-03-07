import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { inject } from '@angular/core';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
    const authService = inject(SupabaseService);
    const router = inject(Router);

    return authService.user$.pipe(
        take(1),
        map((user) => {
            if (user) {
                return true;
            }
            router.navigate(['/auth/login']);
            return false;
        })
    );
};
