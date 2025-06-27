interface LogoProps {
  width?: number | string
  height?: number | string
  className?: string
  fill?: string
}

export default function Logo({ width = 100, height = 80, className = "", fill = "#fff" }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="Logo"
      viewBox="0 0 1000 801"
      width={width}
      height={height}
      className={className}
    >
      <defs>
        <style>{`.cls-1{fill:${fill}}`}</style>
      </defs>
      <g id="LOGO">
        <path
          d="M509.69 792c52.67-79.46 83.3-174.44 83.3-276.48 0-279.33-229.48-505.77-512.56-505.77-25.64 0-50.84 1.87-75.47 5.45L509.69 792ZM526.82 12.46c-5.04 13.75-7.78 28.6-7.78 44.1 0 70.82 57.41 128.22 128.22 128.22 2.81 0 5.6-.1 8.37-.28l.3.15c.65-.11 1.3-.21 1.95-.31 3.7-.3 7.36-.77 10.97-1.38 4.96-.45 9.97-.69 15.05-.69 65.08 0 121.34 37.9 148.14 92.94L995.05 12.46H526.82Z"
          className="cls-1"
        />
      </g>
    </svg>
  )
}
