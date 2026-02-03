import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')
    
    let query = supabase
      .from('product_3d_models')
      .select('*')
    
    if (productId) {
      query = query.eq('product_id', productId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching 3D models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch 3D models' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('product_3d_models')
      .insert([body])
      .select()
    
    if (error) throw error
    
    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Error creating 3D model:', error)
    return NextResponse.json(
      { error: 'Failed to create 3D model' },
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
      .from('product_3d_models')
      .update(updateData)
      .eq('id', id)
      .select()
    
    if (error) throw error
    
    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error updating 3D model:', error)
    return NextResponse.json(
      { error: 'Failed to update 3D model' },
      { status: 500 }
    )
  }
}
