const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Eco-Track server is running ");
});

async function run() {
  try {
    // await client.connect();

    const db = client.db("Eco_db");
    const challengesColl = db.collection("challenges");
    const tipsColl = db.collection("tips");
    const activitiesColl = db.collection("activities");
    const UpcommingEventColl = db.collection("upcomming_events");

    // ---------- Challenges ----------
    app.get("/challenges", async (req, res) => {
      const email = req.query.email;
      const query = email ? { createdBy: email } : {};
      const result = await challengesColl.find(query).toArray();
      res.send(result);
    });

    app.get("/active-challenges", async (req, res) => {
      const result = await challengesColl
        .find()
        .sort({ startDate: 1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.get("/challenges/:id", async (req, res) => {
      const id = req.params.id;
      const result = await challengesColl.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.post("/challenges", async (req, res) => {
      const newChallenge = req.body;
      const result = await challengesColl.insertOne(newChallenge);
      res.send(result);
    });

    app.patch("/challenges/:id", async (req, res) => {
      const id = req.params.id;
      const updateChallenge = req.body;
      const result = await challengesColl.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateChallenge }
      );
      res.send(result);
    });

    app.delete("/challenges/:id", async (req, res) => {
      const id = req.params.id;
      const result = await challengesColl.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // ---------- Activities ----------
    app.get("/activities", async (req, res) => {
      const email = req.query.email;
      if (!email) return res.status(401).send({ message: "Unauthorized" });

      const result = await activitiesColl.find({ userEmail: email }).toArray();
      res.send(result);
    });

    app.post("/activities", async (req, res) => {
      const { userEmail, challenge } = req.body;
      if (!userEmail) return res.status(401).send({ message: "Unauthorized" });

      const existing = await activitiesColl.findOne({
        userEmail,
        "challenge._id": challenge._id,
      });

      if (existing) return res.status(400).send({ message: "Already joined" });

      const result = await activitiesColl.insertOne({
        userEmail,
        challenge,
        joinedAt: new Date(),
      });

      res.send(result);
    });

    app.delete("/activities/:id", async (req, res) => {
      const id = req.params.id;
      const result = await activitiesColl.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    // ---------tips-------------
    app.get("/tips", async (req, res) => {
      try {
        const result = await tipsColl.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching tips:", error);
        res.status(500).send({ message: "Failed to load tips" });
      }
    });

    // ------------Upcomming events-----

    app.get("/upcoming-events", async (req, res) => {
      try {
        const result = await UpcommingEventColl.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
        res.status(500).send({ message: "Failed to load events" });
      }
    });

    // Check DB connection
    // await client.db("admin").command({ ping: 1 });
    console.log(" MongoDB connected successfully");
  } catch (error) {
    console.error(" Server error:", error);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(` Eco-Track server running on port ${port}`);
});
