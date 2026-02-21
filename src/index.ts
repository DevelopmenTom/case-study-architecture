import { json } from 'body-parser';

import 'reflect-metadata';
import dotenv from 'dotenv';
import { InversifyExpressServer } from 'inversify-express-utils';

// import { createKafkaClient, Producer, Consumer } from '@marta/eventbus/dist';

import {
    diContainer,
    initializeDataSourceInContainer,
} from '../inversify.config';
// import { exampleEventHandler } from './events/handlers';
import './controllers/status-controller/status-controller';
import './controllers/user-controller/user-controller';

dotenv.config();

(async () => {
    try {
        // Initialize database and bind to DI container
        await initializeDataSourceInContainer();

        // Create Kafka producer and consumer instance
        // const kafkaClient = await createKafkaClient();
        // const producer = new Producer(kafkaClient);
        // const consumer = new Consumer(kafkaClient, 'test-service-group');

        // Subscribe to all the topics the service is interested in
        // await consumer.subscribe([
        //     { topic: 'test-topic', eventHandler: exampleEventHandler },
        // ]);

        // Create app server
        const app = new InversifyExpressServer(diContainer, null, {
            rootPath: '/partner-app/api',
        });
        app.setConfig(app => {
            app.use(json());
        });

        const server = app.build();

        const PORT = process.env.PORT || 9000;

        server.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (err) {
        console.error(err);
    }
})();
