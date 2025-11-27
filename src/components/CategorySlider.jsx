import React, { useEffect, useRef, useState } from 'react'
import { fetchCategories } from '../api/config'
import '../styles/CategorySlider.css'

const CategorySlider = ({ onSelect, activeCategory }) => {
  const [categories, setCategories] = useState([])
  const wrapperRef = useRef(null)
  const [visibleCount, setVisibleCount] = useState(7)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemWidth, setItemWidth] = useState(0)

  useEffect(() => {
    fetchCategories()
      .then(data => {
        console.log('Categories received:', data);
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error('Categories is not an array:', data);
          setCategories([]);
        }
      })
      .catch(err => {
        console.error('Failed to load categories', err);
        setCategories([]);
      });
  }, [])

  // compute visibleCount based on wrapper width
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    const compute = () => {
      const w = el.clientWidth
      // breakpoints for visible items
      let vc = 1
      if (w >= 900) vc = 7
      else if (w >= 750) vc = 6
      else if (w >= 600) vc = 5
      else if (w >= 480) vc = 4
      else if (w >= 360) vc = 3
      else if (w >= 240) vc = 2
      else vc = 1

      vc = Math.min(vc, categories.length || vc)
      setVisibleCount(vc)
      const iw = Math.floor(w / vc)
      setItemWidth(iw)
      // clamp currentIndex so window fits
      const maxStart = Math.max(0, (categories.length || 0) - vc)
      setCurrentIndex(ci => Math.min(ci, maxStart))
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    window.addEventListener('resize', compute)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [categories.length])

  // reset pageIndex if visibleCount or categories changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [visibleCount, categories.length])

  // when activeCategory changes, ensure it's visible in the viewport
  useEffect(() => {
    if (!activeCategory || categories.length === 0) return
    const idx = categories.findIndex(c => (activeCategory.id && c.id === activeCategory.id) || (activeCategory.title && c.title === activeCategory.title))
    if (idx === -1) return
    setCurrentIndex(ci => {
      if (idx < ci) return idx
      if (idx >= ci + visibleCount) return Math.max(0, idx - visibleCount + 1)
      return ci
    })
  }, [activeCategory, categories, visibleCount])

  const prev = () => {
    setCurrentIndex(ci => Math.max(0, ci - 1))
  }
  const next = () => {
    const maxStart = Math.max(0, (categories.length || 0) - visibleCount)
    setCurrentIndex(ci => Math.min(maxStart, ci + 1))
  }

  // reset index when config changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [visibleCount, categories.length])


  return (
    <div className="category-slider-wrap" ref={wrapperRef}>
      <div className="category-slider-viewport">
        {categories.length > visibleCount && (
          <button type="button" className="slider-arrow prev" onClick={prev} aria-label="Précédent">
            <img src="/img/images/fleche-slider.png" alt="prev" />
          </button>
        )}

        <div
          className="category-slider-track"
          style={{
            width: `${categories.length * itemWidth}px`,
            transform: `translateX(-${currentIndex * itemWidth}px)`,
          }}
        >
          {categories.map((cat) => {
            const isActive = !!activeCategory && ((activeCategory.id && activeCategory.id === cat.id) || (activeCategory.title && activeCategory.title === cat.title))
            return (
            <button
              key={cat.id}
              className={`category-item ${isActive ? 'active' : ''}`}
              aria-pressed={isActive}
              onClick={() => onSelect && onSelect(cat)}
              style={{ width: itemWidth }}
            >
              <img src={cat.image.startsWith('/') ? `/img${cat.image}` : cat.image} alt={cat.title} />
              <span>{cat.title}</span>
            </button>
            )
          })}
        </div>

        {categories.length > visibleCount && (
          <button type="button" className="slider-arrow next" onClick={next} aria-label="Suivant">
            <img src="/img/images/fleche-slider.png" alt="next" />
          </button>
        )}
      </div>
    </div>
  )
}

export default CategorySlider
