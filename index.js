const express = require("express");
const app = express();
let port = 5000;
require("dotenv").config();
const path = require("path");


// ----------- API's Connect ---------
const doctor = require("./src/routes/doctors.routes");
//-------- Mongodb connected --------------------------//
const con = require("./src/config/db.config");

con.on("open", () => {
  console.log("db connected....");
});

const bodyParser = require("body-parser");
var busboy = require("connect-busboy");
app.use(busboy());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ------- Cors --------------------
var cors = require("cors");
const { append } = require("express/lib/response");
app.use(cors());
app.options("*", cors());
app.use(express.json());

app.use("/api", doctor);

app.get("/", (req, res) => {
  res.send("Hello World!");
//   res.sendFile(path.join(__dirname, "/public/client/index.html"));
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
  console.log('I am Darkseid!');
});