import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../db";
import config from "../../config";
import { ApiError } from "../../middleware/globalErrorHandler";
const register = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists.");
  }
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
  const token = generateToken(user.id, user.email, user.role);
  return { user, token };
};
const login = async (data: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }
  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }
  const token = generateToken(user.id, user.email, user.role);
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};
const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { posts: true },
      },
    },
  });
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  return user;
};
const updateProfile = async (
  userId: string,
  data: { name?: string; avatar?: string }
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      updatedAt: true,
    },
  });
  return user;
};
const generateToken = (id: string, email: string, role: string): string => {
  const expiresIn = config.jwt.expiresIn;
  return jwt.sign(
    { id, email, role },
    config.jwt.secret,
    { expiresIn } as jwt.SignOptions
  );
};
export const UserService = {
  register,
  login,
  getProfile,
  updateProfile,
};
