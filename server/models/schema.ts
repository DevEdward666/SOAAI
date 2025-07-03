import { relations } from 'drizzle-orm';
import { 
  pgTable, 
  serial, 
  varchar, 
  text, 
  timestamp, 
  boolean, 
  integer, 
  decimal,
  pgEnum 
} from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
// export const usersRelations = relations(users, ({ many }) => ({
//   adoptionApplications: many(adoptionApplications),
//   sentMessages: many(messages, { relationName: 'senderRelation' }),
//   receivedMessages: many(messages, { relationName: 'receiverRelation' }),
//   reports: many(reports),
//   reportResponses: many(reportResponses),
// }));

// export const petsRelations = relations(pets, ({ many }) => ({
//   adoptionApplications: many(adoptionApplications),
// }));

// Types for insert operations
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

