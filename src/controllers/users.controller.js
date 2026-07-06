import logger from '../config/logger.js';
import { formatValidationError } from '../utils/format.js';
import {
  userIdSchema,
  updateUserSchema,
} from '../validations/users.validation.js';
import {
  getAllUsers,
  getUserById as getUserService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '../services/users.service.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await getAllUsers();
    logger.info('Fetched all users successfully');
    return res.status(200).json({
      message: 'Users retrieved successfully',
      users,
    });
  } catch (e) {
    logger.error('Error fetching users', e);
    next(e);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const paramValidation = userIdSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Invalid ID',
        details: formatValidationError(paramValidation.error),
      });
    }

    const id = paramValidation.data.id;
    const user = await getUserService(id);

    logger.info(`Fetched user id=${id} successfully`);
    return res.status(200).json({
      message: 'User retrieved successfully',
      user,
    });
  } catch (e) {
    logger.error(`Error fetching user id=${req.params.id}`, e);
    if (e.message === 'user not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(e);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    // 1. Validate ID
    const paramValidation = userIdSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Invalid ID',
        details: formatValidationError(paramValidation.error),
      });
    }
    const id = paramValidation.data.id;

    // 2. Validate Body
    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(bodyValidation.error),
      });
    }
    const updates = bodyValidation.data;

    // 3. Check permissions
    const currentUser = req.user; // from authenticate middleware

    // Users can only update their own profile, unless they are admin
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      logger.warn(`User ${currentUser.id} attempted to update user ${id}`);
      return res
        .status(403)
        .json({ error: 'You do not have permission to update this user' });
    }

    // Only admins can change roles
    if (updates.role && currentUser.role !== 'admin') {
      logger.warn(
        `User ${currentUser.id} attempted to change role to ${updates.role}`
      );
      return res.status(403).json({ error: 'Only admins can change roles' });
    }

    // Ensure there's something to update
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    // 4. Perform update
    const updatedUser = await updateUserService(id, updates);

    logger.info(`Updated user id=${id} successfully`);
    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (e) {
    logger.error(`Error updating user id=${req.params.id}`, e);
    if (e.message === 'user not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (e.message.includes('unique constraint')) {
      // For duplicate email
      return res.status(409).json({ error: 'Email already in use' });
    }
    next(e);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const paramValidation = userIdSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Invalid ID',
        details: formatValidationError(paramValidation.error),
      });
    }

    const id = paramValidation.data.id;

    // We could add permission check here: can a user delete themselves?
    // Let's assume only admins or the user themselves can delete
    const currentUser = req.user;
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      logger.warn(`User ${currentUser.id} attempted to delete user ${id}`);
      return res
        .status(403)
        .json({ error: 'You do not have permission to delete this user' });
    }

    await deleteUserService(id);

    logger.info(`Deleted user id=${id} successfully`);
    return res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (e) {
    logger.error(`Error deleting user id=${req.params.id}`, e);
    if (e.message === 'user not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(e);
  }
};
