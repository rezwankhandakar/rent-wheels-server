


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

    app.post("/cars", async (req, res) => {
  const car = req.body;
  const result = await carsCollection.insertOne(car);
  res.send(result);
});


// ✅ Get cars by provider email
app.get("/api/myCars", async (req, res) => {
  try {
    const email = req.query.email; // query parameter: ?email=user@gmail.com
    const cars = await carsCollection.find({ providerEmail: email }).toArray();
    res.send(cars);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch user cars" });
  }
});

// ✅ Delete car
app.delete("/api/cars/:id", async (req, res) => {
  const id = req.params.id;
  const { ObjectId } = require("mongodb");
  try {
    const result = await carsCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "Failed to delete car" });
  }
});

// app.put("/api/cars/:id", async (req, res) => {
//   const { id } = req.params;
//   const updatedData = req.body;
//   const { ObjectId } = require("mongodb");

//   try {
//     const result = await carsCollection.updateOne(
//       { _id: new ObjectId(id) },
//       { $set: updatedData }
//     );
//     res.send(result);
//   } catch (error) {
//     res.status(500).send({ message: "Failed to update car" });
//   }
// });


app.get("/api/cars/:id", async (req, res) => {
  const { id } = req.params;
  const { ObjectId } = require("mongodb");

  try {
    const car = await carsCollection.findOne({ _id: new ObjectId(id) });
    res.send(car);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch car" });
  }
});

app.put("/api/cars/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = { ...req.body };
  const { ObjectId } = require("mongodb");

  // Remove _id if exists
  delete updatedData._id;

  // Ensure numeric fields are numbers
  if (updatedData.rentPrice) updatedData.rentPrice = Number(updatedData.rentPrice);

  try {
    const result = await carsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to update car" });
  }
});





    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error(err);
  }
}
run();