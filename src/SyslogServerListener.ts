import {Mongo} from "./Mongo";
import {SyslogServer} from "./SyslogServer";
import {Log} from "./interfaces";

export class SyslogServerListener {
    constructor(private mongo: Mongo, private syslogServer: SyslogServer) {
        syslogServer.on("log", this.onLog.bind(this));
    }

    private onLog(log: Log) {
        console.log("----");
        console.log(log);
        this.mongo.logs().insertOne(log);
    }
}