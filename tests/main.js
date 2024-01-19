const { Worker, isMainThread } = require("worker_threads");

const totalSize = 10_000_000;
const numThreads = 5;

// 5 luồng sẽ được chia 1 -> 2tr, 2tr.1 -> 4tr ... 10tr
if (isMainThread) {
    for (let i = 0; i < numThreads; i++) {
        const startId = i * Math.ceil(totalSize / numThreads) + 1;
        const endId = Math.min(
            (i + 1) * Math.ceil(totalSize / numThreads),
            totalSize
        );

        new Worker("./connect.mysql.test.js", {
            workerData: { startId, endId },
        });
    }
} else {
    // Worker logic is in the separate worker.js file
}
