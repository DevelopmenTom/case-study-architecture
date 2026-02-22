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
import { authenticateRequest } from '../../middlewares/auth.middleware';
import { rateLimitMiddleware } from '../../middlewares/rate-limit.middleware';
import { validateRequest } from '../../middlewares/validate-request.middleware';
import {
    GetProfileDto,
    LoginUserDto,
    RegisterUserDto,
    UpdateProfileDto,
} from '../../types/Dto';
import { UserService } from '../../types/services';

@controller('/users')
export class UserController extends BaseController {
    constructor(
        @inject(DISymbols.UserService) private userService: UserService
    ) {
        super();
    }

    @httpPost(
        '/register',
        rateLimitMiddleware(),
        validateRequest(RegisterUserDto)
    )
    async register(@request() req: Request, @response() res: Response) {
        const user = await this.userService.register(
            req.body as RegisterUserDto
        );
        res.status(201).json({
            id: user.id,
        });
    }

    @httpPost('/login', rateLimitMiddleware(), validateRequest(LoginUserDto))
    async login(@request() req: Request, @response() res: Response) {
        const { email, password } = req.body as LoginUserDto;
        const token = await this.userService.authenticate(email, password);
        res.status(200).json({
            token,
        });
    }

    @httpGet(
        '/profile',
        rateLimitMiddleware(),
        validateRequest(GetProfileDto),
        authenticateRequest()
    )
    async getProfile(@request() req: Request, @response() res: Response) {
        const { userId } = req.body as GetProfileDto;
        const profile = await this.userService.getProfile(userId);
        res.status(200).json(profile);
    }

    @httpPut(
        '/profile',
        rateLimitMiddleware(),
        validateRequest(UpdateProfileDto),
        authenticateRequest()
    )
    async updateProfile(@request() req: Request, @response() res: Response) {
        const { userId, ...updateData } = req.body as UpdateProfileDto;
        const profile = await this.userService.updateProfile(
            userId,
            updateData
        );
        res.status(200).json(profile);
    }
}
