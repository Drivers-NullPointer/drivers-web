export interface LoginResponse {
    token: string;
    refreshToken?: string | null;
    user: User;
}

export interface User {
    id: number;
    name: string;
    email: string;
    roleId: number;
    isEmailVerified: boolean;
    imageProfile?: string | null;
}
