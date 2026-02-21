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

@controller('/users')
export class UserController extends BaseController {
    constructor(
        @inject(DISymbols.UserService) private userService: UserService
    ) {
        super();
    }

    @httpPost('/register')
    async register(@request() req: Request, @response() res: Response) {
        try {
            const user = await this.userService.register(req.body);
            res.status(201).json({
                id: user.id,
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
