import 'dotenv/config';
import express from "express";
import pg from "pg";
import bodyParser from "body-parser";

const app = express();
const port = process.env.API_PORT;

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PWD,
  port: process.env.PG_PORT,
});


let posts = [];


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



//CHALLENGE 1: GET All posts
await db.connect();
async function loadAgain(params) {
  let result = await db.query("SELECT * FROM record");
  posts = result.rows;
  //console.log(posts);
}

app.get("/posts", async (req, res) => {
  console.log("reached here");
  await db.query("CREATE TABLE record(id SERIAL ,title TEXT,content TEXT,author TEXT,Time TIMESTAMPTZ);");
  await loadAgain();
  res.json(posts);
});

app.get("/posts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.query("SELECT * FROM record WHERE id=$1 ;", [id]);
    let foundPost = result.rows;
    if (foundPost.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    } else {
      res.json(foundPost[0]);
    }
  } catch (error) {
    console.error("index.js app.get (/posts/:id)");
    console.log(error);
  }
});

app.post("/posts", async (req, res) => {
  try {
    await db.query(
      "INSERT INTO record (title,content,author,date) VALUES ($1,$2,$3,$4)",
      [req.body.title, req.body.content, req.body.author, new Date()]
    );

    await loadAgain();
    res.status(201).json(posts);
  } catch (error) {
    console.error("index.js app.post (/posts)");
    console.log(error);
  }
});

app.patch("/posts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.query("SELECT * FROM record WHERE id=$1 ;", [id]);
    let foundPost = result.rows[0];
    await db.query(
      "UPDATE record SET title=$1,content=$2,author =$3,date=$4 WHERE id=$5 ;",
      [
        req.body.title || foundPost.title,
        req.body.content || foundPost.content,
        req.body.author || foundPost.author,
        new Date(),
        id,
      ]
    );

    // let foundPost=result.rows;

    await loadAgain();
    res.status(201).json(posts);
  } catch (error) {
    console.error("index.js app.patch (/posts/:id)");
    console.log(error);
  }
  
});


app.delete("/posts/:id", async(req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.query("DELETE FROM record WHERE id=$1 ;", [id]);
    
    // let foundPost=result.rows;

    await loadAgain();
    res.status(201).json(posts);
  } catch (error) {
    console.error("index.js app.DELETE (/posts/:id)");
    console.log(error);
  }
});
app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
