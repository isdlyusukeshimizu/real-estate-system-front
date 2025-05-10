"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"

const steps = ["登記簿図書館アクセス", "登記簿図書館情報取得", "ネットの電話帳アクセス", "ネットの電話帳情報取得"]

export function AIAgentProgress({ isRunning, onComplete }: { isRunning: boolean; onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval)
            onComplete()
            return 100
          }
          return prevProgress + 1
        })
      }, 50)

      return () => clearInterval(interval)
    }
  }, [isRunning, onComplete])

  useEffect(() => {
    setCurrentStep(Math.min(Math.floor(progress / 25), 3))
  }, [progress])

  if (!isRunning) return null

  return (
    <div className="w-full space-y-2">
      <Progress value={progress} className="w-full" />
      <div className="text-sm font-medium">{steps[currentStep]}</div>
    </div>
  )
}
