import { Sequelize } from 'sequelize-typescript';
import { Contact } from '../contact/contact.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: '127.0.0.1',
        port: 5432,
        username: 'postgres',
        password: '',
        database: 'auto-sub',
      });
      sequelize.addModels([Contact]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
