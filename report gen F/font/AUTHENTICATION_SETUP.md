# OOREDOO Report Builder - Authentication System

## Overview
This Angular application implements a complete authentication system with email activation for the OOREDOO Report Builder. The system includes registration, login, email activation, and role-based dashboard routing.

## Authentication Flow

### 1. Registration Process
- User fills out registration form with:
  - First Name (min 2 characters)
  - Last Name (min 2 characters)
  - Email (valid email format)
  - Password (min 8 characters)
  - PIN (4 digits)
  - User Type (INTERNAL, POS, USER_ADMIN)
- Upon successful registration, user receives an activation email
- User is redirected to activation page

### 2. Email Activation
- User receives a 6-digit activation code via email
- User enters the code on the activation page
- Upon successful activation, user is redirected to login page
- Alternative: User can click activation link from email (if backend supports it)

### 3. Login Process
- User enters email and password
- System checks if account is activated
- If not activated: User is redirected to activation page
- If activated: User is logged in and redirected to appropriate dashboard based on role

### 4. Dashboard Routing
- **MAIN_ADMIN**: Redirected to `/admin` or `/admin-panel`
- **DEPARTMENT_ADMIN**: Redirected to `/department` or `/dept-panel`
- **USER/POS**: Redirected to `/dashboard` (main user dashboard)

## API Endpoints Used

### Backend Endpoints (Spring Boot)
- `POST /auth/register` - User registration
- `POST /auth/authenticate` - User login
- `GET /auth/activation-account?token=xxx` - Activate account via email link
- `POST /auth/verify-activation-code` - Verify activation code (custom endpoint)
- `POST /auth/resend-activation` - Resend activation email (custom endpoint)

## Components Created/Updated

### Core Authentication Components
1. **LoginComponent** (`/core/auth/login.component.ts`)
   - Email and password validation
   - Error handling for unactivated accounts
   - Role-based redirection after login

2. **RegisterComponent** (`/core/auth/register.component.ts`)
   - Complete registration form with all required fields
   - PIN validation (4 digits)
   - User type selection
   - Redirects to activation page after registration

3. **ActivateAccountComponent** (`/core/auth/activate-account.component.ts`)
   - Handles both activation code input and email link activation
   - Resend activation code functionality
   - Success/error state management

4. **AuthService** (`/core/auth/auth.service.ts`)
   - Login, register, and activation methods
   - Token storage management
   - JWT token handling

### Dashboard Components
1. **UserDashboardComponent** (`/features/user/user-dashboard.component.ts`)
   - Welcome dashboard with user information
   - Navigation cards for different features
   - Logout functionality

## Models Updated
1. **RegisterRequest** - Added `pinHash` and `userType` fields
2. **UserType** - Enum with INTERNAL, POS, USER_ADMIN values

## Routing Configuration
- `/login` - Login page
- `/register` - Registration page
- `/activate-account` - Account activation page
- `/dashboard` - Main user dashboard
- `/admin` - Admin dashboard
- `/department` - Department admin dashboard

## Security Features
- JWT token-based authentication
- Role-based access control
- Account activation requirement
- Form validation on both client and server side
- Protected routes with auth guards

## Styling
- Material Design components
- Responsive design
- Modern card-based layout
- Consistent color scheme (#1976d2 primary color)

## Usage Instructions

### For Users
1. Navigate to `/register` to create a new account
2. Fill out all required fields including PIN and user type
3. Check email for activation code
4. Enter activation code on activation page
5. Login with email and password
6. Access dashboard based on your role

### For Developers
1. Ensure backend is running on `http://localhost:8080`
2. Update `environment.ts` if backend URL changes
3. All authentication components are standalone and can be imported independently
4. JWT tokens are automatically stored in localStorage
5. Auth guard protects all dashboard routes

## Dependencies
- Angular Material for UI components
- Angular Reactive Forms for form handling
- Angular Router for navigation
- JWT helper for token decoding
- Toastr for notifications

## Notes
- The system assumes the backend sends activation codes via email
- PIN is stored as `pinHash` in the registration request
- User types are mapped to backend enum values
- All forms include proper validation and error handling
- The dashboard provides navigation to existing form builder features
