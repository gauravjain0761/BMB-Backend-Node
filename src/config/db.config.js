const mongoose = require("mongoose");
const DB = process.env.DB_LOCAL;

mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true });
const con = mongoose.connection;

module.exports = con;
