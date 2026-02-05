import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.letters.create.path, async (req, res) => {
    try {
      const input = api.letters.create.input.parse(req.body);
      const letter = await storage.createLetter(input);
      res.status(201).json(letter);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.get(api.letters.get.path, async (req, res) => {
    // Determine if we're querying by ID or ShareID.
    // The route is defined as /api/letters/:shareId
    // But internally we might want to differentiate.
    // For this app, public access via shareId is the primary "get".
    const shareId = req.params.shareId;
    const letter = await storage.getLetterByShareId(shareId);
    
    if (!letter) {
      // Fallback: Check if it's a numeric ID (for testing/Studio usage maybe)
      if (!isNaN(Number(shareId))) {
         const byId = await storage.getLetter(Number(shareId));
         if (byId) return res.json(byId);
      }
      return res.status(404).json({ message: "Letter not found" });
    }
    res.json(letter);
  });

  app.put(api.letters.update.path, async (req, res) => {
    const id = Number(req.params.id);
    try {
      const input = api.letters.update.input.parse(req.body);
      const letter = await storage.updateLetter(id, input);
      res.json(letter);
    } catch (err) {
       if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Seed data if empty
  const existing = await storage.getLetterByShareId('welcome');
  if (!existing) {
    await storage.createLetter({
      senderName: "Lunar Team",
      recipientName: "You",
      content: {
        background: "midnight-blue",
        textElements: [
          { id: "t1", text: "Welcome to Lunar Cards", x: 50, y: 100, font: "serif", color: "#ffffff", fontSize: 24 },
          { id: "t2", text: "Drag me around!", x: 50, y: 200, font: "hand", color: "#e2e8f0", fontSize: 18 }
        ],
        images: [],
        stickers: [
          { id: "s1", stickerId: "star", x: 200, y: 300, rotation: 15, scale: 1 }
        ]
      },
      status: "sent",
      // We'll manually override shareId for the seed if possible, but createLetter generates it.
      // For the seed, we might just let it generate one, or if we really want 'welcome', we'd need to modify storage or use SQL.
      // Let's just let it generate one and log it, or rely on the UI 'Inspiration Gallery' to pick it up if we had an API for list.
      // Actually, the storage.createLetter generates a random ID. 
      // Let's just create one so the DB isn't empty.
    });
  }

  return httpServer;
}
