import * as userService from "../services/user.service.js";

// Get profile
export async function getMyDetails(req, res) {
  try {
    const user = await userService.getUserById(req.user.id); // req.user comes from middleware
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Update profile
export async function updateMyDetails(req, res) {
  try {
    const updated = await userService.updateUser(req.user.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Delete account
export async function deleteMyAccount(req, res) {
  try {
    await userService.deleteUser(req.user.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
