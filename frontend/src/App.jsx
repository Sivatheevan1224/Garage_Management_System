import { Navbar } from "./components/Navbar"
import { HeroSection } from "./components/HeroSection"
import { FeaturesSection } from "./components/FeaturesSection"
import { AboutSection } from "./components/AboutSection"
import { ContactSection } from "./components/ContactSection"
import { Footer } from "./components/Footer"

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex flex-col gap-8 pb-8">
        <HeroSection />
        <FeaturesSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}

export default App
