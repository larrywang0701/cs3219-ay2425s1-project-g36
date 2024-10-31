export interface User {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    numberOfFailedLoginAttempts: number;
    passwordResetToken?: string;
    passwordResetTokenExpiration?: Date;
    isAdmin: boolean;
}