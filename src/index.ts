import cluster from "cluster";
import os from 'os';
import http from 'http';
import app from './app';
import dotenv from "dotenv";
import { connectRedis } from "./config/redis";
// Register models so they are included in sequelize sync
import './models/index';
dotenv.config();
const CPU_COUNT = os.cpus().length;
const PORT: any = process.env.PORT;

// console.log(CPU_COUNT);
// if (cluster.isPrimary) {
//   console.log(`Primary process ${process.pid}`);

//   for (let i = 0; i < CPU_COUNT; i++) {
//     cluster.fork();
//   }

//   cluster.on("exit", (worker) => {
//     console.log(`Worker ${worker.process.pid} died, restarting...`);
//     cluster.fork();
//   });

// }else{
// (async () => {
//     const server = http.createServer(app);
//     await connectRedis();
//     server.listen(PORT, function () {
//         console.log(`Server started at http://localhost:${PORT}`)
//     })
// })();
// }



(async () => {
    const server = http.createServer(app);
    await connectRedis();
    server.listen(PORT, function () {
        console.log(`Server started at http://localhost:${PORT}`)
    })
})();





