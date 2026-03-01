// 本地碳足迹计算器（备用）
export const calculateCarbonFootprint = (activity) => {
  const { type, amount, unit, meta } = activity;
  
  // 默认因子（简化版）
  const factors = {
    transport: { km: 250 }, // gCO2/km
    electricity: { kWh: 500 }, // gCO2/kWh
    food: { kg: 2000 }, // gCO2/kg
    purchase: { 元: 100 } // gCO2/元
  };
  
  const factor = meta?.gco2PerUnit || 
                 meta?.gco2PerKm || 
                 meta?.gco2PerKwh || 
                 meta?.gco2PerKg ||
                 factors[type]?.[unit] || 0;
  
  const kgCO2e = (parseFloat(amount) || 0) * (factor || 0) / 1000; // 转换为kg
  return parseFloat(kgCO2e.toFixed(3));
};

export const getFactorForType = (type) => {
  const factors = {
    transport: 'gCO2/km',
    electricity: 'gCO2/kWh',
    food: 'gCO2/kg',
    purchase: 'gCO2/元'
  };
  return factors[type] || 'gCO2/unit';
};