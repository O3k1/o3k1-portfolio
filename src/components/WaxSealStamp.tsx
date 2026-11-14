import React from 'react';

interface WaxSealStampProps {
  onClick: () => void;
  archived: boolean;
}

/**
 * Tactile oxblood SVG wax seal button for exporting a self-contained
 * archival HTML snapshot of o3k1.com.
 */
export const WaxSealStamp: React.FC<WaxSealStampProps> = ({ onClick, archived }) => {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <button
        type="button"
        onClick={onClick}
        aria-label="Wax seal stamp: Archive and download a self-contained HTML snapshot of o3k1.com"
        className="group relative inline-flex items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.95] select-none cursor-pointer"
      >
        <svg
          viewBox="0 0 180 180"
          className="h-36 w-36 sm:h-40 sm:w-40 drop-shadow-[2px_4px_0px_rgba(28,27,24,0.32)] group-active:drop-shadow-[1px_1px_0px_rgba(28,27,24,0.28)] transition-all duration-150"
          role="img"
          aria-hidden="true"
        >
          <defs>
            {/* Radial shading for melted oxblood sealing wax */}
            <radialGradient id="wax-body-grad" cx="38%" cy="34%" r="68%">
              <stop offset="0%" stopColor="#9B2C2C" />
              <stop offset="55%" stopColor="#7A1C1C" />
              <stop offset="100%" stopColor="#4F1010" />
            </radialGradient>

            {/* Recessed inner medallion gradient */}
            <radialGradient id="wax-well-grad" cx="62%" cy="64%" r="72%">
              <stop offset="0%" stopColor="#651515" />
              <stop offset="70%" stopColor="#7A1C1C" />
              <stop offset="100%" stopColor="#8E2424" />
            </radialGradient>

            {/* Circular path for curved perimeter text (centred at top 12 o'clock) */}
            <path
              id="wax-seal-text-track"
              d="M 90,146 A 56,56 0 1,1 90.1,146"
              fill="none"
            />
          </defs>

          {/* Organic uneven melted wax perimeter */}
          <path
            d="M 90,8
               C 103,7 115,13 127,16
               C 138,19 151,25 158,36
               C 166,47 167,60 172,72
               C 176,84 174,97 170,109
               C 167,121 163,134 154,143
               C 145,153 132,158 120,164
               C 108,170 95,173 82,171
               C 69,169 56,167 45,159
               C 33,151 24,141 18,129
               C 12,117 9,103 10,90
               C 11,76 12,62 19,50
               C 25,38 35,28 47,21
               C 59,14 74,9 90,8 Z"
            fill="url(#wax-body-grad)"
            stroke="#3B0B0B"
            strokeWidth="1.5"
          />

          {/* Subtle organic outer wax ridge */}
          <path
            d="M 90,15
               C 104,15 117,20 128,26
               C 140,33 149,42 156,54
               C 162,65 165,78 164,91
               C 163,104 159,117 151,128
               C 144,139 134,148 122,154
               C 110,160 97,164 84,163
               C 70,162 57,158 46,150
               C 35,142 26,132 21,119
               C 16,107 15,93 17,80
               C 19,66 24,53 33,42
               C 42,31 54,23 68,18
               C 75,16 82,15 90,15 Z"
            fill="none"
            stroke="#A83A3A"
            strokeOpacity="0.45"
            strokeWidth="1.2"
          />

          {/* Outer bevel groove */}
          <circle
            cx="90"
            cy="90"
            r="67"
            fill="none"
            stroke="#430C0C"
            strokeWidth="2"
          />
          <circle
            cx="90"
            cy="90"
            r="65.5"
            fill="none"
            stroke="#B44646"
            strokeOpacity="0.5"
            strokeWidth="1"
          />

          {/* Curved perimeter lettering */}
          <text
            fill="#F6F3EC"
            fillOpacity="0.92"
            fontSize="8.3"
            fontFamily="'JetBrains Mono', ui-monospace, monospace"
            fontWeight="600"
            letterSpacing="1.65"
          >
            <textPath href="#wax-seal-text-track" startOffset="50%" textAnchor="middle">
              ARCHIVE // DOWNLOAD SITE • O3K1.COM
            </textPath>
          </text>

          {/* Inner medallion bevel rings */}
          <circle
            cx="90"
            cy="90"
            r="43"
            fill="url(#wax-well-grad)"
            stroke="#430C0C"
            strokeWidth="2.2"
          />
          <circle
            cx="90"
            cy="90"
            r="41.5"
            fill="none"
            stroke="#B94B4B"
            strokeOpacity="0.55"
            strokeWidth="1"
          />
          <circle
            cx="90"
            cy="90"
            r="36"
            fill="none"
            stroke="#4F1010"
            strokeOpacity="0.7"
            strokeWidth="1"
            strokeDasharray="2 3"
          />

          {/* Embossed O.O monogram (shadow + highlight + core) */}
          <text
            x="91.2"
            y="101.2"
            textAnchor="middle"
            fill="#3B0B0B"
            fontSize="31"
            fontFamily="'Newsreader', Georgia, serif"
            fontWeight="600"
            letterSpacing="1"
          >
            O.O
          </text>
          <text
            x="89.4"
            y="99.4"
            textAnchor="middle"
            fill="#F6F3EC"
            fillOpacity="0.28"
            fontSize="31"
            fontFamily="'Newsreader', Georgia, serif"
            fontWeight="600"
            letterSpacing="1"
          >
            O.O
          </text>
          <text
            x="90"
            y="100"
            textAnchor="middle"
            fill="#E8D8D2"
            fillOpacity="0.92"
            fontSize="31"
            fontFamily="'Newsreader', Georgia, serif"
            fontWeight="600"
            letterSpacing="1"
          >
            O.O
          </text>
        </svg>
      </button>

      {archived && (
        <span
          role="status"
          aria-live="polite"
          className="font-handwriting text-2xl text-ink"
        >
          Sealed &amp; archived to disk.
        </span>
      )}
    </div>
  );
};
