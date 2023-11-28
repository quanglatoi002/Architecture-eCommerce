"user strict";

const Logger = require("../loggers/discord.log");

const pushToLogDiscord = async (req, res, next) => {
    try {
        Logger.sendToMessage(`this is::: ${req.get("host")}`);
        return next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    pushToLogDiscord,
};
