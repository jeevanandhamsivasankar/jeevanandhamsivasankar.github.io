/** Normalise a CSS value through jsdom, so '#f59e0b66' compares equal to what element.style reports. */
export function norm(prop, value) {
  const el = document.createElement('div')
  el.style[prop] = value
  return el.style[prop]
}

/** Assert the standard section frame: root tag/id/data-section, label icon + text, title. */
export function sectionFrame(container, { id, tag, labelIcon, labelText, title }) {
  const root = container.firstElementChild
  expect(root.tagName.toLowerCase()).toBe(tag)
  expect(root).toHaveAttribute('id', id)
  expect(root).toHaveAttribute('data-section', id)
  const label = root.querySelector('.section-label')
  expect(label).not.toBeNull()
  expect(label.firstChild.textContent).toBe(labelIcon)
  expect(label.firstChild).toHaveAttribute('aria-hidden', 'true')
  expect(label.lastChild.textContent).toBe(labelText)
  const h2 = root.querySelector('h2.section-title')
  if (title === null) expect(h2).toBeNull()
  else expect(h2).toHaveTextContent(title)
  return root
}
