/* =====================================================================
   BAYMOUNT SECURITY OPERATIONS — MANPOWER AUDIT
   يتحقق آلياً من مطابقة توزيع القوة للأعداد المعتمدة
   Run:  node tools/audit.js
   ===================================================================== */
const C = require("../js/data.js");

const posts = C.securityPosts;
const exp = C.shiftRules.expected;

const day = posts.reduce((s, p) => s + p.day, 0);
const night = posts.reduce((s, p) => s + p.night, 0);
const daily = day + night;
const supPerShift = C.supervisors.length;
const dailySup = supPerShift * 2;

console.log("──────────────────────────────────────────────");
console.log("  BAYMOUNT SECURITY OPERATIONS — COUNT AUDIT");
console.log("──────────────────────────────────────────────");
for (const p of posts) {
  console.log(
    "  " + p.nameAr.padEnd(28) +
    " day=" + String(p.day) +
    "  night=" + String(p.night) +
    (p.night === 0 ? "   ← نهاري فقط" : "")
  );
}
console.log("──────────────────────────────────────────────");

let pass = true;
function check(label, got, want) {
  const ok = got === want;
  pass = pass && ok;
  console.log(`  ${ok ? "✓" : "✗"} ${label}: computed=${got} expected=${want}${ok ? "" : "  ← MISMATCH " + (got > want ? "+" : "") + (got - want)}`);
}
check("Day officers   / الوردية النهارية", day, exp.dayOfficers);
check("Night officers / الوردية الليلية", night, exp.nightOfficers);
check("Daily officers / الحضور اليومي", daily, exp.dailyOfficers);
check("Supervisors per shift / مشرفو الوردية", supPerShift, exp.supervisorsPerShift);
check("Daily supervisors / حضور المشرفين", dailySup, exp.dailySupervisors);

const dayOnly = posts.filter(p => p.day > 0 && p.night === 0).map(p => p.nameAr);
console.log("──────────────────────────────────────────────");
console.log("  خدمات خارج الخدمة ليلاً (" + dayOnly.length + "):");
dayOnly.forEach(n => console.log("   • " + n));
console.log("  إجمالي نقاط الخدمة: " + posts.length);
console.log("──────────────────────────────────────────────");
console.log(pass ? "  RESULT: PASS ✓ — التوزيع مطابق للقوة المعتمدة" : "  RESULT: FAIL ✗ — راجع الأعداد قبل التسليم");
console.log("──────────────────────────────────────────────");
process.exit(pass ? 0 : 1);
