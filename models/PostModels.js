const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const PostSchema = new Schema({
    title:{
        type:String,
        require:[true,'title is required'],
        trim:true,
    },
    description:{
        type:String,
        require:[true,'description is required'],
        trim:true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }
},{
    timestamps:true
});

module.exports =mongoose.model("Post",PostSchema);
