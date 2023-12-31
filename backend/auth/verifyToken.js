import jwt from "jsonwebtoken";
import Doctor from "../models/DoctorSchema.js";
import User from "../models/UserSchema.js";

export const authenticate = async (req, res, next) => {
  // get token from headers from the request
  const authToken = req.headers.authorization;

  // 'Bearer actual token
  // check token exist or not
  if (!authToken || !authToken.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token, authorisation denied!" });
  }

  try {
    //console.log(authToken);
    const token = authToken.split(" ")[1];
    //console.log(token);
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.userId = decoded.id;
    req.role = decoded.role;
    //console.log("decoded: " + JSON.stringify(decoded));
    //console.log("req.userId " + req.userId);

    next(); // must call the next function
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token is expired" });
    }
    return res.status(401).json({ success: false, message: "Invalid token!" });
  }
};

export const restrict = (roles) => async (req, res, next) => {
  //  const userId = req.params.id;
  const userId = req.userId;
  let user;
  //console.log(userId);
  const patient = await User.findById(userId);
  const doctor = await Doctor.findById(userId);

  if (patient) {
    user = patient;
  }
  if (doctor) {
    user = doctor;
  }
  if (user === undefined) {
    return res
      .status(401)
      .json({ success: false, message: "You are not authorised!" });
  }

  if (!roles.includes(user.role)) {
    return res
      .status(401)
      .json({ success: false, message: "You are not authorised!" });
  }

  next();
};
