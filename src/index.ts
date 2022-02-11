import Ws from "ws";
import express from "express";
import ip from "ip";

const app = express();
const cors = require("cors");
const ipAddress = ip.address();
const data = require("./data.json");

console.log(ipAddress, data);
const ws = new Ws.Server({ noServer: true, path: "/api/v1/refresh" });

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

ws.on("connection", function (ws) {
  console.log("Client Connected");

  ws.on("close", function close() {
    console.log("Client Disconnected");
  });
});

app.get("/api/v1/devices", (req, res) => {
  console.log("first");
  if (!data) return res.status(500);
  res.status(200).json(data.SmartDevicesList);
});
app.get("/api/v1/devices/:id", (req, res) => {
  if (!data) return res.status(500);
  res.status(200).json(data.SmartDevicesList);
});
const server = app.listen(3080);

app.get("/", function (req, res) {
  res.send("hello world");
});
server.on("upgrade", (request, socket, head) => {
  ws.handleUpgrade(request, socket, head, (socket) => {
    ws.emit("connection", socket, request);
  });
});
