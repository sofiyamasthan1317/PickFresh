const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const { generateToken, generateRefreshToken, jwtSecret } = require("../utils/generateToken");

const buildAuthResponse = async (user) => {
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
    refreshToken,
  };
};

// @desc Register user
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      data: await buildAuthResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc Login user
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: await buildAuthResponse(user),
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400);
      throw new Error("Refresh token is required");
    }

    try {
      jwt.verify(token, jwtSecret);
    } catch (error) {
      res.status(401);
      throw new Error("Invalid refresh token");
    }

    const user = await User.findOne({ refreshToken: token });

    if (!user) {
      res.status(401);
      throw new Error("Invalid refresh token");
    }

    res.json({
      success: true,
      data: {
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
};
