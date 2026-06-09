'use client';

import { useState, useRef, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { registerMemberAction } from '@/app/actions/user';
import { UserPlus, Mail, Phone, User, CheckCircle, Camera, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function NewMemberPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const [activeGymId, setActiveGymId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!user) return;
      
      let gId = user.gymId;
      if (user.role === 'Owner' && !gId) {
        // Fetch owner's gym, handle multiple rows just in case
        const { data } = await supabase.from('gyms').select('id').eq('owner_id', user.id).limit(1).single();
        if (data) gId = data.id;
      }
      
      // Fallback: if owner doesn't have a gym assigned yet or owner_id doesn't match
      if (!gId) {
        const { data: firstGym } = await supabase.from('gyms').select('id').limit(1).single();
        if (firstGym) gId = firstGym.id;
      }
      
      setActiveGymId(gId || null);
    };
    init();
  }, [user]);

  // Start camera on mount, stop when component unmounts
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Gagal mengakses kamera. Pastikan browser memiliki izin.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Target resolution 400x400
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Crop center
        const minDim = Math.min(video.videoWidth, video.videoHeight);
        const startX = (video.videoWidth - minDim) / 2;
        const startY = (video.videoHeight - minDim) / 2;
        
        ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, 400, 400);
        // Compress to JPEG 70% quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setPhotoBase64(dataUrl);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setPhotoBase64(null);
    startCamera();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeGymId) {
      setError("Gym ID tidak ditemukan. Pastikan akun ini terkait dengan sebuah Gym.");
      return;
    }
    
    if (!photoBase64) {
      setError("Silakan ambil foto wajah member terlebih dahulu!");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.append('gymId', activeGymId);
    formData.append('photoBase64', photoBase64);
    
    const result = await registerMemberAction(formData);
    
    setLoading(false);
    
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push(user?.role === 'Owner' ? '/owner/member' : '/admin/member');
      }, 2000);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Owner']}>
      <div className="p-4 pb-28 md:p-[48px] max-w-[1200px] mx-auto min-h-screen bg-[var(--color-canvas)] text-white">
        <DashboardHeader />
        
        <div className="max-w-[600px] mx-auto mt-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
              <UserPlus className="text-[var(--color-primary)]" size={28} />
              Daftar Member Baru
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Member yang didaftarkan akan mendapatkan <strong className="text-white">password acak</strong> yang unik.
            </p>
          </div>

          {success ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Member Berhasil Didaftarkan!</h2>
              <p className="text-green-200/70 mb-6">Mengarahkan kembali ke daftar member...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl">
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                
                {/* Webcam Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Foto Wajah Member</label>
                  <div className="bg-[var(--color-surface-2)] border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-4">
                    
                    {/* Hidden canvas for image processing */}
                    <canvas ref={canvasRef} className="hidden" />

                    {!photoBase64 ? (
                      <>
                        <div className="w-48 h-48 bg-black rounded-full overflow-hidden border-2 border-[var(--color-primary)]/50 relative flex items-center justify-center">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`}
                          />
                          {!cameraActive && (
                            <div className="text-center p-4">
                              <Camera className="mx-auto mb-2 text-gray-500" size={32} />
                              <span className="text-xs text-gray-500">Kamera Nonaktif</span>
                            </div>
                          )}
                        </div>
                        
                        {cameraActive ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={capturePhoto}
                              className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] transition shadow-lg"
                            >
                              Jepret Foto
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={startCamera}
                            className="px-6 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg text-sm font-medium flex items-center gap-2 transition"
                          >
                            <Camera size={16} /> Nyalakan Kamera
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] relative">
                          <img src={photoBase64} alt="Hasil foto" className="w-full h-full object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={retakePhoto}
                          className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-white/5 rounded-lg text-sm font-medium flex items-center gap-2 transition"
                        >
                          <RefreshCcw size={16} /> Foto Ulang
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nama Lengkap</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-500" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full bg-[var(--color-surface-2)] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors"
                      placeholder="Contoh: Budi Santoso"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-300">Email</label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomString = Math.random().toString(36).substring(2, 6) + Date.now().toString(36).substring(4);
                        const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
                        if (emailInput) {
                          emailInput.value = `member_${randomString}@gaulgym.com`;
                        }
                      }}
                      className="text-xs bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-3 py-1 rounded-full hover:bg-[var(--color-primary)] hover:text-white transition-all flex items-center gap-1"
                    >
                      <RefreshCcw size={12} />
                      Random Email
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-500" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full bg-[var(--color-surface-2)] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors"
                      placeholder="Contoh: budi@gmail.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">No. WhatsApp</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={18} className="text-gray-500" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full bg-[var(--color-surface-2)] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors"
                      placeholder="Contoh: 08123456789"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-4 border-t border-white/5 pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 rounded-xl font-medium text-gray-300 hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    'Daftarkan Member'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
