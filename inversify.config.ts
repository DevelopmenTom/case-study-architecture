import { Container } from 'inversify';

import './src/lib/base-controller';
import { PasswordManagerService, PasswordManagerServiceImpl } from './src/services';
import { TYPES } from './src/lib/types';
// import './src/controllers';

// import {
//     ExampleService,
//     ExampleServiceImpl,
//     UserService,
//     UserServiceImpl,
// } from './src/services';
// import { UserRepository, UserRepositoryImpl } from './src/repositories';

export const diContainer = new Container();

diContainer
    .bind<PasswordManagerService>(TYPES.PasswordManagerService)
    .to(PasswordManagerServiceImpl);

// // bind services
// diContainer.bind<ExampleService>(TYPES.ExampleService).to(ExampleServiceImpl);
// diContainer.bind<UserService>(TYPES.UserService).to(UserServiceImpl);
// diContainer
//     .bind<PasswordManagerService>(TYPES.PasswordManagerService)
//     .to(PasswordManagerServiceImpl);

// // bind repositories
// diContainer.bind<UserRepository>(TYPES.UserRepository).to(UserRepositoryImpl);
