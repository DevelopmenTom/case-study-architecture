import { injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';

import { ITokenPayload } from '../../types/payloads';
import { AuthService } from '../../types/services';

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

    verify(token: string): ITokenPayload {
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error(
                'JWT_SECRET is not defined in environment variables'
            );
        }

        return jwt.verify(token, secret) as ITokenPayload;
    }
}
