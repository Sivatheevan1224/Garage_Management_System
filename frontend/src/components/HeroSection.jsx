import { useState } from "react"
import { CheckCircle2, Clock, Shield } from "lucide-react"
import { LoginModal } from "./LoginModal"
import { RegisterModal } from "./RegisterModal"

export function HeroSection() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  return (
    <>
      <section id="home" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background" />
        
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />

        <div className="relative container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-8 leading-tight">
                Manage Your Garage{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  Smarter
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
                ProGarage is a modern web-based system that helps garages manage customer details, vehicle records,
                service history, and billing efficiently using a centralized platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10 justify-center lg:justify-start">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-sm text-foreground">Customer & Vehicle Tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-sm text-foreground">Service History & Billing</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-sm text-foreground">Secure & Easy to Use</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-8 py-4 text-base font-medium bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white rounded-lg shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all flex items-center justify-center gap-2"
                >
                  Login
                </button>
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="px-8 py-4 text-base font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  Register
                </button>
                <a
                  href="#features"
                  className="px-8 py-4 text-base font-medium text-foreground border border-border rounded-lg hover:bg-accent/10 hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2"
                >
                  View Features
                </a>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
                <img
                  src="/professional-garage-management-dashboard-mockup-wi.jpg"
                  alt="ProGarage Dashboard"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <LoginModal
        open={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        onSwitchToRegister={() => {
          setIsLoginOpen(false)
          setIsRegisterOpen(true)
        }}
      />
      <RegisterModal
        open={isRegisterOpen}
        onOpenChange={setIsRegisterOpen}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false)
          setIsLoginOpen(true)
        }}
      />
    </>
  )
}
