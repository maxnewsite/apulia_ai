import { describe, expect, it } from 'vitest'
import { extractSectionItems, topicsInIssue } from '@/lib/topics'

// Estratto della struttura reale prodotta da pipeline/templates/weekly.html.j2
const HTML = `
    <div class="section">
      <div class="section-title">
        Radar Normativo
        <span class="section-title-en">Regulatory Radar · EU AI Act & Policy</span>
      </div>
      <ul class="bullet-list">
<li class="bullet-item">
  <span class="bullet-marker">▪</span>
  <span class="bullet-text">L&#39;UE proibisce le app di nudificazione basate su AI, prima applicazione concreta del divieto. [5][6]
    <span class="bullet-sources">
<a href="https://example.com/a?x=1&amp;y=2" title="Dayitalianews">Dayitalianews 3 ott</a><a href="https://example.com/b" title="Zazoom">, Zazoom 3 ott</a>    </span>
  </span>
</li>
<li class="bullet-item">
  <span class="bullet-marker">▪</span>
  <span class="bullet-text">Notizia senza fonti ma abbastanza lunga da essere tenuta.
  </span>
</li>
      </ul>
    </div>

    <div class="section">
      <div class="section-title">
        Funding &amp; Mercati
        <span class="section-title-en">Funding & Markets</span>
      </div>
      <ul class="bullet-list">
<li class="bullet-item">
  <span class="bullet-marker">▪</span>
  <span class="bullet-text">Mistral chiude un round da 3 miliardi con Samsung tra gli investitori.
    <span class="bullet-sources"><a href="https://example.com/c" title="Sifted">Sifted 12 set</a></span>
  </span>
</li>
      </ul>
    </div>
`

describe('extractSectionItems', () => {
  it('estrae testo pulito e fonti di una sezione', () => {
    const items = extractSectionItems(HTML, 'Radar Normativo')
    expect(items).toHaveLength(2)
    expect(items[0].text).toBe(
      "L'UE proibisce le app di nudificazione basate su AI, prima applicazione concreta del divieto.",
    )
    expect(items[0].sources).toEqual([
      { url: 'https://example.com/a?x=1&y=2', name: 'Dayitalianews 3 ott' },
      { url: 'https://example.com/b', name: 'Zazoom 3 ott' },
    ])
    expect(items[1]).toEqual({
      text: 'Notizia senza fonti ma abbastanza lunga da essere tenuta.',
      sources: [],
    })
  })

  it('non sconfina nella sezione successiva', () => {
    const radar = extractSectionItems(HTML, 'Radar Normativo')
    expect(radar.some((i) => i.text.includes('Mistral'))).toBe(false)
  })

  it('riconosce titoli con & sia grezzo sia come entità', () => {
    expect(extractSectionItems(HTML, 'Funding & Mercati')).toHaveLength(1)
  })

  it('restituisce lista vuota se la sezione manca', () => {
    expect(extractSectionItems(HTML, 'Focus Italia')).toEqual([])
    expect(extractSectionItems('', 'Radar Normativo')).toEqual([])
  })
})

describe('topicsInIssue', () => {
  it('elenca solo i temi presenti nell’edizione', () => {
    expect(topicsInIssue(HTML).map((t) => t.slug)).toEqual(['ai-act', 'investimenti-ai'])
  })
})
