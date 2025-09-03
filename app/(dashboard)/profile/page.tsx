'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserData(data.user);
      }
    };

    fetchUserData();
  }, [supabase.auth]);

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          This is a client-side protected page using the WithAuth component
        </div>
      </div>
      
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your Profile</h2>
        
        {userData ? (
          <>
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              <div className="font-semibold">Email:</div>
              <div>{userData.email}</div>
              
              <div className="font-semibold">User ID:</div>
              <div className="break-all">{userData.id}</div>
              
              <div className="font-semibold">Role:</div>
              <div>{userData.user_metadata?.role || 'No role assigned'}</div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-bold text-xl mb-2">Full User Data</h3>
              <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
          </>
        ) : (
          <p>Loading user data...</p>
        )}
      </div>
    </div>
  );
}