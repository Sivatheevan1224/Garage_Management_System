import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff, Wrench, ArrowLeft, Key, Mail } from "lucide-react"
import { useGarage } from "../context/GarageContext"

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { requestPasswordReset, verifyOtp, confirmPasswordReset } = useGarage()
  
  // Try to get email from navigation state if redirected from forgot password
  const [email, setEmail] = useState(location.state?.email || "")
  const [step, setStep] = useState(email ? 2 : 1) // 1: Email, 2: OTP, 3: New Password
  
  const [otp, setOtp] = useState("")
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setError("")
    
    if (!email) {
      setError("Email is required")
      return
    }
    
    setLoading(true)
    try {
        const result = await requestPasswordReset(email)
        if (result.success) {
            setStep(2)
        } else {
            setError(result.message || "Failed to send OTP")
        }
    } catch (err) {
        setError("Unable to connect to server.")
    } finally {
        setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError("")
    if (otp.length !== 6) return setError("Please enter 6-digit OTP")
    
    setLoading(true)
    const res = await verifyOtp(email, otp)
    setLoading(false)
    
    if (res.success) setStep(3)
    else setError(res.message || "Invalid OTP")
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError("")
    
    if (formData.password.length < 8) return setError("Password must be at least 8 characters")
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match")
    
    setLoading(true)
    const res = await confirmPasswordReset(email, otp, formData.password)
    setLoading(false)
    
    if (res.success) setSuccess(true)
    else setError(res.message || "Reset failed")
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 select-none">
      {/* Background Orbs for Premium Look */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="mb-10 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="h-20 w-auto flex items-center justify-center">
          <img src="/logo.png" alt="ProGarage Logo" className="h-full w-auto object-contain drop-shadow-xl" />
        </div>
        <div className="text-center">
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">ProGarage</h1>
            <p className="text-xs font-bold text-accent uppercase tracking-widest px-1">Security Portal</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-md p-10 relative overflow-hidden animate-in zoom-in-95 duration-500">
        {/* Progress Bar */}
        {!success && (
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-50">
                <div 
                    className="h-full bg-accent transition-all duration-500" 
                    style={{ width: `${(step / 3) * 100}%` }}
                />
            </div>
        )}

        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {success ? "Success!" : step === 1 ? "Provide Email" : step === 2 ? "Verify OTP" : "New Password"}
          </h2>
          <p className="text-sm text-gray-500">
            {success 
                ? "Your security credentials have been updated." 
                : step === 1 
                    ? "Enter your registered email to start."
                    : step === 2 
                        ? `We sent a code to ${email}` 
                        : "Almost done! Choose a strong password."}
          </p>
        </div>

        {error && (
          <div className="bg-red-50/50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center space-y-8 animate-in scale-in-95 duration-500">
            <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto border-2 border-green-100 mb-2">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <p className="text-gray-600 font-medium">You can now access your dashboard with your new password.</p>
            <button
              onClick={() => navigate("/")}
              className="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
            >
              Back to Login
              <ArrowLeft className="h-5 w-5 rotate-180" />
            </button>
          </div>
        ) : (
          <form onSubmit={step === 1 ? handleRequestOtp : step === 2 ? handleVerify : handleReset} className="space-y-8">
            {step === 1 && (
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2 px-1">
                    <Mail className="h-4 w-4 text-accent" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 px-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent focus:bg-white transition-all text-gray-900 font-medium"
                  />
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2 px-1">
                    <Key className="h-4 w-4 text-accent" />
                    Security Code
                  </label>
                  <div className="grid grid-cols-1 gap-4">
                    <input
                        type="text"
                        maxLength="6"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        className="w-full h-16 text-center text-3xl font-black tracking-[0.5em] bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent focus:bg-white transition-all text-accent"
                    />
                  </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2 px-1">
                      <Lock className="h-4 w-4 text-accent" />
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Min. 8 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full h-14 pl-5 pr-14 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent focus:bg-white transition-all text-gray-900 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 px-1">Confirm Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full h-14 px-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent focus:bg-white transition-all text-gray-900 font-medium"
                    />
                  </div>
                </div>
            )}

            <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-accent text-white rounded-2xl font-black shadow-xl shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-sm">
                            {step === 1 ? "Sending Email..." : step === 2 ? "Validating OTP..." : "Resetting Password..."}
                        </span>
                    </div>
                  ) : (
                    <>
                        {step === 1 ? "Get Started" : step === 2 ? "Confirm Code" : "Update Password"}
                        <ArrowLeft className="h-5 w-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="w-full mt-6 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Return to Home
                </button>
            </div>
          </form>
        )}
      </div>
      
      <p className="mt-10 text-sm text-gray-400 font-medium">
        Secure encryption active. &copy; 2026 ProGarage
      </p>
    </div>
  )
}
