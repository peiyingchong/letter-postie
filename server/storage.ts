import { letters, type InsertLetter, type Letter } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface IStorage {
  createLetter(letter: InsertLetter): Promise<Letter>;
  getLetter(id: number): Promise<Letter | undefined>;
  getLetterByShareId(shareId: string): Promise<Letter | undefined>;
  updateLetter(id: number, letter: Partial<InsertLetter>): Promise<Letter>;
}

export class DatabaseStorage implements IStorage {
  async createLetter(insertLetter: InsertLetter): Promise<Letter> {
    const shareId = randomBytes(4).toString('hex'); // 8 char unique ID
    const [letter] = await db
      .insert(letters)
      .values({ ...insertLetter, shareId })
      .returning();
    return letter;
  }

  async getLetter(id: number): Promise<Letter | undefined> {
    const [letter] = await db.select().from(letters).where(eq(letters.id, id));
    return letter;
  }

  async getLetterByShareId(shareId: string): Promise<Letter | undefined> {
    const [letter] = await db.select().from(letters).where(eq(letters.shareId, shareId));
    return letter;
  }

  async updateLetter(id: number, update: Partial<InsertLetter>): Promise<Letter> {
    const [letter] = await db
      .update(letters)
      .set(update)
      .where(eq(letters.id, id))
      .returning();
    return letter;
  }
}

export const storage = new DatabaseStorage();
