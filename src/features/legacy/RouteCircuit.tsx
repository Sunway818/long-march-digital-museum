/** 艺术化象征图；不承载历史坐标或电气逻辑。 */
export function RouteCircuit({ small = false }: { small?: boolean }) {
 return <svg className={small?'legacy-circuit legacy-circuit-small':'legacy-circuit'} viewBox="0 0 1200 320" role="img" aria-label="艺术示意：不规则行军路线经过1956年的折线与焊盘，逐步转为2026年的PCB走线，连入芯片并向外延展">
  <g className="legacy-terrain" fill="none" stroke="currentColor" strokeWidth="1" opacity=".16">
   <path d="M0 207 C35 188 24 133 78 111 S135 73 151 40 S232 14 269 46 283 116 323 112 367 73 403 105 409 177 452 193"/>
   <path d="M0 240 C48 220 39 158 89 146 S158 105 178 72 228 48 245 75 259 133 301 140 371 101 388 148 411 210 457 218"/>
   <path d="M7 267 C62 247 74 189 117 180 S170 131 197 113 225 157 259 181 307 176 332 164 353 196 382 211 435 244 482 231"/>
   <path d="M72 46 C89 25 115 21 125 37 S124 69 108 82 80 79 78 65 72 55 72 46Z M44 43 C68 7 128 6 146 33 S144 82 115 102 61 95 57 79 37 61 44 43Z"/>
  </g>
  <g className="legacy-circuit-traces" fill="none" stroke="var(--legacy-gold)" strokeWidth="2" strokeLinejoin="round" data-motion-slot="pcb-network">
   <path d="M555 149 V104 L587 72 H717 L749 104 H893 L917 128 H1032 M635 181 V221 H761 L789 249 H925 L950 224 H1000 L1016 208 H1032"/>
   <path d="M750 135 V87 L777 60 H845 M825 135 V186 L843 204 H901 L929 176 H1032 M789 249 V272 H1112 L1140 244 H1190 M893 104 V68 H952"/>
   <path d="M1128 128 H1155 L1179 104 H1194 M1128 144 H1194 M1128 160 H1152 L1178 186 H1194 M1128 192 H1144 V218 H1194"/>
   <path d="M1048 107 V83 H1006 V49 H956 M1072 107 V73 H1108 V40 M1096 107 V70 H1180 M1060 215 V248 M1084 215 V262 H1152"/>
   <rect x="806" y="58" width="39" height="17" rx="1"/><path d="M806 66 H792 M845 66 H860"/>
   <rect x="873" y="241" width="31" height="16" rx="1"/><path d="M864 249 H873 M904 249 H915"/>
   <rect className="legacy-chip" x="1032" y="107" width="96" height="108" rx="2"/>
   <path d="M1016 128 H1032 M1016 144 H1032 M1016 160 H1032 M1016 176 H1032 M1016 192 H1032 M1128 176 H1142 M1050 91 V107 M1060 91 V107 M1084 91 V107 M1108 91 V107 M1050 215 V231 M1072 215 V231 M1096 215 V231 M1108 215 V231"/>
   <rect x="1048" y="123" width="64" height="76"/><path d="M1048 144 H1066 V136 H1096 V159 H1080 V185 H1112 M1048 171 H1066 V199 M1096 123 V136" opacity=".7"/>
  </g>
  <path className="legacy-route-ghost" d="M14 242 L61 225 Q70 219 67 208 L60 185 L101 180 L119 133 L162 146 L184 97 L221 81 L246 105 L231 137 L263 171 L292 158 L309 190 L345 176 L363 136 L399 126 Q411 126 420 139 L430 154 H460 L487 181 H523 L555 149 H603 L635 181 H704 L750 135 H825 L857 167 H927 L950 144 H1048" fill="none" stroke="var(--legacy-red)" strokeWidth="4.5" opacity="0" aria-hidden="true"/>
  <path id="legacy-main-route" className="legacy-route-path" d="M14 242 L61 225 Q70 219 67 208 L60 185 L101 180 L119 133 L162 146 L184 97 L221 81 L246 105 L231 137 L263 171 L292 158 L309 190 L345 176 L363 136 L399 126 Q411 126 420 139 L430 154 H460 L487 181 H523 L555 149 H603 L635 181 H704 L750 135 H825 L857 167 H927 L950 144 H1048" fill="none" stroke="var(--legacy-red)" strokeWidth="4.5" strokeLinejoin="round" pathLength="1"/>
  <g className="legacy-march-nodes" fill="var(--legacy-paper)" stroke="var(--legacy-red)" strokeWidth="2.5"><circle cx="119" cy="133" r="5"/><circle cx="263" cy="171" r="4"/><circle cx="399" cy="126" r="4"/><circle cx="603" cy="149" r="7"/></g>
  <g className="legacy-pcb-pads" fill="var(--legacy-paper)" stroke="var(--legacy-gold)" strokeWidth="2"><circle cx="555" cy="104" r="5"/><circle cx="635" cy="221" r="5"/><circle cx="825" cy="186" r="5"/><circle cx="952" cy="68" r="5"/><circle cx="956" cy="49" r="3"/><circle cx="1180" cy="70" r="3"/></g>
  <g fill="none" stroke="var(--legacy-red)" strokeWidth="1.7"><path d="m197 87 10-1-5 9 M327 176 l9-1-5 8"/></g>
  <circle className="legacy-signal-dot" r="5.5" fill="var(--legacy-red)" opacity="0" aria-hidden="true"/>
  <g fill="currentColor" className="legacy-circuit-label" textAnchor="middle"><text x="112" y="310">1936</text><text x="603" y="310">1956</text><text x="1080" y="310">2026</text></g>
 </svg>
}
