"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"
import { Toaster } from "@/components/sonner"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster />
    </SessionProvider>
  )
}

