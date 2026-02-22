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
    LoginUserDto,
    RegisterUserDto,
    UpdateProfileDto,
} from '../../types/Dto';
import { HttpError } from '../../types/errors';
import { UserService } from '../../types/services';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication
 */
@controller('/users')
export class UserController extends BaseController {
    constructor(
        @inject(DISymbols.UserService) private userService: UserService
    ) {
        super();
    }

    /**
     * @swagger
     * /users/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RegisterUserDto'
     *     responses:
     *       201:
     *         description: User successfully registered
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: Newly created user ID
     *       400:
     *         description: Invalid input data
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       429:
     *         description: Too many requests
     */
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

    /**
     * @swagger
     * /users/login:
     *   post:
     *     summary: Authenticate user and get JWT token
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginUserDto'
     *     responses:
     *       200:
     *         description: Successfully authenticated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 token:
     *                   type: string
     *                   description: JWT authentication token
     *       400:
     *         description: Invalid credentials
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       429:
     *         description: Too many requests
     */
    @httpPost('/login', rateLimitMiddleware(), validateRequest(LoginUserDto))
    async login(@request() req: Request, @response() res: Response) {
        const { email, password } = req.body as LoginUserDto;
        const token = await this.userService.authenticate(email, password);
        res.status(200).json({
            token,
        });
    }

    /**
     * @swagger
     * /users/profile:
     *   get:
     *     summary: Get user profile
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: User profile retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserProfileDto'
     *       401:
     *         description: Unauthorized - Invalid or missing token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *          description: User Profile was not found
     *       429:
     *         description: Too many requests
     */
    @httpGet('/profile', rateLimitMiddleware(), authenticateRequest())
    async getProfile(@request() req: Request, @response() res: Response) {
        if (!req.auth?.userId) {
            throw new HttpError(
                'No userId found in token payload for getProfile',
                400
            );
        }
        const profile = await this.userService.getProfile(req.auth?.userId);
        res.status(200).json(profile);
    }

    /**
     * @swagger
     * /users/profile:
     *   put:
     *     summary: Update user profile
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateProfileDto'
     *     responses:
     *       200:
     *         description: User profile updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserProfileDto'
     *       401:
     *         description: Unauthorized - Invalid or missing token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       429:
     *         description: Too many requests
     */
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
