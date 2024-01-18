const mysql = require("mysql2");
const { Worker, isMainThread, workerData } = require("worker_threads");

const pool = mysql.createPool({
    host: "localhost",
    user: "quang",
    password: "123456",
    database: "shopDEV",
});

const batchSize = 100000;
const totalSize = 10_000_000;
let currentId = 1;

console.time(":::::TIMER:::::");

const insertBatch = async () => {
    const values = [];

    for (let i = 0; i < batchSize && currentId <= totalSize; i++) {
        const name = `name-${currentId}`;
        const age = currentId;
        const address = `address${currentId}`;
        values.push([currentId, name, age, address]);
        currentId++;
    }

    if (!values.length) {
        pool.end((err) => {
            if (err) {
                console.log("error occurred while inserting");
            } else {
                console.log("Connection closed pool closed successfully");
            }
        });
        return;
    }

    const sql = `INSERT INTO test_table (id, name, age, address) VALUES ?`;

    pool.query(sql, [values], async function (err, results) {
        if (err) throw err;
        console.log(`Inserted ${results.affectedRows} records`);
        await insertBatch();
    });
};

insertBatch().catch(console.error);
