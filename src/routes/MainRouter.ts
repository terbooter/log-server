import * as express from "express";
import {Request, Router} from "express";
import {JWTHelper} from "../lib/JWTHelper";
import {Mongo} from "../Mongo";
import {PasswordHelper} from "../lib/PasswordHelper";
import {ObjectID} from "bson";

export class MainRouter {

    public readonly router: Router;

    constructor(private mongo: Mongo) {

        this.router = express.Router();

        this.router
            .use((req, res, next) => {
                console.log(req.query);
                console.log(req.body);
                next();
            })
            .post("/signin", this.signIn.bind(this))
            .post("/signup", this.signUp.bind(this))
            .use(this.checkToken.bind(this))
            .post("/refresh-token", this.refreshToken.bind(this))
            .get("/me", this.getMe.bind(this))
            .get("/hosts", this.getHosts.bind(this))
            .get("/containers", this.getContainers.bind(this))
            .post("/get-logs", this.getLogs.bind(this))
    }

    private async checkToken(req: Request, res, next) {

        let authorizationHeader = req.get("authorization");
        if (!authorizationHeader) {
            res.json({success: false, error: {message: "authorization header missing"}});
            return;
        }
        let token = authorizationHeader.replace("Bearer ", "");
        console.log("---------------------");
        console.log(`->>${token}<<-`);
        console.log("---------------------");

        let decoded;
        try {
            decoded = await JWTHelper.verify(token);
        } catch (error) {
            res.json({success: false, error});
            return;
        }

        console.log(JSON.stringify(decoded));

        if (!decoded.user_id) {
            res.json({success: false, error: {message: "user_id not found in JWT payload"}});
            return;
        }
        res.user_id = decoded.user_id;
        next();
    }

    private async getLogs(req, res, next) {
        const {host, container, text} = req.body;
        let find: any = {};
        if (host !== "all") {
            find.host = host;
        }
        if (container !== "all") {
            find.container = container;
        }
        if (text !== "") {
            find.message = {$regex: `.*${text}.*`};
        }
        let arr = await this.mongo.logs().find(find).sort({created_at: -1}).limit(20).toArray();
        res.json({success: true, data: {logs: arr}});
    }

    private async getHosts(req, res, next) {
        let arr = await this.mongo.logs().distinct("host", {});
        arr.unshift("all");
        res.json({success: true, data: {hosts: arr}});
    }

    private async getContainers(req, res, next) {
        let arr = await this.mongo.logs().distinct("container", {});
        arr.unshift("all");
        res.json({success: true, data: {containers: arr}});
    }

    private async getMe(req, res, next) {
        const user_id = res.user_id;

        let user;
        try {
            user = await this.mongo.users().findOne({_id: new ObjectID(res.user_id)});
        } catch (error) {
            next();
            return;
        }
        if (!user) {
            next({status: 404, message: "user not found"});
            return;
        }

        let me = Object.assign({}, user);
        delete me.password;
        res.json({success: true, data: {me}});
    }

    private async signUp(req, res, next) {
        let {email, password} = req.body;
        let passwordHash: string = await PasswordHelper.hashPassword(password);
        try {
            await this.mongo.users().insertOne({email, password: passwordHash});
        } catch (error) {
            if (error.constraint = "unique_email") {
                next({status: 400, message: "email already exists"});
                return;
            } else {
                next(error);
                return;
            }
        }
        res.json({success: true, data: {}});
    }

    private async signIn(req, res, next) {

        const {email, password} = req.body;
        let user;
        try {
            user = await this.mongo.users().findOne({email});
        } catch (error) {
            next();
            return;
        }
        if (!user) {
            next({status: 400, message: "email not found"});
            return;
        }

        if (!await PasswordHelper.checkPassword(password, user.password)) {
            next({status: 400, message: "wrong password"});
            return;
        }
        let token = JWTHelper.sign({user_id: user._id});
        let me = Object.assign({}, user);
        delete me.password;
        res.json({success: true, data: {me, token}});
    }

    private async refreshToken(req, res, next) {
        const {token} = req.body;
        let user;
        try {
            user = await this.mongo.users().findOne({_id: new ObjectID(res.user_id)});
            console.log(user);
        } catch (error) {
            next();
            return;
        }
        if (!user) {
            next({status: 400, message: `user not found. user_id=${res.user_id}`});
            return;
        }

        let newToken = JWTHelper.sign({user_id: user._id});
        let me = Object.assign({}, user);
        delete me.password;
        res.json({success: true, data: {me, token: newToken}});
    }

}