import Header from './components/Header'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import InvertedCta from './components/InvertedCta'
import Footer from './components/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <InvertedCta />
      </main>
      <Footer />
    </div>
  )
}
