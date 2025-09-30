import * as userService from "../services/user.service.js";

// Signup
export const signup = async (req, res, next) => {
  try {
    const newUser = await userService.signupUser(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    if (err.message.includes("already exists")) {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { email } = req.body; // take from body
    const user = await userService.loginUser(email);
    res.json(user);
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
};

// Get user details
export const getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params; // better to pass id as URL param
    const details = await userService.getUserDetailsById(Number(id));

    if (!details) {
      return res.status(404).json({ error: "Details not entered by user" });
    }

    res.json(details);
  } catch (err) {
    next(err);
  }
};

// Update user details
export const updateUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await userService.updateUserDetailsById(Number(id), req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const details = await userService.getUserDetailsById(Number(id));
    if (!details) {
      return res.status(404).json({ message: "No user details found under this id" });
    }

    await userService.deleteUserById(Number(id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
