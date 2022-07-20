//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const homeStartingContent ="all generated questions";
const aboutContent ="about page";
const contactContent = "contact page";
const app = express();

mongoose.connect(
  "mongodb+srv://saumyaabhiraj:test123@cluster0.rzizx.mongodb.net/blogDB?retryWrites=true&w=majority"
);  //encode this key

const postSchema = {
  code: String,
  title: String,
  body: String,
  marks: Number
};

const Post = mongoose.model("Post", postSchema);

app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

app.get("/", function (req, res) {    //use different rendering method
  Post.find({}, function (err, foundPosts) {
    res.render("home", {
      homeContent: homeStartingContent,
      homePosts: foundPosts,
    });
  });
});

app.get("/about", function (req, res) {
  res.render("about", {
    aboutContent: aboutContent,
  });
});

app.get("/view", function (req, res) {
  res.render("questionview");
});

app.get("/contact", function (req, res) {
  res.render("contact", {
    contactContent: contactContent,
  });
});

app.get("/generator", function (req, res) {
  res.render("generator");
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

app.get("/posts/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne(                         //use mongoose
    {
      _id: requestedPostId,
    },
    function (err, foundPosts) {
      res.render("post", {
        title: foundPosts.title,

        content: foundPosts.body,
      });
    }
  );
});

app.post("/compose", function (req, res) {  //change this composed value to state
  const post = new Post({
    code: req.body.composeCode,
    title: req.body.composeTitle,
    body: req.body.composeBody,
    marks: req.body.composeMarks
  });
  post.save(function (err) {
    if (!err) {
      res.redirect("/");  //callback funtion every save to back to home
    }
  });
});

app.post("/viewQuestions", (req, res) => {   //change data table also
  // for odering of data according to coloumssss....
  let order = req.body.order[0];
  if (order.column == "3") {
    if(order.dir == "asc") { sort = {marks: 1} }
    else {
      sort= {marks: -1}
    }
  }
  ////  count of record
  var total = 0; // no. of total recrds ...
  // counting of total recorsds in a collection...  . .
  Post.countDocuments({}, (err, count) => {
    if (!err) {
      total = count;
    }
  });

  //for searching....
  if (req.body.search.value) {
    var regex = new RegExp(req.body.search.value, "i");
    searchStr = { $or: [{ name: regex }, { email: regex }, { city: regex }] };
  } else {
    searchStr = {};
  }
  var t = 0;

  // data base fetching .....
  Post.find(
    searchStr,
    null,
    {
      skip: Number(req.body.start),
      limit: Number(req.body.length),  //delimiter not working in present phase..
      sort: sort
    },
    (err, data) => {
      if (err) throw err;

      user.countDocuments(searchStr, (err, count) => {
        res.send({ recordsTotal: total, recordsFiltered: count, data });
      });
    }
  );
});

app.listen(3000, function () {
  console.log("Server started on port 3000");   //callback function
});
