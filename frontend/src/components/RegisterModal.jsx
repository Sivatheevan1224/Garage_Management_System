import { useState } from "react"
import { X, Lock, Mail, User, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { useGarage } from "../context/GarageContext"

export function RegisterModal({ open, onOpenChange, onSwitchToLogin }) {
  const { registerStaff } = useGarage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const validateForm = () => {
    const errors = {}
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters"
    }
    
    // Email validation
    if (!formData.email) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = "Password is required"
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      errors.password = "Password must contain at least one lowercase letter"
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      errors.password = "Password must contain at least one uppercase letter"
    } else if (!/(?=.*\d)/.test(formData.password)) {
      errors.password = "Password must contain at least one number"
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setFieldErrors({})
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const result = await registerStaff({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'staff'
      })

      if (result.success) {
        setSuccess(true)
        setFormData({ name: "", email: "", password: "", confirmPassword: "" })
        setTimeout(() => {
          onOpenChange(false)
          onSwitchToLogin()
          setSuccess(false)
        }, 3000)
      } else {
        // Handle backend validation errors
        if (result.errors) {
          const backendErrors = {}
          if (result.errors.email) {
            backendErrors.email = Array.isArray(result.errors.email) 
              ? result.errors.email[0] 
              : result.errors.email
          }
          if (result.errors.password) {
            backendErrors.password = Array.isArray(result.errors.password) 
              ? result.errors.password[0] 
              : result.errors.password
          }
          if (result.errors.name) {
            backendErrors.name = Array.isArray(result.errors.name) 
              ? result.errors.name[0] 
              : result.errors.name
          }
          setFieldErrors(backendErrors)
        }
        setError(result.message || "Registration failed. Please try again.")
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ""
      })
    }
    // Clear general error when user starts typing
    if (error) {
      setError("")
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-md p-10 relative">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center mb-8 gap-4">
            <img src="/logo.png" alt="ProGarage" className="h-16 w-auto object-contain" />
            <h2 className="text-2xl font-bold text-foreground">Register for ProGarage</h2>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-3 bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>Registration successful! Please wait for admin approval before logging in. Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="register-name" className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Name
            </label>
            <input
              id="register-name"
              name="name"
              type="text"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full h-12 px-4 bg-background border rounded-lg focus:outline-none focus:ring-2 text-foreground transition-colors ${
                fieldErrors.name 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-border focus:ring-accent'
              }`}
            />
            {fieldErrors.name && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="register-email" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              className={`w-full h-12 px-4 bg-background border rounded-lg focus:outline-none focus:ring-2 text-foreground transition-colors ${
                fieldErrors.email 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-border focus:ring-accent'
              }`}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="register-password" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`w-full h-12 pl-4 pr-12 bg-background border rounded-lg focus:outline-none focus:ring-2 text-foreground transition-colors ${
                  fieldErrors.password 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-border focus:ring-accent'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {fieldErrors.password}
              </p>
            )}
            {!fieldErrors.password && formData.password === "" && (
              <p className="text-muted-foreground text-xs mt-1">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="register-confirm-password"
              className="text-sm font-medium text-foreground flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full h-12 pl-4 pr-12 bg-background border rounded-lg focus:outline-none focus:ring-2 text-foreground transition-colors ${
                  fieldErrors.confirmPassword 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-border focus:ring-accent'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex="-1"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-lg font-medium transition-all disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button onClick={onSwitchToLogin} className="text-accent hover:underline font-medium">
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
