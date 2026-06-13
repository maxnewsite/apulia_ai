import Header from '@/components/Header'
import Hero from '@/components/Hero'
import StatsBar from '@/components/StatsBar'
import SourceTicker from '@/components/SourceTicker'
import HowItWorks from '@/components/HowItWorks'
import Products from '@/components/Products'
import Audience from '@/components/Audience'
import LatestIssue from '@/components/LatestIssue'
import FAQ from '@/components/FAQ'
import SubscribeForm from '@/components/SubscribeForm'
import SisterPublication from '@/components/SisterPublication'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#2563EB] focus:text-white focus:rounded-lg focus:font-semibold focus:text-sm"
      >
        Skip to main content
      </a>
      <Header />
      <main
        id="main-content"
        itemScope
        itemType="https://schema.org/Organization"
      >
        <article>
          <Hero />
          <StatsBar />
          <SourceTicker />
          <HowItWorks />
          <Products />
          <Audience />
          <LatestIssue />
          <FAQ />
          <SisterPublication />
          <SubscribeForm />
        </article>
      </main>
      <Footer />
    </>
  )
}
