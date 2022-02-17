import "reflect-metadata";
import fp from 'fastify-plugin';
import { createConnection, getConnectionOptions } from 'typeorm';
import { User } from '../modules/user_entity';

export default fp(async server => {
    try {
        const connectionOptions = await getConnectionOptions();
        Object.assign(connectionOptions, {
            options: { encrypt: true },
            entities: [User] 
        })
        const connection = await createConnection(connectionOptions)
        console.log(`Database connection created ${connection}`)
    } catch (error) {
        server.log.error(`Failed to connected with database`);
    }
})