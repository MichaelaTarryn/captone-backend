function errorHandling(err, req, res, next) {
    if(err) {
        // Put your code here.
    }rs
    next();
  }

  // On your index.js
  const {errorHandling} = require('./middleware/ErrorHandling');
//   Place the below code at the bottom of index.js so that it catches all errors.
  // Taking care of all errors
  app.use(errorHandling);
  
  module.exports = {errorHandling};