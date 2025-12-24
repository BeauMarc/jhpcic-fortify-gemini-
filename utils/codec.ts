/**
 * Base64 Encoding/Decoding with UTF-8 support to handle Chinese characters correctly.
 * This is crucial for the "Data via URL" architecture.
 */

export const encodeData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    // encodeURIComponent escapes all characters except the following: alphabetic, decimal digits, - _ . ! ~ * ' ( )
    // unescape is deprecated but necessary for the btoa hack with utf8
    return btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
      }));
  } catch (e) {
    console.error("Encoding error", e);
    return "";
  }
};

export const decodeData = (base64: string): any => {
  try {
    const jsonString = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Decoding error", e);
    return null;
  }
};

// Types for Coverage Items
export interface CoverageItem {
  name: string;       // 投保险种
  amount: string;     // 保险金额/责任限额
  deductible: string; // 绝对免赔率
  premium: string;    // 保险费
}

// Types for our Insurance Data
export interface InsuranceData {
  orderId: string;
  status: 'pending' | 'paid';
  proposer: {
    name: string;
    idType: string; // Added: 证件类型
    idCard: string; // Renamed label to 证件号
    mobile: string;
    address: string; // Added: 住址
  };
  insured: {
    name: string;
    idType: string; // Added: 证件类型
    idCard: string; // Renamed label to 证件号
    mobile: string;
    address: string; // Added: 住址
  };
  vehicle: {
    plate: string;
    vin: string;
    engineNo: string;
    brand: string;
    vehicleOwner: string; // Added: 机动车辆所有人
    registerDate: string; // Added: 初次登记日期
    curbWeight: string;   // Added: 整备质量
    approvedLoad: string; // Added: 核定载质量
  };
  project: {
    region: string;
    period: string;
    premium: string; // Total Premium
    coverages: CoverageItem[]; // Structured coverage list
  };
  payment: {
    alipayUrl: string;
    wechatUrl: string;
  };
  signature?: string; // Base64 image
}