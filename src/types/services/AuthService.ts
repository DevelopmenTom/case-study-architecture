import { ITokenPayload } from '../payloads';

export interface AuthService {
    generateToken(payload: ITokenPayload): string;
    verify(token: string): ITokenPayload;
}
