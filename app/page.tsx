'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Call = dynamic(() => import('../components/Call'), {
  ssr: false,
});
import { AlertCircle, CheckCircle, Loader2, Video, Lock } from 'lucide-react';

export default function Page() {
  const searchParams = useSearchParams();
  const channelName = searchParams.get('booking');
  const token = searchParams.get('ref');
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!channelName) {
      setIsLoading(false);
      setError('Missing channel name');
      return;
    }

    if (!token) {
      setIsLoading(false);
      setIsTokenValid(false);
      setError('Missing access token');
      return;
    }

    if (!appId) {
      setIsLoading(false);
      setError('Server configuration error');
      return;
    }

    // Validate token
    fetch(`https://taskimony.com/api/validate-meeting-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
      mode: 'cors'
    })
      .then(res => {
        setIsLoading(false);
        if (res.ok) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
          setError('Invalid or expired meeting token');
        }
      })
      .catch(() => {
        setIsLoading(false);
        setIsTokenValid(false);
        setError('Failed to validate access token');
      });
  }, [token, channelName, appId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 mx-auto bg-white rounded-lg shadow-md">
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Connecting to meeting</h2>
            <p className="text-gray-600 text-center">
              Validating your access credentials...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Missing channel name
  if (!channelName) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 mx-auto bg-white rounded-lg shadow-md">
          <div className="flex flex-col items-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Meeting Not Found</h2>
            <p className="text-gray-600 text-center mb-6">
              No meeting channel was specified. Please check your meeting link and try again.
            </p>
            <a
              href="https://taskimony.com"
              className="px-4 py-2 font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // App ID missing
  if (!appId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 mx-auto bg-white rounded-lg shadow-md">
          <div className="flex flex-col items-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Configuration Error</h2>
            <p className="text-gray-600 text-center">
              The meeting service is not properly configured. Please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token
  if (isTokenValid === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 mx-auto bg-white rounded-lg shadow-md border-t-4 border-red-500">
          <div className="flex flex-col items-center">
            <Lock className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 text-center mb-2">
              {error || 'Invalid or expired meeting token'}
            </p>
            <p className="text-gray-500 text-sm text-center mb-6">
              You need a valid access token to join this meeting
            </p>
            <div className="flex space-x-4">
              <a
                href="https://taskimony.com"
                className="px-4 py-2 font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Return to Home
              </a>
              <a
                href="/support"
                className="px-4 py-2 font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Get Help
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Valid token and channel - render the call
  return (
    <main className="flex w-full flex-col">
      <div className="bg-blue-600 py-3 px-6 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Video className="h-6 w-6 text-white mr-2" />
            <h1 className="text-xl font-semibold text-white">{channelName}</h1>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-4 h-4 mr-1" />
              Connected
            </span>
          </div>
        </div>
      </div>

      <Call
        appId={appId}
        channelName={channelName}
        ref={token}
      />
    </main>
  );
}