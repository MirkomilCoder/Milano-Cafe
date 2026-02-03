import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let query = supabase
      .from('kitchen_tasks')
      .select('*')
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching kitchen tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch kitchen tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('kitchen_tasks')
      .insert([body])
      .select()
    
    if (error) throw error
    
    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Error creating kitchen task:', error)
    return NextResponse.json(
      { error: 'Failed to create kitchen task' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const body = await request.json()
    const { id, ...updateData } = body
    
    const { data, error } = await supabase
      .from('kitchen_tasks')
      .update(updateData)
      .eq('id', id)
      .select()
    
    if (error) throw error
    
    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error updating kitchen task:', error)
    return NextResponse.json(
      { error: 'Failed to update kitchen task' },
      { status: 500 }
    )
  }
}
