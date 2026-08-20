import type { SVGProps } from 'react'

export interface AguyBrandProps {
  className?: string
  label?: string
  markProps?: SVGProps<SVGSVGElement>
}

export function AguyBrand({ className, label = 'A-Guy', markProps }: AguyBrandProps) {
  return (
    <span className={['aguy-brand', className].filter(Boolean).join(' ')}>
      <svg aria-hidden="true" className="aguy-brand__mark" viewBox="0 0 40 40" {...markProps}>
        <rect width="40" height="40" rx="12" fill="currentColor" />
        <path
          d="M11 29 18.2 11h3.6L29 29h-4.3l-1.5-4.2h-6.8L14.9 29H11Zm6.7-7.8h4.2L19.8 15l-2.1 6.2Z"
          fill="white"
        />
      </svg>
      <span className="aguy-brand__label">{label}</span>
    </span>
  )
}
