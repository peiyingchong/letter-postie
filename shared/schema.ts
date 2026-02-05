import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const letters = pgTable("letters", {
  id: serial("id").primaryKey(),
  senderName: text("sender_name").notNull(),
  recipientName: text("recipient_name").notNull(),
  content: jsonb("content").$type<{
    background: string;
    textElements: {
      id: string;
      text: string;
      x: number;
      y: number;
      font: string;
      color: string;
      fontSize: number;
    }[];
    images: {
      id: string;
      url: string;
      x: number;
      y: number;
      rotation: number;
      scale: number;
    }[];
    stickers: {
      id: string;
      stickerId: string; // e.g., 'star', 'heart'
      x: number;
      y: number;
      rotation: number;
      scale: number;
    }[];
  }>().notNull(),
  status: text("status", { enum: ["draft", "sent"] }).default("draft").notNull(),
  shareId: text("share_id").notNull().unique(), // Public facing random ID
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLetterSchema = createInsertSchema(letters).omit({ 
  id: true, 
  createdAt: true,
  shareId: true // Generated on server
});

export type Letter = typeof letters.$inferSelect;
export type InsertLetter = z.infer<typeof insertLetterSchema>;

// Explicit API Types
export type CreateLetterRequest = InsertLetter;
export type UpdateLetterRequest = Partial<InsertLetter>;
export type LetterResponse = Letter;
