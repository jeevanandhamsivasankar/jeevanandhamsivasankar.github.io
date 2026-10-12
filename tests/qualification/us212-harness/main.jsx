// QT harness for US-212 (test-only, never part of the site build). Renders MediaSlot with items
// supplied by the spec through window.__ITEMS__, below a tall spacer so lazy behaviour is testable.
import { createRoot } from 'react-dom/client'
import MediaSlot from '../../../src/components/media/MediaSlot.jsx'
import '../../../src/styles/tokens.css'
import '../../../src/styles/media.css'

const items = window.__ITEMS__ ?? []
createRoot(document.getElementById('root')).render(
  <>
    <div style={{ height: 6000 }} />
    {items.map((item) => (
      <div key={item.id} id={`slot-${item.id}`} style={{ width: 640 }}>
        <MediaSlot item={item} />
      </div>
    ))}
    <div style={{ height: 6000 }} />
  </>,
)
