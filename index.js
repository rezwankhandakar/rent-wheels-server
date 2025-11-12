



const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = "mongodb+srv://rent-wheelsDB:ZCEhzcM8oH3GD6dF@cluster0.fu1n5ti.mongodb.net/rentWheelsDB?retryWrites=true&w=majority";
const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1 } });

async function run() {
  try {
    await client.connect();
    console.log("MongoDB connected");

    const db = client.db("rentWheelsDB");
    const carsCollection = db.collection("cars");
    const bookingsCollection = db.collection("bookings");

    // ✅ Get all cars (public)
    app.get("/api/cars", async (req, res) => {
      try {
        const cars = await carsCollection.find({}).toArray();
        res.send(cars);
      } catch (err) {
        res.status(500).send({ success: false, message: "Failed to fetch cars" });
      }
    });

    // ✅ Featured cars (latest 6)
app.get("/api/cars/featured", async (req, res) => {
  try {
    const cars = await carsCollection
      .find({ status: { $ne: "unavailable" } })
      .sort({ _id: -1 })
      .limit(6)
      .toArray();
    res.send(cars);
  } catch (err) {
    res.status(500).send({ success: false, message: "Failed to fetch featured cars" });
  }
});

// ✅ Top Rated Cars
app.get("/api/cars/top-rated", async (req, res) => {
  try {
    const cars = await carsCollection.find({}).limit(3).toArray();
    res.send(cars);
  } catch (err) {
    res.status(500).send({ success: false, message: "Failed to fetch top rated cars" });
  }
});

    // ✅ Get single car by id
    app.get("/api/cars/:id", async (req, res) => {
      try {
        const car = await carsCollection.findOne({ _id: new ObjectId(req.params.id) });
        res.send(car);
      } catch (err) {
        res.status(500).send({ success: false, message: "Failed to fetch car" });
      }
    });

    // ✅ My Listings (provider email অনুযায়ী গাড়ি)
    app.get("/api/myCars", async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) return res.status(400).send({ success: false, message: "Email required" });

        const cars = await carsCollection.find({ providerEmail: email }).toArray();
        res.send(cars);
      } catch (err) {
        res.status(500).send({ success: false, message: "Failed to fetch user cars" });
      }
    });

    // ✅ Add new car
    app.post("/api/cars", async (req, res) => {
      try {
        const car = req.body;
        const result = await carsCollection.insertOne(car);
        res.send({ success: true, insertedId: result.insertedId });
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    // ✅ Update car
    app.put("/api/cars/:id", async (req, res) => {
      try {
        const data = req.body;
        delete data._id;
        if (data.rentPrice) data.rentPrice = Number(data.rentPrice);

        const result = await carsCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: data }
        );
        res.send({ success: true, result });
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    // ✅ Delete car
    app.delete("/api/cars/:id", async (req, res) => {
      try {
        const result = await carsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        res.send({ success: true, result });
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    // ✅ Book a car
    app.post("/api/bookings", async (req, res) => {
      try {
        const { carId, userName, userEmail } = req.body;
        const car = await carsCollection.findOne({ _id: new ObjectId(carId) });
        if (!car) return res.status(404).send({ success: false, message: "Car not found" });

        // Insert booking
        const booking = {
          carId,
          carName: car.name,
          imageUrl: car.imageUrl,
          rentPrice: car.rentPrice,
          location: car.location,
          providerName: car.providerName,
          userName,
          userEmail,
          status: "booked",
          date: new Date()
        };
        await bookingsCollection.insertOne(booking);

        // Update car status
        await carsCollection.updateOne(
          { _id: new ObjectId(carId) },
          { $set: { status: "unavailable" } }
        );

        res.send({ success: true });
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    // ✅ Get bookings for a user
    app.get("/api/bookings", async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) return res.status(400).send({ success: false, message: "Email required" });

        const bookings = await bookingsCollection.find({ userEmail: email }).toArray();
        res.send(bookings);
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error(err);
  }
}

run();
