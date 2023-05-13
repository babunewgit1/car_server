const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
app.use(cors());
app.use(express.json());
require("dotenv").config();

app.get("/", (req, res) => {
  res.send("hello world");
});

const uri =
  "mongodb+srv://carproject:YDKJL64MDdDqDdVb@cluster-1.vbj8kjp.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("cardatabase").collection("car");
    const productbd = client.db("cardatabase").collection("products");
    const checkout = client.db("cardatabase").collection("checkout");

    app.get("/service", async (req, res) => {
      const cursor = database.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const options = {
        projection: { _id: 1, title: 1, img: 1, price: 1, description: 1 },
      };
      const result = await database.findOne(query, options);
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const cursor = productbd.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/checkout", async (req, res) => {
      const data = req.body;
      const result = await checkout.insertOne(data);
      res.send(result);
    });

    app.get("/checkout", async (req, res) => {
      let query = {};
      if (req.query?.logMail) {
        query = { logMail: req.query?.logMail };
      }
      const resutl = await checkout.find(query).toArray();
      res.send(resutl);
    });

    app.delete("/checkout/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await checkout.deleteOne(query);
      res.send(result);
    });

    app.patch("/checkout/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;

      const filter = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          status: data.status,
        },
      };

      const result = await checkout.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //  await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`app is running in port : ${port}`);
});
