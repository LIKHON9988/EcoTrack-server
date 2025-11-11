const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();

const port = process.env.PORT || 3000;

// midleware

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://Eco-Track:8RAw5p4jLpJnVUmZ@cluster30.jaxhuvk.mongodb.net/?appName=Cluster30";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Eco-Track is running");
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("Eco_db");
    const challengesColl = db.collection("challenges");
    const userColl = db.collection("User_coll");

    app.get("/challenges", async (req, res) => {
      console.log(req.query);
      const email = req.query.email;
      const query = {};
      if (email) {
        query.createdBy = email;
      }

      const cursor = challengesColl.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/active-challenges", async (req, res) => {
      const cursor = challengesColl.find().limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/challenges/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await challengesColl.findOne(query);
      res.send(result);
    });

    app.post("/challenges", async (req, res) => {
      const newChallange = req.body;
      const result = await challengesColl.insertOne(newChallange);

      res.send(result);
    });

    app.post("/challengesActivities/:id", async (req, res) => {
      const id = res.params.id;
      const query = { _id: new ObjectId(id) };
      const newCard = req.body;
      const result = await challengesColl.insertOne(newCard);
    });

    app.patch("/challenges/:id", async (req, res) => {
      const id = req.params.id;
      const updateChallenge = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: updateChallenge,
      };
      const result = await challengesColl.updateOne(query, update);
      res.send(result);
    });

    app.delete("/challenges/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await challengesColl.deleteOne(query);
      res.send(result);
    });

    // ----------------------------------------------------------------------------------------------
    const activitiesColl = db.collection("activities");

    app.get("/activities", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.status(401).send({ message: "Unauthorized" });
      }

      const result = await activitiesColl.find({ userEmail: email }).toArray();
      res.send(result);
    });

    app.post("/activities", async (req, res) => {
      const { userEmail, challenge } = req.body;
      if (!userEmail) {
        return res.status(401).send({ message: "Unauthorized" });
      }

      const existing = await activitiesColl.findOne({
        userEmail,
        "challenge._id": challenge._id,
      });

      if (existing) {
        return res.status(400).send({ message: "Already joined" });
      }

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

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Eco-Track is runnong on port : ${port}`);
});
