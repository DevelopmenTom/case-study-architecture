import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const getParametersFromSSM = async () => {
    const ssmClient = new SSMClient({ region: 'eu-central-1' });

    const input = {
        Names: [
            'k8s_rds_host',
            'k8s_rds_db_name',
            'k8s_rds_master_username',
            'k8s_rds_master_password',
        ],
        WithDecryption: true,
    };

    const command = new GetParametersCommand(input);

    const response = await ssmClient.send(command);

    const envVars = {};

    if (!response.Parameters) {
        throw new Error(
            'no parameters found on SSM. cannot initialize DB connection'
        );
    }

    for (const p of response.Parameters) {
        if (!p.Value) {
            throw new Error(
                `param ${p.Name} had no value on SSM. cannot initialize DB connection`
            );
        }
        envVars[p.Name!] = p.Value;
    }

    return envVars;
};

const getDBConfig = async () => {
    if (process.env.NODE_ENV === 'production') {
        const params = await getParametersFromSSM();
        return {
            host: params['k8s_rds_host'],
            port: 5432,
            username: params['k8s_rds_master_username'],
            password: params['k8s_rds_master_password'],
            database: params['k8s_rds_db_name'],
            synchronize: false,
            logging: false,
        };
    }

    const getPortFromEnv = DATABASE_PORT => {
        const parsedEnvVar = parseInt(DATABASE_PORT);

        if (Number.isNaN(parsedEnvVar)) {
            throw new Error(
                'DATABASE_PORT is not a number, will not be able to connect to DB'
            );
        }

        return parsedEnvVar;
    };

    return {
        host: process.env.DATABASE_HOST,
        port: getPortFromEnv(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        synchronize: true,
        logging: true,
    };
};

export const getDataSource = async (): Promise<DataSource> => {
    const config: PostgresConnectionOptions = {
        type: 'postgres',
        entities: [__dirname + '/entities/**/!(*.spec).{js,ts}'],
        ...(await getDBConfig()),
    };

    return new DataSource(config);
};
