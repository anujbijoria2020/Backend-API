const bcrypt = require("bcrypt");
const {createHmac} = require("crypto")
exports.doHash = async (value, saltRounds = 12) => {
    const result = await bcrypt.hash(value, saltRounds);
    return result;
};


exports.comparePassword = async(value,hashedPassword)=>{
return await bcrypt.compare(value,hashedPassword);
}

exports.hmacProcess = (value,key)=>{
    const result = createHmac('sha256',key).update(value).digest('hex');
    return result;
}
