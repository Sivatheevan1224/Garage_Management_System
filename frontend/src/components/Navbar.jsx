import { useState } from "react"
import { Menu, X, Wrench } from "lucide-react"
import { LoginModal } from "./LoginModal"
import { RegisterModal } from "./RegisterModal"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="ProGarage Logo" className="h-16 w-auto object-contain" />
              <span className="text-xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">ProGarage</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="px-6 py-2 text-sm font-semibold bg-gradient-to-r from-accent to-accent/90 text-white rounded-lg hover:shadow-lg hover:shadow-accent/30 transition-all"
              >
                Register
              </button>
            </div>

            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setIsLoginOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors text-left"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setIsRegisterOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-accent to-accent/90 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

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
