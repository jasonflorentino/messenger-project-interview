require("dotenv").config();
const db = require("../db");

async function test() {
  try {
    await db.authenticate();
    console.log('Connection has been established successfully.');
    process.exit();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  
}

test();