import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: number
  showText?: boolean
}

export default function Logo({ size = 52, showText = true }: LogoProps) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-lg"
      aria-label="apulia.ai home"
    >
      <Image
        src="/apulia_ai.webp"
        alt="apulia.ai logo"
        width={size}
        height={size}
        className="flex-shrink-0 transition-transform duration-200 group-hover:scale-105 rounded-md"
        priority
      />

      {showText && (
        <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
          apulia<span className="text-[#2563EB]">.ai</span>
        </span>
      )}
    </Link>
  )
}
