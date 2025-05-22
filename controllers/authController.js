
const { signupSchema ,signinSchema,acceptCodeSchema, changePasswordSchema, ForgotPasswordSchema} = require("../middlewares/validator");
const User = require("../models/UserModel");
const {doHash,comparePassword, hmacProcess} = require("../utils/hashing");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const NODE_ENV = process.env.NODE_ENV;
const transport = require("../middlewares/sendMail");
const { findOne } = require("../models/PostModel");

exports.signup = async (req,res) => {
  const { email, password } = req.body;

  try {
    const { error } = signupSchema.validate({ email, password });
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        success: false,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }
    const hashedPassword = await doHash(password, 12);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    const result = await newUser.save();

    result.password = undefined;

    return res.status(201).json({
      success: true,
      message: "Account created!",
      result,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.signin = async (req,res)=>{
const {email,password} = req.body;
    try{
const {error,value}  = signinSchema.validate({email,password});
if(error){
    res.status(401).json({
        message:error.details[0].message,
        success:false,
    })
}

const existingUser = await User.findOne({email}).select('+password');
if(!existingUser){
   return res.status(401).json({
        success:false,
        message:"user does not exists",
    });
}

const response  = await comparePassword(password,existingUser.password);
if(!response){
    return res.status(401).json({message:"invalid credentials"});
}
const token = jwt.sign({
    userId:existingUser._id,
    email:existingUser.email,
    verified:existingUser.verified
},JWT_SECRET);

res.cookie("Authorization","Bearer"+token,{expiresIn:new Date(Date.now()+8*3600000),httpOnly:NODE_ENV==='production',secure:NODE_ENV==='production'}).json({
    success:true,
    message:"logged in successfull",
    token,
})

    }
    catch(err){
        console.log(err);
    }
}

exports.signout = async(req,res)=>{
    res.clearCookie('Authorization').status(200).json({
        success:true,
        message:"loggedout"
    })
}

exports.sendVerificationCode  = async(req,res)=>{
    const {email} = req.body;
    try{
        const existingUser = await User.findOne({
            email
        })
        if(!existingUser){
   return res.status(401).json({
        success:false,
        message:"user does not exists",
    });
}

if(existingUser.verified){
      return res.status(401).json({
        success:false,
        message:"user already verified",
    });
}

const codeValue = Math.floor(Math.random()*1000000).toString();

let info = await transport.sendMail({
    from:process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
    to:existingUser.email,
    subject:"verification code",
    html:'<h1>' + codeValue + '</h1>'+'<p>'+"sent from anuj kurmi" +'</p>',
})

if(info.accepted[0]===existingUser.email){
    const hashedCodeValue = hmacProcess(codeValue,process.env.HMAC_VERIFICATION_CODE_SECRET);
  existingUser.verificationCode = hashedCodeValue;
existingUser.verificationValidation = Date.now();
await existingUser.save();

    return res.status(201).json({
        success:true,
        message:"code sent"
    });
}
res.status(401).json({
    success:false,
    message:"code sent failed"
})

    }catch(error){
        console.log(error);
        res.json({error})
    }
}

exports.verifyVerificationCode = async (req, res) => {
    const { email, providedCode } = req.body;

    try {
        const { error } = acceptCodeSchema.validate({ email, providedCode });
        if (error) {
            return res.status(401).json({
                message: error.details[0].message,
                success: false,
            });
        }

        const codeValue = providedCode.toString();
        const existingUser = await User.findOne({ email }).select("+verificationCode +verificationValidation");

        if (!existingUser) {
            return res.status(401).json({
                success: false,
                message: "User does not exist",
            });
        }

        if (existingUser.verified) {
            return res.status(400).json({ success: false, message: "User is already verified" });
        }

        if (!existingUser.verificationCode || !existingUser.verificationValidation) {
            return res.status(400).json({ message: "Something is wrong with the verification data" });
        }

        if (Date.now() - existingUser.verificationValidation > 5 * 60 * 1000) {
            return res.status(400).json({ message: "Verification code has expired" });
        }

        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);

        if (hashedCodeValue === existingUser.verificationCode) {
            existingUser.verified = true;
            existingUser.verificationCode = undefined;
            existingUser.verificationValidation = undefined;
            await existingUser.save();

            return res.status(200).json({
                success: true,
                message: "You are now a verified user!",
            });
        }

        return res.status(400).json({
            success: false,
            message: "Invalid verification code",
        });

    } catch (error) {
        console.log("Error during verification:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.changePassword = async(req,res)=>{
    const {userId,verified} =req.user;
    const {oldPassword,newPassword}  = req.body;
    try{
const {error,value} = changePasswordSchema.validate({newPassword,oldPassword});
if(error){
    return res.status(400).json({success:false,message:error.details[0].message});
}
if(!verified){
    return res.status(400).json({success:false,
        message:"you are not verified"
    })
}

const existingUser = await User.findOne({_id:userId}).select("+password");
if(!existingUser){
    return res.status(400).json({message:"user does not exists"});
}

const result = await comparePassword(oldPassword,existingUser.password);
if(!result){
    return res.status(400).json({
        message:"old password is incorrect",
    })
}
const hashedPassword = await doHash(newPassword,12);
existingUser.password = hashedPassword;
await existingUser.save();
return res.status(200).json({message:"updated!!"})
    }
    catch(error){
        console.log(error);
    }
}


exports.sendForgotPasswordCode = async(req,res)=>{
    const {email} = req.body;
  try{
  const existingUser = await User.findOne({email}).select("+forgotPasswordCode +forgotPasswordCodeValidation");

    if(!existingUser){
        return res.status(400).json({
            success:false,
            message:"user does not exists"
        });
    }
const codeValue = Math.floor(Math.random()*1000000).toString();
    const info = await transport.sendMail({
        from:process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
        to:existingUser.email,
        subject:"forgot password code",
        html:'<h1>'+codeValue + "</h1>"+"<p>"+"forgot password code"+"</p>"
    });

    if(info.accepted[0]===existingUser.email){
const hashedCodeValue = hmacProcess(codeValue,process.env.HMAC_VERIFICATION_CODE_SECRET);
        existingUser.forgotPasswordCode = hashedCodeValue;
        existingUser.forgotPasswordCodeValidation = Date.now();
await existingUser.save();
return res.status(200).json({success:true,message:"code sent!!"});
    }
    return res.status(400).json({success:false,message:"code sent failed"});


  }
  catch(error){
    console.log(error);
    return res.status(400).json({successs:false,
        message:error
    })
  }
}

exports.verifyForgotPasswordCode = async(req,res)=>{
    const {email,providedCode,newPassword}= req.body;
try{
const {error,value} = ForgotPasswordSchema.validate({ email, providedCode, newPassword });


if(error){
    return res.status(400).json({
        success:false,
        error:error.details[0].message
    })}

const existingUser = await User.findOne({email}).select("+forgotPasswordCode +forgotPasswordCodeValidation");
if(!existingUser){
    return res.status(400).json({success:false,
        message:"user does not exists"
    })
}

if(!existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation){
    return res.status(400).json({success:true,
        message:'something is wrong with the verification details'
    })
}

if(Date.now()-existingUser.forgotPasswordCodeValidation>5*6*1000){
    return res.status(300).json({message:"code expired!!"});
}

const codeValue  = providedCode.toString()
const hashedCodeValue =  hmacProcess(codeValue,process.env.HMAC_VERIFICATION_CODE_SECRET);
const hashedPassword =await doHash(newPassword,12);

if(hashedCodeValue===existingUser.forgotPasswordCode){
    existingUser.forgotPasswordCode= undefined;
    existingUser.forgotPasswordCodeValidation = undefined;
    existingUser.password = hashedPassword;
    await existingUser.save();

    return res.status(200).json({success:true,message:"password updated"});
    
}
return res.status(400).json({success:false,message:"someting wrong happened"});
}
catch(error){
    console.log(error);
}
}
