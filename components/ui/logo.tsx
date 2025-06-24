interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className = "", width = 24, height = 24 }: LogoProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 3000 714"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="LOGOTIPO">
        <g id="ISOTIPO">
          <text
            className="fill-white font-bold"
            style={{
              fontFamily: "Geist, sans-serif",
              fontSize: "852.89px",
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
            transform="translate(36 651) scale(1.24 1)"
          >
            <tspan x="616.63" y="0">
              ERN
            </tspan>
          </text>
          <path
            className="fill-white"
            d="M391.78,638.36L45.57,43.6l210.15-1.94c16.35-2.74,34.55,7.44,44.78,25.03l206.46,355c10.23,17.6,10.08,38.45-.39,51.31l-114.8,165.36Z"
          />
          <path
            className="fill-white"
            d="M658.09,247.77s-35.51-79.89-124.28-71.02c-88.77,8.88-115.4-60.7-115.4-88.77,0-35.51,8.88-44.39,8.88-44.39h363.96"
          />
        </g>
      </g>
    </svg>
  )
}
