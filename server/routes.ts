import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertSessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Create a new profile
  app.post("/api/profiles", async (req, res) => {
    try {
      const data = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(data);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid profile data", details: error.errors });
      } else {
        console.error("Error creating profile:", error);
        res.status(500).json({ error: "Failed to create profile" });
      }
    }
  });

  // Get a profile by ID
  app.get("/api/profiles/:id", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.id);
      if (!profile) {
        res.status(404).json({ error: "Profile not found" });
        return;
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Get profile stats
  app.get("/api/profiles/:id/stats", async (req, res) => {
    try {
      const stats = await storage.getProfileStats(req.params.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Submit a new session
  app.post("/api/sessions", async (req, res) => {
    try {
      const data = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(data);
      
      // Fetch updated profile and badges to return to client
      const updatedProfile = await storage.getProfile(data.profileId);
      const badges = await storage.getBadgesByProfile(data.profileId);
      
      res.json({
        session,
        profile: updatedProfile,
        badges,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid session data", details: error.errors });
      } else {
        console.error("Error creating session:", error);
        res.status(500).json({ error: "Failed to create session" });
      }
    }
  });

  // Get sessions for a profile
  app.get("/api/profiles/:id/sessions", async (req, res) => {
    try {
      const { range } = req.query;
      let sessions;
      
      if (range === "7d") {
        sessions = await storage.getRecentSessions(req.params.id, 7);
      } else if (range === "30d") {
        sessions = await storage.getRecentSessions(req.params.id, 30);
      } else {
        sessions = await storage.getSessionsByProfile(req.params.id);
      }
      
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Get badges for a profile
  app.get("/api/profiles/:id/badges", async (req, res) => {
    try {
      const badges = await storage.getBadgesByProfile(req.params.id);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  return httpServer;
}
