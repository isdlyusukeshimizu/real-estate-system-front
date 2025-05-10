"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface MapViewerProps {
  isOpen: boolean
  onClose: () => void
  address?: string
  currentAddress?: string
  inheritanceAddress?: string
  title?: string
  showButtons?: boolean
}

export default function MapViewer({
  isOpen,
  onClose,
  address,
  currentAddress,
  inheritanceAddress,
  title = "地図表示",
  showButtons = false,
}: MapViewerProps) {
  const [activeTab, setActiveTab] = useState<string>("single")

  // 単一住所または比較モードを自動判定
  useEffect(() => {
    if (currentAddress && inheritanceAddress) {
      setActiveTab("compare")
    } else {
      setActiveTab("single")
    }
  }, [currentAddress, inheritanceAddress])

  // 地図のiframeを生成する関数
  const generateMapIframe = (addr: string) => {
    if (!addr) return null
    const encodedAddress = encodeURIComponent(addr)
    return (
      <iframe
        title={`Map of ${addr}`}
        width="100%"
        height="450"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBIwzALxUPNbatRBj3Xi1Uhp0fFzwWNBkE&q=${encodedAddress}&language=ja`}
      />
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {currentAddress && inheritanceAddress ? (
            <DialogDescription>現在住所と相続住所を比較します</DialogDescription>
          ) : (
            <DialogDescription>{address || currentAddress || inheritanceAddress}</DialogDescription>
          )}
        </DialogHeader>

        {currentAddress && inheritanceAddress ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">現在住所</h3>
                {generateMapIframe(currentAddress)}
                <p className="mt-2 text-sm">{currentAddress}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">相続住所</h3>
                {generateMapIframe(inheritanceAddress)}
                <p className="mt-2 text-sm">{inheritanceAddress}</p>
              </div>
            </div>
          </div>
        ) : (
          <div>{generateMapIframe(address || currentAddress || inheritanceAddress || "")}</div>
        )}

        {showButtons && (
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              閉じる
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
