import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
    controller,
    httpPost,
    request,
    response,
} from 'inversify-express-utils';

import { BaseController, DISymbols } from '../../lib';
import { UserService } from '../../types/services';
import { validateRequest } from '../../middlewares/validate-request.middleware';
import {
    registerUserSchema,
    RegisterUserInput,
} from '../../middlewares/schemas/register-user.schema';
import {
    loginUserSchema,
    LoginUserInput,
} from '../../middlewares/schemas/login-user.schema';

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
}
