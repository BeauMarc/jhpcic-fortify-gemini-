import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { decodeData, InsuranceData } from '../utils/codec';

type Step = 'terms' | 'verify' | 'check' | 'sign' | 'pay' | 'completed';

const ClientIndex: React.FC = () => {
  const location = useLocation();
  const [step, setStep] = useState<Step>('terms');
  const [data, setData] = useState<InsuranceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Verify State
  const [inputMobile, setInputMobile] = useState('');
  
  // Sign State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const dataParam = searchParams.get('data');
    const idParam = searchParams.get('id');

    // Scenario 1: Cloudflare Short ID
    if (idParam) {
      setIsLoading(true);
      fetch(`/api/get?id=${idParam}`)
        .then(res => {
          if (!res.ok) throw new Error("Order not found");
          return res.json();
        })
        .then((fetchedData: InsuranceData) => {
          setData(fetchedData);
          if (fetchedData.status === 'paid') setStep('completed');
        })
        .catch(err => {
          console.error(err);
          alert("无法获取保单信息，链接可能已过期或ID无效。");
        })
        .finally(() => setIsLoading(false));
    } 
    // Scenario 2: Legacy Base64 Data
    else if (dataParam) {
      const decoded = decodeData(dataParam);
      if (decoded) {
        setData(decoded);
        if (decoded.status === 'paid') {
          setStep('completed');
        }
      } else {
        alert("数据解析失败，请联系业务员重新生成链接");
      }
    }
  }, [location]);

  if (isLoading) return <div className="p-10 text-center text-gray-500 mt-20">正在从云端加载保单信息...</div>;
  if (!data) return <div className="p-4 text-center mt-20">正在加载数据...</div>;

  // --- Handlers ---
  const handleMobileVerify = () => {
    if (inputMobile === data.proposer.mobile) {
      setStep('check');
    } else {
      alert(`验证失败：手机号不匹配 (请输入 ${data.proposer.mobile})`);
    }
  };

  // Canvas Logic
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
    setHasSigned(true);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHasSigned(false);
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    const rect = canvas.getBoundingClientRect();
    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top
    };
  };

  // --- Header Component matching Style ---
  const Header = ({ title, theme = 'green' }: { title: string, theme?: 'green' | 'white' }) => (
    <header className={`${theme === 'green' ? 'bg-jh-header text-white shadow-sm' : 'bg-gray-50 text-gray-800'} h-12 flex items-center px-4 justify-between sticky top-0 z-30 transition-colors duration-300`}>
      <div className="flex items-center cursor-pointer opacity-90 hover:opacity-100">
        <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
      </div>
      <h1 className="text-lg font-medium tracking-wide absolute left-1/2 transform -translate-x-1/2">{title}</h1>
      <div className="w-6"></div> {/* Spacer for centering */}
    </header>
  );

  // --- Renders for each step ---

  // STEP 1: TERMS (Redesigned with Corporate Identity)
  if (step === 'terms') {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header title="授权登录" theme="white" />
        
        <div className="flex-1 flex flex-col p-6 animate-fade-in">
           {/* Corporate Identity / Logo Area */}
           <div className="flex flex-col items-center justify-center mb-10 mt-6">
              <div className="flex items-center justify-center">
                 {/* Graphic Logo */}
                 <div className="w-10 h-10 mr-3 relative flex items-center justify-center">
                    {/* The Green C shape */}
                     <div className="w-full h-full rounded-full border-[4px] border-jh-green border-r-transparent -rotate-45 absolute"></div>
                    {/* The Sphere */}
                     <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-200 via-gray-100 to-white shadow-inner absolute top-[9px] left-[9px]"></div>
                 </div>
                 
                 {/* Text Block */}
                 <div className="flex items-center h-10">
                    <div className="flex flex-col justify-between h-9 mr-3">
                       <span className="text-xl font-bold text-black leading-none tracking-widest font-serif">中国人寿</span>
                       <span className="text-[9px] font-bold text-black leading-none tracking-widest scale-x-105 origin-left font-sans">CHINA LIFE</span>
                    </div>
                    
                    {/* Divider */}
                    <div className="h-8 w-px bg-jh-green"></div>
                    
                    {/* Property Insurance */}
                    <div className="text-xl font-medium text-jh-green tracking-wide ml-3">
                       财产保险
                    </div>
                 </div>
              </div>
              <p className="text-xs text-gray-400 mt-10 tracking-wide">本产品由中国人寿财产保险股份有限公司承保</p>
           </div>

           {/* Divider */}
           <div className="h-px bg-gray-100 w-full mb-8"></div>

           {/* Content */}
           <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-6">温馨提示，您即将进入投保流程</h2>
              
              <div className="space-y-6 text-sm text-gray-600 leading-relaxed text-justify">
                  <p>
                    请仔细阅读
                    <span className="text-jh-header font-medium mx-1">《保险条款》</span>
                    及保险须知等内容，为保障您的权益，您在销售页面的操作将会被记录并加密储存。
                  </p>
                  
                  <p>
                    请仔细阅读
                    <span className="text-jh-header font-medium mx-1">《中国人寿财险互联网平台用户个人信息保护政策》</span>
                  </p>

                  <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-500 mt-4 border border-gray-100 flex items-start gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-jh-header mt-1.5 flex-shrink-0"></div>
                     <span className="opacity-90 leading-relaxed">点击下方按钮即表示您已阅读并同意上述协议，且确认您的个人信息真实有效。</span>
                  </div>
              </div>
           </div>

           {/* Bottom Button */}
           <div className="mt-8 mb-4">
              <button 
                onClick={() => setStep('verify')}
                className="w-full bg-jh-header text-white font-bold py-3.5 rounded-full shadow-lg hover:brightness-95 transition-all active:scale-[0.98] tracking-wider"
              >
                我已阅读并同意
              </button>
           </div>
        </div>
      </div>
    );
  }

  // --- Other Steps (Keeping content but updating Header to green) ---

  if (step === 'completed') {
    return (
      <div className="min-h-screen bg-jh-light flex flex-col">
         <Header title="投保完成" />
         <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-jh-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h1 className="text-xl font-bold text-gray-800 mb-2">支付完成</h1>
                <p className="text-sm text-gray-500 mb-6">您的保单已生成，电子保单将发送至您的手机。</p>
                <div className="bg-gray-50 p-4 rounded-lg text-left text-sm space-y-2 border border-gray-100">
                    <div className="flex justify-between"><span>车牌号</span><span className="font-medium">{data.vehicle.plate}</span></div>
                    <div className="flex justify-between"><span>投保人</span><span className="font-medium">{data.proposer.name}</span></div>
                    <div className="flex justify-between"><span>总保费</span><span className="font-bold text-red-600">¥{data.project.premium}</span></div>
                </div>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-jh-light flex flex-col pb-10">
      <Header title="新核心车险承保" />

      {/* Progress Bar (simplified) */}
      <div className="bg-white px-4 py-2 flex justify-between items-center text-xs text-gray-400 border-b border-gray-100 mb-2">
         <span className={step === 'verify' ? 'text-jh-header font-bold' : ''}>身份验证</span>
         <span className="text-gray-200">&gt;</span>
         <span className={step === 'check' ? 'text-jh-header font-bold' : ''}>信息核对</span>
         <span className="text-gray-200">&gt;</span>
         <span className={step === 'sign' ? 'text-jh-header font-bold' : ''}>签署</span>
         <span className="text-gray-200">&gt;</span>
         <span className={step === 'pay' ? 'text-jh-header font-bold' : ''}>支付</span>
      </div>

      <main className="flex-1 px-4 max-w-lg mx-auto w-full">
        
        {/* STEP 2: Verify Mobile */}
        {step === 'verify' && (
          <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in mt-4">
             <h2 className="text-lg font-bold mb-2">身份验证</h2>
             <p className="text-sm text-gray-500 mb-6">请输入投保时预留的手机号 ({data.proposer.mobile.slice(0,3)}****{data.proposer.mobile.slice(-4)})</p>
             <div className="mb-6">
                <input 
                    type="tel" 
                    value={inputMobile}
                    onChange={(e) => setInputMobile(e.target.value)}
                    placeholder="请输入11位手机号"
                    className="w-full border-b border-gray-200 py-3 text-lg outline-none focus:border-jh-green focus:border-b-2 transition-all bg-transparent"
                />
             </div>
             <button 
              onClick={handleMobileVerify}
              className="w-full bg-jh-header text-white font-bold py-3 rounded-full shadow-lg hover:brightness-95 disabled:opacity-50"
              disabled={inputMobile.length !== 11}
            >
              验证并继续
            </button>
          </div>
        )}

        {/* STEP 3: Info Check */}
        {step === 'check' && (
           <div className="space-y-4 animate-fade-in mt-2">
             <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3 text-sm">投保人信息</h3>
                <InfoRow label="名称" value={data.proposer.name} />
                <InfoRow label="证件类型" value={data.proposer.idType} />
                <InfoRow label="证件号" value={data.proposer.idCard} />
                <InfoRow label="手机号" value={data.proposer.mobile} />
                <InfoRow label="住址" value={data.proposer.address} />
             </div>

             <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3 text-sm">车辆信息</h3>
                <InfoRow label="车牌号" value={data.vehicle.plate} />
                <InfoRow label="车辆所有人" value={data.vehicle.vehicleOwner} />
                <InfoRow label="品牌型号" value={data.vehicle.brand} />
                <InfoRow label="车架号" value={data.vehicle.vin} />
                <InfoRow label="初次登记日期" value={data.vehicle.registerDate} />
                <InfoRow label="整备质量" value={data.vehicle.curbWeight} />
                <InfoRow label="核定载质量" value={data.vehicle.approvedLoad} />
             </div>

             <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3 text-sm">投保方案</h3>
                <InfoRow label="投保地区" value={data.project.region} />
                <InfoRow label="保险期间" value={data.project.period} />
                
                <div className="mt-4 border border-gray-100 rounded-lg overflow-hidden text-xs">
                    <div className="grid grid-cols-12 bg-gray-50 text-gray-700 font-bold p-2 text-center border-b border-gray-100">
                        <div className="col-span-5 text-left pl-1">投保险种</div>
                        <div className="col-span-3">保额(元)</div>
                        <div className="col-span-2">免赔</div>
                        <div className="col-span-2">保费</div>
                    </div>
                    {data.project.coverages?.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 border-b border-gray-50 p-3 items-center text-center text-gray-600 last:border-0">
                             <div className="col-span-5 text-left pl-1 font-medium text-gray-800 leading-tight">{item.name}</div>
                             <div className="col-span-3 transform scale-90">{item.amount}</div>
                             <div className="col-span-2">{item.deductible}</div>
                             <div className="col-span-2">{item.premium}</div>
                        </div>
                    ))}
                    <div className="grid grid-cols-12 bg-gray-50 p-3 text-center border-t border-gray-100">
                        <div className="col-span-8 text-right font-bold pr-2 text-gray-600">合计:</div>
                        <div className="col-span-4 font-bold text-red-600 text-sm">¥ {data.project.premium}</div>
                    </div>
                </div>
             </div>

             <button 
              onClick={() => setStep('sign')}
              className="w-full bg-jh-header text-white font-bold py-3.5 rounded-full shadow-lg hover:brightness-95 mt-4"
            >
              信息无误，去签字
            </button>
           </div>
        )}

        {/* STEP 4: Sign */}
        {step === 'sign' && (
            <div className="bg-white rounded-xl shadow-sm p-5 animate-fade-in flex flex-col h-[70vh] mt-4">
                <h2 className="text-lg font-bold mb-1">电子签名</h2>
                <p className="text-xs text-gray-400 mb-4">请在下方区域签署您的姓名</p>
                
                <div className="flex-1 border border-gray-200 rounded-xl bg-gray-50 overflow-hidden touch-none relative shadow-inner">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full"
                        width={window.innerWidth - 60}
                        height={400}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={endDrawing}
                        onMouseLeave={endDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={endDrawing}
                    />
                    {!hasSigned && <div className="absolute inset-0 flex items-center justify-center text-gray-300 pointer-events-none text-xl tracking-widest">请在此签名</div>}
                </div>

                <div className="flex gap-4 mt-6">
                    <button onClick={clearSignature} className="flex-1 bg-white border border-gray-300 text-gray-600 font-bold py-3 rounded-full shadow-sm">
                        重写
                    </button>
                    <button 
                        onClick={() => hasSigned ? setStep('pay') : alert('请先签名')}
                        className={`flex-1 font-bold py-3 rounded-full text-white shadow-lg transition-all ${hasSigned ? 'bg-jh-header hover:brightness-95' : 'bg-gray-300 cursor-not-allowed'}`}
                    >
                        确认签名
                    </button>
                </div>
            </div>
        )}

        {/* STEP 5: Pay */}
        {step === 'pay' && (
            <div className="bg-white rounded-xl shadow-sm p-8 animate-fade-in text-center mt-4">
                <h2 className="text-lg font-bold mb-6 text-gray-800">支付保费</h2>
                
                <div className="mb-8">
                   <p className="text-sm text-gray-500 mb-1">应付金额</p>
                   <p className="text-4xl font-bold text-red-600">¥ {data.project.premium}</p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-8 inline-block w-full max-w-xs">
                    <div className="flex items-center justify-center mb-4 gap-2">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">支</div>
                        <span className="font-bold text-blue-800">支付宝支付</span>
                    </div>
                    <div className="bg-white w-48 h-48 mx-auto flex items-center justify-center rounded-xl shadow-sm border border-gray-100">
                       <div className="text-center p-2">
                         <div className="text-[10px] text-gray-300 break-all leading-tight">
                            {data.payment.alipayUrl || "QR CODE AREA"}
                         </div>
                       </div>
                    </div>
                </div>

                <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-3.5 rounded-full cursor-not-allowed">
                    请扫码支付...
                </button>
            </div>
        )}

      </main>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between py-2 text-sm border-b border-gray-50 last:border-0">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-900">{value}</span>
    </div>
);

export default ClientIndex;