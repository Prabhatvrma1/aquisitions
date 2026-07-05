import logger from '../config/logger.js';
import { db } from '../config/database.js';
import { users } from '../models/user.model.js';
import { eq } from 'drizzle-orm';
import { hashPasword } from './auth.service.js';

// Safe columns to return (never return password)
const safeColumns = {
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    created_at: users.created_at,
    updated_at: users.updated_at,
};

/**
 * Get all users (safe fields only).
 */
export const getAllUsers = async () => {
    try {
        const allUsers = await db.select(safeColumns).from(users);
        logger.info(`Retrieved ${allUsers.length} users`);
        return allUsers;
    } catch (e) {
        logger.error(`Error fetching all users: ${e}`);
        throw e;
    }
};

/**
 * Get a single user by id.
 * Throws if not found.
 */
export const getUserById = async (id) => {
    try {
        const [user] = await db.select(safeColumns).from(users).where(eq(users.id, id)).limit(1);

        if (!user) {
            throw new Error('user not found');
        }

        logger.info(`Retrieved user id=${id}`);
        return user;
    } catch (e) {
        logger.error(`Error fetching user id=${id}: ${e}`);
        throw e;
    }
};

/**
 * Update a user's fields.
 * @param {number} id
 * @param {object} updates – any subset of { name, email, password, role }
 */
export const updateUser = async (id, updates) => {
    try {
        // Confirm the user exists first
        const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);

        if (!existing) {
            throw new Error('user not found');
        }

        // Hash the new password if one was supplied
        if (updates.password) {
            updates.password = await hashPasword(updates.password);
        }

        // Always bump updated_at
        updates.updated_at = new Date();

        const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning(safeColumns);

        logger.info(`User id=${id} updated successfully`);
        return updated;
    } catch (e) {
        logger.error(`Error updating user id=${id}: ${e}`);
        throw e;
    }
};

/**
 * Delete a user by id.
 * Throws if not found.
 */
export const deleteUser = async (id) => {
    try {
        const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);

        if (!existing) {
            throw new Error('user not found');
        }

        await db.delete(users).where(eq(users.id, id));

        logger.info(`User id=${id} deleted successfully`);
    } catch (e) {
        logger.error(`Error deleting user id=${id}: ${e}`);
        throw e;
    }
};
