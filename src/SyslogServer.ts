import dgram = require("dgram");
import {AddressInfo, Socket} from "dgram";
import {Log} from "./interfaces";
import {EventEmitter} from "events";

export class SyslogServer extends EventEmitter {
    private socket: Socket;

    constructor() {
        super();
        this.socket = dgram.createSocket("udp4");

        let socket = this.socket;

        socket.on("error", this.onError.bind(this));
        socket.on("message", this.onMessage.bind(this));
        socket.on("listening", this.onListening.bind(this));
    }

    public listen(port: number) {
        this.socket.bind(port);
    }

    private onError(error: Error) {
        console.log(`server error:\n${error.stack}`);
        this.socket.close();
    }

    private onMessage(rawData: Buffer, rinfo: AddressInfo) {
        console.log(JSON.stringify(rinfo));
        console.log("----------------");
        console.log(`server got: ${rawData} from ${rinfo.address}:${rinfo.port}`);

        let log = this.parseIncomingMessage(rawData);
        this.emit("log", log);
    }

    private parseIncomingMessage(rawData: Buffer): Log {
        let message = rawData.toString("utf-8");

        let arr = message.split(" ");

        let container = arr[2];
        container = container.substr(0, container.length - 1);
        let log: Log = {
            created_at: new Date(),
            host: arr[1],
            container: container,
            message: message.split(`${container}: `)[1]
        };

        return log;
    }

    private onListening() {
        const address = this.socket.address();
        console.log(`Syslog Server listening ${address.address}:${address.port}`);
    }
}