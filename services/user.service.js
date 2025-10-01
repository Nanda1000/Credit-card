import { prisma } from "../database/prisma.js";

// Get user by ID
export async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");
  return user;
}

// Update user profile
export async function updateUser(userId, data) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");

  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

// Delete user
export async function deleteUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");

  return prisma.user.delete({
    where: { id: userId },
  });
}
