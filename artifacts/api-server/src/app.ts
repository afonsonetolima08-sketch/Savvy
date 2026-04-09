import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import { logger } from "./lib/logger";
import { Request, Response } from 'express'

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req: Request) => {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
       {
        return {
          statusCode:res: Response.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
