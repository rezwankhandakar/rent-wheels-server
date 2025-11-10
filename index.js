


const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://rent-wheelsDB:ZCEhzcM8oH3GD6dF@cluster0.fu1n5ti.mongodb.net/rentWheelsDB?retryWrites=true&w=majority";
const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1 } });

async function run() {
  try {
    await client.connect();
    console.log("MongoDB connected");

    const db = client.db("rentWheelsDB");
    const carsCollection = db.collection("cars");

    // Add a new car
app.post("/api/cars", async (req, res) => {
  try {
    const car = req.body; // JSON data পাঠানো হবে body তে
    const result = await carsCollection.insertOne(car);
    res.send({ success: true, insertedId: result.insertedId });
  } catch (err) {
    res.status(500).send({ success: false, error: err.message });
  }
});

app.get("/api/cars/top-rated", async (req, res) => {
  try {
    const cars = await carsCollection
      .find({})
      .sort({ rating: -1 })
      .limit(3)
      .toArray();
    res.send(cars);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch top-rated cars" });
  }
});



    // Featured cars route → latest 6 cars
    app.get("/api/cars/featured", async (req, res) => {
      try {
        const cars = await carsCollection
          .find({})
          .sort({ _id: -1 }) // newest first
          .limit(6)
          .toArray();
        res.send(cars);
      } catch (err) {
        res.status(500).send({ error: "Failed to fetch featured cars" });
      }
    });

    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error(err);
  }
}
run();
