import express  from "express";
import authRouter from "./routes/authrouter";
const app = express();

// app.use is builtin middleware of Express
app.use(express.json()); // application label middleware
app.use(express.urlencoded({extended:true}))
app.use("/auth",authRouter); // router based middleware


export default app;