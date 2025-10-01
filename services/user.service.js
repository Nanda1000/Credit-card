import { prisma } from "../database/prisma.js";


// Signup
export async function signupUser(firebasepayload){
  const { uid, email, password, firstname, lastname, mobilenumber, country } = firebasepayload;

  const existingByNumber = await prisma.user.findUnique({
    where: { mobilenumber },
  });

  const user = await prisma.user.findUnique({
    where:{firebaseUid: uid}
  })

  const existingByEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingByNumber || existingByEmail || user) {
    throw new Error("User already exists");
  }

  return prisma.user.create({
    data: { uid, email, firstname, lastname, mobilenumber, country },
  });
};

// Login
export async function loginUser(firebasepayload) {
  const { uid } = firebasepayload;
    const user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user; // just return the user, no need to re-create
};

// Get user details
export async function getUserDetailsById(firebasepayload) {
    const { uid } = firebasepayload;
    const user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user
};

// Update user details
export async function updateUserDetailsById(firebasepayload) {
    const { uid, email, firstname, lastname, mobilenumber, country } = firebasepayload;
    const user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const updateUser = await prisma.user.update({data: {email, firstname, lastname, mobilenumber, country}});
    return updateUser;
};

// Delete user
export async function deleteUserById(id){
    const { uid } = firebasepayload;
    const user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (!user) {
      throw new Error("User not found");
    }
    return prisma.user.delete({
        where: { id },
    });
};
