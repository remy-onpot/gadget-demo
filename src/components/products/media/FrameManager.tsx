'use client'

import { useState } from 'react'
import { Save, ArrowLeft, ArrowRight, Trash2, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr' 
import { saveProduct360Set } from '@/actions/product-360-actions'
import { toast } from 'sonner' 

interface FrameManagerProps {
  storeId: string
  productId: string
  initialFrames: string[] // Blob URLs from the video processor
  onCancel: () => void
  onSaveSuccess: () => void
}

// Helper to convert Blob URL back to File object for upload
const urlToFile = async (url: string, filename: string, mimeType: string) => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: mimeType });
}

export default function FrameManager({ 
  storeId,
  productId, 
  initialFrames, 
  onCancel, 
  onSaveSuccess 
}: FrameManagerProps) {
  const [frames, setFrames] = useState<string[]>(initialFrames)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // FIX: Pass env variables to createBrowserClient
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // --- UI Actions ---

  const moveFrame = (index: number, direction: 'left' | 'right') => {
    const newFrames = [...frames]
    const targetIndex = direction === 'left' ? index - 1 : index + 1

    if (targetIndex >= 0 && targetIndex < newFrames.length) {
      [newFrames[index], newFrames[targetIndex]] = [newFrames[targetIndex], newFrames[index]]
      setFrames(newFrames)
    }
  }

  const deleteFrame = (index: number) => {
    setFrames(frames.filter((_, i) => i !== index))
  }

  // --- Save Logic ---

  const handleSave = async () => {
    if (frames.length === 0) return toast.error("No frames to save")
    
    setIsSaving(true)
    setUploadProgress(0)
    const toastId = toast.loading("Starting upload...")

    try {
        const uploadedUrls: string[] = []
        
        // 1. Upload Loop
        const total = frames.length
        
        for (let i = 0; i < total; i++) {
            const frameBlobUrl = frames[i]
            // Naming convention: store/product/360/index_timestamp.jpg
            const fileName = `360/${i}_${Date.now()}.jpg`
            const filePath = `${storeId}/${productId}/${fileName}`
            
            // Convert blob URL to File
            const file = await urlToFile(frameBlobUrl, fileName, 'image/jpeg')

            // Upload to 'product-media' bucket
            const { error: uploadError } = await supabase
                .storage
                .from('product-media') 
                .upload(filePath, file, {
                    upsert: true
                })

            if (uploadError) throw uploadError
            
            // Get Public URL
            const { data: { publicUrl } } = supabase
                .storage
                .from('product-media')
                .getPublicUrl(filePath)
                
            uploadedUrls.push(publicUrl)
            
            // Update progress
            setUploadProgress(Math.round(((i + 1) / total) * 100))
        }

        // 2. Save to Database via Server Action
        toast.loading("Finalizing database...", { id: toastId })
        
        const dbResult = await saveProduct360Set(storeId, productId, uploadedUrls)

        if (dbResult.success) {
            toast.success("360 View published successfully!", { id: toastId })
            onSaveSuccess()
        } else {
            throw new Error(dbResult.error || "Unknown database error")
        }

    } catch (error: any) {
        console.error(error)
        toast.error("Save failed: " + error.message, { id: toastId })
    } finally {
        setIsSaving(false)
        setUploadProgress(0)
    }
  }

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-gray-50/50">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
            <h3 className="font-semibold text-sm">Review Frames ({frames.length})</h3>
            <p className="text-xs text-gray-500">Drag or use arrows to reorder. Delete blurry frames.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={onCancel} 
                disabled={isSaving}
                className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
                Cancel
            </button>
            <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-black text-white px-3 py-1.5 rounded-md text-xs flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50 min-w-[100px] justify-center"
            >
                {isSaving ? (
                    <><Loader2 size={14} className="animate-spin" /> {uploadProgress}%</>
                ) : (
                    <><Save size={14} /> Save Set</>
                )}
            </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-[400px] overflow-y-auto p-2 border bg-white rounded custom-scrollbar">
        {frames.map((frame, idx) => (
          <div key={idx} className="relative group aspect-square border rounded overflow-hidden bg-gray-100">
            <Image 
                src={frame} 
                alt={`Frame ${idx}`} 
                fill 
                className="object-cover"
                unoptimized // Use unoptimized for blob URLs
            />
            
            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <button 
                onClick={() => moveFrame(idx, 'left')} 
                disabled={idx === 0}
                className="p-1 bg-white/20 hover:bg-white/40 rounded text-white disabled:opacity-0"
              >
                <ArrowLeft size={12} />
              </button>
              
              <button 
                onClick={() => deleteFrame(idx)} 
                className="p-1 bg-red-500/80 hover:bg-red-600 rounded text-white"
              >
                <Trash2 size={12} />
              </button>

              <button 
                onClick={() => moveFrame(idx, 'right')} 
                disabled={idx === frames.length - 1}
                className="p-1 bg-white/20 hover:bg-white/40 rounded text-white disabled:opacity-0"
              >
                <ArrowRight size={12} />
              </button>
            </div>
            
            {/* Frame Number Badge */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-[1px] text-[10px] text-white text-center py-0.5 font-mono">
                {idx + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}