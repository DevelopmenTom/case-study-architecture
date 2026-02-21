import { ITokenPayload } from './payloads/ITokenPayload';

declare global {
    namespace Express {
        interface Request {
            auth?: ITokenPayload;
        }
    }
}
