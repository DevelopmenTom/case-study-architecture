import { injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';
import { AuthService } from '../../types/services/AuthService';
import { ITokenPayload } from '../../types/payloads';

@injectable()
export class AuthServiceImpl implements AuthService {
    generateToken(payload: ITokenPayload): string {
        const secret = process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_EXPIRES_IN;

        if (!secret) {
            throw new Error(
                'JWT_SECRET is not defined in environment variables'
            );
        }

        return jwt.sign(payload, secret, { expiresIn });
    }
}
