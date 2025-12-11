import {
  app_default
} from "./chunk-6WDY56F4.js";
import "./chunk-4TJSMZYY.js";
import "./chunk-C6GKSQGS.js";
import "./chunk-7Z7EU3X5.js";
import {
  sequelize
} from "./chunk-FSIT3LXZ.js";

// src/index.ts
import http from "http";
import dotenv from "dotenv";
dotenv.config();
var PORT = process.env.PORT;
var server = http.createServer(app_default);
server.listen(PORT, function() {
  console.log(`Server started at http://localhost:${PORT}`);
});
async function testDB() {
  try {
    await sequelize.authenticate();
    console.log("\u2705 Database connection successful!");
    await sequelize.sync();
    console.log("\u2705 Models synced");
  } catch (error) {
    console.error("\u274C Unable to connect to the database:", error);
  }
}
testDB();
//# sourceMappingURL=index.js.map