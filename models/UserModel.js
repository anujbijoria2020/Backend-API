const mongoose   = require("mongoose");
const { trim, minLength, lowercase } = require("zod/v4");
const Schema  = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const UserSchema = mongoose.Schema({
    email:{
        type:String,
        required:[true,'email required'],
        trim:true,
        unique:[true,'email must be unique'],
        minLength:[5,'email must have 5 characters'],
        lowercase:true,
    },
    password:{
        type:String,
        required:[true,'password must be provided'],
        trim :true,
        select:false,
    },
    verified:{
        type:Boolean,
        default:false,
    },
    verificationCode:{
        type:String,
        select:false,
    },
    verificationValidation:{
        type:Number,
        select:false,
    },
    forgotPasswordCode:{
        type:String,
        select:false,
    },
    forgotPasswordCodeValidation:{
        type:Number,
        select:false,
    },
},{
    timestamps:true
});

module.exports = mongoose.model("User",UserSchema);
