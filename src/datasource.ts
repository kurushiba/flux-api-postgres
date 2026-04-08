import { DataSource } from 'typeorm';

export default new DataSource({
  migrationsTableName: 'migrations',
  type: 'sqlite',
  database: './data/api-template.sqlite',
  synchronize: false,
  migrationsRun: true,
  logging: ['query', 'error', 'log'],
  entities: [process.env.DB_TYPEORM_ENTITIES || 'src/**/*.entity.ts'],
  migrations: [process.env.DB_TYPEORM_MIGRATIONS || 'src/migrations/**/*.ts'],
  subscribers: [process.env.DB_TYPEORM_SUBSCRIBERS || 'src/subscriber/**/*.ts'],
});
