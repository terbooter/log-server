import {EventEmitter} from "events";
import {Collection, Db, MongoClient, MongoClientOptions} from "mongodb";


export class Mongo extends EventEmitter {

    private client: MongoClient;
    private db: Db;

    constructor() {
        super();
    }

    public async connect() {
        const MongoClient = require("mongodb").MongoClient;

        const servers = process.env.MONGO_HOST;
        const password = process.env.MONGO_PASSWORD;
        const user = "log-server";
        const database = "log-server";

        let url = `mongodb://${user}:${password}@${servers}/${database}`;
        console.log(url);

        const options: MongoClientOptions = {
            useNewUrlParser: true
        };

        this.client = await MongoClient.connect(url, options);
        console.log("Connected");
        this.db = this.client.db(database);
        this.createIndexes();
    }

    public getDB(): Db {
        return this.db;
    }

    public logs(): Collection {
        return this.db.collection("logs");
    }


    private createIndexes() {
        this.logs().createIndex({"created_at": 1}, {"unique": false, background: true});
        this.logs().createIndex({"host": 1}, {"unique": false, background: true});
        this.logs().createIndex({"container": 1}, {"unique": false, background: true});
    }
}
