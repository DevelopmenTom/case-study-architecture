import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';

import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { DataSource } from 'typeorm';

const getParametersFromSSM = async () => {
    try {
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

        const envVars: any = {};

        if (response.Parameters) {
            for (const p of response.Parameters) {
                envVars[p.Name!] = p.Value;
            }
        }

        return envVars;
    } catch (error: any) {
        console.log('Failed to read parameters from SSM with error: ', error);
    }
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

    return {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '5433'),
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
        entities: [__dirname + '/entities/**/*.{js,ts}'],
        ...(await getDBConfig()),
    };

    return new DataSource(config);
};
