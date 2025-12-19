import { useState } from "react"
import { X, Lock, Mail, User } from "lucide-react"

export function RegisterModal({ open, onOpenChange, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Register:", formData)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
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

        <h2 className="text-2xl font-bold text-foreground mb-8">Register for ProGarage</h2>

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
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full h-12 px-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
            />
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
              required
              className="w-full h-12 px-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="register-password" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full h-12 px-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="register-confirm-password"
              className="text-sm font-medium text-foreground flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Confirm Password
            </label>
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full h-12 px-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-lg font-medium transition-all"
          >
            Register
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
