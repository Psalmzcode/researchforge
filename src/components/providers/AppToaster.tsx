'use client'

import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'

export function AppToaster() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const read = () => setTheme(document.documentElement.classList.contains('light') ? 'light' : 'dark')
    read()
    const obs = new MutationObserver(read)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  return (
    <Toaster
      theme={theme}
      richColors
      closeButton
      position="top-center"
      expand={false}
      gap={10}
      toastOptions={{
        classNames: {
          toast: '!font-sans !text-[0.9rem]',
        },
      }}
    />
  )
}
