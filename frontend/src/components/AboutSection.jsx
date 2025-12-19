import { Target, Lightbulb, Shield, Award } from "lucide-react"

const values = [
  {
    title: "Our Mission",
    description: "Empowering automotive businesses with cutting-edge technology for seamless operations.",
    icon: Target,
  },
  {
    title: "Innovation",
    description: "Continuously evolving with the latest features to keep your garage ahead of the curve.",
    icon: Lightbulb,
  },
  {
    title: "Reliability",
    description: "Rock-solid platform with 99.9% uptime and enterprise-grade security.",
    icon: Shield,
  },
  {
    title: "Excellence",
    description: "Award-winning customer support and dedicated to your success.",
    icon: Award,
  },
]

const stats = [
  { label: "Active Garages", value: "5K+" },
  { label: "Vehicles Tracked", value: "50K+" },
  { label: "Uptime", value: "99.9%" },
]

export function AboutSection() {
  return (
    <section id="about" className="py-12 sm:py-16 bg-background relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            About <span className="text-primary">ProGarage</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We're on a mission to revolutionize how automotive businesses operate. Built by garage owners, for garage
            owners.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-foreground">Our Story</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              ProGarage was born from years of experience in the automotive industry. We saw firsthand how outdated
              systems and manual processes were holding garages back from reaching their full potential.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Today, we're proud to serve thousands of garages worldwide, helping them streamline operations, delight
              customers, and grow their businesses with confidence.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div
                  key={value.title}
                  className="bg-card border border-border rounded-lg hover:border-primary/50 hover:shadow-lg transition-all duration-300 text-center p-6 flex flex-col h-full gap-4"
                >
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-full w-14 h-14 flex items-center justify-center mx-auto">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground">{value.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-grow">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center bg-card border border-border rounded-2xl p-8">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-2">
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-base text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
