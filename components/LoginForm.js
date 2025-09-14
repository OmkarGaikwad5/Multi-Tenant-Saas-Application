'use client'

import { useState } from 'react'
import { LogIn, Eye, EyeOff, Users, Building2 } from 'lucide-react'

const testAccounts = [
  { email: 'admin@acme.test', role: 'Admin', tenant: 'Acme', color: 'blue' },
  { email: 'user@acme.test', role: 'Member', tenant: 'Acme', color: 'blue' },
  { email: 'admin@globex.test', role: 'Admin', tenant: 'Globex', color: 'purple' },
  { email: 'user@globex.test', role: 'Member', tenant: 'Globex', color: 'purple' }
]

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    
    setLoading(true)
    await onLogin(email, password)
    setLoading(false)
  }

  const handleQuickLogin = (testEmail) => {
    setEmail(testEmail)
    setPassword('password')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-fade-in">
        <div className="card overflow-hidden">
          {/* Header */}
          <div className="gradient-bg px-8 py-12 text-center">
            <div className="mx-auto h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 animate-pulse-subtle">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/90">Sign in to your workspace</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-primary"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-primary pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Test Accounts */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Test Accounts</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {testAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleQuickLogin(account.email)}
                    className={`w-full p-4 text-left border rounded-xl hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 ${
                      account.color === 'blue' 
                        ? 'border-blue-200 hover:border-blue-300 hover:bg-blue-50' 
                        : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{account.tenant} Corporation</div>
                        <div className="text-sm text-gray-600">{account.role} • {account.email}</div>
                      </div>
                      <Users className={`h-5 w-5 ${
                        account.color === 'blue' ? 'text-blue-500' : 'text-purple-500'
                      }`} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  All test accounts use password: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">password</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}