import {Mongo} from "./Mongo";
import {SyslogServer} from "./SyslogServer";
import {SyslogServerListener} from "./SyslogServerListener";

require("dotenv").config();

async function main() {
    let mongo = new Mongo();
    await mongo.connect();
    let syslogServer = new SyslogServer();

    new SyslogServerListener(mongo, syslogServer);

    syslogServer.listen(5145);
}

main();