// Authetication code
const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

const authee = async (req, res, next) => {
  try {
    const token = req.cookies.jwtoken;
    console.log(token);

    if (!token) {
      console.log('No token provided in cookies');
      return res.status(401).send('No token provided');
    }

    console.log('Token received:', token); // Log the received token

    const verifyToken = jwt.verify(token, process.env.KEY);
    console.log('Token verified:', verifyToken); // Log the verified token

    const rootUser = await User.findOne({ _id: verifyToken._id, 'tokens.token': token });

    if (!rootUser) {
      console.log('User not found');
      throw new Error('User not found');
    }

    req.token = token;
    req.rootUser = rootUser;
    req.userID = rootUser._id;

    next();
  } catch (err) {
    console.error('Authentication error:', err); // Improved error logging
    res.status(401).send('Unauthorized: No token provided');
  }
};

module.exports = authee;

