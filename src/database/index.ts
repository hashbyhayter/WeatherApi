import knex from 'knex';
import { DB_USER, DB_PASSWORD, DB_SERVER, DB_DATABASE } from '../var/config'

export const database = knex({
  client: 'mssql',
  connection: {
    server: DB_SERVER,
    port: 1433,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    connectionTimeout: 180000,
    driver: "tedious",
    stream: true,
    options: {
      appName: "WeatherAPI",
      encrypt: false,
      enableArithAbort: true,
    },
    pool: {
      max: 70,
      min: 0,
    },
  },
});;