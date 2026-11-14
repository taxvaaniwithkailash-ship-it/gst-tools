// Run: node test.js
const setoff = require('./gst-setoff.js');
let pass = 0, fail = 0;
function eq(name, got, exp) { if (Math.abs(got - exp) < 0.01) pass++; else { fail++; console.log('FAIL', name, 'got', got, 'expected', exp); } }
const z = { I: 0, C: 0, S: 0, X: 0 };

// 1. Worked example: IGST credit first, balance where own credit falls short
let r = setoff({ liab: { I: 100000, C: 60000, S: 60000, X: 0 }, rcm: { I: 0, C: 2000, S: 2000, X: 0 }, itc: { I: 130000, C: 25000, S: 45000, X: 0 } });
eq('ex cash total', r.cashTotal, 24000); eq('ex CGST cash', r.rows.C.cash, 7000); eq('ex SGST cash', r.rows.S.cash, 17000); eq('ex IGST cash', r.rows.I.cash, 0);

// 2. CGST credit can never pay SGST (s.49(5)(c)/(d))
r = setoff({ liab: { I: 0, C: 0, S: 10000, X: 0 }, rcm: z, itc: { I: 0, C: 50000, S: 0, X: 0 } });
eq('no C->S cash', r.rows.S.cash, 10000); eq('no C->S carry', r.rows.C.carry, 50000);

// 3. CGST/SGST credit pays IGST only after IGST credit is exhausted (Rule 88A)
r = setoff({ liab: { I: 30000, C: 0, S: 0, X: 0 }, rcm: z, itc: { I: 10000, C: 15000, S: 15000, X: 0 } });
eq('C/S->I cash', r.rows.I.cash, 0); eq('C used for I', r.rows.I.byC, 15000); eq('S used for I', r.rows.I.byS, 5000);

// 4. Reverse charge tax always in cash
r = setoff({ liab: z, rcm: { I: 5000, C: 0, S: 0, X: 0 }, itc: { I: 99999, C: 0, S: 0, X: 0 } });
eq('rcm cash', r.rows.I.cash, 5000);

// 5. Cess credit only against cess
r = setoff({ liab: { I: 1000, C: 0, S: 0, X: 0 }, rcm: z, itc: { I: 0, C: 0, S: 0, X: 5000 } });
eq('cess not for IGST', r.rows.I.cash, 1000);

// 6. Rule 86B: at least 1% in cash
r = setoff({ liab: { I: 0, C: 500000, S: 500000, X: 0 }, rcm: z, itc: { I: 0, C: 600000, S: 600000, X: 0 }, r86b: true });
eq('86B min cash', r.cashTotal, 10000);

// 7. Interest at 18% p.a. on cash for days of delay (s.50)
r = setoff({ liab: { I: 36500, C: 0, S: 0, X: 0 }, rcm: z, itc: z, days: 10 });
eq('interest', r.interest, 180);

console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
