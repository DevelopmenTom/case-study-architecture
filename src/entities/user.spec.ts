import { DataSource, Repository } from 'typeorm';
import { User } from './user';
import { getDataSource } from '../typeormconfig';

describe('User Entity', () => {
    let dataSource: DataSource;
    let userRepository: Repository<User>;

    beforeAll(async () => {
        dataSource = await getDataSource();
        await dataSource.initialize();
        userRepository = dataSource.getRepository(User);
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    it('allows DB save and find operations on user', async () => {
        const newUser = userRepository.create({
            email: `test-${Date.now()}@example.com`,
            password: 'hashedPassword123',
            firstName: 'John',
            lastName: 'Doe',
        });

        const savedUser = await userRepository.save(newUser);

        const foundUser = await userRepository.findOneOrFail({
            where: { id: savedUser.id },
        });

        expect(foundUser).toBeDefined();
    });
});
