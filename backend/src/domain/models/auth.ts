export type TokenPayload = {
    userId: number;
    email: string;
    organizationId: number;
    roles?: string[];
};

export type AuthTokens = {
    accessToken: string;
    refreshToken: string;
};
