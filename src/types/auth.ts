export interface Register {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    role: string;
    password: string;
}

export interface Login {
    email: string;
    password: string;
}
