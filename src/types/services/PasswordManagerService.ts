export interface PasswordManagerService {
    toHash(password: string): Promise<string>;
    compare({
        storedPassword,
        suppliedPassword,
    }: {
        storedPassword: string;
        suppliedPassword: string;
    }): Promise<boolean>;
}
