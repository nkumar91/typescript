import {
  authrouter_default
} from "./chunk-4TJSMZYY.js";

// src/app.ts
import express from "express";
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authrouter_default);
var app_default = app;

export {
  app_default
};
//# sourceMappingURL=chunk-6WDY56F4.js.map