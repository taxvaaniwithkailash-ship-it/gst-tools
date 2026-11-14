# GST set-off engine (GSTR-3B Table 6.1)

Free, open-source JavaScript engine that works out how input tax credit (ITC) pays output tax under the Indian GST law, and how much must be paid in cash.

**Live demo:** https://taxvaaniwithkailash-ship-it.github.io/gst-tools/
**Full calculator with explanations:** [GST set-off calculator on ksvatc.in](https://ksvatc.in/tools/gst-set-off-calculator/)

Maintained by [KSV Accounting & Taxation Consultants](https://ksvatc.in/), Gurugram.

## Rules applied

| Step | Rule | Legal basis |
|---|---|---|
| 1 | IGST credit first against IGST | Section 49(5)(a), Rule 88A |
| 2 | Balance IGST credit against CGST and SGST, in any order and proportion, fully used before CGST/SGST credit | Sections 49(5)(a), 49A, Rule 88A |
| 3 | CGST credit against CGST, SGST credit against SGST; never across | Section 49(5)(b)-(d) |
| 4 | Remaining CGST/SGST credit against IGST, only after IGST credit is exhausted | Section 49(5), Rule 88A |
| 5 | Cess credit only against cess | Compensation Cess Act, Section 11 |
| - | Reverse charge tax in cash | Section 49(4) read with Section 2(82) |
| - | Rule 86B: ITC up to 99% of output tax | Rule 86B |
| - | Interest 18% p.a. on cash paid late | Section 50 |

## Usage

```js
const gstSetoff = require('./gst-setoff.js'); // in a browser: window.gstSetoff
const r = gstSetoff({
  liab: { I: 100000, C: 60000, S: 60000, X: 0 },
  rcm:  { I: 0, C: 2000, S: 2000, X: 0 },
  itc:  { I: 130000, C: 25000, S: 45000, X: 0 },
  r86b: false, igstOrder: 'CS', days: 0
});
console.log(r.cashTotal); // 24000
```

## Tests

```
node test.js
```

## More free GST tools

- [Do I need GST registration? 6-question check](https://ksvatc.in/tools/gst-registration-check/)
- [All free GST tools](https://ksvatc.in/tools/)
- [GST registration in Gurgaon](https://ksvatc.in/gst-registration/)

Estimate for planning only; check the final set-off on the GST portal before filing. Law as on 14 Nov 2026. MIT licence.
