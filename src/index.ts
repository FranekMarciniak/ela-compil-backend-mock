import Ws from "ws";
import express from "express";
import ip from "ip";
import _ from "lodash";

const app = express();
const cors = require("cors");
const ipAddress = ip.address();
const dataFile = require("../data.json");

let data = _.cloneDeep(dataFile);
const ws = new Ws.Server({ noServer: true, path: "/api/v1/refresh" });
const PORT = process.env.PORT || 4000;

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
  setTimeout(() => {
    data.SmartDevicesList[0].connectionState = "poorConnection";
    ws.send(JSON.stringify(data.SmartDeviceDetailsList[0]));
  }, 3000);
  setTimeout(() => {
    data.SmartDeviceDetailsList[0].brightness = 12;
    ws.send(JSON.stringify(data.SmartDeviceDetailsList[0]));
  }, 5000);
  setTimeout(() => {
    data.SmartDeviceDetailsList[0].brightness = 50;
    ws.send(JSON.stringify(data.SmartDeviceDetailsList[0]));
  }, 7000);
  setTimeout(() => {
    data = _.cloneDeep(dataFile);
    console.log(dataFile);
    ws.send(JSON.stringify(data.SmartDeviceDetailsList[0]));
  }, 10000);
  ws.on("close", function close() {
    console.log("Client Disconnected");
  });
});
app.get("/api/v1/devices", (req, res) => {
  // console.log("first");
  if (!data) return res.status(400).send("No devices found");
  res.status(200).json(data.SmartDevicesList);
});
app.get("/api/v1/devices/:id", (req, res) => {
  if (!data) return res.status(404).send("No device found");
  const deviceToReturn = data.SmartDeviceDetailsList.find(
    (device: any) => device.id === req.params.id
  );
  if (!deviceToReturn)
    return res.status(404).json({ message: "Device not found" });
  res.status(200).json(deviceToReturn);
});
const server = app.listen(PORT, () => console.log(ipAddress, PORT));

app.get("/", function (req, res) {
  res.send("hello world");
});
server.on("upgrade", (request, socket, head) => {
  ws.handleUpgrade(request, socket, head, (socket) => {
    ws.emit("connection", socket, request);
  });
});
