import Image from 'next/image'

interface LogoProps {
  size?: number
  showText?: boolean
}

export default function Logo({ size = 36, showText = true }: LogoProps) {
  return (
    <a
      href="#"
      className="inline-flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-lg"
      aria-label="apulia.ai home"
    >
      <Image
        src="/apulia_ai.webp"
        alt="apulia.ai logo"
        width={size}
        height={size}
        className="flex-shrink-0 transition-transform duration-200 group-hover:scale-105 rounded-sm"
        priority
      />

      {showText && (
        <span className="text-[1.05rem] font-bold tracking-tight text-[#F0F4FF] group-hover:text-white transition-colors">
          apulia<span className="text-[#2563EB]">.ai</span>
        </span>
      )}
    </a>
  )
}
