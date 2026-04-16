'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface WeatherData {
  temperature: number
}

const DROPS = Array.from({ length: 60 }, (_, i) => {
  const seed = (i * 7919 + 1234) % 1000
  return {
    left: seed % 100,
    duration: 0.6 + ((seed * 3) % 1000) / 1000,
    delay: -((seed * 13) % 2000) / 1000,
    height: 8 + (seed % 10),
    opacity: 0.2 + ((seed * 7) % 60) / 100,
  }
})

function RainLayer() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
      {DROPS.map((drop, i) => (
        <div
          key={i}
          className="absolute w-px rounded-full bg-white"
          style={{
            left: `${drop.left}%`,
            top: 0,
            height: `${drop.height}px`,
            opacity: drop.opacity,
            animation: `rain-fall ${drop.duration}s ${drop.delay}s linear infinite`,
          }}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const [temperature, setTemperature] = useState<number | null>(null)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=68.2&longitude=14.4&current=temperature_2m&timezone=Europe%2FOslo'
        )
        const data = await res.json()
        setTemperature(Math.round(data.current.temperature_2m))
      } catch {
        // silently retry on next mount
      }
    }
    fetchWeather()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const timeStr = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="relative w-[400px] h-[400px] rounded-3xl overflow-hidden shadow-2xl">

        <Image
          src="/lofoten.png"
          alt="Lofoten landscape"
          fill
          className="object-cover"
          priority
        />

        <RainLayer />

        <div className="absolute inset-0 p-7 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white font-semibold text-lg leading-snug drop-shadow">Today</p>
              <p className="text-white/80 text-base leading-snug drop-shadow">{timeStr}</p>
            </div>
            <p className="text-white font-bold text-7xl leading-none drop-shadow">
              {temperature !== null ? `${temperature}°` : '—'}
            </p>
          </div>
          <div>
            <p className="text-white font-bold text-2xl leading-tight drop-shadow">Lofoten</p>
            <p className="text-white/80 text-lg leading-tight drop-shadow">Norway</p>
          </div>
        </div>

      </div>
    </main>
  )
}
