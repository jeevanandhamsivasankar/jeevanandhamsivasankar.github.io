import { render } from '@testing-library/react'
import RichText from '../../../../src/components/ui/RichText.jsx'

describe('UNIT-RICH_TEXT', () => {
  it('UT-RICH_TEXT-001 mixed segments produce the exact innerHTML', () => {
    const { container } = render(
      <p>
        <RichText
          segments={[
            { text: 'plain ' },
            { text: 'bold', mark: 'strong' },
            { text: ' mid ' },
            { text: 'lit', mark: 'hl' },
            { text: ' tail' },
          ]}
        />
      </p>,
    )
    expect(container.firstChild.innerHTML).toBe('plain <strong>bold</strong> mid <span class="hl">lit</span> tail')
  })

  it('UT-RICH_TEXT-002 markup-like text is rendered as text, not markup; no wrapper element', () => {
    const { container } = render(
      <div>
        <RichText segments={[{ text: '<b>x</b>' }, { text: '<i>y</i>', mark: 'strong' }]} />
      </div>,
    )
    expect(container.querySelector('b')).toBeNull()
    expect(container.querySelector('i')).toBeNull()
    expect(container.firstChild.textContent).toBe('<b>x</b><i>y</i>')
    expect(container.firstChild.children).toHaveLength(1) // only the <strong>
  })
})
