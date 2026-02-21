import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

import { injectable } from 'inversify';

import { PasswordManagerService } from '../../types/services';

const scryptAsync = promisify(scrypt);

/**
 * A utility class to hash user password before storing in DB
 * and compares user supplied passowrd with the stored hash
 */
@injectable()
export class PasswordManagerServiceImpl implements PasswordManagerService {
    async toHash(password: string): Promise<string> {
        const salt = randomBytes(32).toString('hex');
        const hash = (await scryptAsync(password, salt, 64)) as Buffer;
        return `${salt}.${hash.toString('hex')}`;
    }

    async compare({
        storedPassword,
        suppliedPassword,
    }: {
        storedPassword: string;
        suppliedPassword: string;
    }): Promise<boolean> {
        const [salt, storedHash] = storedPassword.split('.');
        const suppliedHash = (await scryptAsync(
            suppliedPassword,
            salt,
            64
        )) as Buffer;
        return storedHash === suppliedHash.toString('hex');
    }
}
