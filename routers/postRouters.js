const express = require("express");
const postRouter = express.Router();
const {identifier} = require("../middlewares/identification");
const postController=require("../controllers/postController")
postRouter.get("/all-posts",postController.getPosts);
postRouter.get("/single-post",postController.singlePost);
postRouter.post("/create-post",identifier,postController.createPost);

postRouter.put("/update-post",identifier,postController.updatePost);

postRouter.delete("/delete-post",identifier,postController.deletePost);

module.exports = postRouter;
