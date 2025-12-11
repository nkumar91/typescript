// src/config/db.ts
import dotenv from "dotenv";
import { Sequelize } from "sequelize";
dotenv.config();
var DATABASE = process.env.DB_NAME;
var USER = process.env.DB_USER;
var PASSWORD = process.env.DB_PASS;
console.log(DATABASE, USER, PASSWORD);
var sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false
  }
);

export {
  sequelize
};
//# sourceMappingURL=chunk-FSIT3LXZ.js.map