import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test the main token detection API
    const response = await fetch('http://localhost:3000/api/tokens/detect')
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      testResult: {
        apiWorking: data.success,
        tokenCount: data.tokens?.length || 0,
        sources: data.metadata?.sources || [],
        timestamp: data.metadata?.timestamp || new Date().toISOString()
      },
      message: 'Token detection API test completed'
    })
  } catch (error) {
    console.error('Error testing token detection API:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to test token detection API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
} 