import { DataSource } from 'typeorm';

import { getDataSource } from '../typeormconfig';

let dataSourceInstance: DataSource | null = null;

export const initializeDataSource = async (): Promise<DataSource> => {
    if (dataSourceInstance?.isInitialized) {
        return dataSourceInstance;
    }

    if (!dataSourceInstance) {
        dataSourceInstance = await getDataSource();
    }

    if (!dataSourceInstance.isInitialized) {
        await dataSourceInstance.initialize();
    }

    return dataSourceInstance;
};
