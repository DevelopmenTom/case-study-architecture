import { Container } from 'inversify';

import './src/lib/base-controller';
import { AuthServiceImpl, PasswordManagerServiceImpl, UserServiceImpl } from './src/services';
import { DISymbols } from './src/lib';
import { UserRepositoryImpl } from './src/repositories';
import { initializeDataSource } from './src/lib';
import { UserRepository } from './src/types/repositories';
import { AuthService, PasswordManagerService, UserService } from './src/types/services';
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
diContainer.bind<AuthService>(DISymbols.AuthService).to(AuthServiceImpl);
diContainer.bind<UserService>(DISymbols.UserService).to(UserServiceImpl);
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

