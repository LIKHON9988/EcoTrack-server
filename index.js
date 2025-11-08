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

    app.post("/challenges", async (req, res) => {
      const newChallange = req.body;
      const result = await challengesColl.insertOne(newChallange);

      res.send(result);
    });

    app.delete("/challenges/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await challengesColl.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
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
