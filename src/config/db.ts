import dotenv from "dotenv";
import { Sequelize } from "sequelize";
dotenv.config();

const DATABASE = process.env.DB_NAME;
const USER = process.env.DB_USER;
const PASSWORD = process.env.DB_PASS;
console.log(DATABASE,USER,PASSWORD);

export const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASS!,
  {
    host: process.env.DB_HOST!,
    dialect: "mysql",
    logging: false,
  }
);