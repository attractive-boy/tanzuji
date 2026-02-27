const assert = require('assert');
const calc = require('../src/calculator');

function nearlyEqual(a,b,eps=1e-6){ return Math.abs(a-b) < eps; }

// Transport test: 10 km, 150 g/km -> 1.5 kg
const t1 = calc.transportKgCO2e(10,150);
assert(nearlyEqual(t1,1.5), `transport test failed: got ${t1}`);

// Electricity test: 2 kWh, 500 g/kWh -> 1.0 kg
const e1 = calc.electricityKgCO2e(2,500);
assert(nearlyEqual(e1,1.0), `electricity test failed: got ${e1}`);

// Food test: 0.25 kg (a portion), 6000 g/kg (beef) -> 1.5 kg
const f1 = calc.foodKgCO2e(0.25,6000);
assert(nearlyEqual(f1,1.5), `food test failed: got ${f1}`);

// Purchase test: $10, 500 g per currency -> 5.0 kg
const p1 = calc.purchaseKgCO2e(10,500);
assert(nearlyEqual(p1,5.0), `purchase test failed: got ${p1}`);

// Generic activity wrapper
const a1 = calc.calculateActivity({type:'transport', amount:5, meta:{gco2PerKm:200}});
assert(nearlyEqual(a1,1.0), `generic transport wrapper failed: got ${a1}`);

console.log('All tests passed');
