import { Container } from 'inversify';

import './src/lib/base-controller';
import { PasswordManagerService, PasswordManagerServiceImpl } from './src/services';
import { TYPES } from './src/lib/types';
import { UserRepository, UserRepositoryImpl } from './src/repositories';
import { initializeDataSource } from './src/lib/data-source';
// import './src/controllers';

// import {
//     ExampleService,
//     ExampleServiceImpl,
//     UserService,
//     UserServiceImpl,
// } from './src/services';

export const diContainer = new Container();

// bind services
// diContainer.bind<ExampleService>(TYPES.ExampleService).to(ExampleServiceImpl);
// diContainer.bind<UserService>(TYPES.UserService).to(UserServiceImpl);
diContainer
    .bind<PasswordManagerService>(TYPES.PasswordManagerService)
    .to(PasswordManagerServiceImpl);

// bind repositories
diContainer.bind<UserRepository>(TYPES.UserRepository).to(UserRepositoryImpl);

export const initializeDataSourceInContainer = async () => {
    const dataSource = await initializeDataSource();

    // Only bind if not already bound
    if (!diContainer.isBound(TYPES.DB)) {
        diContainer.bind(TYPES.DB).toConstantValue(dataSource);
    }
};

