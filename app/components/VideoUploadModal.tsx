"use client";

import type React from "react";
import { useState, useRef } from "react";
import { X, Play, LinkIcon, Type, Trash, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { newsVerificationService, VerificationInput } from "@/lib/verificationService";

export function VideoUploadModal({
  onClose,
  onUploadComplete,
}: {
  onClose: () => void;
  onUploadComplete: (types: string[], verificationData?: any) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"video" | "link" | "text">("video");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string>("");

  // Actual stored user inputs
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [textInput, setTextInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith("video")
    );
    if (files.length) {
      setVideoFiles((prev) => [...prev, ...files]);
    }
  };

  const handleSelectFiles = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files || []).filter((f) => f.type.startsWith("video"));
    if (files.length) setVideoFiles((prev) => [...prev, ...files]);
    // clear input so same file can be re-picked if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeVideoFile = (idx: number) => {
    setVideoFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // helper to decide which types are present
  const getUploadedTypes = (): string[] => {
    const types: string[] = [];
    if (videoFiles.length > 0) types.push("video");
    if (linkInput.trim().length > 0) types.push("link");
    if (textInput.trim().length > 0) types.push("text");
    return types;
  };

  const handleAddToProfile = async () => {
    const uploadedTypes = getUploadedTypes();
    if (uploadedTypes.length === 0) {
      alert("Please add at least one file, link or text entry before verification.");
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    try {
      // Process each type of input
      const verificationPromises: Promise<any>[] = [];

      if (textInput.trim()) {
        const input: VerificationInput = {
          type: 'text',
          content: textInput.trim()
        };
        verificationPromises.push(newsVerificationService.verifyContent(input));
      }

      if (linkInput.trim()) {
        const input: VerificationInput = {
          type: 'link',
          content: linkInput.trim()
        };
        verificationPromises.push(newsVerificationService.verifyContent(input));
      }

      if (videoFiles.length > 0) {
        // For video files, we'll use the filename as content for now
        // In a real implementation, you'd extract video content or transcription
        const input: VerificationInput = {
          type: 'video',
          content: videoFiles.map(f => f.name).join(', ')
        };
        verificationPromises.push(newsVerificationService.verifyContent(input));
      }

      // Wait for all verifications to complete
        const verificationResults = await Promise.all(verificationPromises);      // Create a combined result object
      const combinedResults = {
        results: verificationResults,
        types: uploadedTypes,
        timestamp: new Date().toISOString()
      };

      // Store results in localStorage for the results page
      localStorage.setItem('verificationResults', JSON.stringify(combinedResults));
      
      onUploadComplete(uploadedTypes, combinedResults);
      
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationError(error instanceof Error ? error.message : 'Verification failed. Please try again.');
      setIsVerifying(false);
    }
  };

  const clearAll = () => {
    setVideoFiles([]);
    setLinkInput("");
    setTextInput("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Upload for Verification</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                clearAll();
                onClose();
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tabs */}
          <div className="flex gap-3 border-b border-border">
            <button
              onClick={() => setSelectedOption("video")}
              className={`pb-3 px-1 font-medium text-sm transition-colors ${
                selectedOption === "video"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Video
              </div>
            </button>
            <button
              onClick={() => setSelectedOption("link")}
              className={`pb-3 px-1 font-medium text-sm transition-colors ${
                selectedOption === "link"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Link
              </div>
            </button>
            <button
              onClick={() => setSelectedOption("text")}
              className={`pb-3 px-1 font-medium text-sm transition-colors ${
                selectedOption === "text"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Text
              </div>
            </button>
          </div>

          {/* Short status chips showing which types are currently added */}
          <div className="flex gap-2 flex-wrap">
            {videoFiles.length > 0 && (
              <div className="px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-full text-sm flex items-center gap-2">
                <Play className="w-4 h-4" /> Video ({videoFiles.length})
              </div>
            )}
            {linkInput.trim().length > 0 && (
              <div className="px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-full text-sm flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Link
              </div>
            )}
            {textInput.trim().length > 0 && (
              <div className="px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-full text-sm flex items-center gap-2">
                <Type className="w-4 h-4" /> Text
              </div>
            )}
          </div>

          {/* Explanatory line */}
          <p className="text-sm text-gray-600">
            You can add multiple types in one session — pick a tab, add content, then switch tabs and add
            more. All present types will be shown on the results page.
          </p>

          {/* Inputs */}
          {selectedOption === "video" && (
            <>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging ? "border-orange-500 bg-orange-50" : "border-gray-300 bg-gray-50"
                }`}
              >
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
                    <Play className="w-6 h-6 text-gray-400 fill-gray-400" />
                  </div>
                </div>
                <p className="font-medium text-gray-700 mb-1">Drag & drop video files here</p>
                <p className="text-sm text-gray-500 mb-4">MP4 recommended — private until verification</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectFiles}
                  className="text-orange-600 border-orange-600 hover:bg-orange-50 bg-transparent"
                >
                  Select Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
              </div>

              {/* List selected video files */}
              {videoFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {videoFiles.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black/5 rounded flex items-center justify-center text-sm font-medium">{/* thumbnail placeholder */}🎞</div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">{f.name}</div>
                          <div className="text-xs text-gray-500">{(f.size / 1024 / 1024).toFixed(1)} MB</div>
                        </div>
                      </div>
                      <button onClick={() => removeVideoFile(idx)} className="text-red-500 hover:text-red-700">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {selectedOption === "link" && (
            <div className="space-y-2">
              <input
                type="url"
                placeholder="https://example.com/video-or-article"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
              />
              <p className="text-xs text-gray-500">Supported: YouTube, Vimeo, news sites, etc.</p>
            </div>
          )}

          {selectedOption === "text" && (
            <textarea
              placeholder="Type the news text here... (max 500 chars)"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value.slice(0, 500))}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none resize-none h-32"
            />
          )}
        </div>

        {/* Error Message */}
        {verificationError && (
          <div className="px-6 pb-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <strong>Verification Error:</strong> {verificationError}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border bg-gray-50">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              clearAll();
              onClose();
            }}
            disabled={isVerifying}
          >
            Cancel
          </Button>

          <Button 
            className="flex-1 bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-400" 
            onClick={handleAddToProfile}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </div>
            ) : (
              'Verify Content'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
