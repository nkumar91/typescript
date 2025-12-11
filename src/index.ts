
import http from 'http';
import app from './app';
import dotenv from "dotenv";
import { sequelize } from './config/db';
dotenv.config();

const PORT:any = process.env.PORT;
const server = http.createServer(app);
server.listen(PORT,function(){
    console.log(`Server started at http://localhost:${PORT}`)
})

async function testDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection successful!");
     await sequelize.sync();
    // await sequelize.sync({force:true}); // {force:true} {alter:true} apply only development mode
    console.log("✅ Models synced");
  } catch (error) {
    console.error("❌ Unable to connect to the database:",error);
  }
}
testDB();


