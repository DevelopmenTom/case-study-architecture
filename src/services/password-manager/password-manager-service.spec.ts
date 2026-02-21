import {
    PasswordManagerService,
    PasswordManagerServiceImpl,
} from './password-manager-service';
import { diContainer } from '../../../inversify.config';
import { DISymbols } from '../../lib/DISymbols';

describe('PasswordManagerService', () => {
    let service: PasswordManagerServiceImpl;

    beforeEach(() => {
        service = diContainer.get<PasswordManagerService>(
            DISymbols.PasswordManagerService
        );
    });

    describe('toHash', () => {
        it('should return a hashed password (128 characters) with concatenated salt (64 characters)', async () => {
            const password = 'mySecurePassword123';
            const hashedPassword = await service.toHash(password);

            expect(hashedPassword).toContain('.');

            const parts = hashedPassword.split('.');
            const [salt, hash] = parts;

            expect(salt).toHaveLength(64);
            expect(hash).toHaveLength(128);
        });

        it('should generate different hashes for the same password', async () => {
            const password = 'samePassword';
            const hash1 = await service.toHash(password);
            const hash2 = await service.toHash(password);

            expect(hash1).not.toBe(hash2);
        });
    });

    describe('compare', () => {
        it('should accept a correct supplied password', async () => {
            const password = 'correctPassword123';
            const hashedPassword = await service.toHash(password);

            const result = await service.compare(hashedPassword, password);

            expect(result).toBe(true);
        });

        it('should reject a false supplied password', async () => {
            const correctPassword = 'correctPassword123';
            const wrongPassword = 'wrongPassword456';
            const hashedPassword = await service.toHash(correctPassword);

            const result = await service.compare(hashedPassword, wrongPassword);

            expect(result).toBe(false);
        });
    });
});
