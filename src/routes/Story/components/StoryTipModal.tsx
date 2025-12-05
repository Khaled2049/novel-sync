import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface StoryTipModalProps {
  author: string;
  authorWalletAddress: string;
  isOpen: boolean;
  onClose: () => void;
}

export const StoryTipModal: React.FC<StoryTipModalProps> = ({
  author,
  authorWalletAddress,
  isOpen,
  onClose,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const tipAmounts = [1, 5, 10, 25];

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentSuccess(false);
      setSelectedAmount(null);
      setCustomAmount("");
      setIsPaying(false);
    }
  }, [isOpen]);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount(null);
    }
  };

  const getTipAmount = (): number | null => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) return parseFloat(customAmount);
    return null;
  };

  const handleSendTip = async () => {
    const amount = getTipAmount();
    if (!amount || amount <= 0) return;

    setIsPaying(true);

    // Simulate x402 payment flow
    // In production, this would:
    // 1. Connect to user's wallet
    // 2. Create x402 payment request
    // 3. Sign and submit USDC transaction
    // 4. Verify payment with facilitator
    // 5. Confirm on backend

    try {
      // Simulated delay for payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log(
        `Processing tip of $${amount} USDC to ${authorWalletAddress}`
      );

      setPaymentSuccess(true);
      setTimeout(() => {
        onClose();
        setSelectedAmount(null);
        setCustomAmount("");
        setPaymentSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsPaying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-xl font-bold text-black dark:text-white">
              Support {author}
            </h3>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              Send a tip with USDC on Base
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors"
            disabled={isPaying}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!paymentSuccess ? (
            <>
              {/* Preset amounts */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {tipAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAmountSelect(amount)}
                    className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                      selectedAmount === amount
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    }`}
                    disabled={isPaying}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-black/70 dark:text-white/70 mb-2">
                  Or enter custom amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50 dark:text-white/50 font-medium">
                    $
                  </span>
                  <input
                    type="text"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-neutral-100 dark:bg-neutral-800 border-2 border-transparent focus:border-emerald-500 rounded-lg text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 focus:outline-none transition-colors"
                    disabled={isPaying}
                  />
                </div>
              </div>

              {/* Wallet info */}
              <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                <p className="text-xs font-medium text-black/50 dark:text-white/50 mb-1">
                  Recipient Address
                </p>
                <p className="text-xs font-mono text-black/70 dark:text-white/70 break-all">
                  {authorWalletAddress}
                </p>
              </div>

              {/* Send button */}
              <button
                onClick={handleSendTip}
                disabled={!getTipAmount() || getTipAmount()! <= 0 || isPaying}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 text-white disabled:text-neutral-500 dark:disabled:text-neutral-400 rounded-lg font-semibold transition-all disabled:cursor-not-allowed shadow-sm"
              >
                {isPaying ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Send ${getTipAmount() ? `$${getTipAmount()} USDC` : "Tip"}`
                )}
              </button>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-black dark:text-white mb-2">
                Tip Sent!
              </h4>
              <p className="text-black/60 dark:text-white/60">
                Thank you for supporting {author}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
