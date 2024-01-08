import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const app = express();
const port = process.env.SERVER_PORT;
//const API_URL = `http://localhost:${process.env.API_PORT}`;
//const port = process.env.API_PORT;

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PWD,
  port: process.env.PG_PORT,
});





// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let response = [];


await db.connect();
async function loadAgain(params) {
  let result = await db.query("SELECT * FROM record");
  response = result.rows;
  //console.log(posts);
}


// Route to render the main page
app.get("/", async (req, res) => {
  try {
    //await db.query("CREATE TABLE record(id SERIAL ,title TEXT,content TEXT,author TEXT,date TIMESTAMPTZ);");
    await loadAgain();
    //console.log(response);
    res.render("index.ejs", { posts: response });
  } catch (error) {
    //res.status(500).json({ message: "Error fetching posts" });
    console.log(error);
    res.render("index.ejs",{ posts: error });
  }
});

// Route to render the edit page
app.get("/new", (req, res) => {
  res.render("modify.ejs", { heading: "New Post", submit: "Create Post" });
});

app.get("/edit/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.query("SELECT * FROM record WHERE id=$1 ;", [id]);
    response=result.rows;
    res.render("modify.ejs", {
      heading: "Edit Post",
      submit: "Update Post",
      post: response[0],
    });

    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching post" });
  }
});

// Create a new post
app.post("/api/posts", async (req, res) => {
  try {
    // const response = await axios.post(`${API_URL}/posts`, req.body);
    // console.log(response.data);

    await db.query(
      "INSERT INTO record (title,content,author,Time) VALUES ($1,$2,$3,$4)",
      [req.body.title, req.body.content, req.body.author, new Date()]
    );

    res.redirect("/");
    //res.status(201).json(posts);
  } catch (error) {
    
    console.log(error);
    res.status(500).json({ message: "Error creating post" });
  }
});

// Partially update a post
app.post("/api/posts/:id", async (req, res) => {
  //console.log("called");
  try {
    const id = parseInt(req.params.id);
    const result = await db.query("SELECT * FROM record WHERE id=$1 ;", [id]);
    let foundPost = result.rows[0];

    await db.query(
      "UPDATE record SET title=$1,content=$2,author =$3,Time=$4 WHERE id=$5 ;",
      [
        req.body.title || foundPost.title,
        req.body.content || foundPost.content,
        req.body.author || foundPost.author,
        new Date(),
        id,
      ]
    );
    
    //console.log(response.data);
    res.redirect("/");

    // let foundPost=result.rows;

    //await loadAgain();
    //res.status(201).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating post" });
  }
});

// Delete a post
app.get("/api/posts/delete/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.query("DELETE FROM record WHERE id=$1 ;", [id]);
    
    res.redirect("/");

    // let foundPost=result.rows;

  } catch (error) {
    console,log(error);
    res.status(500).json({ message: "Error deleting post" });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
