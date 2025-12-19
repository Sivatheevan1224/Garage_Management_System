import { Users, FileText, Settings, Car, Wrench, BarChart3 } from "lucide-react"

const features = [
  {
    title: "Customer Management",
    description: "Keep track of customer details, contact history, and preferences in one organized place.",
    icon: Users,
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500",
  },
  {
    title: "Vehicle Tracking",
    description: "Monitor vehicle history, specifications, and service records with ease.",
    icon: Car,
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500",
  },
  {
    title: "Service History",
    description: "Maintain comprehensive logs of all services performed, parts used, and technician notes.",
    icon: FileText,
    color: "from-orange-500/20 to-red-500/20",
    iconColor: "text-orange-500",
  },
  {
    title: "Billing & Invoicing",
    description: "Generate professional invoices and track payments and outstanding balances.",
    icon: BarChart3,
    color: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-500",
  },
  {
    title: "Job Management",
    description: "Schedule appointments, assign mechanics, and track job status in real-time.",
    icon: Wrench,
    color: "from-indigo-500/20 to-violet-500/20",
    iconColor: "text-indigo-500",
  },
  {
    title: "Admin Dashboard",
    description: "Get insights into business performance with detailed reports and analytics.",
    icon: Settings,
    color: "from-rose-500/20 to-orange-500/20",
    iconColor: "text-rose-500",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-12 sm:py-16 bg-muted/30 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Everything You Need to <span className="text-accent">Excel</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
            Powerful features designed specifically for automotive repair shops and garages
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="bg-card border border-border rounded-lg hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10 transition-all duration-300 hover:-translate-y-1 group p-10 h-full flex flex-col gap-6 text-center items-center"
              >
                <div
                  className={`bg-gradient-to-br ${feature.color} rounded-xl w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed flex-grow">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
