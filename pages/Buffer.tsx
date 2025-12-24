import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Buffer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  const dataParam = searchParams.get('data');
  const idParam = searchParams.get('id');

  useEffect(() => {
    if (!dataParam && !idParam) {
       // Ideally we might want to show an error state here instead of alerting
       // but for now we keep the logic simple.
       return;
    }

    const timer = setTimeout(() => {
      if (idParam) {
        navigate(`/index?id=${idParam}`);
      } else {
        navigate(`/index?data=${dataParam}`);
      }
    }, 4000); 

    return () => clearTimeout(timer);
  }, [dataParam, idParam, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      {/* Header - Refined for Modern Clean Look */}
      <header className="bg-jh-header text-white h-12 flex items-center justify-between px-4 shadow-sm z-50 sticky top-0">
        <div className="w-10 flex items-center justify-start cursor-pointer opacity-90 hover:opacity-100 active:scale-95 transition-transform">
           {/* Back Icon */}
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </div>
        
        <h1 className="text-lg font-medium tracking-wide flex-1 text-center truncate px-2">授权登录</h1>
        
        <div className="w-10 flex items-center justify-end cursor-pointer opacity-90 hover:opacity-100">
           {/* Menu/More Icon */}
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 -mt-12">
        
        {/* Modern Loading Indicator */}
        <div className="mb-12 relative">
           {/* Outer Ring Spinner */}
           <div className="w-14 h-14 border-[3px] border-gray-200 border-t-jh-header rounded-full animate-spin"></div>
           
           {/* Inner Brand Dot Pulse */}
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-jh-header rounded-full animate-pulse"></div>
           </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-4 max-w-xs mx-auto">
            <h2 className="text-gray-800 font-bold text-lg">
              正在安全跳转
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              您正在进入由中国人寿财产保险股份有限公司提供的服务页面，请稍候...
            </p>
        </div>

        {/* Secure Badge */}
        <div className="mt-16 flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
           <span className="font-medium">平台已加密保护</span>
        </div>

      </div>

      {/* Footer */}
      <div className="pb-8 text-center px-6">
         <div className="flex items-center justify-center gap-2 mb-2 opacity-50 grayscale">
             {/* Simple visual placeholder for logo if image not available */}
             <div className="w-4 h-4 rounded-full border border-gray-400"></div>
             <span className="text-xs font-serif font-bold text-gray-400">中国人寿财险</span>
         </div>
         <p className="text-[10px] text-gray-300">Copyright © China Life Property & Casualty Insurance Company Limited</p>
      </div>
    </div>
  );
};

export default Buffer;