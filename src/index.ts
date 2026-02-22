import 'reflect-metadata';
import { json } from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { Application, RequestHandler } from 'express';
import helmet from 'helmet';
import { InversifyExpressServer } from 'inversify-express-utils';
import swaggerUi from 'swagger-ui-express';

// import { createKafkaClient, Producer, Consumer } from '@marta/eventbus/dist';

import {
    diContainer,
    initializeDataSourceInContainer,
} from '../inversify.config';

import { swaggerSpec } from './config/swagger.config';
import { errorHandler } from './middlewares/error-handler.middleware';
import './controllers';

dotenv.config();

(async () => {
    try {
        await initializeDataSourceInContainer();

        // Create Kafka producer and consumer instance
        // const kafkaClient = await createKafkaClient();
        // const producer = new Producer(kafkaClient);
        // const consumer = new Consumer(kafkaClient, 'test-service-group');

        // Subscribe to all the topics the service is interested in
        // await consumer.subscribe([
        //     { topic: 'test-topic', eventHandler: exampleEventHandler },
        // ]);

        const app = new InversifyExpressServer(diContainer, null, {
            rootPath: '/partner-app/api',
        });
        app.setConfig((expressApp: Application) => {
            expressApp.use(helmet());
            expressApp.use(cors());
            expressApp.use(json());
        });
        app.setErrorConfig(app => {
            app.use(errorHandler);
        });

        const server = app.build();

        server.use(
            '/partner-app/api/docs',
            // @todo: remove type case once swagger's own dependency of @types/express aligns with exact type of current express:
            swaggerUi.serve as unknown as RequestHandler[],
            swaggerUi.setup(swaggerSpec) as unknown as RequestHandler
        );

        const PORT = process.env.PORT || 9000;

        server.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (err) {
        console.error(err);
    }
})();
