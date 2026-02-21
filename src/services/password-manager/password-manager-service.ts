import { scrypt, randomBytes } from 'crypto';
import { injectable } from 'inversify';
import { promisify } from 'util';
import { PasswordManagerService } from '../../types/services/PasswordManagerService';

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

    async compare(
        storedPassword: string,
        suppliedPassword: string
    ): Promise<boolean> {
        const [salt, storedHash] = storedPassword.split('.');
        const suppliedHash = (await scryptAsync(
            suppliedPassword,
            salt,
            64
        )) as Buffer;
        return storedHash === suppliedHash.toString('hex');
    }
}
