var jwt = require('jsonwebtoken');
const secret = process.env.JWT_SCERT;

exports.generateWebToken = (docId) =>{
   return jwt.sign({
        data: docId,
      }, secret, { expiresIn: 60 * 60 });
} 

exports.veerifyWebToken = (token) =>{
    jwt.verify(token, secret, function(err, decoded) {
        if(err){
            console.log('json web token error', err);
        }
        console.log(decoded);
      });
}