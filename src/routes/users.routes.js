import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/users.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Require authentication for all user routes
router.use(authenticate);

// Get all users (maybe restrict to admins, but for now allow all authenticated users)
router.get('/', getUsers);

// Get specific user
router.get('/:id', getUserById);

// Update user (controller handles ensuring users only update themselves unless admin)
router.patch('/:id', updateUser);

// Delete user
router.delete('/:id', deleteUser);

export default router;
