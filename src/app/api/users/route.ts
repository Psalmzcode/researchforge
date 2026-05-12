import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
export async function GET(req: NextRequest) {
  const session = await auth(); if (!session) return NextResponse.json({ error:'Unauthorized' },{status:401})
  const user = session.user as any; if (!['ADMIN','FINANCE'].includes(user.role)) return NextResponse.json({ error:'Forbidden' },{status:403})
  const users = await db.user.findMany({ select:{id:true,name:true,email:true,role:true,organization:true,createdAt:true}, orderBy:{createdAt:'desc'} })
  return NextResponse.json(users)
}
