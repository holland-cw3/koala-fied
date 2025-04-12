const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 5000;

const databaseAndCollection = {
  db: process.env.MONGO_DB_NAME,
  collection: process.env.MONGO_COLLECTION,
};

const uri = process.env.MONGO_CONNECTION_STRING;
const { MongoClient, ServerApiVersion } = require("mongodb");

const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

app.use(express.static(path.join(__dirname, "../client/build")));

app.get("/api/hello", (req, res) => {
  res.send("Hello from Express!");
});

app.post("/createAccount", (request, response) => {
  const post_data = request.body;

  createAccount(post_data.username, post_data.email, post_data.password);

  response.send("Success");
});

async function createAccount(username, email, password) {
  try {
    await client.connect();

    // HASH PASSWORD

    // Make sure username/email isnt already used

    let user = {
      username: username,
      email: email,
      password: password,
      numApps: 0,
      numInterviews: 0,
      numOffers: 0,
      notes: "",
      applications: [],
    };

    // Add user to the database
    const result = await client
      .db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .insertOne(user);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.post("/viewApplications", (request, response) => {
  const post_data = request.body;

  viewApplication(post_data.user, response);
});

async function viewApplication(user, response) {
  try {
    await client.connect();

    // DO PASSWORD/SESSION CHECK

    const cursor = await client
      .db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .findOne({ username: user });

    // Sends JSON with all the user's data
    const result = await cursor;

    response.send(result);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

app.post("/addApplication", (request, response) => {
  const post_data = request.body;

  addApplication(
    post_data.company,
    post_data.position,
    post_data.link,
    post_data.date,
    post_data.status
  );

  response.send("Success");
});

async function addApplication(company, posiiton, link, date, status) {
  try {
    await client.connect();

    let application = {
      company: company,
      posiiton: posiiton,
      link: link,
      date: date,
      status: status,
    };

    // DO PASSWORD/SESSION CHECK

    // Idea: get applicaiton list, add a new one, update the list
    const cursor = await client
      .db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .findOne({ username: user });

    const obj = await cursor.toArray();

    let applications = obj.applicaitons;

    applications.push(application);

    const result = await client
      .db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .updateOne({ username: user }, { applications: applications });
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

app.post("/updateStatus", (request, response) => {
  const post_data = request.body;

  // DO PASSWORD/SESSION CHECK

  updateStatus(
    post_data.user,
    post_data.company,
    post_data.position,
    post_data.status
  );

  response.send("Success");
});

async function updateStatus(user, company, posiiton, status) {
  try {
    await client.connect();

    // DO PASSWORD/SESSION CHECK

    // Idea: get applicaiton list, add a new one, update the list
    const cursor = await client
      .db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .findOne({ username: user });

    const obj = await cursor.toArray();

    let applications = obj.applicaitons;

    // find that job in the application list, update the notes
    for (app in applications) {
      if (app.company.equals(company) && app.posiiton.equals(posiiton)) {
        app.status = status;
        break;
      }
    }

    // update the applicaiton list
    const result = await client
      .db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .updateOne({ username: user }, { applications: applications });
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

app.post("/updateNotes", (request, response) => {
  const post_data = request.body;

  // DO PASSWORD/SESSION CHECK

  updateNotes(post_data.user, post_data.notes);

  response.send("Success");
});

async function updateNotes(user, notes) {
  try {
    await client.connect();

    // DO PASSWORD/SESSION CHECK

    // find that user and update the notes
    const result = await client
      .db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .updateOne({ username: user }, { notes: notes });
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
