// Conteúdo exato de day-realistic.svg / night-realistic.svg (não editar as artes aqui —
// se precisar alterar o visual, troque os arquivos .svg nesta pasta e regenere estas strings).

export const DAY_BACKGROUND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 2400" preserveAspectRatio="xMidYMid slice">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2E8BCB"/><stop offset=".48" stop-color="#62B8E8"/><stop offset="1" stop-color="#B9E5F7"/>
  </linearGradient>
  <radialGradient id="sunGlow"><stop stop-color="#FFFBE0" stop-opacity=".72"/><stop offset=".35" stop-color="#FFEFA3" stop-opacity=".28"/><stop offset="1" stop-color="#FFEFA3" stop-opacity="0"/></radialGradient>
  <radialGradient id="sun"><stop stop-color="#FFFDF0"/><stop offset=".55" stop-color="#FFE98A"/><stop offset="1" stop-color="#FFC94F"/></radialGradient>
  <linearGradient id="cloud" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#FFF" stop-opacity=".88"/><stop offset="1" stop-color="#E9F6FB" stop-opacity=".42"/></linearGradient>
  <filter id="blur30"><feGaussianBlur stdDeviation="30"/></filter>
  <filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter>
</defs>

<rect width="1080" height="2400" fill="url(#sky)"/>

<!-- atmospheric haze -->
<ellipse cx="540" cy="1050" rx="700" ry="520" fill="#FFF" opacity=".08" filter="url(#blur30)"/>

<!-- large realistic sun -->
<circle cx="850" cy="390" r="300" fill="url(#sunGlow)" filter="url(#blur30)"/>
<circle cx="850" cy="390" r="215" fill="url(#sunGlow)"/>
<circle cx="850" cy="390" r="128" fill="url(#sun)"/>
<circle cx="820" cy="355" r="82" fill="#FFFDEB" opacity=".13" filter="url(#blur8)"/>

<!-- soft clouds -->
<g fill="url(#cloud)" opacity=".72" filter="url(#blur8)">
  <ellipse cx="125" cy="700" rx="180" ry="55"/>
  <ellipse cx="260" cy="675" rx="150" ry="75"/>
  <ellipse cx="395" cy="710" rx="180" ry="55"/>
  <ellipse cx="920" cy="820" rx="210" ry="58"/>
  <ellipse cx="790" cy="800" rx="145" ry="70"/>
</g>
<g fill="#FFF" opacity=".22">
  <ellipse cx="220" cy="690" rx="110" ry="42"/>
  <ellipse cx="835" cy="805" rx="100" ry="40"/>
</g>

<!-- distant atmospheric clouds -->
<g fill="#FFF" opacity=".12" filter="url(#blur30)">
  <ellipse cx="80" cy="1160" rx="300" ry="70"/>
  <ellipse cx="970" cy="1280" rx="330" ry="80"/>
</g>
</svg>`

export const NIGHT_BACKGROUND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 2400" preserveAspectRatio="xMidYMid slice">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#06142F"/><stop offset=".48" stop-color="#102F63"/><stop offset="1" stop-color="#275A91"/>
  </linearGradient>
  <radialGradient id="moonGlow"><stop stop-color="#FFFBEA" stop-opacity=".42"/><stop offset=".35" stop-color="#FFFBEA" stop-opacity=".18"/><stop offset="1" stop-color="#FFFBEA" stop-opacity="0"/></radialGradient>
  <radialGradient id="moonSurface" cx=".35" cy=".3" r=".75">
    <stop stop-color="#FFFDF2"/><stop offset=".55" stop-color="#F4EED7"/><stop offset="1" stop-color="#D8D1B8"/>
  </radialGradient>
  <filter id="blur30"><feGaussianBlur stdDeviation="30"/></filter>
  <filter id="blur10"><feGaussianBlur stdDeviation="10"/></filter>
</defs>

<rect width="1080" height="2400" fill="url(#sky)"/>

<!-- subtle atmospheric night haze -->
<ellipse cx="540" cy="1050" rx="700" ry="520" fill="#6C9FD0" opacity=".07" filter="url(#blur30)"/>

<!-- stars -->
<g fill="#FFFBEA">
  <circle cx="100" cy="190" r="2.5" opacity=".55"/><circle cx="220" cy="330" r="2" opacity=".38"/>
  <circle cx="360" cy="150" r="2.8" opacity=".6"/><circle cx="500" cy="260" r="2" opacity=".5"/>
  <circle cx="650" cy="150" r="2.5" opacity=".42"/><circle cx="770" cy="285" r="2" opacity=".58"/>
  <circle cx="970" cy="190" r="2.8" opacity=".48"/><circle cx="300" cy="560" r="2" opacity=".42"/>
  <circle cx="690" cy="600" r="2.5" opacity=".4"/><circle cx="920" cy="720" r="2" opacity=".52"/>
  <circle cx="150" cy="850" r="2" opacity=".38"/><circle cx="820" cy="930" r="2.5" opacity=".4"/>
</g>

<!-- large realistic full moon -->
<circle cx="835" cy="410" r="330" fill="url(#moonGlow)" filter="url(#blur30)"/>
<circle cx="835" cy="410" r="235" fill="url(#moonGlow)"/>
<circle cx="835" cy="410" r="150" fill="url(#moonSurface)"/>

<!-- moon craters -->
<g fill="#C8C0A5" opacity=".24">
  <circle cx="780" cy="360" r="20"/><circle cx="870" cy="330" r="15"/>
  <circle cx="900" cy="455" r="25"/><circle cx="810" cy="485" r="18"/>
  <circle cx="760" cy="445" r="11"/><circle cx="850" cy="410" r="9"/>
  <circle cx="885" cy="385" r="8"/><circle cx="800" cy="415" r="7"/>
</g>
<g fill="#FFF" opacity=".16" filter="url(#blur10)">
  <circle cx="800" cy="370" r="30"/>
</g>

<!-- soft night clouds -->
<g fill="#091D3D" opacity=".35" filter="url(#blur10)">
  <ellipse cx="145" cy="790" rx="190" ry="58"/>
  <ellipse cx="285" cy="770" rx="145" ry="50"/>
  <ellipse cx="920" cy="930" rx="210" ry="62"/>
  <ellipse cx="790" cy="910" rx="150" ry="52"/>
</g>
<g fill="#CFE2F5" opacity=".055">
  <ellipse cx="190" cy="770" rx="135" ry="42"/>
  <ellipse cx="865" cy="910" rx="145" ry="42"/>
</g>
</svg>`
