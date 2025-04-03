import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import { WebSocketServer, WebSocket } from "ws";
import { insertUserSchema, insertForumPostSchema, insertForumReplySchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";

const MemoryStoreSession = MemoryStore(session);

// WebSocket connections by userId
const userConnections = new Map<number, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // 24 hours
      }),
      secret: process.env.SESSION_SECRET || "aarogya-session-secret",
      resave: false,
      saveUninitialized: false,
    })
  );

  // Add authentication check middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const user = await storage.createUser(validatedData);
      
      // Do not return the password
      const { password, ...userWithoutPassword } = user;
      
      // Set user session
      req.session.userId = user.id;
      
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error during registration" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set user session
      req.session.userId = user.id;
      
      // Do not return the password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Server error during login" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }
      
      // Do not return the password
      const { password, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Server error fetching user data" });
    }
  });
  
  // User routes
  app.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Do not return the password
      const { password, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Server error fetching user" });
    }
  });
  
  // Doctor routes
  app.get("/api/doctors", async (req, res) => {
    try {
      const specialization = req.query.specialization as string | undefined;
      
      let doctors;
      if (specialization) {
        doctors = await storage.getDoctorsBySpecialization(specialization);
      } else {
        doctors = await storage.getAllDoctors();
      }
      
      res.json({ doctors });
    } catch (error) {
      res.status(500).json({ message: "Server error fetching doctors" });
    }
  });
  
  app.get("/api/doctors/:id", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const doctor = await storage.getDoctorProfile(doctorId);
      
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      
      const user = await storage.getUser(doctor.userId);
      
      if (!user) {
        return res.status(404).json({ message: "Doctor user not found" });
      }
      
      // Do not return the password
      const { password, ...userWithoutPassword } = user;
      
      res.json({ doctor: { ...doctor, user: userWithoutPassword } });
    } catch (error) {
      res.status(500).json({ message: "Server error fetching doctor" });
    }
  });
  
  app.patch("/api/doctors/:id/availability", requireAuth, async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const { isAvailable } = req.body;
      
      if (typeof isAvailable !== 'boolean') {
        return res.status(400).json({ message: "isAvailable must be a boolean" });
      }
      
      const doctor = await storage.getDoctorProfile(doctorId);
      
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      
      // Verify that the logged-in user is updating their own status
      if (doctor.userId !== req.session.userId) {
        return res.status(403).json({ message: "You can only update your own availability" });
      }
      
      const updatedDoctor = await storage.updateDoctorProfile(doctorId, { isAvailable });
      
      res.json({ doctor: updatedDoctor });
    } catch (error) {
      res.status(500).json({ message: "Server error updating doctor availability" });
    }
  });
  
  // Symptom routes
  app.get("/api/symptoms", async (req, res) => {
    try {
      const symptoms = await storage.getSymptoms();
      res.json({ symptoms });
    } catch (error) {
      res.status(500).json({ message: "Server error fetching symptoms" });
    }
  });
  
  app.post("/api/symptom-check", async (req, res) => {
    try {
      const { symptoms, duration } = req.body;
      
      if (!Array.isArray(symptoms) || symptoms.length === 0) {
        return res.status(400).json({ message: "Symptoms are required" });
      }
      
      // Get potential conditions based on symptoms
      const conditions = await storage.getConditionsBySymptoms(symptoms);
      
      // Get appropriate diet plans
      const conditionNames = conditions.map(condition => condition.name);
      const dietPlans = await Promise.all(
        conditionNames.map(async (condition) => {
          return await storage.getDietPlansByCondition(condition);
        })
      );
      
      // Flatten and remove duplicates from diet plans
      const uniqueDietPlans = Array.from(
        new Map(
          dietPlans.flat().map(plan => [plan.id, plan])
        ).values()
      );
      
      res.json({ 
        conditions,
        dietPlans: uniqueDietPlans,
        urgencyLevel: Math.min(5, Math.max(1, conditions.length))
      });
    } catch (error) {
      res.status(500).json({ message: "Server error checking symptoms" });
    }
  });
  
  // Diet plan routes
  app.get("/api/diet-plans", async (req, res) => {
    try {
      const condition = req.query.condition as string | undefined;
      
      let dietPlans;
      if (condition) {
        dietPlans = await storage.getDietPlansByCondition(condition);
      } else {
        dietPlans = await storage.getDietPlans();
      }
      
      res.json({ dietPlans });
    } catch (error) {
      res.status(500).json({ message: "Server error fetching diet plans" });
    }
  });
  
  app.get("/api/diet-plans/:id", async (req, res) => {
    try {
      const dietPlanId = parseInt(req.params.id);
      const dietPlan = await storage.getDietPlan(dietPlanId);
      
      if (!dietPlan) {
        return res.status(404).json({ message: "Diet plan not found" });
      }
      
      res.json({ dietPlan });
    } catch (error) {
      res.status(500).json({ message: "Server error fetching diet plan" });
    }
  });
  
  // Appointment routes
  app.get("/api/appointments", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let appointments;
      if (user.role === "doctor") {
        const doctorProfile = await storage.getDoctorProfileByUserId(userId);
        if (!doctorProfile) {
          return res.status(404).json({ message: "Doctor profile not found" });
        }
        appointments = await storage.getDoctorAppointments(doctorProfile.id);
      } else {
        appointments = await storage.getPatientAppointments(userId);
      }
      
      res.json({ appointments });
    } catch (error) {
      res.status(500).json({ message: "Server error fetching appointments" });
    }
  });
  
  app.post("/api/appointments", requireAuth, async (req, res) => {
    try {
      const { doctorId, date, time, type, notes } = req.body;
      const patientId = req.session.userId!;
      
      if (!doctorId || !date || !time || !type) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const appointment = await storage.createAppointment({
        patientId,
        doctorId,
        date: new Date(date),
        time,
        type,
        notes,
        status: "scheduled"
      });
      
      res.status(201).json({ appointment });
    } catch (error) {
      res.status(500).json({ message: "Server error creating appointment" });
    }
  });
  
  app.patch("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Verify that the logged-in user is a participant in this appointment
      const userId = req.session.userId!;
      if (appointment.patientId !== userId) {
        const doctorProfile = await storage.getDoctorProfileByUserId(userId);
        if (!doctorProfile || appointment.doctorId !== doctorProfile.id) {
          return res.status(403).json({ message: "You are not authorized to update this appointment" });
        }
      }
      
      const updatedAppointment = await storage.updateAppointment(appointmentId, { status });
      
      res.json({ appointment: updatedAppointment });
    } catch (error) {
      res.status(500).json({ message: "Server error updating appointment" });
    }
  });
  
  // Medication routes
  app.get("/api/medications", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const medications = await storage.getUserMedications(userId);
      
      res.json({ medications });
    } catch (error) {
      res.status(500).json({ message: "Server error fetching medications" });
    }
  });
  
  app.post("/api/medications", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { name, dosage, frequency, time, startDate, endDate, notes } = req.body;
      
      if (!name || !dosage || !frequency || !time || !startDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const medication = await storage.createMedication({
        userId,
        name,
        dosage,
        frequency,
        time,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        notes
      });
      
      res.status(201).json({ medication });
    } catch (error) {
      res.status(500).json({ message: "Server error creating medication" });
    }
  });
  
  // Forum routes
  app.get("/api/forum/posts", async (req, res) => {
    try {
      const posts = await storage.getForumPosts();
      
      res.json({ posts });
    } catch (error) {
      res.status(500).json({ message: "Server error fetching forum posts" });
    }
  });
  
  app.get("/api/forum/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getForumPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const replies = await storage.getForumReplies(postId);
      
      res.json({ post, replies });
    } catch (error) {
      res.status(500).json({ message: "Server error fetching forum post" });
    }
  });
  
  app.post("/api/forum/posts", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const validatedData = insertForumPostSchema.parse({ ...req.body, userId });
      
      const post = await storage.createForumPost(validatedData);
      const user = await storage.getUser(userId);
      
      res.status(201).json({ post: { ...post, user: user! } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error creating forum post" });
    }
  });
  
  app.post("/api/forum/posts/:id/replies", requireAuth, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.session.userId!;
      const validatedData = insertForumReplySchema.parse({ 
        ...req.body, 
        userId,
        postId 
      });
      
      const post = await storage.getForumPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const reply = await storage.createForumReply(validatedData);
      const user = await storage.getUser(userId);
      
      res.status(201).json({ reply: { ...reply, user: user! } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error creating forum reply" });
    }
  });
  
  // Health schemes routes
  app.get("/api/health-schemes", async (req, res) => {
    try {
      const schemes = await storage.getHealthSchemes();
      
      res.json({ schemes });
    } catch (error) {
      res.status(500).json({ message: "Server error fetching health schemes" });
    }
  });
  
  // Health metrics routes
  app.get("/api/health-metrics", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const type = req.query.type as string | undefined;
      
      let metrics;
      if (type) {
        metrics = await storage.getUserHealthMetricsByType(userId, type);
      } else {
        metrics = await storage.getUserHealthMetrics(userId);
      }
      
      res.json({ metrics });
    } catch (error) {
      res.status(500).json({ message: "Server error fetching health metrics" });
    }
  });
  
  app.post("/api/health-metrics", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { type, value, unit } = req.body;
      
      if (!type || !value || !unit) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const metric = await storage.createHealthMetric({
        userId,
        type,
        value,
        unit
      });
      
      res.status(201).json({ metric });
    } catch (error) {
      res.status(500).json({ message: "Server error creating health metric" });
    }
  });
  
  // Emergency contact routes
  app.get("/api/emergency-contacts", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const contacts = await storage.getEmergencyContacts(userId);
      
      res.json({ contacts });
    } catch (error) {
      res.status(500).json({ message: "Server error fetching emergency contacts" });
    }
  });
  
  app.post("/api/emergency-contacts", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { name, relationship, phone } = req.body;
      
      if (!name || !relationship || !phone) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const contact = await storage.createEmergencyContact({
        userId,
        name,
        relationship,
        phone
      });
      
      res.json({ contact });
    } catch (error) {
      res.status(500).json({ message: "Server error creating emergency contact" });
    }
  });
  
  // Translations routes
  app.get("/api/translations/:language", async (req, res) => {
    try {
      const language = req.params.language;
      const translations = await storage.getTranslationsByLanguage(language);
      
      // Convert to a more usable format
      const translationsMap = translations.reduce((acc, trans) => {
        acc[trans.key] = trans.value;
        return acc;
      }, {} as Record<string, string>);
      
      res.json({ translations: translationsMap });
    } catch (error) {
      res.status(500).json({ message: "Server error fetching translations" });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Set up WebSocket server for chat and video calls
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    ws.on('message', async (messageData) => {
      try {
        const message = JSON.parse(messageData.toString());
        
        if (message.type === 'auth') {
          // Authenticate the WebSocket connection
          const userId = message.userId;
          userConnections.set(userId, ws);
          ws.send(JSON.stringify({ type: 'auth', success: true }));
        } 
        else if (message.type === 'chat') {
          // Handle chat messages
          const { senderId, receiverId, content } = message;
          
          // Store the message in the database
          const validatedData = insertChatMessageSchema.parse({
            senderId,
            receiverId,
            content
          });
          
          const chatMessage = await storage.createChatMessage(validatedData);
          
          // Send to the receiver if online
          const receiverWs = userConnections.get(receiverId);
          if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(JSON.stringify({
              type: 'chat',
              message: chatMessage
            }));
          }
          
          // Send confirmation to the sender
          ws.send(JSON.stringify({
            type: 'chat_sent',
            message: chatMessage
          }));
        }
        else if (message.type === 'video_offer' || message.type === 'video_answer' || message.type === 'ice_candidate') {
          // Forward WebRTC signaling messages
          const { targetUserId } = message;
          const targetWs = userConnections.get(targetUserId);
          
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify(message));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });
    
    ws.on('close', () => {
      // Remove the connection when it's closed
      for (const [userId, connection] of userConnections.entries()) {
        if (connection === ws) {
          userConnections.delete(userId);
          break;
        }
      }
    });
  });

  return httpServer;
}
