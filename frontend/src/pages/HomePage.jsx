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
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className={`absolute inset-0 bg-gradient-to-br ${currentColor.bgGradient} opacity-5 transition-all duration-1000`}></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-100 to-blue-100 rounded-full blur-3xl opacity-40 translate-y-1/3 -translate-x-1/3"></div>
          
          {/* Floating particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-emerald-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3.5s' }}></div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left side - Text Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm mb-8">
                <span className={`w-2 h-2 rounded-full ${currentColor.bg} animate-pulse`}></span>
                <span className="text-sm font-medium text-slate-700">Plateforme ESIEE Paris</span>
              </div>

              {/* Main heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                Simplifiez vos{' '}
                <br className="hidden sm:block" />
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentColor.bgGradient}`}>
                  Affectations
                </span>
              </h1>

              <p className="text-lg sm:text-xl xl:text-2xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Optimisez vos affectations de projets, programmes d'echange et groupes de travail avec notre algorithme genetique.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-12">
                {isLoggedIn ? (
                  <Link to={`/${userRole}`}>
                    <Button variant="primary" size="lg">
                      <span className="flex items-center gap-2">
                        Mon Tableau de Bord
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="primary" size="lg">
                        <span className="flex items-center gap-2">
                          Commencer maintenant
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button variant="secondary" size="lg">
                        Creer un compte
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-slate-900">
                    <AnimatedCounter end={500} suffix="+" />
                  </div>
                  <div className="text-sm text-slate-500">Etudiants</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-slate-900">
                    <AnimatedCounter end={50} suffix="+" />
                  </div>
                  <div className="text-sm text-slate-500">Projets</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-slate-900">
                    <AnimatedCounter end={99} suffix="%" />
                  </div>
                  <div className="text-sm text-slate-500">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Right side - Feature Slider Card */}
            <div className="relative">
              {/* Slider Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:shadow-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:shadow-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Slider Card */}
              <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                {/* Card Header with gradient */}
                <div className={`relative h-32 bg-gradient-to-r ${currentColor.bgGradient} flex items-center justify-center transition-all duration-500`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative text-white">
                    {slides[currentSlide].icon}
                  </div>
                  
                  {/* Slide counter */}
                  <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-medium">
                    {currentSlide + 1} / {slides.length}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-8">
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${currentColor.bgLight} ${currentColor.text} mb-4`}>
                    {slides[currentSlide].subtitle}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    {slides[currentSlide].title}
                  </h3>
                  
                  <p className="text-slate-600 mb-6 min-h-[72px]">
                    {slides[currentSlide].description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    {slides[currentSlide].stats.map((stat, index) => (
                      <div key={index} className={`p-4 rounded-xl ${currentColor.bgLight} border ${currentColor.border}`}>
                        <div className={`text-xl font-bold ${currentColor.text}`}>{stat.value}</div>
                        <div className="text-sm text-slate-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slide Indicators */}
                <div className="flex justify-center gap-2 pb-6">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentSlide 
                          ? `w-8 h-2 ${currentColor.bg}` 
                          : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process Section - Horizontal Scrolling Cards */}
      <div className="py-20 bg-slate-50 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl xl:text-4xl font-bold text-slate-900 mb-4">
              Comment ca marche ?
            </h2>
            <p className="text-lg xl:text-xl text-slate-600 max-w-2xl mx-auto">
              Un processus simple et efficace en 4 etapes
            </p>
          </div>

          {/* Process Steps */}
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 via-emerald-500 to-amber-500 transform -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: 1, title: "Import", desc: "Importez votre liste d'etudiants via CSV", color: "blue", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
                { step: 2, title: "Configure", desc: "Definissez les contraintes du projet", color: "purple", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
                { step: 3, title: "Optimise", desc: "L'algorithme trouve la meilleure solution", color: "emerald", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
                { step: 4, title: "Export", desc: "Telechargez et partagez les resultats", color: "amber", icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }
              ].map((item) => (
                <div key={item.step} className="relative group">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative z-10">
                    {/* Step Number */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[item.color].bgGradient} text-white flex items-center justify-center font-bold text-lg mb-4 shadow-lg ${colorClasses[item.color].shadow}`}>
                      {item.step}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg ${colorClasses[item.color].bgLight} ${colorClasses[item.color].text} flex items-center justify-center mb-4`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl xl:text-4xl font-bold text-slate-900 mb-4">
              Pourquoi nous choisir ?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Import CSV facile", desc: "Importez vos etudiants en un clic", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
              { title: "Algorithme puissant", desc: "Optimisation genetique avancee", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
              { title: "Multi-projets", desc: "Echange, groupes, niveaux anglais", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
              { title: "Preferences etudiants", desc: "Les etudiants classent leurs choix", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
              { title: "Resultats en temps reel", desc: "Visualisez instantanement", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
              { title: "Export universel", desc: "CSV, PDF, partage facile", icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-100 group-hover:scale-110 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isLoggedIn && (
        <div className="py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-bold text-white mb-4">
              Pret a optimiser vos affectations ?
            </h2>
            <p className="text-lg xl:text-xl text-blue-100 mb-8 max-w-xl mx-auto">
              Rejoignez les enseignants qui simplifient deja la gestion de leurs projets.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/signup">
                <Button variant="secondary" size="lg" className="shadow-xl">
                  <span className="flex items-center gap-2">
                    Creer un compte gratuit
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Button>
              </Link>
              <Link to="/login" className="text-white hover:text-blue-100 font-medium flex items-center gap-2 transition-colors">
                Se connecter
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
