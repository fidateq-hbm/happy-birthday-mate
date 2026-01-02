'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import { auth, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import { Upload, User, Calendar, MapPin, Check } from 'lucide-react';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';
import { getTribeId } from '@/utils/dates';

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
  'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain',
  'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria',
  'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada',
  'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
  'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica',
  'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji',
  'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece',
  'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras',
  'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
  'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon',
  'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
  'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia',
  'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea',
  'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama',
  'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
  'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore',
  'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea',
  'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland',
  'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia',
  'Zimbabwe'
];

export default function OnboardingPage() {
  const router = useRouter();
  const { firebaseUser, user, setFirebaseUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [firstName, setFirstName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'prefer_not_to_say'>('prefer_not_to_say');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    if (!firebaseUser) {
      router.push('/login');
    }
    if (user) {
      router.push('/dashboard');
    }
  }, [firebaseUser, user, router]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async (): Promise<string> => {
    if (!profilePicture || !firebaseUser) {
      // Return fallback avatar if no picture selected
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName || 'User')}&background=6366f1&color=fff&size=200&bold=true`;
    }

    // Upload to Firebase Storage during onboarding (before user exists in backend)
    // After signup, profile picture updates can use the backend endpoint
    try {
      const storageRef = ref(storage, `profile_pictures/${firebaseUser.uid}/${Date.now()}_${profilePicture.name}`);
      await uploadBytes(storageRef, profilePicture);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Upload error:', error);
      // If upload fails, use fallback avatar instead of blocking onboarding
      console.warn('Profile picture upload failed, using fallback avatar');
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName || 'User')}&background=6366f1&color=fff&size=200&bold=true`;
    }
  };

  const handleSubmit = async () => {
    if (!firebaseUser) return;

    setLoading(true);

    try {
      // Upload profile picture (with fallback if it fails)
      let profilePictureUrl: string;
      try {
        profilePictureUrl = await uploadProfilePicture();
      } catch (uploadError) {
        // If upload fails, use fallback avatar
        console.warn('Profile picture upload failed, using fallback:', uploadError);
        profilePictureUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName || 'User')}&background=6366f1&color=fff&size=200&bold=true`;
      }

      // Submit to backend
      const response = await authAPI.signup({
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email!,
        first_name: firstName,
        date_of_birth: dateOfBirth,
        gender,
        country,
        state,
        city: city || undefined,
        profile_picture_url: profilePictureUrl,
        consent_given: consentGiven,
      });

      toast.success('Welcome to Happy Birthday Mate! 🎉');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.response?.data?.detail || error.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = firstName && dateOfBirth && gender; // Profile picture is optional
  const canProceedStep2 = country && state;
  const canSubmit = canProceedStep1 && canProceedStep2 && consentGiven;

  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Email Verification Banner */}
          {firebaseUser && !firebaseUser.emailVerified && (
            <EmailVerificationBanner
              userEmail={firebaseUser.email || ''}
              emailVerified={firebaseUser.emailVerified}
              onVerificationCheck={async () => {
                // Reload Firebase user to get latest verification status
                if (firebaseUser) {
                  await firebaseUser.reload();
                  setFirebaseUser(firebaseUser);
                }
              }}
            />
          )}
          
          <div className="glass-effect rounded-3xl p-8">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Step {step} of 3
                </span>
                <span className="text-sm font-medium text-primary-600">
                  {Math.round((step / 3) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="celebration-gradient h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold gradient-text">Let's Get to Know You!</h2>
                  <p className="text-gray-600 mt-2">We need a few details to personalize your experience</p>
                </div>

                {/* Profile Picture */}
                <div className="flex flex-col items-center">
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    Profile Picture (Optional)
                  </label>
                  <p className="text-xs text-gray-500 mb-4 text-center">
                    Your photo helps your birthday mates recognize and connect with you
                  </p>
                  <div className="relative">
                    {profilePicturePreview ? (
                      <img
                        src={profilePicturePreview}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary-400"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-dashed border-gray-300">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                      <Upload className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {!profilePicture && (
                    <p className="text-xs text-gray-500 mt-2">You can add a profile picture later in settings</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {dateOfBirth && (
                    <p className="text-sm text-primary-600 mt-2">
                      🎉 You'll be in tribe: {getTribeId(dateOfBirth)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setGender(option.value as any)}
                        className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                          gender === option.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="w-full celebration-gradient text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold gradient-text">Where Are You From?</h2>
                  <p className="text-gray-600 mt-2">Help us connect you with nearby celebrants</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select a country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="California"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City (Optional)
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Los Angeles"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 font-semibold py-3 rounded-xl transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                    className="flex-1 celebration-gradient text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Consent */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold gradient-text">Almost There!</h2>
                  <p className="text-gray-600 mt-2">Just need your consent to get started</p>
                </div>

                <div className="glass-effect rounded-2xl p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Privacy & Data Usage</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Your data is used only to enhance your birthday celebration experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>You can delete your account and data at any time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>GDPR compliant with full transparency</span>
                    </li>
                  </ul>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the Terms of Service and Privacy Policy. I consent to my data being used 
                    as described above to provide me with the Happy Birthday Mate experience.
                  </span>
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || loading}
                    className="flex-1 celebration-gradient text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Creating your account...' : 'Complete Setup 🎉'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}

