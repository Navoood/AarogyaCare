import { pgTable, text, serial, integer, boolean, date, time, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles
export const userRoles = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  ADMIN: "admin",
} as const;

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").$type<keyof typeof userRoles>().notNull().default("patient"),
  phone: text("phone"),
  address: text("address"),
  language: text("language").default("english"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Doctor profiles
export const doctorProfiles = pgTable("doctor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  specialization: text("specialization").notNull(),
  experience: integer("experience").notNull(),
  hospital: text("hospital"),
  qualification: text("qualification").notNull(),
  location: text("location").notNull().default("Delhi"), // Add location field with default
  isAvailable: boolean("is_available").default(false),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
  consultationFee: integer("consultation_fee"),
});

// Emergency contacts
export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  phone: text("phone").notNull(),
});

// Symptoms mapping
export const symptoms = pgTable("symptoms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  urgencyLevel: integer("urgency_level").default(1), // 1-5 scale
});

// Health conditions
export const conditions = pgTable("conditions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  symptoms: text("symptoms").array(),
  recommendations: text("recommendations").array(),
});

// Doctor availability
export const availability = pgTable("availability", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull().references(() => doctorProfiles.id),
  day: text("day").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
});

// Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  doctorId: integer("doctor_id").notNull().references(() => doctorProfiles.id),
  date: date("date").notNull(),
  time: time("time").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  type: text("type").notNull(), // video, in-person
  notes: text("notes"),
});

// Diet plans
export const dietPlans = pgTable("diet_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  forConditions: text("for_conditions").array(),
  mealPlan: jsonb("meal_plan").notNull(),
});

// Medication reminders
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(), // daily, twice a day, etc.
  time: text("time").array().notNull(), // Array of times
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  notes: text("notes"),
});

// Forum posts
export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  upvotes: integer("upvotes").default(0),
});

// Forum replies
export const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => forumPosts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  upvotes: integer("upvotes").default(0),
});

// Government health schemes
export const healthSchemes = pgTable("health_schemes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  eligibility: text("eligibility").notNull(),
  benefits: text("benefits").notNull(),
  status: text("status").notNull().default("active"), // active, inactive
  coverageAmount: text("coverage_amount"),
  documents: text("documents").array(),
});

// Health metrics
export const healthMetrics = pgTable("health_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // weight, blood pressure, glucose, etc.
  value: text("value").notNull(),
  unit: text("unit").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  isRead: boolean("is_read").default(false),
});

// Translations
export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  language: text("language").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
});

// Schema validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertDoctorProfileSchema = createInsertSchema(doctorProfiles).omit({ id: true });
export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).omit({ id: true });
export const insertSymptomSchema = createInsertSchema(symptoms).omit({ id: true });
export const insertConditionSchema = createInsertSchema(conditions).omit({ id: true });
export const insertAvailabilitySchema = createInsertSchema(availability).omit({ id: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true });
export const insertDietPlanSchema = createInsertSchema(dietPlans).omit({ id: true });
export const insertMedicationSchema = createInsertSchema(medications).omit({ id: true });
export const insertForumPostSchema = createInsertSchema(forumPosts).omit({ id: true, createdAt: true, upvotes: true });
export const insertForumReplySchema = createInsertSchema(forumReplies).omit({ id: true, createdAt: true, upvotes: true });
export const insertHealthSchemeSchema = createInsertSchema(healthSchemes).omit({ id: true });
export const insertHealthMetricSchema = createInsertSchema(healthMetrics).omit({ id: true, timestamp: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, timestamp: true, isRead: true });
export const insertTranslationSchema = createInsertSchema(translations).omit({ id: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDoctorProfile = z.infer<typeof insertDoctorProfileSchema>;
export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;
export type InsertSymptom = z.infer<typeof insertSymptomSchema>;
export type InsertCondition = z.infer<typeof insertConditionSchema>;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertDietPlan = z.infer<typeof insertDietPlanSchema>;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type InsertHealthScheme = z.infer<typeof insertHealthSchemeSchema>;
export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;

export type User = typeof users.$inferSelect;
export type DoctorProfile = typeof doctorProfiles.$inferSelect;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type Symptom = typeof symptoms.$inferSelect;
export type Condition = typeof conditions.$inferSelect;
export type Availability = typeof availability.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type DietPlan = typeof dietPlans.$inferSelect;
export type Medication = typeof medications.$inferSelect;
export type ForumPost = typeof forumPosts.$inferSelect;
export type ForumReply = typeof forumReplies.$inferSelect;
export type HealthScheme = typeof healthSchemes.$inferSelect;
export type HealthMetric = typeof healthMetrics.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type Translation = typeof translations.$inferSelect;
