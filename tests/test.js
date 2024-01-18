class wsSocker {
    ping() {
        var that = this;
        this.timer = setInterval(function () {
            that.send({ type: "ping" });
        }, 10000);
    }
}

const a = new wsSocker();
a.ping();
