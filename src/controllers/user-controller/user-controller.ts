import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
    controller,
    httpGet,
    httpPost,
    httpPut,
    request,
    response,
} from 'inversify-express-utils';

import { BaseController, DISymbols } from '../../lib';
import { UserService } from '../../types/services';
import { validateRequest } from '../../middlewares/validate-request.middleware';
import { authenticateRequest } from '../../middlewares/auth.middleware';
import {
    registerUserSchema,
    RegisterUserInput,
} from '../../middlewares/schemas/register-user.schema';
import {
    loginUserSchema,
    LoginUserInput,
} from '../../middlewares/schemas/login-user.schema';
import {
    getProfileSchema,
    GetProfileInput,
} from '../../middlewares/schemas/get-profile.schema';
import {
    updateProfileSchema,
    UpdateProfileInput,
} from '../../middlewares/schemas/update-profile.schema';

@controller('/users')
export class UserController extends BaseController {
    constructor(
        @inject(DISymbols.UserService) private userService: UserService
    ) {
        super();
    }

    @httpPost('/register', validateRequest(registerUserSchema))
    async register(@request() req: Request, @response() res: Response) {
        const user = await this.userService.register(
            req.body as RegisterUserInput
        );
        res.status(201).json({
            id: user.id,
        });
    }

    @httpPost('/login', validateRequest(loginUserSchema))
    async login(@request() req: Request, @response() res: Response) {
        const { email, password } = req.body as LoginUserInput;
        const token = await this.userService.authenticate(email, password);
        res.status(200).json({
            token,
        });
    }

    @httpGet(
        '/profile',
        validateRequest(getProfileSchema),
        authenticateRequest()
    )
    async getProfile(@request() req: Request, @response() res: Response) {
        const { userId } = req.body as GetProfileInput;
        const profile = await this.userService.getProfile(userId);
        res.status(200).json(profile);
    }

    @httpPut(
        '/profile',
        validateRequest(updateProfileSchema),
        authenticateRequest()
    )
    async updateProfile(@request() req: Request, @response() res: Response) {
        const { userId, ...updateData } = req.body as UpdateProfileInput;
        const profile = await this.userService.updateProfile(
            userId,
            updateData
        );
        res.status(200).json(profile);
    }
}
