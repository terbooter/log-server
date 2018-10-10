import * as express from "express";
import {Application} from "express";
import * as bodyParser from "body-parser";

import * as logger from "morgan";
import * as cookieParser from "cookie-parser";
import * as path from "path";

import {MainRouter} from "./routes/MainRouter";
import {Mongo} from "./Mongo";


export class WebServer {

    private app: Application = express();

    constructor(private mongo: Mongo) {

        this.app
            .use(logger("dev"))
            .use(bodyParser.json())
            .use(bodyParser.urlencoded({extended: false}))
            .use(cookieParser())
            .set("view engine", "ejs")
            .set("views", path.resolve(__dirname, "../views"))
            .use(this.setHeaders.bind(this))
            .use("/", this.options.bind(this))
            .use("/", (new MainRouter(mongo).router))
            .use(this.midleware404)
            .use(this.finalMiddleware)
    }

    private async options(req, res, next) {
        if (req.method !== "OPTIONS") {
            next();
            return;
        }

        console.log("Get options request");
        res.json({cors: true})
    }


    private setHeaders(req, res: express.Response, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        next();
    }

    public async listen(port): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.app.listen(port, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log(`Web Server listening on port ${port}`);
                resolve();
            });
        });
    }

    public getApp(): Application {
        return this.app;
    }

    private async midleware404(req, res, next) {
        let err: any = new Error("Not Found");
        err.status = 404;
        next(err);
    }

    private finalMiddleware(err, req, res, next) {

        if (err.statusCode) {
            err.status = err.statusCode;
        }
        err.status = err.status || 500;
        if (err.status === 500) {
            console.log(err);
        }

        let r: any = {
            success: false,
            message: err.message || "Unknown error"
        };

        if (err.description) {
            r.description = err.description;
        }

        res.status(err.status);
        console.log(err);

        res.json({success: false, error: {message: err.message, all: err}});
    };
}
