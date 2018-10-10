require("dotenv").config();

import {Mongo} from "./Mongo";
import {SyslogServer} from "./SyslogServer";
import {SyslogServerListener} from "./SyslogServerListener";
import {WebServer} from "./WebServer";

console.log(process.env.JWT_SECRET);
async function main() {
    let mongo = new Mongo();
    await mongo.connect();
    let syslogServer = new SyslogServer();

    new SyslogServerListener(mongo, syslogServer);

    syslogServer.listen(5145);

    let webServer = new WebServer(mongo);
    webServer.listen(8888);
}

main();