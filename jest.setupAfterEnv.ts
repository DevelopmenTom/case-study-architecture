import { User } from './src/entities';
import { initializeDataSource } from './src/lib';
import { mockUserData } from './src/testHelpers/mockUserData';

// making sure the User table exists in a fresh DB (e.g in CI) to enable running tests in parallel
beforeAll(async () => {
    const setupDataSource = await initializeDataSource();

    const userRepository = setupDataSource.getRepository(User);
    await userRepository.save(mockUserData());
}, 30000);


afterAll(async () => {
    const setupDataSource = await initializeDataSource();
    
    if (setupDataSource?.isInitialized) {
        await setupDataSource.destroy();
    }
});
