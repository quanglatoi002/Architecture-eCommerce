"use strict";

class RoundRobin {
    constructor() {
        this.servers = [];
        this.index = 0;
    }

    //add server
    addServer(server) {
        this.servers.push(server);
    }

    //get next server
    getNextServer() {
        if (!this.servers.length) {
            throw new Error("No servers available");
        }
    }
}
