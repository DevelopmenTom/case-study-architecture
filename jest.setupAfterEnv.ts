import { DataSource } from 'typeorm';

import { User } from './src/entities';
import { mockUserData } from './src/testHelpers/mockUserData';
import { getDataSource } from './src/typeormconfig';

let setupDataSource: DataSource;

// making sure the User table exists in a fresh DB (e.g in CI) to enable running tests in parallel
beforeAll(async () => {
    setupDataSource = await getDataSource();
    await setupDataSource.initialize();

    const userRepository = setupDataSource.getRepository(User);
    await userRepository.save(mockUserData());
}, 30000);

afterAll(async () => {
    if (setupDataSource?.isInitialized) {
        await setupDataSource.destroy();
    }
});
