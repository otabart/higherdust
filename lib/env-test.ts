// Simple environment variable test
export function testEnvironmentVariables() {
  console.log('🧪 Testing Environment Variables...')
  
  const testVars = [
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
    'NEXT_PUBLIC_APP_NAME',
    'NEXT_PUBLIC_APP_DESCRIPTION',
    'NEXT_PUBLIC_APP_URL',
    'NODE_ENV',
    'NEXT_PUBLIC_DEBUG'
  ]
  
  testVars.forEach(varName => {
    const value = process.env[varName]
    const status = value ? '✅' : '❌'
    const displayValue = value ? 
      (varName.includes('PROJECT_ID') ? `${value.slice(0, 8)}...` : value) : 
      'undefined'
    console.log(`${status} ${varName}: ${displayValue}`)
  })
  
  console.log('🧪 Environment test complete')
} 