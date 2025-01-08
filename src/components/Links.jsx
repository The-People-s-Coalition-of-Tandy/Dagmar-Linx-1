import styled from 'styled-components'
import { useState, useCallback, memo } from 'react'

const LinksContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: min(250px, 90vw);
  padding: 1rem;
  will-change: transform;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`

const Link = styled.a`
  padding: 0.8rem 1.5rem;
  color: white;
  font-weight: bold;
  text-decoration: none;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 1rem;
  transition: transform 0.3s ease;
  text-shadow: 0 0 10px black;
  position: relative;
  overflow: hidden;
  will-change: transform;

  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }

  &:active {
    transform: scale(0.98);
    background: rgba(230, 197, 135, 0.2);
  }

  @media (hover: hover) {
    &:hover {
      color: #ffffff;
      transform: scale(1.02);
    }
  }
`

const links = [
  { title: '1. Bandcamp', url: 'https://tandy.bandcamp.com/album/in-filth-your-mystery-is-kingdom-far-smile-peasant-in-yellow-music' },
  { title: '2. Full Album Video', url: 'https://youtu.be/AaqEr05QtQI' },
  { title: '3. Why I Remember (Each Day of Summer) Visualizer', url: 'https://youtu.be/UR73Q2kuAg0' },
  { title: '4. even god gets stuck in devotion', url: 'https://youtu.be/Ga4grUX0bDQ ' },
]

const LinkItem = memo(({ url, title }) => (
  <Link href={url} target="_blank" rel="noopener noreferrer">
    {title}
  </Link>
))

export const Links = memo(function Links() {
  const [touchStart, setTouchStart] = useState(null)

  const handleTouchStart = useCallback((e) => {
    setTouchStart(e.touches[0].clientY)
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!touchStart) return
    
    const currentTouch = e.touches[0].clientY
    const diff = touchStart - currentTouch

    if (Math.abs(diff) > 5) {
      e.preventDefault()
    }
  }, [touchStart])

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null)
  }, [])

  return (
    <LinksContainer
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {links.map((link) => (
        <LinkItem key={link.url} {...link} />
      ))}
    </LinksContainer>
  )
})