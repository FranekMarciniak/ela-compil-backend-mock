import Ws from "ws";
import express from "express";
import ip from "ip";
import _, { forEach } from "lodash";

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

const simulateWS = (ws: any) => {
  setTimeout(() => {
    data.SmartDevicesList[2].connectionState = "connected";
    data.SmartDeviceDetailsList[2].connectionState = "connected";
    ws.send(JSON.stringify(data.SmartDeviceDetailsList[2]));
  }, 1500);
  setTimeout(() => {
    data.SmartDevicesList[0].connectionState = "poorConnection";
    data.SmartDeviceDetailsList[0].connectionState = "poorConnection";
    ws.send(JSON.stringify(data.SmartDeviceDetailsList[0]));
  }, 4500);
  setTimeout(() => {
    data.SmartDeviceDetailsList[0].brightness = 12;
    ws.send(JSON.stringify(data.SmartDeviceDetailsList[0]));
  }, 5000);
  setTimeout(() => {
    data.SmartDevicesList[2].connectionState = "disconnected";
    data.SmartDeviceDetailsList[2].connectionState = "disconnected";
    ws.send(JSON.stringify(data.SmartDeviceDetailsList[2]));
  }, 6000);
  setTimeout(() => {
    data.SmartDevicesList[0].connectionState = "connected";
    data.SmartDeviceDetailsList[0].connectionState = "connected";
    ws.send(JSON.stringify(data.SmartDeviceDetailsList[0]));
  }, 7000);
  setTimeout(() => {
    data.SmartDeviceDetailsList[0].brightness = 50;
    ws.send(JSON.stringify(data.SmartDeviceDetailsList[0]));
  }, 7000);
  setTimeout(() => {
    data.SmartDeviceDetailsList[1].powerConsumption = 6;
    ws.send(JSON.stringify(data.SmartDeviceDetailsList[1]));
  }, 7300);
  setTimeout(() => {
    data.SmartDeviceDetailsList[1].powerConsumption = 8;
    ws.send(JSON.stringify(data.SmartDeviceDetailsList[1]));
  }, 7400);
  setTimeout(() => {
    data.SmartDeviceDetailsList[1].powerConsumption = 11;
    ws.send(JSON.stringify(data.SmartDeviceDetailsList[1]));
  }, 7800);
};

ws.on("connection", function (ws) {
  console.log("Client Connected");
  setInterval(() => {
    data.SmartDeviceDetailsList[2].brightness = Math.floor(Math.random() * 100);
    ws.send(JSON.stringify(data.SmartDeviceDetailsList[2]));
  }, 5000);
  simulateWS(ws);
  setInterval(() => simulateWS(ws), 8000);
  ws.on("close", function close() {
    console.log("Client Disconnected");
    data = _.cloneDeep(dataFile);
    data.SmartDeviceDetailsList.forEach((device: any) => {
      ws.send(JSON.stringify(device));
    });
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
