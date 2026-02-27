// Simple activity-to-CO2e calculator (units: gCO2e unless noted)

function gramsToKg(g) { return g / 1000; }

// Transport: accept km and gCO2e_per_km (g/km). returns kgCO2e
function transportKgCO2e(km, gco2PerKm) {
  if (km == null || gco2PerKm == null) return 0;
  return gramsToKg(km * gco2PerKm);
}

// Electricity: kWh and gCO2e_per_kWh
function electricityKgCO2e(kwh, gco2PerKwh) {
  if (kwh == null || gco2PerKwh == null) return 0;
  return gramsToKg(kwh * gco2PerKwh);
}

// Food: kg of food * gCO2e per kg
function foodKgCO2e(kgFood, gco2PerKg) {
  if (kgFood == null || gco2PerKg == null) return 0;
  return gramsToKg(kgFood * gco2PerKg);
}

// Purchases: simple spend-based multiplier (gCO2e per currency unit)
function purchaseKgCO2e(amount, gco2PerCurrencyUnit) {
  if (amount == null || gco2PerCurrencyUnit == null) return 0;
  return gramsToKg(amount * gco2PerCurrencyUnit);
}

// Generic activity calculation with minimal schema support
// activity: {type, amount, unit, meta}
// returns kgCO2e
function calculateActivity(activity) {
  if (!activity || !activity.type) return 0;
  switch (activity.type) {
    case 'transport':
      // meta: gco2PerKm
      return transportKgCO2e(activity.amount, activity.meta && activity.meta.gco2PerKm);
    case 'electricity':
      // amount in kWh, meta.gco2PerKwh
      return electricityKgCO2e(activity.amount, activity.meta && activity.meta.gco2PerKwh);
    case 'food':
      // amount in kg, meta.gco2PerKg
      return foodKgCO2e(activity.amount, activity.meta && activity.meta.gco2PerKg);
    case 'purchase':
      // amount in currency, meta.gco2PerCurrencyUnit
      return purchaseKgCO2e(activity.amount, activity.meta && activity.meta.gco2PerCurrencyUnit);
    default:
      return 0;
  }
}

module.exports = {
  transportKgCO2e,
  electricityKgCO2e,
  foodKgCO2e,
  purchaseKgCO2e,
  calculateActivity
};
