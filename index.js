const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.efsdsdy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  const sectorsCollection = client.db("task-1").collection("sectors");

  const usersCollection = client.db("task-1").collection("users");

  try {
    app.get("/sectors", async (req, res) => {
      const query = {};
      const sectors = await sectorsCollection.find(query).toArray();
      res.send(sectors);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = {
        email: user.email,
      };
      const alreadyAssigned = await usersCollection.find(query).toArray();
      if (alreadyAssigned.length) {
        return res.send({ acknowledged: false });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });

    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const info = req.body;

      const filter = { email: email };
      const user = await usersCollection.findOne(filter);
      const option = { upsert: true };
      const updatedDoc = {
        $set: {
          name: info.name,
          sectors: info.sectors,
          terms: info.terms,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        option
      );
    });
  } finally {
  }
}
run().catch(console.log());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
