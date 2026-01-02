'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { roomAPI } from '@/lib/api';
import { ArrowLeft, Calendar, Image, Archive } from 'lucide-react';
import toast from 'react-hot-toast';
import { MobileAppHeader } from '@/components/MobileAppHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';

interface WallArchiveItem {
  wall_id: number;
  public_url_code: string;
  title: string;
  theme: string;
  accent_color: string;
  birthday_year: number;
  photo_count: number;
  is_open: boolean;
  is_archived: boolean;
  created_at: string;
  opens_at: string;
  closes_at: string;
}

interface YearArchive {
  year: number;
  walls: WallArchiveItem[];
}

export default function WallArchivePage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [archive, setArchive] = useState<YearArchive[]>([]);
  const [loadingArchive, setLoadingArchive] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchArchive();
    }
  }, [user]);

  const fetchArchive = async () => {
    if (!user) return;
    
    setLoadingArchive(true);
    try {
      const response = await roomAPI.getWallArchive(user.id);
      setArchive(response.data.archive || []);
    } catch (error: any) {
      console.error('Error fetching archive:', error);
      toast.error('Failed to load archive');
    } finally {
      setLoadingArchive(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="min-h-screen">
        {/* Mobile App Header */}
        <MobileAppHeader show={isMobile} />

        {/* Desktop Header */}
        {!isMobile && (
          <header className="glass-effect border-b border-white/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
                <Archive className="w-6 h-6" />
                Birthday Wall Archive
              </h1>
            </div>
          </header>
        )}

        <div className={`${isMobile ? 'p-4 pt-20 pb-24' : 'p-4 py-8'}`}>
          <div className={`mx-auto ${isMobile ? '' : 'max-w-6xl'}`}>
            {isMobile && (
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {loadingArchive ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
              </div>
            ) : archive.length === 0 ? (
              <div className="text-center py-16">
                <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No birthday walls yet</p>
                <p className="text-gray-500 text-sm">Create your first birthday wall to start building your archive!</p>
                <button
                  onClick={() => router.push('/birthday-wall/create')}
                  className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create Birthday Wall
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {archive.map((yearGroup) => (
                  <div key={yearGroup.year} className="glass-effect rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Calendar className="w-6 h-6 text-primary-600" />
                      <h2 className="text-2xl font-bold gradient-text">{yearGroup.year}</h2>
                      <span className="text-gray-500 text-sm">
                        ({yearGroup.walls.length} {yearGroup.walls.length === 1 ? 'wall' : 'walls'})
                      </span>
                    </div>
                    
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-4`}>
                      {yearGroup.walls.map((wall) => (
                        <button
                          key={wall.wall_id}
                          onClick={() => router.push(`/birthday-wall/${wall.public_url_code}`)}
                          className="glass-effect rounded-xl p-4 hover:shadow-xl transition-all text-left border-2 border-transparent hover:border-primary-300"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-lg truncate">{wall.title}</h3>
                            {wall.is_archived && (
                              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                                Archived
                              </span>
                            )}
                            {wall.is_open && !wall.is_archived && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                            <Image className="w-4 h-4" />
                            <span>{wall.photo_count} {wall.photo_count === 1 ? 'photo' : 'photos'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: wall.accent_color }}
                            />
                            <span className="text-xs text-gray-500 capitalize">{wall.theme}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav show={isMobile && !!user} />
      </div>
    </AuthProvider>
  );
}

