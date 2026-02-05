import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'

// Feature slides data
const slides = [
  {
    id: 1,
    title: "Gestion des Etudiants",
    subtitle: "Centralisez vos donnees",
    description: "Gerez facilement les profils, preferences et informations academiques des etudiants. Importez vos listes CSV en un clic.",
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: "blue",
    stats: [
      { label: "Import CSV", value: "1 clic" },
      { label: "Profils", value: "Illimites" }
    ]
  },
  {
    id: 2,
    title: "Creation de Projets",
    subtitle: "Flexibilite totale",
    description: "Creez des projets de groupe, des programmes d'echange ou des repartitions par niveau. Definissez vos contraintes en toute liberte.",
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    color: "purple",
    stats: [
      { label: "Types", value: "3+" },
      { label: "Contraintes", value: "Personnalisables" }
    ]
  },
  {
    id: 3,
    title: "Algorithme Intelligent",
    subtitle: "Optimisation genetique",
    description: "Notre algorithme genetique calcule l'affectation optimale en respectant toutes les contraintes et preferences definies.",
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: "emerald",
    stats: [
      { label: "Précision", value: "99%" },
      { label: "Temps", value: "< 1 min" }
    ]
  },
  {
    id: 4,
    title: "Export & Analyse",
    subtitle: "Resultats instantanes",
    description: "Visualisez les statistiques d'affectation, exportez les resultats en CSV et partagez avec votre equipe pedagogique.",
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: "amber",
    stats: [
      { label: "Formats", value: "CSV, PDF" },
      { label: "Statistiques", value: "Temps réel" }
    ]
  }
]

// Color mappings
const colorClasses = {
  blue: {
    bg: "bg-blue-500",
    bgLight: "bg-blue-50",
    bgGradient: "from-blue-600 to-blue-400",
    text: "text-blue-600",
    border: "border-blue-200",
    shadow: "shadow-blue-500/20",
    ring: "ring-blue-500"
  },
  purple: {
    bg: "bg-purple-500",
    bgLight: "bg-purple-50",
    bgGradient: "from-purple-600 to-purple-400",
    text: "text-purple-600",
    border: "border-purple-200",
    shadow: "shadow-purple-500/20",
    ring: "ring-purple-500"
  },
  emerald: {
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-50",
    bgGradient: "from-emerald-600 to-emerald-400",
    text: "text-emerald-600",
    border: "border-emerald-200",
    shadow: "shadow-emerald-500/20",
    ring: "ring-emerald-500"
  },
  amber: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-50",
    bgGradient: "from-amber-600 to-amber-400",
    text: "text-amber-600",
    border: "border-amber-200",
    shadow: "shadow-amber-500/20",
    ring: "ring-amber-500"
  }
}

// Animated counter component
function AnimatedCounter({ end, duration = 2000, suffix = "" }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let startTime = null
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [end, duration])
  
  return <span>{count}{suffix}</span>
}

function HomePage() {
  const { isLoggedIn, userRole } = useAuth()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [slideDirection, setSlideDirection] = useState('right')

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(() => {
      setSlideDirection('right')
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [isAutoPlaying])

  const goToSlide = useCallback((index) => {
    setSlideDirection(index > currentSlide ? 'right' : 'left')
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [currentSlide])

  const nextSlide = useCallback(() => {
    setSlideDirection('right')
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [])

  const prevSlide = useCallback(() => {
    setSlideDirection('left')
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  const currentColor = colorClasses[slides[currentSlide].color]

  return (
    <div className="animate-fade-in">
      {/* Hero Section with Slider */}
      <div className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Animated Background - Plus subtil et naturel */}
        <div className="absolute inset-0 -z-10">
          <div className={`absolute inset-0 bg-gradient-to-br ${currentColor.bgGradient} opacity-[0.03] transition-all duration-1000`}></div>
          
          {/* Organic blob shapes instead of perfect circles */}
          <div className="absolute top-0 right-0 w-[600px] h-[550px] opacity-30 -translate-y-1/3 translate-x-1/4"
            style={{
              background: 'radial-gradient(ellipse at 30% 40%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
            }}
          ></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[450px] opacity-25 translate-y-1/4 -translate-x-1/4"
            style={{
              background: 'radial-gradient(ellipse at 60% 50%, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
            }}
          ></div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left side - Text Content */}
            <div className="text-center lg:text-left">
              {/* Badge - Plus discret */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 backdrop-blur-sm rounded-full border border-slate-200/60 mb-6">
                <span className={`w-1.5 h-1.5 rounded-full ${currentColor.bg}`}></span>
                <span className="text-xs font-medium text-slate-600 tracking-wide">ESIEE Paris</span>
              </div>

              {/* Main heading - Typographie plus sophistiquée */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-bold text-slate-900 mb-5 leading-[1.1] tracking-tight">
                Simplifiez vos{' '}
                <br className="hidden sm:block" />
                <span className="text-blue-600">
                  affectations
                </span>
              </h1>

              <p className="text-lg xl:text-xl text-slate-500 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Optimisez vos affectations de projets, programmes d'échange et groupes avec notre algorithme génétique.
              </p>

              {/* CTA Buttons - Hiérarchie plus claire */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-10">
                {isLoggedIn ? (
                  <Link to={`/${userRole}`}>
                    <Button variant="primary" size="lg">
                      <span className="flex items-center gap-2">
                        Tableau de bord
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="primary" size="lg">
                        Commencer
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button variant="ghost" size="lg">
                        Créer un compte
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Quick Stats - Moins proéminent, plus subtil */}
              <div className="flex items-center justify-center lg:justify-start gap-8 text-sm">
                <div>
                  <span className="text-2xl font-semibold text-slate-900">
                    <AnimatedCounter end={500} suffix="+" />
                  </span>
                  <span className="text-slate-400 ml-1">étudiants</span>
                </div>
                <div className="w-px h-6 bg-slate-200"></div>
                <div>
                  <span className="text-2xl font-semibold text-slate-900">
                    <AnimatedCounter end={50} suffix="+" />
                  </span>
                  <span className="text-slate-400 ml-1">projets</span>
                </div>
                <div className="w-px h-6 bg-slate-200"></div>
                <div>
                  <span className="text-2xl font-semibold text-slate-900">
                    <AnimatedCounter end={99} suffix="%" />
                  </span>
                  <span className="text-slate-400 ml-1">satisfaction</span>
                </div>
              </div>
            </div>

            {/* Right side - Feature Slider Card */}
            <div className="relative">
              {/* Slider Navigation Arrows - Plus discrets */}
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 lg:-translate-x-5 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-white transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 lg:translate-x-5 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-white transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Slider Card - Design plus raffiné */}
              <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
                {/* Card Header with gradient - Plus subtil */}
                <div className={`relative h-28 bg-gradient-to-br ${currentColor.bgGradient} flex items-center justify-center transition-all duration-500`}>
                  <div className="relative text-white/90">
                    {slides[currentSlide].icon}
                  </div>
                  
                  {/* Slide counter - Plus discret */}
                  <div className="absolute bottom-3 right-3 text-white/60 text-xs font-medium">
                    {currentSlide + 1}/{slides.length}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 lg:p-7">
                  <div className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${currentColor.bgLight} ${currentColor.text} mb-3`}>
                    {slides[currentSlide].subtitle}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {slides[currentSlide].title}
                  </h3>
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-5 min-h-[60px]">
                    {slides[currentSlide].description}
                  </p>

                  {/* Stats - Plus compacts */}
                  <div className="grid grid-cols-2 gap-3">
                    {slides[currentSlide].stats.map((stat, index) => (
                      <div key={index} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className={`text-base font-semibold ${currentColor.text}`}>{stat.value}</div>
                        <div className="text-xs text-slate-400">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slide Indicators - Plus subtils */}
                <div className="flex justify-center gap-1.5 pb-5">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`transition-all duration-200 rounded-full ${
                        index === currentSlide 
                          ? `w-6 h-1.5 ${currentColor.bg}` 
                          : 'w-1.5 h-1.5 bg-slate-200 hover:bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process Section - Plus organique et moins symétrique */}
      <div className="py-16 lg:py-20 bg-slate-50/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 lg:mb-14">
            <h2 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-3">
              Comment ça marche
            </h2>
            <p className="text-slate-500 max-w-lg">
              Un processus simple en 4 étapes pour optimiser vos affectations.
            </p>
          </div>

          {/* Process Steps - Layout asymétrique */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {[
              { step: 1, title: "Import", desc: "Importez votre liste d'étudiants via CSV", color: "blue", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
              { step: 2, title: "Configure", desc: "Définissez les contraintes du projet", color: "purple", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
              { step: 3, title: "Optimise", desc: "L'algorithme trouve la meilleure solution", color: "emerald", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
              { step: 4, title: "Export", desc: "Téléchargez et partagez les résultats", color: "amber", icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }
            ].map((item, idx) => (
              <div key={item.step} className="group">
                <div className={`bg-white rounded-xl p-5 border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 h-full ${idx === 1 ? 'lg:translate-y-2' : idx === 2 ? 'lg:-translate-y-1' : ''}`}>
                  {/* Step indicator */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs font-medium ${colorClasses[item.color].text} ${colorClasses[item.color].bgLight} px-2 py-0.5 rounded`}>
                      0{item.step}
                    </span>
                    <div className="flex-1 h-px bg-slate-100"></div>
                  </div>
                  
                  <h3 className="text-base font-medium text-slate-900 mb-1.5">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section - Design plus sobre */}
      <div className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-3">
              Fonctionnalités clés
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            {[
              { title: "Import CSV", desc: "Importez vos étudiants en un clic depuis Excel", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
              { title: "Algorithme génétique", desc: "Optimisation avancée respectant toutes les contraintes", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
              { title: "Multi-projets", desc: "Échanges, groupes, niveaux d'anglais", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
              { title: "Préférences", desc: "Les étudiants classent leurs choix", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
              { title: "Temps réel", desc: "Visualisez les résultats instantanément", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
              { title: "Export", desc: "CSV, PDF, partage facile", icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-0.5">{feature.title}</h3>
                  <p className="text-sm text-slate-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section - Plus discret */}
      {!isLoggedIn && (
        <div className="py-16 bg-slate-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3">
              Prêt à commencer ?
            </h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Rejoignez les enseignants qui simplifient déjà la gestion de leurs projets.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/signup">
                <Button variant="primary" size="md">
                  Créer un compte
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="md" className="text-slate-300 hover:text-white">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
