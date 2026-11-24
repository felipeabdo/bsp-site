import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    memberId: text("member_id").notNull().unique(),
    joinYear: integer("join_year").notNull(),
    seq: integer("seq").notNull(),
    email: text("email").unique(),
    passwordHash: text("password_hash"),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull().default(""),
    stageName: text("stage_name"),
    birthDate: text("birth_date"),
    birthPlace: text("birth_place"),
    address: text("address"),
    city: text("city"),
    state: text("state"),
    zip: text("zip"),
    phone: text("phone"),
    gender: text("gender"),
    silhouette: text("silhouette").notNull().default("m"),
    category: text("category").notNull().default("atual"), // fundador | atual | ex
    instrument: text("instrument"),
    leftYear: integer("left_year"),
    bio: text("bio"),
    bodyPhotoType: text("body_photo_type").notNull().default("full"), // full | half
    photoBody: text("photo_body"),
    photoPortrait: text("photo_portrait"),
    photoVersion: integer("photo_version").notNull().default(0),
    instagram: text("instagram"),
    whatsapp: text("whatsapp"),
    showContact: boolean("show_contact").notNull().default(true),
    bloodType: text("blood_type"),
    emergencyName: text("emergency_name"),
    emergencyPhone: text("emergency_phone"),
    shirtSize: text("shirt_size"),
    isDemo: boolean("is_demo").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_year_seq_idx").on(t.joinYear, t.seq)],
);

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(), // sha256 do token
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  startsAt: timestamp("starts_at").notNull(),
  timeLabel: text("time_label"),
  location: text("location"),
  description: text("description"),
  kind: text("kind").notNull().default("show"), // show | ensaio | cortejo | oficina
  free: boolean("free").notNull().default(true),
  confirmed: boolean("confirmed").notNull().default(true),
  isDemo: boolean("is_demo").notNull().default(false),
  concentrationAt: text("concentration_at"),
  dressCode: text("dress_code"),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const oficinaSignups = pgTable("oficina_signups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp").notNull(),
  level: text("level").notNull(),
  instrument: text("instrument"),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


// Sequencer patterns and uploaded one-shot audio samples for the public music studio.
export const musicInstrumentSettings = pgTable("music_instrument_settings", {
  voice: text("voice").primaryKey(),
  pattern: jsonb("pattern").$type<number[]>().notNull(),
  sampleData: text("sample_data"), // base64-encoded short audio sample
  sampleMime: text("sample_mime"),
  sampleName: text("sample_name"),
  soundSlots: jsonb("sound_slots").$type<unknown[]>(),
  composition: jsonb("composition").$type<Record<string, unknown>>(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const musicSoundSamples = pgTable("music_sound_samples", {
  voice: text("voice").notNull(),
  slotId: text("slot_id").notNull(),
  sampleData: text("sample_data").notNull(),
  sampleMime: text("sample_mime").notNull(),
  sampleName: text("sample_name").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("music_sound_samples_voice_slot_idx").on(t.voice, t.slotId)]);

export const musicAssignments = pgTable("music_assignments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  recipientMemberId: text("recipient_member_id").notNull(),
  instrument: text("instrument").notNull(),
  bpm: integer("bpm").notNull().default(92),
  pattern: jsonb("pattern").$type<number[]>().notNull(),
  composition: jsonb("composition").$type<Record<string, unknown>>(),
  description: text("description"),
  assignedBy: text("assigned_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


export const eventRsvps = pgTable(
  "event_rsvps",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    memberId: text("member_id").notNull().references(() => users.memberId, { onDelete: "cascade" }),
    status: text("status").notNull(), // going | unavailable
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("event_rsvps_event_member_idx").on(t.eventId, t.memberId)],
);

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  author: text("author").notNull().default("Diretoria"),
  pinned: boolean("pinned").notNull().default(false),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
