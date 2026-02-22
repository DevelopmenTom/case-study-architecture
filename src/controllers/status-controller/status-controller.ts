import { Response } from 'express';
import { controller, httpGet, response } from 'inversify-express-utils';

import { BaseController } from '../../lib';

/**
 * @swagger
 * tags:
 *   name: Status
 *   description: Server status endpoints
 */
@controller('/status')
export class StatusController extends BaseController {
    constructor() {
        super();
    }

    /**
     * @swagger
     * /status:
     *   get:
     *     summary: Check server status
     *     tags: [Status]
     *     responses:
     *       200:
     *         description: Server is running
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Server Running!
     */
    @httpGet('/')
    async status(@response() res: Response) {
        res.status(200).json({ message: 'Server Running!' });
    }
}
