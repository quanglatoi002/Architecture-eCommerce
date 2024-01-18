const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.json({
        msg: "Hello docker",
    });
});

app.listen(3000, () => {
    console.log("docker");
});
