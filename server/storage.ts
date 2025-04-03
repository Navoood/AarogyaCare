import {
  users, doctorProfiles, emergencyContacts, symptoms, conditions,
  availability, appointments, dietPlans, medications, forumPosts,
  forumReplies, healthSchemes, healthMetrics, chatMessages, translations,
  type User, type DoctorProfile, type EmergencyContact, type Symptom,
  type Condition, type Availability, type Appointment, type DietPlan,
  type Medication, type ForumPost, type ForumReply, type HealthScheme,
  type HealthMetric, type ChatMessage, type Translation,
  type InsertUser, type InsertDoctorProfile, type InsertEmergencyContact,
  type InsertSymptom, type InsertCondition, type InsertAvailability,
  type InsertAppointment, type InsertDietPlan, type InsertMedication,
  type InsertForumPost, type InsertForumReply, type InsertHealthScheme,
  type InsertHealthMetric, type InsertChatMessage, type InsertTranslation
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, asc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Doctor profile operations
  getDoctorProfile(id: number): Promise<DoctorProfile | undefined>;
  getDoctorProfileByUserId(userId: number): Promise<DoctorProfile | undefined>;
  createDoctorProfile(profile: InsertDoctorProfile): Promise<DoctorProfile>;
  updateDoctorProfile(id: number, data: Partial<DoctorProfile>): Promise<DoctorProfile | undefined>;
  getAllDoctors(): Promise<Array<DoctorProfile & { user: User }>>;
  getDoctorsBySpecialization(specialization: string): Promise<Array<DoctorProfile & { user: User }>>;
  
  // Emergency contacts
  getEmergencyContacts(userId: number): Promise<EmergencyContact[]>;
  createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact>;
  updateEmergencyContact(id: number, data: Partial<EmergencyContact>): Promise<EmergencyContact | undefined>;
  deleteEmergencyContact(id: number): Promise<boolean>;
  
  // Symptoms and conditions
  getSymptom(id: number): Promise<Symptom | undefined>;
  getSymptoms(): Promise<Symptom[]>;
  createSymptom(symptom: InsertSymptom): Promise<Symptom>;
  getCondition(id: number): Promise<Condition | undefined>;
  getConditions(): Promise<Condition[]>;
  getConditionsBySymptoms(symptomIds: number[]): Promise<Condition[]>;
  createCondition(condition: InsertCondition): Promise<Condition>;
  
  // Doctor availability
  getDoctorAvailability(doctorId: number): Promise<Availability[]>;
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  updateAvailability(id: number, data: Partial<Availability>): Promise<Availability | undefined>;
  deleteAvailability(id: number): Promise<boolean>;
  
  // Appointments
  getAppointment(id: number): Promise<Appointment | undefined>;
  getPatientAppointments(patientId: number): Promise<(Appointment & { doctor: DoctorProfile & { user: User } })[]>;
  getDoctorAppointments(doctorId: number): Promise<(Appointment & { patient: User })[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment | undefined>;
  
  // Diet plans
  getDietPlan(id: number): Promise<DietPlan | undefined>;
  getDietPlans(): Promise<DietPlan[]>;
  getDietPlansByCondition(condition: string): Promise<DietPlan[]>;
  createDietPlan(dietPlan: InsertDietPlan): Promise<DietPlan>;
  
  // Medications
  getMedication(id: number): Promise<Medication | undefined>;
  getUserMedications(userId: number): Promise<Medication[]>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, data: Partial<Medication>): Promise<Medication | undefined>;
  deleteMedication(id: number): Promise<boolean>;
  
  // Forum
  getForumPost(id: number): Promise<(ForumPost & { user: User }) | undefined>;
  getForumPosts(): Promise<(ForumPost & { user: User })[]>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  updateForumPost(id: number, data: Partial<ForumPost>): Promise<ForumPost | undefined>;
  getForumReplies(postId: number): Promise<(ForumReply & { user: User })[]>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  updateForumReply(id: number, data: Partial<ForumReply>): Promise<ForumReply | undefined>;
  
  // Health schemes
  getHealthScheme(id: number): Promise<HealthScheme | undefined>;
  getHealthSchemes(): Promise<HealthScheme[]>;
  createHealthScheme(scheme: InsertHealthScheme): Promise<HealthScheme>;
  updateHealthScheme(id: number, data: Partial<HealthScheme>): Promise<HealthScheme | undefined>;
  
  // Health metrics
  getHealthMetric(id: number): Promise<HealthMetric | undefined>;
  getUserHealthMetrics(userId: number): Promise<HealthMetric[]>;
  getUserHealthMetricsByType(userId: number, type: string): Promise<HealthMetric[]>;
  createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric>;
  
  // Chat messages
  getChatMessages(senderId: number, receiverId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markMessageAsRead(id: number): Promise<ChatMessage | undefined>;
  
  // Translations
  getTranslation(language: string, key: string): Promise<Translation | undefined>;
  getTranslationsByLanguage(language: string): Promise<Translation[]>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private doctorProfiles: Map<number, DoctorProfile>;
  private emergencyContacts: Map<number, EmergencyContact>;
  private symptoms: Map<number, Symptom>;
  private conditions: Map<number, Condition>;
  private availability: Map<number, Availability>;
  private appointments: Map<number, Appointment>;
  private dietPlans: Map<number, DietPlan>;
  private medications: Map<number, Medication>;
  private forumPosts: Map<number, ForumPost>;
  private forumReplies: Map<number, ForumReply>;
  private healthSchemes: Map<number, HealthScheme>;
  private healthMetrics: Map<number, HealthMetric>;
  private chatMessages: Map<number, ChatMessage>;
  private translations: Map<number, Translation>;
  
  // Auto incrementing IDs
  private userIdCounter: number;
  private doctorProfileIdCounter: number;
  private emergencyContactIdCounter: number;
  private symptomIdCounter: number;
  private conditionIdCounter: number;
  private availabilityIdCounter: number;
  private appointmentIdCounter: number;
  private dietPlanIdCounter: number;
  private medicationIdCounter: number;
  private forumPostIdCounter: number;
  private forumReplyIdCounter: number;
  private healthSchemeIdCounter: number;
  private healthMetricIdCounter: number;
  private chatMessageIdCounter: number;
  private translationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.doctorProfiles = new Map();
    this.emergencyContacts = new Map();
    this.symptoms = new Map();
    this.conditions = new Map();
    this.availability = new Map();
    this.appointments = new Map();
    this.dietPlans = new Map();
    this.medications = new Map();
    this.forumPosts = new Map();
    this.forumReplies = new Map();
    this.healthSchemes = new Map();
    this.healthMetrics = new Map();
    this.chatMessages = new Map();
    this.translations = new Map();
    
    this.userIdCounter = 1;
    this.doctorProfileIdCounter = 1;
    this.emergencyContactIdCounter = 1;
    this.symptomIdCounter = 1;
    this.conditionIdCounter = 1;
    this.availabilityIdCounter = 1;
    this.appointmentIdCounter = 1;
    this.dietPlanIdCounter = 1;
    this.medicationIdCounter = 1;
    this.forumPostIdCounter = 1;
    this.forumReplyIdCounter = 1;
    this.healthSchemeIdCounter = 1;
    this.healthMetricIdCounter = 1;
    this.chatMessageIdCounter = 1;
    this.translationIdCounter = 1;
    
    // Initialize with seed data
    this.seedData();
  }

  private seedData() {
    // Initial data for testing
    // 1. Create some users
    const adminUser = this.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@aarogya.com",
      fullName: "Admin User",
      role: "admin",
      phone: "9876543210",
      address: "Admin Office, Delhi",
      language: "english"
    });
    
    const patientUser = this.createUser({
      username: "patient",
      password: "patient123",
      email: "patient@example.com",
      fullName: "Rahul Kumar",
      role: "patient",
      phone: "9876543211",
      address: "123 Main St, Rural Village",
      language: "english"
    });
    
    const doctorUser1 = this.createUser({
      username: "doctor1",
      password: "doctor123",
      email: "doctor1@hospital.com",
      fullName: "Dr. Deepak Singh",
      role: "doctor",
      phone: "9876543212",
      address: "AIIMS Delhi",
      language: "english"
    });
    
    const doctorUser2 = this.createUser({
      username: "doctor2",
      password: "doctor123",
      email: "doctor2@hospital.com",
      fullName: "Dr. Ananya Reddy",
      role: "doctor",
      phone: "9876543213",
      address: "Apollo Hospitals",
      language: "english"
    });
    
    const doctorUser3 = this.createUser({
      username: "doctor3",
      password: "doctor123",
      email: "doctor3@hospital.com",
      fullName: "Dr. Rajiv Gupta",
      role: "doctor",
      phone: "9876543214",
      address: "Fortis Hospital",
      language: "english"
    });
    
    // 2. Create doctor profiles
    const doctorProfile1 = this.createDoctorProfile({
      userId: doctorUser1.id,
      specialization: "Cardiologist",
      experience: 8,
      hospital: "AIIMS Delhi",
      qualification: "MD, Cardiology",
      isAvailable: true,
      rating: 48,
      reviewCount: 10,
      consultationFee: 1000
    });
    
    const doctorProfile2 = this.createDoctorProfile({
      userId: doctorUser2.id,
      specialization: "Neurologist",
      experience: 12,
      hospital: "Apollo Hospitals",
      qualification: "MD, Neurology",
      isAvailable: true,
      rating: 49,
      reviewCount: 10,
      consultationFee: 1500
    });
    
    const doctorProfile3 = this.createDoctorProfile({
      userId: doctorUser3.id,
      specialization: "Orthopedic",
      experience: 15,
      hospital: "Fortis Hospital",
      qualification: "MD, Orthopedics",
      isAvailable: false,
      rating: 47,
      reviewCount: 10,
      consultationFee: 1200
    });
    
    // 3. Add some symptoms
    const headache = this.createSymptom({
      name: "Headache",
      description: "Pain in the head or upper neck",
      urgencyLevel: 2
    });
    
    const fever = this.createSymptom({
      name: "Fever",
      description: "Elevated body temperature",
      urgencyLevel: 3
    });
    
    const cough = this.createSymptom({
      name: "Cough",
      description: "Sudden expulsion of air from the lungs",
      urgencyLevel: 2
    });
    
    // 4. Add some health conditions
    const cold = this.createCondition({
      name: "Common Cold",
      description: "A viral infectious disease of the upper respiratory tract",
      symptoms: ["Headache", "Cough", "Fever"],
      recommendations: ["Rest", "Drink fluids", "Take over-the-counter pain relievers"]
    });
    
    const hypertension = this.createCondition({
      name: "Hypertension",
      description: "High blood pressure",
      symptoms: ["Headache", "Dizziness", "Shortness of breath"],
      recommendations: ["Reduce salt intake", "Exercise regularly", "Monitor blood pressure"]
    });
    
    // 5. Create some diet plans
    const generalDiet = this.createDietPlan({
      name: "Balanced Diet",
      description: "A balanced diet for general health",
      forConditions: ["General Health"],
      mealPlan: {
        breakfast: "Oatmeal with fruits and nuts",
        lunch: "Brown rice with vegetables and dal",
        dinner: "Chapati with vegetables and curd",
        snacks: ["Fruits", "Nuts"]
      }
    });
    
    const diabeticDiet = this.createDietPlan({
      name: "Diabetic Diet",
      description: "A diet plan for managing diabetes",
      forConditions: ["Diabetes"],
      mealPlan: {
        breakfast: "High-fiber cereal with skimmed milk",
        lunch: "Whole grain chapati with vegetables and dal",
        dinner: "Grilled fish with salad",
        snacks: ["Apple with peanut butter", "Greek yogurt"]
      }
    });
    
    // 6. Add medications for the patient
    const medication1 = this.createMedication({
      userId: patientUser.id,
      name: "Amlodipine",
      dosage: "5mg",
      frequency: "Daily",
      time: ["9:00 AM"],
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      notes: "Take after breakfast"
    });
    
    const medication2 = this.createMedication({
      userId: patientUser.id,
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      time: ["2:00 PM", "8:00 PM"],
      startDate: new Date(),
      endDate: null,
      notes: "Take after meals"
    });
    
    // 7. Add forum posts
    const forumPost1 = this.createForumPost({
      userId: patientUser.id,
      title: "Managing Diabetes in Rural Areas",
      content: "What lifestyle modifications and locally available foods work best for managing Type 2 diabetes in rural settings?"
    });
    
    const forumPost2 = this.createForumPost({
      userId: patientUser.id,
      title: "Monsoon Health Precautions",
      content: "With monsoon season approaching, what precautions should we take to prevent water-borne diseases?"
    });
    
    // 8. Add forum replies
    const forumReply1 = this.createForumReply({
      postId: forumPost1.id,
      userId: doctorUser1.id,
      content: "Including millets like ragi and jowar in your diet can help manage blood sugar levels. These are often available in rural areas and are cost-effective."
    });
    
    // 9. Add health schemes
    const scheme1 = this.createHealthScheme({
      name: "Ayushman Bharat Yojana",
      description: "Health insurance scheme for economically vulnerable citizens",
      eligibility: "Below poverty line families",
      benefits: "Covers up to ₹5 lakhs per family per year",
      status: "active",
      coverageAmount: "₹5 lakhs",
      documents: ["Aadhaar Card", "Income Certificate", "Ration Card"]
    });
    
    const scheme2 = this.createHealthScheme({
      name: "Pradhan Mantri Jan Arogya Yojana",
      description: "Universal healthcare insurance scheme",
      eligibility: "All citizens",
      benefits: "Cashless treatment at empanelled hospitals",
      status: "active",
      coverageAmount: "Varies",
      documents: ["Aadhaar Card", "Income Certificate"]
    });
    
    // 10. Add translations
    const hindiTranslation1 = this.createTranslation({
      language: "hindi",
      key: "dashboard",
      value: "डैशबोर्ड"
    });
    
    const hindiTranslation2 = this.createTranslation({
      language: "hindi",
      key: "doctors",
      value: "डॉक्टर्स"
    });
    
    // 11. Add health metrics
    const healthMetric1 = this.createHealthMetric({
      userId: patientUser.id,
      type: "blood_pressure",
      value: "120/80",
      unit: "mmHg"
    });
    
    const healthMetric2 = this.createHealthMetric({
      userId: patientUser.id,
      type: "weight",
      value: "70",
      unit: "kg"
    });
    
    // 12. Add emergency contacts
    const emergencyContact1 = this.createEmergencyContact({
      userId: patientUser.id,
      name: "Amit Kumar",
      relationship: "Brother",
      phone: "9876543215"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Doctor profile operations
  async getDoctorProfile(id: number): Promise<DoctorProfile | undefined> {
    return this.doctorProfiles.get(id);
  }
  
  async getDoctorProfileByUserId(userId: number): Promise<DoctorProfile | undefined> {
    return Array.from(this.doctorProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }
  
  async createDoctorProfile(profile: InsertDoctorProfile): Promise<DoctorProfile> {
    const id = this.doctorProfileIdCounter++;
    const doctorProfile: DoctorProfile = { ...profile, id };
    this.doctorProfiles.set(id, doctorProfile);
    return doctorProfile;
  }
  
  async updateDoctorProfile(id: number, data: Partial<DoctorProfile>): Promise<DoctorProfile | undefined> {
    const profile = await this.getDoctorProfile(id);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...data };
    this.doctorProfiles.set(id, updatedProfile);
    return updatedProfile;
  }
  
  async getAllDoctors(): Promise<Array<DoctorProfile & { user: User }>> {
    return Promise.all(
      Array.from(this.doctorProfiles.values()).map(async (profile) => {
        const user = await this.getUser(profile.userId);
        return { ...profile, user: user! };
      })
    );
  }
  
  async getDoctorsBySpecialization(specialization: string): Promise<Array<DoctorProfile & { user: User }>> {
    const doctors = await this.getAllDoctors();
    return doctors.filter((doctor) => doctor.specialization === specialization);
  }
  
  // Emergency contacts
  async getEmergencyContacts(userId: number): Promise<EmergencyContact[]> {
    return Array.from(this.emergencyContacts.values()).filter(
      (contact) => contact.userId === userId
    );
  }
  
  async createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact> {
    const id = this.emergencyContactIdCounter++;
    const emergencyContact: EmergencyContact = { ...contact, id };
    this.emergencyContacts.set(id, emergencyContact);
    return emergencyContact;
  }
  
  async updateEmergencyContact(id: number, data: Partial<EmergencyContact>): Promise<EmergencyContact | undefined> {
    const contact = this.emergencyContacts.get(id);
    if (!contact) return undefined;
    
    const updatedContact = { ...contact, ...data };
    this.emergencyContacts.set(id, updatedContact);
    return updatedContact;
  }
  
  async deleteEmergencyContact(id: number): Promise<boolean> {
    return this.emergencyContacts.delete(id);
  }
  
  // Symptoms and conditions
  async getSymptom(id: number): Promise<Symptom | undefined> {
    return this.symptoms.get(id);
  }
  
  async getSymptoms(): Promise<Symptom[]> {
    return Array.from(this.symptoms.values());
  }
  
  async createSymptom(symptom: InsertSymptom): Promise<Symptom> {
    const id = this.symptomIdCounter++;
    const newSymptom: Symptom = { ...symptom, id };
    this.symptoms.set(id, newSymptom);
    return newSymptom;
  }
  
  async getCondition(id: number): Promise<Condition | undefined> {
    return this.conditions.get(id);
  }
  
  async getConditions(): Promise<Condition[]> {
    return Array.from(this.conditions.values());
  }
  
  async getConditionsBySymptoms(symptomIds: number[]): Promise<Condition[]> {
    const allConditions = await this.getConditions();
    const symptomNames = await Promise.all(
      symptomIds.map(async (id) => {
        const symptom = await this.getSymptom(id);
        return symptom?.name;
      })
    );
    
    return allConditions.filter((condition) => {
      return symptomNames.some((name) => 
        name && condition.symptoms.includes(name)
      );
    });
  }
  
  async createCondition(condition: InsertCondition): Promise<Condition> {
    const id = this.conditionIdCounter++;
    const newCondition: Condition = { ...condition, id };
    this.conditions.set(id, newCondition);
    return newCondition;
  }
  
  // Doctor availability
  async getDoctorAvailability(doctorId: number): Promise<Availability[]> {
    return Array.from(this.availability.values()).filter(
      (avail) => avail.doctorId === doctorId
    );
  }
  
  async createAvailability(avail: InsertAvailability): Promise<Availability> {
    const id = this.availabilityIdCounter++;
    const newAvailability: Availability = { ...avail, id };
    this.availability.set(id, newAvailability);
    return newAvailability;
  }
  
  async updateAvailability(id: number, data: Partial<Availability>): Promise<Availability | undefined> {
    const avail = this.availability.get(id);
    if (!avail) return undefined;
    
    const updatedAvail = { ...avail, ...data };
    this.availability.set(id, updatedAvail);
    return updatedAvail;
  }
  
  async deleteAvailability(id: number): Promise<boolean> {
    return this.availability.delete(id);
  }
  
  // Appointments
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async getPatientAppointments(patientId: number): Promise<(Appointment & { doctor: DoctorProfile & { user: User } })[]> {
    const patientAppointments = Array.from(this.appointments.values()).filter(
      (appointment) => appointment.patientId === patientId
    );
    
    return Promise.all(
      patientAppointments.map(async (appointment) => {
        const doctorProfile = await this.getDoctorProfile(appointment.doctorId);
        const user = await this.getUser(doctorProfile!.userId);
        return {
          ...appointment,
          doctor: { ...doctorProfile!, user: user! }
        };
      })
    );
  }
  
  async getDoctorAppointments(doctorId: number): Promise<(Appointment & { patient: User })[]> {
    const doctorAppointments = Array.from(this.appointments.values()).filter(
      (appointment) => appointment.doctorId === doctorId
    );
    
    return Promise.all(
      doctorAppointments.map(async (appointment) => {
        const patient = await this.getUser(appointment.patientId);
        return {
          ...appointment,
          patient: patient!
        };
      })
    );
  }
  
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const newAppointment: Appointment = { ...appointment, id };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }
  
  async updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...data };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  // Diet plans
  async getDietPlan(id: number): Promise<DietPlan | undefined> {
    return this.dietPlans.get(id);
  }
  
  async getDietPlans(): Promise<DietPlan[]> {
    return Array.from(this.dietPlans.values());
  }
  
  async getDietPlansByCondition(condition: string): Promise<DietPlan[]> {
    return Array.from(this.dietPlans.values()).filter((plan) =>
      plan.forConditions.includes(condition)
    );
  }
  
  async createDietPlan(dietPlan: InsertDietPlan): Promise<DietPlan> {
    const id = this.dietPlanIdCounter++;
    const newDietPlan: DietPlan = { ...dietPlan, id };
    this.dietPlans.set(id, newDietPlan);
    return newDietPlan;
  }
  
  // Medications
  async getMedication(id: number): Promise<Medication | undefined> {
    return this.medications.get(id);
  }
  
  async getUserMedications(userId: number): Promise<Medication[]> {
    return Array.from(this.medications.values()).filter(
      (med) => med.userId === userId
    );
  }
  
  async createMedication(medication: InsertMedication): Promise<Medication> {
    const id = this.medicationIdCounter++;
    const newMedication: Medication = { ...medication, id };
    this.medications.set(id, newMedication);
    return newMedication;
  }
  
  async updateMedication(id: number, data: Partial<Medication>): Promise<Medication | undefined> {
    const medication = this.medications.get(id);
    if (!medication) return undefined;
    
    const updatedMedication = { ...medication, ...data };
    this.medications.set(id, updatedMedication);
    return updatedMedication;
  }
  
  async deleteMedication(id: number): Promise<boolean> {
    return this.medications.delete(id);
  }
  
  // Forum
  async getForumPost(id: number): Promise<(ForumPost & { user: User }) | undefined> {
    const post = this.forumPosts.get(id);
    if (!post) return undefined;
    
    const user = await this.getUser(post.userId);
    return { ...post, user: user! };
  }
  
  async getForumPosts(): Promise<(ForumPost & { user: User })[]> {
    return Promise.all(
      Array.from(this.forumPosts.values()).map(async (post) => {
        const user = await this.getUser(post.userId);
        return { ...post, user: user! };
      })
    );
  }
  
  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const id = this.forumPostIdCounter++;
    const createdAt = new Date();
    const newPost: ForumPost = { ...post, id, createdAt, upvotes: 0 };
    this.forumPosts.set(id, newPost);
    return newPost;
  }
  
  async updateForumPost(id: number, data: Partial<ForumPost>): Promise<ForumPost | undefined> {
    const post = this.forumPosts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...data };
    this.forumPosts.set(id, updatedPost);
    return updatedPost;
  }
  
  async getForumReplies(postId: number): Promise<(ForumReply & { user: User })[]> {
    const replies = Array.from(this.forumReplies.values()).filter(
      (reply) => reply.postId === postId
    );
    
    return Promise.all(
      replies.map(async (reply) => {
        const user = await this.getUser(reply.userId);
        return { ...reply, user: user! };
      })
    );
  }
  
  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const id = this.forumReplyIdCounter++;
    const createdAt = new Date();
    const newReply: ForumReply = { ...reply, id, createdAt, upvotes: 0 };
    this.forumReplies.set(id, newReply);
    return newReply;
  }
  
  async updateForumReply(id: number, data: Partial<ForumReply>): Promise<ForumReply | undefined> {
    const reply = this.forumReplies.get(id);
    if (!reply) return undefined;
    
    const updatedReply = { ...reply, ...data };
    this.forumReplies.set(id, updatedReply);
    return updatedReply;
  }
  
  // Health schemes
  async getHealthScheme(id: number): Promise<HealthScheme | undefined> {
    return this.healthSchemes.get(id);
  }
  
  async getHealthSchemes(): Promise<HealthScheme[]> {
    return Array.from(this.healthSchemes.values());
  }
  
  async createHealthScheme(scheme: InsertHealthScheme): Promise<HealthScheme> {
    const id = this.healthSchemeIdCounter++;
    const newScheme: HealthScheme = { ...scheme, id };
    this.healthSchemes.set(id, newScheme);
    return newScheme;
  }
  
  async updateHealthScheme(id: number, data: Partial<HealthScheme>): Promise<HealthScheme | undefined> {
    const scheme = this.healthSchemes.get(id);
    if (!scheme) return undefined;
    
    const updatedScheme = { ...scheme, ...data };
    this.healthSchemes.set(id, updatedScheme);
    return updatedScheme;
  }
  
  // Health metrics
  async getHealthMetric(id: number): Promise<HealthMetric | undefined> {
    return this.healthMetrics.get(id);
  }
  
  async getUserHealthMetrics(userId: number): Promise<HealthMetric[]> {
    return Array.from(this.healthMetrics.values()).filter(
      (metric) => metric.userId === userId
    );
  }
  
  async getUserHealthMetricsByType(userId: number, type: string): Promise<HealthMetric[]> {
    return Array.from(this.healthMetrics.values()).filter(
      (metric) => metric.userId === userId && metric.type === type
    );
  }
  
  async createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric> {
    const id = this.healthMetricIdCounter++;
    const timestamp = new Date();
    const newMetric: HealthMetric = { ...metric, id, timestamp };
    this.healthMetrics.set(id, newMetric);
    return newMetric;
  }
  
  // Chat messages
  async getChatMessages(senderId: number, receiverId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(
      (message) => 
        (message.senderId === senderId && message.receiverId === receiverId) ||
        (message.senderId === receiverId && message.receiverId === senderId)
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatMessageIdCounter++;
    const timestamp = new Date();
    const newMessage: ChatMessage = { ...message, id, timestamp, isRead: false };
    this.chatMessages.set(id, newMessage);
    return newMessage;
  }
  
  async markMessageAsRead(id: number): Promise<ChatMessage | undefined> {
    const message = this.chatMessages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, isRead: true };
    this.chatMessages.set(id, updatedMessage);
    return updatedMessage;
  }
  
  // Translations
  async getTranslation(language: string, key: string): Promise<Translation | undefined> {
    return Array.from(this.translations.values()).find(
      (trans) => trans.language === language && trans.key === key
    );
  }
  
  async getTranslationsByLanguage(language: string): Promise<Translation[]> {
    return Array.from(this.translations.values()).filter(
      (trans) => trans.language === language
    );
  }
  
  async createTranslation(translation: InsertTranslation): Promise<Translation> {
    const id = this.translationIdCounter++;
    const newTranslation: Translation = { ...translation, id };
    this.translations.set(id, newTranslation);
    return newTranslation;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getDoctorProfile(id: number): Promise<DoctorProfile | undefined> {
    const [profile] = await db.select().from(doctorProfiles).where(eq(doctorProfiles.id, id));
    return profile || undefined;
  }

  async getDoctorProfileByUserId(userId: number): Promise<DoctorProfile | undefined> {
    const [profile] = await db.select().from(doctorProfiles).where(eq(doctorProfiles.userId, userId));
    return profile || undefined;
  }

  async createDoctorProfile(profile: InsertDoctorProfile): Promise<DoctorProfile> {
    const [doctorProfile] = await db.insert(doctorProfiles).values(profile).returning();
    return doctorProfile;
  }

  async updateDoctorProfile(id: number, data: Partial<DoctorProfile>): Promise<DoctorProfile | undefined> {
    const [profile] = await db.update(doctorProfiles).set(data).where(eq(doctorProfiles.id, id)).returning();
    return profile || undefined;
  }

  async getAllDoctors(): Promise<Array<DoctorProfile & { user: User }>> {
    const doctors = await db.select({
      doctorProfile: doctorProfiles,
      user: users
    }).from(doctorProfiles)
      .innerJoin(users, eq(doctorProfiles.userId, users.id));
    
    return doctors.map(({ doctorProfile, user }) => ({
      ...doctorProfile,
      user
    }));
  }

  async getDoctorsBySpecialization(specialization: string): Promise<Array<DoctorProfile & { user: User }>> {
    const doctors = await db.select({
      doctorProfile: doctorProfiles,
      user: users
    }).from(doctorProfiles)
      .innerJoin(users, eq(doctorProfiles.userId, users.id))
      .where(eq(doctorProfiles.specialization, specialization));
    
    return doctors.map(({ doctorProfile, user }) => ({
      ...doctorProfile,
      user
    }));
  }

  async getEmergencyContacts(userId: number): Promise<EmergencyContact[]> {
    return db.select().from(emergencyContacts).where(eq(emergencyContacts.userId, userId));
  }

  async createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact> {
    const [emergencyContact] = await db.insert(emergencyContacts).values(contact).returning();
    return emergencyContact;
  }

  async updateEmergencyContact(id: number, data: Partial<EmergencyContact>): Promise<EmergencyContact | undefined> {
    const [contact] = await db.update(emergencyContacts).set(data).where(eq(emergencyContacts.id, id)).returning();
    return contact || undefined;
  }

  async deleteEmergencyContact(id: number): Promise<boolean> {
    const result = await db.delete(emergencyContacts).where(eq(emergencyContacts.id, id));
    return !!result;
  }

  async getSymptom(id: number): Promise<Symptom | undefined> {
    const [symptom] = await db.select().from(symptoms).where(eq(symptoms.id, id));
    return symptom || undefined;
  }

  async getSymptoms(): Promise<Symptom[]> {
    return db.select().from(symptoms);
  }

  async createSymptom(symptom: InsertSymptom): Promise<Symptom> {
    const [newSymptom] = await db.insert(symptoms).values(symptom).returning();
    return newSymptom;
  }

  async getCondition(id: number): Promise<Condition | undefined> {
    const [condition] = await db.select().from(conditions).where(eq(conditions.id, id));
    return condition || undefined;
  }

  async getConditions(): Promise<Condition[]> {
    return db.select().from(conditions);
  }

  async getConditionsBySymptoms(symptomIds: number[]): Promise<Condition[]> {
    // This is a complex query that would need to match conditions containing any of the symptom IDs
    // In SQL we'd normally use something like WHERE symptoms && ARRAY[...symptomIds]
    // Since this is more complex with Drizzle ORM, we'll get all conditions and filter in JS
    const allConditions = await this.getConditions();
    return allConditions.filter(condition => {
      const conditionSymptomIds = condition.symptoms.map(Number);
      return symptomIds.some(id => conditionSymptomIds.includes(id));
    });
  }

  async createCondition(condition: InsertCondition): Promise<Condition> {
    const [newCondition] = await db.insert(conditions).values(condition).returning();
    return newCondition;
  }

  async getDoctorAvailability(doctorId: number): Promise<Availability[]> {
    return db.select().from(availability).where(eq(availability.doctorId, doctorId));
  }

  async createAvailability(avail: InsertAvailability): Promise<Availability> {
    const [newAvailability] = await db.insert(availability).values(avail).returning();
    return newAvailability;
  }

  async updateAvailability(id: number, data: Partial<Availability>): Promise<Availability | undefined> {
    const [updatedAvailability] = await db.update(availability).set(data).where(eq(availability.id, id)).returning();
    return updatedAvailability || undefined;
  }

  async deleteAvailability(id: number): Promise<boolean> {
    const result = await db.delete(availability).where(eq(availability.id, id));
    return !!result;
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async getPatientAppointments(patientId: number): Promise<(Appointment & { doctor: DoctorProfile & { user: User } })[]> {
    const result = await db.select({
      appointment: appointments,
      doctorProfile: doctorProfiles,
      user: users
    }).from(appointments)
      .innerJoin(doctorProfiles, eq(appointments.doctorId, doctorProfiles.id))
      .innerJoin(users, eq(doctorProfiles.userId, users.id))
      .where(eq(appointments.patientId, patientId));
    
    return result.map(({ appointment, doctorProfile, user }) => ({
      ...appointment,
      doctor: {
        ...doctorProfile,
        user
      }
    }));
  }

  async getDoctorAppointments(doctorId: number): Promise<(Appointment & { patient: User })[]> {
    const result = await db.select({
      appointment: appointments,
      patient: users
    }).from(appointments)
      .innerJoin(users, eq(appointments.patientId, users.id))
      .where(eq(appointments.doctorId, doctorId));
    
    return result.map(({ appointment, patient }) => ({
      ...appointment,
      patient
    }));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment | undefined> {
    const [updatedAppointment] = await db.update(appointments).set(data).where(eq(appointments.id, id)).returning();
    return updatedAppointment || undefined;
  }

  async getDietPlan(id: number): Promise<DietPlan | undefined> {
    const [dietPlan] = await db.select().from(dietPlans).where(eq(dietPlans.id, id));
    return dietPlan || undefined;
  }

  async getDietPlans(): Promise<DietPlan[]> {
    return db.select().from(dietPlans);
  }

  async getDietPlansByCondition(condition: string): Promise<DietPlan[]> {
    // Similar to getConditionsBySymptoms, we need to check if the condition is in the forConditions array
    const allDietPlans = await this.getDietPlans();
    return allDietPlans.filter(plan => plan.forConditions.includes(condition));
  }

  async createDietPlan(dietPlan: InsertDietPlan): Promise<DietPlan> {
    const [newDietPlan] = await db.insert(dietPlans).values(dietPlan).returning();
    return newDietPlan;
  }

  async getMedication(id: number): Promise<Medication | undefined> {
    const [medication] = await db.select().from(medications).where(eq(medications.id, id));
    return medication || undefined;
  }

  async getUserMedications(userId: number): Promise<Medication[]> {
    return db.select().from(medications).where(eq(medications.userId, userId));
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const [newMedication] = await db.insert(medications).values(medication).returning();
    return newMedication;
  }

  async updateMedication(id: number, data: Partial<Medication>): Promise<Medication | undefined> {
    const [updatedMedication] = await db.update(medications).set(data).where(eq(medications.id, id)).returning();
    return updatedMedication || undefined;
  }

  async deleteMedication(id: number): Promise<boolean> {
    const result = await db.delete(medications).where(eq(medications.id, id));
    return !!result;
  }

  async getForumPost(id: number): Promise<(ForumPost & { user: User }) | undefined> {
    const [result] = await db.select({
      post: forumPosts,
      user: users
    }).from(forumPosts)
      .innerJoin(users, eq(forumPosts.userId, users.id))
      .where(eq(forumPosts.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.post,
      user: result.user
    };
  }

  async getForumPosts(): Promise<(ForumPost & { user: User })[]> {
    const result = await db.select({
      post: forumPosts,
      user: users
    }).from(forumPosts)
      .innerJoin(users, eq(forumPosts.userId, users.id));
    
    return result.map(({ post, user }) => ({
      ...post,
      user
    }));
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const [newPost] = await db.insert(forumPosts).values({
      ...post,
      upvotes: 0
    }).returning();
    
    return newPost;
  }

  async updateForumPost(id: number, data: Partial<ForumPost>): Promise<ForumPost | undefined> {
    const [updatedPost] = await db.update(forumPosts).set(data).where(eq(forumPosts.id, id)).returning();
    return updatedPost || undefined;
  }

  async getForumReplies(postId: number): Promise<(ForumReply & { user: User })[]> {
    const result = await db.select({
      reply: forumReplies,
      user: users
    }).from(forumReplies)
      .innerJoin(users, eq(forumReplies.userId, users.id))
      .where(eq(forumReplies.postId, postId));
    
    return result.map(({ reply, user }) => ({
      ...reply,
      user
    }));
  }

  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const [newReply] = await db.insert(forumReplies).values({
      ...reply,
      upvotes: 0
    }).returning();
    
    return newReply;
  }

  async updateForumReply(id: number, data: Partial<ForumReply>): Promise<ForumReply | undefined> {
    const [updatedReply] = await db.update(forumReplies).set(data).where(eq(forumReplies.id, id)).returning();
    return updatedReply || undefined;
  }

  async getHealthScheme(id: number): Promise<HealthScheme | undefined> {
    const [scheme] = await db.select().from(healthSchemes).where(eq(healthSchemes.id, id));
    return scheme || undefined;
  }

  async getHealthSchemes(): Promise<HealthScheme[]> {
    return db.select().from(healthSchemes);
  }

  async createHealthScheme(scheme: InsertHealthScheme): Promise<HealthScheme> {
    const [newScheme] = await db.insert(healthSchemes).values(scheme).returning();
    return newScheme;
  }

  async updateHealthScheme(id: number, data: Partial<HealthScheme>): Promise<HealthScheme | undefined> {
    const [updatedScheme] = await db.update(healthSchemes).set(data).where(eq(healthSchemes.id, id)).returning();
    return updatedScheme || undefined;
  }

  async getHealthMetric(id: number): Promise<HealthMetric | undefined> {
    const [metric] = await db.select().from(healthMetrics).where(eq(healthMetrics.id, id));
    return metric || undefined;
  }

  async getUserHealthMetrics(userId: number): Promise<HealthMetric[]> {
    return db.select().from(healthMetrics).where(eq(healthMetrics.userId, userId));
  }

  async getUserHealthMetricsByType(userId: number, type: string): Promise<HealthMetric[]> {
    return db.select().from(healthMetrics)
      .where(and(
        eq(healthMetrics.userId, userId),
        eq(healthMetrics.type, type)
      ));
  }

  async createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric> {
    const [newMetric] = await db.insert(healthMetrics).values(metric).returning();
    return newMetric;
  }

  async getChatMessages(senderId: number, receiverId: number): Promise<ChatMessage[]> {
    return db.select().from(chatMessages)
      .where(
        or(
          and(
            eq(chatMessages.senderId, senderId),
            eq(chatMessages.receiverId, receiverId)
          ),
          and(
            eq(chatMessages.senderId, receiverId),
            eq(chatMessages.receiverId, senderId)
          )
        )
      )
      .orderBy(asc(chatMessages.timestamp));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values({
      ...message,
      isRead: false
    }).returning();
    
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<ChatMessage | undefined> {
    const [updatedMessage] = await db.update(chatMessages)
      .set({ isRead: true })
      .where(eq(chatMessages.id, id))
      .returning();
    
    return updatedMessage || undefined;
  }

  async getTranslation(language: string, key: string): Promise<Translation | undefined> {
    const [translation] = await db.select().from(translations)
      .where(and(
        eq(translations.language, language),
        eq(translations.key, key)
      ));
    
    return translation || undefined;
  }

  async getTranslationsByLanguage(language: string): Promise<Translation[]> {
    return db.select().from(translations).where(eq(translations.language, language));
  }

  async createTranslation(translation: InsertTranslation): Promise<Translation> {
    const [newTranslation] = await db.insert(translations).values(translation).returning();
    return newTranslation;
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
