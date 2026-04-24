export default function SunModeEffect() {
  return (
    <div aria-hidden="true" className="sun-mode-effect">
      <svg
        className="sun-mode-effect__svg"
        viewBox="0 0 1600 1100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter
            id="sun-shadow-soft"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="28" />
          </filter>
          <filter
            id="sun-shadow-deep"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter
            id="sun-light-blur"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="24" />
          </filter>
        </defs>

        <g
          className="sun-mode-effect__light-layer sun-mode-effect__light-layer--back"
          filter="url(#sun-light-blur)"
        >
          <ellipse cx="120" cy="150" rx="260" ry="170" />
          <ellipse cx="480" cy="210" rx="210" ry="120" />
          <ellipse cx="800" cy="160" rx="250" ry="150" />
          <ellipse cx="1130" cy="250" rx="220" ry="130" />
          <ellipse cx="570" cy="760" rx="190" ry="120" />
          <ellipse cx="910" cy="710" rx="240" ry="150" />
          <ellipse cx="1380" cy="840" rx="180" ry="130" />
          <ellipse cx="180" cy="900" rx="170" ry="110" />
        </g>

        <g
          className="sun-mode-effect__shadow-layer sun-mode-effect__shadow-layer--soft"
          filter="url(#sun-shadow-soft)"
        >
          <ellipse cx="1450" cy="180" rx="260" ry="220" />
          <ellipse cx="1280" cy="470" rx="180" ry="130" />
          <ellipse cx="260" cy="1020" rx="420" ry="180" />
          <ellipse cx="1080" cy="980" rx="460" ry="220" />
        </g>

        <g
          className="sun-mode-effect__branch-layer sun-mode-effect__branch-layer--main"
          filter="url(#sun-shadow-deep)"
        >
          <path d="M -120 800 C 210 650 470 540 770 555 C 980 565 1210 515 1720 330" />
          <path d="M 1140 -120 C 1220 70 1310 180 1540 310" />
          <path d="M -140 110 C 100 220 280 340 560 455" />
          <path d="M 250 610 C 330 540 370 430 415 220" />
          <path d="M 720 930 C 850 815 970 745 1110 700" />
          <path d="M 1260 1020 C 1320 930 1370 860 1455 790" />
        </g>

        <g
          className="sun-mode-effect__light-layer sun-mode-effect__light-layer--front"
          filter="url(#sun-light-blur)"
        >
          <ellipse cx="250" cy="230" rx="170" ry="105" />
          <ellipse cx="410" cy="610" rx="115" ry="85" />
          <ellipse cx="710" cy="310" rx="150" ry="100" />
          <ellipse cx="1030" cy="320" rx="155" ry="95" />
          <ellipse cx="720" cy="760" rx="170" ry="105" />
          <ellipse cx="1250" cy="700" rx="140" ry="90" />
          <ellipse cx="1450" cy="930" rx="120" ry="86" />
          <ellipse cx="90" cy="950" rx="105" ry="74" />
        </g>
      </svg>
      <div className="sun-mode-effect__noise" />
    </div>
  );
}
