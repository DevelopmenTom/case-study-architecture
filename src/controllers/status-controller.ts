import { Response } from 'express';
import { controller, httpGet, response } from 'inversify-express-utils';

import { BaseController } from '../lib';

@controller('/status')
export class StatusController extends BaseController {
    constructor() {
        super();
    }

    @httpGet('/')
    async status(@response() res: Response) {
        res.status(200).json({ message: 'Server Running!' });
    }
}
