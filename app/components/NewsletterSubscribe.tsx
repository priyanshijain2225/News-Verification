"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Dialog, DialogContent } from "@/app/components/ui/dialog";
import { Check, X, Mail } from "lucide-react"; // 📨 Added Mail icon

interface NewsletterSubscribeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewsletterSubscribe({
  open,
  onOpenChange,
}: NewsletterSubscribeProps) {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToPolicy) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitted(true);
    setFormData({ name: "", email: "" });
    setAgreedToPolicy(false);
    setIsLoading(false);

    setTimeout(() => {
      setIsSubmitted(false);
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-white">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center pt-8 px-6">
          {/* 🟠 Replaced the image with an icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center mb-6 flex-shrink-0">
            <Mail className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Sign up for newsletter:
          </h2>

          {isSubmitted ? (
            <div className="w-full text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Successfully subscribed!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full space-y-4 pb-6">
              <Input
                name="name"
                type="text"
                placeholder="Your name..."
                value={formData.name}
                onChange={handleChange}
                required
                className="border-gray-300 text-gray-700 placeholder:text-gray-400"
              />
              <Input
                name="email"
                type="email"
                placeholder="Email address..."
                value={formData.email}
                onChange={handleChange}
                required
                className="border-gray-300 text-gray-700 placeholder:text-gray-400"
              />

              <div className="flex items-start gap-3 py-2">
                <input
                  type="checkbox"
                  id="policy"
                  checked={agreedToPolicy}
                  onChange={(e) => setAgreedToPolicy(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-orange-600 cursor-pointer"
                />
                <label
                  htmlFor="policy"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  I confirm that I have read and agree to{" "}
                  <a
                    href="#"
                    className="text-orange-600 hover:underline font-medium"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !agreedToPolicy}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg mt-6"
              >
                {isLoading ? "Confirming..." : "Confirm Signup"}
              </Button>
            </form>
          )}
        </div>

        <svg
          className="w-full h-16 text-orange-600"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z" fill="currentColor" />
        </svg>
      </DialogContent>
    </Dialog>
  );
}
