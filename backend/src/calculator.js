// Lightweight calculator copy for backend
function gramsToKg(g) { return g / 1000; }
function transportKgCO2e(km, gco2PerKm) { if (km == null || gco2PerKm == null) return 0; return gramsToKg(km * gco2PerKm); }
function electricityKgCO2e(kwh, gco2PerKwh) { if (kwh == null || gco2PerKwh == null) return 0; return gramsToKg(kwh * gco2PerKwh); }
function foodKgCO2e(kgFood, gco2PerKg) { if (kgFood == null || gco2PerKg == null) return 0; return gramsToKg(kgFood * gco2PerKg); }
function purchaseKgCO2e(amount, gco2PerCurrencyUnit) { if (amount == null || gco2PerCurrencyUnit == null) return 0; return gramsToKg(amount * gco2PerCurrencyUnit); }
function calculateActivity(activity) {
  if (!activity || !activity.type) return 0;
  switch (activity.type) {
    case 'transport': return transportKgCO2e(activity.amount, activity.meta && activity.meta.gco2PerKm);
    case 'electricity': return electricityKgCO2e(activity.amount, activity.meta && activity.meta.gco2PerKwh);
    case 'food': return foodKgCO2e(activity.amount, activity.meta && activity.meta.gco2PerKg);
    case 'purchase': return purchaseKgCO2e(activity.amount, activity.meta && activity.meta.gco2PerCurrencyUnit);
    default: return 0;
  }
}
module.exports = { transportKgCO2e, electricityKgCO2e, foodKgCO2e, purchaseKgCO2e, calculateActivity };
