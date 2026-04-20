/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

const uri = process.env.MONGODB_URI;
console.log(
  "Testing connection to:",
  uri ? uri.substring(0, 40) + "..." : "undefined",
);

async function test() {
  try {
    await mongoose.connect(uri);
    console.log("SUCCESS: Connected to MongoDB");
    process.exit(0);
  } catch (err) {
    console.error("FAILURE: Could not connect to MongoDB");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    if (err.reason) console.error("Reason:", err.reason);
    process.exit(1);
  }
}

test();
