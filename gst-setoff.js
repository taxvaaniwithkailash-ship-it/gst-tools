/* GST liability set-off engine - Section 49, 49A, 49B CGST Act; Rules 86B and 88A CGST Rules.
   Heads: I = IGST, C = CGST, S = SGST/UTGST, X = Compensation cess. Amounts in rupees. */
(function (g) {
  var H = ['I', 'C', 'S', 'X'];
  function r2(v) { return Math.round((+v || 0) * 100) / 100; }
  function setoff(inp) {
    var L = {}, cr = {}, rcm = {}, used = {}, steps = [];
    H.forEach(function (h) {
      L[h] = Math.max(0, r2(inp.liab[h])); cr[h] = Math.max(0, r2(inp.itc[h])); rcm[h] = Math.max(0, r2(inp.rcm[h]));
      used[h] = { I: 0, C: 0, S: 0, X: 0 };
    });
    var liab0 = { I: L.I, C: L.C, S: L.S, X: L.X };
    function apply(c, l, amt, step) {
      amt = r2(Math.min(amt, cr[c], L[l]));
      if (amt <= 0) return 0;
      cr[c] = r2(cr[c] - amt); L[l] = r2(L[l] - amt); used[c][l] = r2(used[c][l] + amt);
      steps.push({ step: step, c: c, l: l, amt: amt });
      return amt;
    }
    // Step 1: IGST credit first against IGST (s.49(5)(a), Rule 88A)
    apply('I', 'I', cr.I, 1);
    // Step 2: balance IGST credit against CGST and SGST in any order and proportion (Rule 88A).
    // It must be fully used before CGST/SGST credit (s.49A), so it goes first where own credit falls short.
    var needC = Math.max(0, r2(L.C - cr.C)), needS = Math.max(0, r2(L.S - cr.S));
    apply('I', 'C', needC, 2); apply('I', 'S', needS, 2);
    apply('I', 'C', cr.I, 2); apply('I', 'S', cr.I, 2);
    // Step 3: CGST credit against CGST, SGST credit against SGST (s.49(5)(b),(c); 49(5)(c)/(d) bar CGST<->SGST)
    apply('C', 'C', cr.C, 3); apply('S', 'S', cr.S, 3);
    // Step 4: balance CGST / SGST credit against IGST, only after IGST credit is exhausted (Rule 88A)
    var ord = inp.igstOrder === 'SC' ? ['S', 'C'] : ['C', 'S'];
    if (cr.I === 0) { apply(ord[0], 'I', cr[ord[0]], 4); apply(ord[1], 'I', cr[ord[1]], 4); }
    // Cess credit only against cess
    apply('X', 'X', cr.X, 5);

    // Rule 86B: ITC may discharge at most 99% of output tax (IGST+CGST+SGST; cess excluded here)
    var r86 = null;
    if (inp.r86b) {
      var out = r2(liab0.I + liab0.C + liab0.S);
      var cap = r2(out * 0.99), tot = 0;
      steps.forEach(function (s) { if (s.l !== 'X') tot = r2(tot + s.amt); });
      var cut = r2(Math.max(0, tot - cap)), cutDone = 0;
      for (var i = steps.length - 1; i >= 0 && cut > 0; i--) {
        var s = steps[i]; if (s.l === 'X') continue;
        var k = r2(Math.min(s.amt, cut));
        s.amt = r2(s.amt - k); used[s.c][s.l] = r2(used[s.c][s.l] - k);
        cr[s.c] = r2(cr[s.c] + k); L[s.l] = r2(L[s.l] + k); cut = r2(cut - k); cutDone = r2(cutDone + k);
      }
      r86 = { output: out, cap: cap, minCash: r2(out - cap), reduced: cutDone };
    }

    var rows = {}, cashTotal = 0, itcTotal = 0;
    H.forEach(function (h) {
      var viaItc = r2(used.I[h] + used.C[h] + used.S[h] + used.X[h]);
      var cash = r2(L[h] + rcm[h]);
      rows[h] = { payable: r2(liab0[h] + rcm[h]), fwd: liab0[h], rcm: rcm[h], byI: used.I[h], byC: used.C[h], byS: used.S[h], byX: used.X[h], viaItc: viaItc, cashFwd: L[h], cash: cash, carry: cr[h] };
      cashTotal = r2(cashTotal + cash); itcTotal = r2(itcTotal + viaItc);
    });
    var days = Math.max(0, Math.floor(+inp.days || 0));
    var interest = r2(cashTotal * 0.18 * days / 365);
    return { rows: rows, cashTotal: cashTotal, itcTotal: itcTotal, r86: r86, days: days, interest: interest, steps: steps.filter(function (s) { return s.amt > 0; }) };
  }
  g.gstSetoff = setoff;
  if (typeof module !== 'undefined') module.exports = setoff;
})(typeof window !== 'undefined' ? window : globalThis);
