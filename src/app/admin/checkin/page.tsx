"use client";

import { useState, useEffect, useCallback } from "react";

interface CheckInData {
  memberId: string;
  memberName: string;
  checkInTime: Date;
  membershipType: string;
  remainingSessions: number;
}

interface ScanResult {
  success: boolean;
  message: string;
  data?: CheckInData;
}

export default function CheckInPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [scanLinePosition, setScanLinePosition] = useState(0);

  // Simulate QR scan line animation
  useEffect(() => {
    if (!isScanning) return;

    const animationFrame = requestAnimationFrame(function animate() {
      setScanLinePosition((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [isScanning]);

  const handleScan = useCallback(() => {
    // Simulate scanning a QR code
    setIsScanning(true);
    setLastScanResult(null);
    setShowConfirmation(false);

    // Simulate scan delay
    setTimeout(() => {
      setIsScanning(false);

      // Simulate successful scan with random member data
      const mockMembers = [
        { memberId: "MBR-001", memberName: "John Smith", membershipType: "Premium", remainingSessions: 12 },
        { memberId: "MBR-002", memberName: "Sarah Johnson", membershipType: "Standard", remainingSessions: 8 },
        { memberId: "MBR-003", memberName: "Mike Davis", membershipType: "Basic", remainingSessions: 4 },
        { memberId: "MBR-004", memberName: "Emily Brown", membershipType: "Premium", remainingSessions: 24 },
      ];

      const randomMember = mockMembers[Math.floor(Math.random() * mockMembers.length)];

      const result: ScanResult = {
        success: true,
        message: "Member verified successfully!",
        data: {
          ...randomMember,
          checkInTime: new Date(),
        },
      };

      setLastScanResult(result);
      setShowConfirmation(true);
    }, 2500);
  }, []);

  const handleManualEntry = () => {
    // Simulate manual entry
    setIsScanning(false);
    const result: ScanResult = {
      success: true,
      message: "Manual check-in successful!",
      data: {
        memberId: "MBR-005",
        memberName: "Guest Pass - David Wilson",
        membershipType: "Day Pass",
        remainingSessions: 1,
        checkInTime: new Date(),
      },
    };
    setLastScanResult(result);
    setShowConfirmation(true);
  };

  const resetScanner = () => {
    setShowConfirmation(false);
    setLastScanResult(null);
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">QR Check-In</h1>
          <p className="text-gray-400 text-center">
            Scan member QR code or enter manually
          </p>
        </div>

        {/* Scanner Area */}
        <div className="relative mb-8">
          <div
            className={`relative w-72 h-72 mx-auto bg-black rounded-2xl overflow-hidden border-4 transition-colors ${
              isScanning ? "border-green-500" : "border-gray-700"
            }`}
          >
            {/* Corner markers */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-green-500" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-green-500" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-green-500" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-green-500" />

            {/* Scan area */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isScanning ? (
                <>
                  {/* Animated scan line */}
                  <div
                    className="absolute left-4 right-4 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent"
                    style={{ top: `${scanLinePosition}%` }}
                  />
                  <div className="text-green-400 text-lg font-medium animate-pulse">
                    Scanning...
                  </div>
                </>
              ) : showConfirmation && lastScanResult?.success ? (
                <div className="text-green-400 text-8xl">✓</div>
              ) : (
                <div className="text-gray-600 text-6xl">📷</div>
              )}
            </div>
          </div>

          {/* Status indicator */}
          <div className="mt-4 text-center">
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                isScanning
                  ? "bg-green-500/20 text-green-400"
                  : showConfirmation
                  ? "bg-green-500/20 text-green-400"
                  : "bg-gray-700/50 text-gray-400"
              }`}
            >
              {isScanning
                ? "● Scanning"
                : showConfirmation
                ? "✓ Check-in Complete"
                : "○ Ready to Scan"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors flex items-center gap-2"
          >
            <span className="text-xl">{isScanning ? "⏳" : "📱"}</span>
            {isScanning ? "Scanning..." : "Scan QR Code"}
          </button>

          <button
            onClick={handleManualEntry}
            disabled={isScanning}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors flex items-center gap-2"
          >
            <span className="text-xl">✏️</span>
            Manual Entry
          </button>
        </div>

        {/* Confirmation Card */}
        {showConfirmation && lastScanResult?.data && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-green-500/30 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">
                Check-In Successful!
              </h2>
              <p className="text-gray-400">
                {lastScanResult.data.checkInTime.toLocaleTimeString()}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-900/50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Member ID</p>
                    <p className="text-lg font-semibold">{lastScanResult.data.memberId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Membership</p>
                    <p className="text-lg font-semibold">{lastScanResult.data.membershipType}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-sm mb-1">Member Name</p>
                    <p className="text-xl font-bold">{lastScanResult.data.memberName}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-sm mb-1">Remaining Sessions</p>
                    <p className="text-2xl font-bold text-green-400">
                      {lastScanResult.data.remainingSessions}
                    </p>
                  </div>
                </div>
              </div>

              {/* Receipt-style footer */}
              <div className="border-t border-dashed border-gray-600 pt-4 text-center">
                <p className="text-gray-500 text-sm">
                  Welcome to the gym! Have a great workout!
                </p>
              </div>
            </div>

            <button
              onClick={resetScanner}
              className="w-full mt-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-colors"
            >
              New Check-In
            </button>
          </div>
        )}

        {/* Recent Check-ins (Demo) */}
        {!showConfirmation && (
          <div className="bg-gray-800/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Check-ins Today</h3>
            <div className="space-y-3">
              {[
                { name: "Alice Cooper", time: "09:15 AM", type: "Premium" },
                { name: "Bob Martin", time: "09:30 AM", type: "Standard" },
                { name: "Carol White", time: "09:45 AM", type: "Basic" },
              ].map((checkin, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <span className="text-green-400 font-bold">
                        {checkin.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{checkin.name}</p>
                      <p className="text-sm text-gray-500">{checkin.time}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                    {checkin.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}