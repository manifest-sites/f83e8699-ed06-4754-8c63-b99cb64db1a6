import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../../utils/apiConfig'

function PaymentRequired() {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [appId, setAppId] = useState(null)

  useEffect(() => {
    const fetchAppIdAndPrices = async () => {
      try {
        // First, fetch the appId from manifest.config.json
        const manifestResponse = await fetch('/manifest.config.json')
        const manifestData = await manifestResponse.json()
        const fetchedAppId = manifestData.appId
        
        if (!fetchedAppId) {
          throw new Error('App ID not found in manifest.config.json')
        }
        
        setAppId(fetchedAppId)
        
        // Then fetch prices using the appId
        const response = await fetch(`${API_BASE_URL}/stripe/prices/${fetchedAppId}`)
        const result = await response.json()
        
        if (result.success) {
          setPrices(result.data)
        } else {
          setError('Failed to load pricing options')
        }
      } catch (err) {
        setError('Error fetching data: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAppIdAndPrices()
  }, [])

  const handleSelectPrice = (price) => {
    if (!appId) {
      setError('App ID not available')
      return
    }
    const checkoutUrl = `${API_BASE_URL}/stripe/checkout/${appId}/prices/${price.id}`
    window.location.href = checkoutUrl
  }

  const formatPrice = (unitAmount, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(unitAmount / 100)
  }

  const getRecurrencyText = (price) => {
    if (price.type === 'one_time') return 'One-time payment'
    if (price.recurring) {
      const { interval, interval_count } = price.recurring
      if (interval_count === 1) {
        return `Per ${interval}`
      }
      return `Every ${interval_count} ${interval}${interval_count > 1 ? 's' : ''}`
    }
    return 'One-time payment'
  }

  if (loading) {
    return (
      <div className="text-2xl bg-slate-600 h-screen w-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading pricing options...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-2xl bg-slate-600 h-screen w-screen text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-red-400">Error</h2>
          <p className="text-lg mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Select the perfect plan for your needs. All plans include full access to premium features.
          </p>
        </div>

        {/* Price Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {prices.map((price) => (
            <div
              key={price.id}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-8 hover:bg-slate-750 transition-all duration-300 hover:scale-105 hover:border-blue-500/50 shadow-lg hover:shadow-blue-500/20"
            >
              {/* Plan Name */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2 text-white">
                  {price.nickname || 'Premium Plan'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {getRecurrencyText(price)}
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-blue-400 mb-2">
                  {formatPrice(price.unit_amount, price.currency)}
                </div>
                {price.recurring && (
                  <div className="text-gray-400 text-sm">
                    per {price.recurring.interval}
                    {price.recurring.interval_count > 1 && ` (every ${price.recurring.interval_count} ${price.recurring.interval}s)`}
                  </div>
                )}
              </div>

              {/* Features placeholder */}
              <div className="mb-8">
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Full access to all features
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {price.type === 'one_time' ? 'Lifetime access' : 'Cancel anytime'}
                  </li>
                </ul>
              </div>

              {/* Select Button */}
              <button
                onClick={() => handleSelectPrice(price)}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 cursor-pointer"
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 space-y-4">
          <p className="text-gray-400 text-sm flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secure payment processing • Your data is protected
          </p>
          <p className="text-gray-500 text-xs max-w-md mx-auto">
            By proceeding, you agree to our terms of service and privacy policy. All payments are processed securely through Stripe.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentRequired 