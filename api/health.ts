import { db } from './_lib/db'
import { sql } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    // Verify DB connection by running a simple query
    await db.execute(sql`SELECT 1`)
    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return Response.json(
      { status: 'error', message: 'Database connection failed' },
      { status: 500 }
    )
  }
}
