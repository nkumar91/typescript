
import http from 'http';
import app from './app';
import dotenv from "dotenv";
// Register models so they are included in sequelize sync
import './models/index';
dotenv.config();

const PORT:any = process.env.PORT;
const server = http.createServer(app);
server.listen(PORT,function(){
    console.log(`Server started at http://localhost:${PORT}`)
})




