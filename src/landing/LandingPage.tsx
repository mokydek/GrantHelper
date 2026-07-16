import Header from './components/Header'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import InvertedCta from './components/InvertedCta'
import Footer from './components/Footer'
import { usePageTitle } from '../lib/usePageTitle'

export default function LandingPage() {
  usePageTitle('')
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
