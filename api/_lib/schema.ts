import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export const quizLeads = pgTable('quiz_leads', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  prenom: text('prenom').notNull(),
  scoreTotal: integer('score_total').notNull(),
  scorePersonnel: integer('score_personnel').notNull(),
  scoreTravail: integer('score_travail').notNull(),
  scoreRetrait: integer('score_retrait').notNull(),
  stade: text('stade').notNull(),
  answers: jsonb('answers'),
  booked: boolean('booked').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const quizEvents = pgTable('quiz_events', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id'),
  eventType: text('event_type').notNull(),
  questionIndex: integer('question_index'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// TypeScript type exports for use in API routes
export type QuizLead = InferSelectModel<typeof quizLeads>
export type NewQuizLead = InferInsertModel<typeof quizLeads>
export type QuizEvent = InferSelectModel<typeof quizEvents>
export type NewQuizEvent = InferInsertModel<typeof quizEvents>
