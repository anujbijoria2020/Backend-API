const Joi = require("joi");

exports.signupSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: ['com', 'net'] } }) 
    .min(6)
    .max(60)
    .required(),

  password: Joi.string()
    .min(8) 
    .required()
    .pattern(new RegExp("^[A-Za-z0-9@#$%^&+=!]*$")) 
});

exports.signinSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: ['com', 'net'] } }) 
    .min(6)
    .max(60)
    .required(),

  password: Joi.string()
    .min(8) 
    .required()
    .pattern(new RegExp("^[A-Za-z0-9@#$%^&+=!]*$")) 
});

exports.acceptCodeSchema  = Joi.object({
      email: Joi.string()
    .email({ tlds: { allow: ['com', 'net'] } }) 
    .min(6)
    .max(60)
    .required(),

    providedCode:Joi.number().required()
})


exports.changePasswordSchema   = Joi.object({
     newPassword: Joi.string()
    .min(8) 
    .required()
    .pattern(new RegExp("^[A-Za-z0-9@#$%^&+=!]*$")) ,
     oldPassword: Joi.string()
    .min(8) 
    .required()
    .pattern(new RegExp("^[A-Za-z0-9@#$%^&+=!]*$")) 
})

exports.ForgotPasswordSchema = Joi.object({
    email:Joi.string()
    .required()
    .min(10)
    .max(50)
    .email({tlds:{allow:['com','net']}}),

    providedCode:Joi.number().required(),

    newPassword:Joi.string().required().min(8).pattern(new RegExp("^[A-Za-z0-9@#$%^&+=!]*$"))
})

exports.postSchema = Joi.object({
    title:Joi.string()
    .min(3)
    .required(),

    description:Joi.string()
    .min(5)
    .required(),

    userId:Joi.string().required()

})
