import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
export async function GET(req: NextRequest) {
  const session = await auth(); if (!session) return NextResponse.json({ error:'Unauthorized' },{ status:401 })
  const user = session.user as any
  const invoices = await db.invoice.findMany({
    where: user.role==='CLIENT' ? {clientId:user.id} : user.role==='FINANCE'||user.role==='ADMIN' ? {} : {clientId:user.id},
    include: { project:{select:{title:true,service:true}}, client:{select:{name:true,organization:true}}, payments:true },
    orderBy: { createdAt:'desc' },
  })
  return NextResponse.json(invoices)
}
