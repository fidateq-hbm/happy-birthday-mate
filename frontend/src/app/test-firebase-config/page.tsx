'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';

/**
 * Diagnostic page to verify Firebase configuration
 * Access at: /test-firebase-config
 */
export default function TestFirebaseConfig() {
  const [config, setConfig] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const checkConfig = () => {
      const app = auth.app;
      const config = {
        apiKey: app.options.apiKey,
        authDomain: app.options.authDomain,
        projectId: app.options.projectId,
        storageBucket: app.options.storageBucket,
        messagingSenderId: app.options.messagingSenderId,
        appId: app.options.appId,
      };

      const newErrors: string[] = [];

      // Check each required field
      if (!config.apiKey) newErrors.push('API Key is missing');
      if (!config.authDomain) newErrors.push('Auth Domain is missing');
      if (!config.projectId) newErrors.push('Project ID is missing');
      if (!config.storageBucket) newErrors.push('Storage Bucket is missing');
      if (!config.messagingSenderId) newErrors.push('Messaging Sender ID is missing');
      if (!config.appId) newErrors.push('App ID is missing');

      // Check authDomain format
      if (config.authDomain && !config.authDomain.includes('.firebaseapp.com')) {
        newErrors.push('Auth Domain should end with .firebaseapp.com');
      }

      setConfig(config);
      setErrors(newErrors);
    };

    checkConfig();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold gradient-text mb-6">Firebase Configuration Diagnostic</h1>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <h2 className="text-red-800 font-bold mb-2">❌ Configuration Errors:</h2>
            <ul className="list-disc list-inside text-red-700">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {errors.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <h2 className="text-green-800 font-bold">✅ All configuration values are present</h2>
          </div>
        )}

        <div className="glass-effect rounded-3xl p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4">Current Configuration:</h2>
          
          {config && (
            <div className="space-y-2 font-mono text-sm">
              <div>
                <span className="font-semibold">API Key:</span>{' '}
                <span className="text-gray-600">
                  {config.apiKey ? `${config.apiKey.substring(0, 20)}...` : 'MISSING'}
                </span>
              </div>
              <div>
                <span className="font-semibold">Auth Domain:</span>{' '}
                <span className="text-gray-600">{config.authDomain || 'MISSING'}</span>
              </div>
              <div>
                <span className="font-semibold">Project ID:</span>{' '}
                <span className="text-gray-600">{config.projectId || 'MISSING'}</span>
              </div>
              <div>
                <span className="font-semibold">Storage Bucket:</span>{' '}
                <span className="text-gray-600">{config.storageBucket || 'MISSING'}</span>
              </div>
              <div>
                <span className="font-semibold">Messaging Sender ID:</span>{' '}
                <span className="text-gray-600">{config.messagingSenderId || 'MISSING'}</span>
              </div>
              <div>
                <span className="font-semibold">App ID:</span>{' '}
                <span className="text-gray-600">{config.appId || 'MISSING'}</span>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <h3 className="font-bold text-blue-900 mb-2">Firebase Console Checklist:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Authentication → Settings → Authorized domains: localhost should be listed</li>
              <li>✅ Authentication → Templates → Password reset: Expire after should be 3+ hours</li>
              <li>✅ Project Settings → General: Project ID should match above</li>
            </ul>
          </div>

          <div className="mt-4">
            <a
              href="/forgot-password"
              className="text-primary-600 hover:underline font-semibold"
            >
              Test Password Reset Flow →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

