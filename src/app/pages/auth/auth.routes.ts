import { Routes } from '@angular/router';
import { Access } from './access';
import { Error } from './error';
import { Register } from './register';
import { ForgotPassword } from './forgotpassword';
import { NewPassword } from './newpassword';
import { Verification } from './verification';
import { LockScreen } from './lockscreen';
import { Login } from './login/login';
import { guestGuard } from '@/app/guards/guest.guard';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: Login, canActivate: [guestGuard] },
    { path: 'register', component: Register, canActivate: [guestGuard] },
    { path: 'forgotpassword', component: ForgotPassword },
    { path: 'newpassword', component: NewPassword },
    { path: 'verification', component: Verification },
    { path: 'lockscreen', component: LockScreen }
] as Routes;
