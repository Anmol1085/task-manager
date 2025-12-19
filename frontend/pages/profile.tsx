import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (res.ok) {
          const user = await res.json();
          if (mounted) {
            setName(user.name || '');
            setAge(user.age ? String(user.age) : '');
            setProfilePicture(user.profilePicture);
          }
        } else {
          if (mounted) router.push('/login');
          return; // Don't turn off loading if redirecting
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        if (mounted) router.push('/login');
        return;
      }
      if (mounted) setLoading(false);
    })();

    return () => { mounted = false; };
  }, [router, router.isReady]);

  const saveProfile = async (newName: string, newPic: string | null) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          profilePicture: newPic,
          age: age ? parseInt(age) : null
        })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Failed to save');
      } else {
        // Update local state to match confirmed saved data
        const user = await res.json();
        setName(user.name);
        setAge(user.age ? String(user.age) : '');
        setProfilePicture(user.profilePicture);
        // Notify other components (Header)
        window.dispatchEvent(new Event('user-updated'));
        alert('Profile updated!');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => saveProfile(name, profilePicture);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/auth/me', { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        window.location.href = '/login';
      } else {
        setError('Failed to delete account');
        setDeleting(false);
      }
    } catch {
      setError('Network error during deletion');
      setDeleting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    setSaving(true);
    try {
      // Note: We use the proxy '/api/auth/...' but we also need a proxy for upload. 
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      // Use the Next.js proxy to handle cookies correctly (Same Origin)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
        // No headers needed, browser sets Content-Type boundary
      });

      if (res.ok) {
        const data = await res.json();
        const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || `http://${currentHostname}:5001`;
        const fullUrl = `${backendUrl}${data.url}`;
        // Automatically save the new profile picture
        await saveProfile(name, fullUrl);
      } else {
        setError('Image upload failed');
      }
    } catch (err) {
      console.error(err);
      setError('Image upload failed');
    } finally {
      // The saveProfile function already sets setSaving(false)
      // if it was called. If saveProfile was not called due to an
      // upload error, we need to ensure saving is turned off here.
      // However, saveProfile itself sets setSaving(true) and then false.
      // To avoid double setting, we can remove the finally here and
      // ensure saveProfile's finally handles it, or ensure this finally
      // only runs if saveProfile wasn't called.
      // For simplicity and to avoid nested logic, we'll let saveProfile
      // manage the final setSaving(false) if it's called.
      // If an error occurs before saveProfile, this finally will catch it.
      if (saving) { // Only set to false if it's still true from this function's initial set
        setSaving(false);
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="animate-pulse flex space-x-4">
        <div className="h-12 w-12 bg-white/10 rounded-full"></div>
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 items-center flex justify-between">
          <h1 className="text-3xl font-bold text-slate-800">Your Profile</h1>
          <button onClick={() => router.push('/')} className="text-sm text-slate-500 hover:text-emerald-700 transition-colors font-medium">
            &larr; Back to Dashboard
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="glass-card overflow-hidden"
        >
          <div className="p-8">
            <div className="flex items-center space-x-6 mb-8">
              <div className="relative group cursor-pointer">
                <div className="h-20 w-20 rounded-full border-2 border-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold overflow-hidden bg-emerald-50 relative z-10">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    name ? name.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <div className="absolute inset-0 bg-emerald-200/50 rounded-full filter blur-md group-hover:blur-lg transition-all"></div>

                <label className="absolute bottom-0 right-0 bg-emerald-600 rounded-full p-1.5 cursor-pointer hover:bg-emerald-500 transition-colors z-20 shadow-sm border border-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              <div>
                <h2 className="text-xl font-medium text-slate-800">{name || 'User'}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-slate-500 text-sm">Customize your digital identity</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">Display Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-primary bg-white focus:bg-white text-slate-800 border-slate-200"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="input-primary bg-white focus:bg-white text-slate-800 border-slate-200"
                  placeholder="Enter your age"
                />
              </div>

              {error && <div className="text-red-300 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</div>}

              <div className="pt-4 flex items-center justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary w-full sm:w-auto"
                >
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <h3 className="text-red-500 font-medium mb-2">Danger Zone</h3>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="px-4 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm"
                >
                  Delete Account
                </button>
              ) : (
                <div className="flex items-center gap-3 animate-fadeIn">
                  <p className="text-sm text-red-300">Are you sure? This cannot be undone.</p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium shadow-lg shadow-red-900/20"
                  >
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-2 text-stone-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div >
    </div >
  );
}
