import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white p-6 font-sans">
      <div className="max-w-2xl w-full text-center space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Readme Widget is Live
          </h1>
          <p className="text-slate-400 text-lg">
            The API endpoint is active and serving dynamic SVGs.
          </p>
        </div>

        {/* Live Preview Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-2 overflow-hidden">
             {/* We point to the local API to show it working */}
            <img 
              src="/api/badge?name=Visitor&tagline=Welcome+to+my+API&theme=blue" 
              alt="Live Preview" 
              className="w-full rounded-lg"
            />
          </div>
          <p className="mt-4 text-sm text-slate-500">
            👆 This image is being generated live by your <code>/api/badge</code> route.
          </p>
        </div>

        {/* Usage Guide */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-left">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            How to use in GitHub
          </h3>
          <div className="bg-black rounded-lg p-4 overflow-x-auto">
            <code className="text-sm font-mono text-green-400 whitespace-nowrap">
              ![Widget](https://my-readme-widget.vercel.app/api/badge?name=YourName&theme=blue)
            </code>
          </div>
        </div>

      </div>
    </div>
  );
}
