import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "實驗室測試管理系統",
  description: "高效管理實驗室測試、人員和設備",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
