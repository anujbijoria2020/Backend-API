const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
exports.identifier = async(req,res,next)=>{
    let token;
    if(req.headers.client === "not-browser"){
        token = req.headers.authorization
        console.log("HEADERS:", req.headers);
    }
    else{
        token  = req.cookies['Authorization']
    }
console.log("Authorization header:", req.headers.authorization);
console.log("Cookie:", req.cookies.Authorization);
console.log("Client:", req.headers.client);

    if(!token){
    return res.status(400).json({success:false,message:"unauthorized"})
    }

    try{
        const userToken = token.startsWith("Bearer")?token.split(' ')[1]:token;
        const decodedValue = jwt.verify(userToken,JWT_SECRET);
        if(decodedValue){
            req.user = decodedValue;
            next();
        }
        else{
            throw new Error("error in the token");
        }
    }
    catch(error){
        console.log(error);
        res.status(400).json({error});
    }
}
