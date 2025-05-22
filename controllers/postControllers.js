const { postSchema } = require("../middlewares/validator");
const Post = require("../models/PostModel");

exports.getPosts = async(req,res)=>{
 const {page} = req.query;
 const postsPerPage = 10;

 try{
    let pageNum = 0;
    if(page<=1){
        pageNum = 0;
    }
    else{
        pageNum =page-1
    }

    const result = await Post.find()
      .sort({ createdAt: -1 })
      .skip(pageNum * postsPerPage)
      .limit(postsPerPage)
      .populate({
        path: "userId",
        select: "email",
      });


     res.status(200).json({
      success: true,
      message: "Posts retrieved successfully",
      data: result,
    });

 }
 catch(error){
    console.log(error);
 }
}

exports.createPost = async(req,res)=>{
const {title,description} = req.body;
const {userId}= req.user;
try{
const {error,value}  = postSchema.validate({title,description,userId});
if(error){
    return res.status(400).json({success:false,message:error.details[0].message});
}
const result= await Post.create({
    title,
    description,
    userId
});
return res.status(200).json({success:true,message:"post created",result});
}
catch(error){
    console.log(error)
}
}


exports.singlePost = async(req,res)=>{
    const {_id} = req.query;

 try{
   const result = await Post.findOne({
        _id
    }).populate({
        path:"userId",
        select:"email"
    });
    if(!result){
        return res.status(400).json({success:false,message:'post unavailable'});
    }

    return res.status(200).json({success:true,message:"single post",data:result});
 }
 catch(error){
    console.log(error);
 }

}

exports.updatePost = async(req,res)=>{
    const {title,description} = req.body;
    const {userId} = req.user;
    const {_id} = req.query;
    
    try{
        const {error,value} = postSchema.validate({
            title,
            description,
            userId
        });
        if(error){
            return res.status(400).json({success:false,message:error.details[0].message});
        }
        
        const existingPost = await Post.findOne({_id})
        if(!existingPost){
            return res.status(400).json({success:false,message:"post unavailable"})
        }
        if(existingPost.userId.toString() !== userId){
            return res.status(400).json({success:false,message:"unauthoerised"});
        }
        existingPost.title = title;
        existingPost.description  = description;
        const result =  await existingPost.save();
        return res.status(200).json({success:true,message:"post updated",result})
    }
    catch(error){
        console.log(error);
    }
}

exports.deletePost = async(req,res)=>{
    const {_id}= req.query;
    const {userId} = req.user;
    const  existingPost = await Post.findOne({_id});
    if(!existingPost){
        return res.status(400).json({success:false,message:"post already unaavileble"});
    }
    if(existingPost.userId.toString()!==userId){
        return res.status(400).json({success:false,message:"unauthorised"});
    }
    await Post.deleteOne({_id});
    return res.status(200).json({success:true,message:"deleted"})
}
