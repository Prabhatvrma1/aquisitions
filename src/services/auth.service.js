import logger from "../config/logger.js"
import bcrypt from 'bcrypt';
import { db } from "../config/database.js";
import { users } from "../models/user.model.js"
import { eq } from "drizzle-orm";

export const hashPasword = async (password) => {
    try {
        const hashedPasword = await bcrypt.hash(password, 10);
        return await hashedPasword;
    } catch (e) {
        logger.error(`erorr while hashing the password: ${e}`);
        throw new Error(" error handling");
    }
}


export const createUser = async ({ name, email, password, role = 'user' }) => {
    try {
        const existingUser = await db.select().from(users).where(
            eq(users.email, email)
        ).limit(1)
        if (existingUser.length > 0) {
            throw new Error("user already exists");

        }

        const password_hash = await hashPasword(password);
        const [newUser] = await db.insert(users).values({
            name,
            email,
            password: password_hash,
            role
        }).returning({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            created_at: users.created_at,
            updated_at: users.updated_at
        })


        logger.info(`user ${newUser.email} created sucessfullt`);

        return newUser;
    }
    catch (e) {
        logger.error(`Error  created the user ${e}`);
        throw new Error(e);
    }

}

