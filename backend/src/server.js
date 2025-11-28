const express = require("express");
const client = require("prom-client");
const si = require("systeminformation");

const app = express();
const register = new client.Registry();

// Metrics
const cpuGauge = new client.Gauge({ name: "server_cpu_usage", help: "CPU usage %" });
const ramGauge = new client.Gauge({ name: "server_ram_usage", help: "RAM usage %" });
const diskGauge = new client.Gauge({ name: "server_disk_usage", help: "Disk usage %" });

register.registerMetric(cpuGauge);
register.registerMetric(ramGauge);
register.registerMetric(diskGauge);
client.collectDefaultMetrics({ register });

async function updateMetrics() {
    const cpu = await si.currentLoad();
    const mem = await si.mem();
    const disk = await si.fsSize();

    cpuGauge.set(cpu.currentLoad);
    ramGauge.set((mem.used / mem.total) * 100);
    diskGauge.set(disk[0].use);
}

setInterval(updateMetrics, 5000);

app.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
});

app.listen(9000, () => console.log("Metrics server running on port 9000"));

