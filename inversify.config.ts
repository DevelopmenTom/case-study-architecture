import { Container } from 'inversify';

import './src/lib/base-controller';
import { PasswordManagerServiceImpl } from './src/services';
import { DISymbols } from './src/lib';
import { UserRepositoryImpl } from './src/repositories';
import { initializeDataSource } from './src/lib';
import { UserRepository } from './src/types/repositories/UserRepository';
import { PasswordManagerService } from './src/types/services/PasswordManagerService';
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
    .bind<PasswordManagerService>(DISymbols.PasswordManagerService)
    .to(PasswordManagerServiceImpl);

// bind repositories
diContainer.bind<UserRepository>(DISymbols.UserRepository).to(UserRepositoryImpl);

export const initializeDataSourceInContainer = async () => {
    const dataSource = await initializeDataSource();
    
    if (!diContainer.isBound(DISymbols.DB)) {
        diContainer.bind(DISymbols.DB).toConstantValue(dataSource);
    }
};

