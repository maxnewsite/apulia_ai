import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('subscribers')
    .select('id, email, preferred_language, products, status, source, created_at, confirmed_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Compute summary stats
  const total = data.length
  const active = data.filter(s => s.status === 'active').length
  const pending = data.filter(s => s.status === 'pending').length
  const unsubscribed = data.filter(s => s.status === 'unsubscribed').length
  const weeklyOnly = data.filter(s => s.products?.includes('weekly') && !s.products?.includes('monthly')).length
  const monthlyOnly = data.filter(s => s.products?.includes('monthly') && !s.products?.includes('weekly')).length
  const both = data.filter(s => s.products?.includes('weekly') && s.products?.includes('monthly')).length

  return NextResponse.json({
    stats: { total, active, pending, unsubscribed, weeklyOnly, monthlyOnly, both },
    subscribers: data,
  })
}
