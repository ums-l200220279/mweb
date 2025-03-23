import Image from "next/image"
import LandingPage from "@/components/landing-page"

export default function Home() {
  return (
    <>
      <div className="relative h-[500px] w-full">
        <Image
          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3"
          alt="Senior patient engaging with digital cognitive assessment tool while healthcare professional provides guidance"
          layout="fill"
          objectFit="cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-turquoise-900/80 to-turquoise-700/60 flex items-center justify-center">
          <div className="container px-4 md:px-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white text-center max-w-4xl mx-auto">
              Empowering Cognitive Health with Advanced AI Technology
            </h1>
            <p className="mt-4 text-xl text-white/90 text-center max-w-2xl mx-auto">
              Early detection, personalized care, and continuous support for better brain health
            </p>
          </div>
        </div>
      </div>
      <LandingPage />
    </>
  )
}

