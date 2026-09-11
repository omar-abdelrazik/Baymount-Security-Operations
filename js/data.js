/* =====================================================================
   BAYMOUNT SECURITY OPERATIONS — CENTRAL CONFIGURATION
   خطة التأمين وتوزيع الخدمات — ملف الإعدادات المركزي
   ---------------------------------------------------------------------
   ✏️  EVERYTHING EDITABLE LIVES HERE — التعديل يتم من هذا الملف فقط
   • x / y : موقع العلامة على المخطط كنسبة مئوية من عرض/ارتفاع الصورة
             (0,0) = أعلى يسار الصورة — قابلة للضبط بعد المعاينة الميدانية
             يمكن أيضاً استخدام وضع التحرير المخفي: Ctrl+Shift+E
   • day / night : عدد أفراد الأمن في كل وردية (0 = خارج الخدمة)
   • equipment  : مفاتيح من قائمة equipmentTypes بالأسفل
   • Totals are NEVER hardcoded in the UI — they are computed from this
     data and validated against shiftRules.expected automatically.
   ===================================================================== */

const BAYMOUNT_CONFIG = {

  meta: {
    projectAr: "باي ماونت السخنة",
    projectEn: "BAYMOUNT SOKHNA",
    developerEn: "MAVEN DEVELOPMENTS",
    titleAr: "خطة التأمين وتوزيع الخدمات",
    titleEn: "SECURITY OPERATIONS",
    confidentialAr: "سري · لمراجعة الإدارة",
    confidentialEn: "CONFIDENTIAL — FOR MANAGEMENT REVIEW",
    planImage: "assets/masterplan.jpg",
    aerialImage: "assets/aerial.jpg",
    /* aspect ratio of the masterplan image (height / width) */
    planAspect: 1983 / 1800,
    positionsNote: "المواقع على المخطط تقريبية وقابلة للضبط من ملف الإعدادات أو وضع التحرير"
  },

  /* ------------------------------------------------------------------
     القوة المعتمدة — المرجع الوحيد للتحقق الآلي
     ------------------------------------------------------------------ */
  shiftRules: {
    expected: {
      dayOfficers: 14,
      nightOfficers: 10,
      dailyOfficers: 24,          /* حضور يومي = نهاري + ليلي */
      supervisorsPerShift: 4,
      dailySupervisors: 8
    },
    shifts: {
      day:   { ar: "نهاري", en: "DAY SHIFT" },
      night: { ar: "ليلي",  en: "NIGHT SHIFT" }
    },
    nightOffLabel: "غير مفعّل بالوردية الليلية",
    nightOffShort: "خارج الخدمة ليلاً"
  },

  /* ------------------------------------------------------------------
     التجهيزات — قاموس الأنواع
     ------------------------------------------------------------------ */
  equipmentTypes: {
    radio:      { ar: "جهاز لاسلكي", icon: "i-radio" },
    flashlight: { ar: "كشاف إضاءة",  icon: "i-flash" },
    scooter:    { ar: "سكوتر",       icon: "i-scooter" },
    motorcycle: { ar: "موتوسيكل",    icon: "i-moto" }
  },

  /* ------------------------------------------------------------------
     فئات المواقع
     ------------------------------------------------------------------ */
  categories: {
    entrance:    { ar: "مدخل",            icon: "i-gate",    layer: "gates" },
    post:        { ar: "نقطة أمن",        icon: "i-terrace", layer: "services" },
    residential: { ar: "سكن عمال",        icon: "i-house",   layer: "services" },
    control:     { ar: "قيادة وسيطرة",    icon: "i-screens", layer: "services" },
    admin:       { ar: "إدارية وعهدة",    icon: "i-box",     layer: "services" },
    warehouse:   { ar: "مكاتب ومخازن",    icon: "i-office",  layer: "services" }
  },

  /* ------------------------------------------------------------------
     نقاط الخدمة الأمنية — ١٢ نقطة / نطاق
     day / night = عدد الأفراد — المجاميع تُحسب آلياً
     ------------------------------------------------------------------ */
  securityPosts: [
    { id: "gate1", nameAr: "مدخل 1", nameEn: "Gate 01",
      category: "entrance", group: "المداخل",
      x: 48.3, y: 56.4, day: 1, night: 1,
      equipment: ["radio"], supervisor: "sup2",
      aliases: ["بوابة 1", "الباب 1", "المدخل الرئيسي"],
      notes: "" },

    { id: "gate2", nameAr: "مدخل 2", nameEn: "Gate 02",
      category: "entrance", group: "المداخل",
      x: 64.0, y: 58.2, day: 1, night: 1,
      equipment: ["radio"], supervisor: "sup2",
      aliases: ["بوابة 2", "الباب 2"],
      notes: "" },

    { id: "gate3", nameAr: "مدخل 3", nameEn: "Gate 03",
      category: "entrance", group: "المداخل",
      x: 83.0, y: 59.6, day: 2, night: 2,
      equipment: ["radio"], supervisor: "sup2",
      aliases: ["بوابة 3", "الباب 3"],
      notes: "جهاز لاسلكي واحد مخصص للنقطة" },

    { id: "gate4", nameAr: "مدخل 4 — باب الشاطئ", nameEn: "Gate 04 · Beach",
      category: "entrance", group: "المداخل",
      x: 52.4, y: 66.2, day: 1, night: 0,
      equipment: ["radio"], supervisor: "sup2",
      aliases: ["بوابة الشاطئ", "باب الشاطي", "الباب 4", "الشاطئ"],
      notes: "خدمة نهارية فقط — تأمين المعبر إلى الواجهة البحرية" },

    { id: "gate5", nameAr: "مدخل 5", nameEn: "Gate 05",
      category: "entrance", group: "المداخل",
      x: 6.5, y: 58.0, day: 1, night: 0,
      equipment: ["radio"], supervisor: "sup2",
      aliases: ["بوابة 5", "الباب 5"],
      notes: "خدمة نهارية فقط" },

    { id: "svc-m12", nameAr: "خدمة المصاطب 1+2", nameEn: "Mastaba 1+2",
      category: "post", group: "المنطقة الإنشائية",
      x: 89.5, y: 22.5, day: 1, night: 1,
      equipment: [], supervisor: "sup1",
      covers: ["m1", "m2"],
      aliases: ["مصطبة 1", "مصطبة 2", "المصاطب"],
      notes: "خدمة واحدة مشتركة تغطي مصطبة 1 ومصطبة 2" },

    { id: "svc-m34", nameAr: "خدمة المصاطب 3+4", nameEn: "Mastaba 3+4",
      category: "post", group: "المنطقة الإنشائية",
      x: 78.5, y: 10.0, day: 2, night: 2,
      equipment: [], supervisor: "sup1",
      covers: ["m3", "m4"],
      aliases: ["مصطبة 3", "مصطبة 4"],
      notes: "خدمة مشتركة بفردين تغطي مصطبة 3 ومصطبة 4" },

    { id: "housing1", nameAr: "سكن عمال 1", nameEn: "Workers Housing 01",
      category: "residential", group: "المناطق السكنية",
      x: 15.0, y: 6.0, day: 1, night: 1,
      equipment: [], supervisor: "sup4",
      aliases: ["سكني عمال 1", "سكن العمال"],
      notes: "" },

    { id: "housing2", nameAr: "سكن عمال 2", nameEn: "Workers Housing 02",
      category: "residential", group: "المناطق السكنية",
      x: 43.0, y: 4.8, day: 1, night: 1,
      equipment: [], supervisor: "sup4",
      aliases: ["سكني عمال 2"],
      notes: "" },

    { id: "admin", nameAr: "شئون إدارية وعهدة", nameEn: "Admin & Custody",
      category: "admin", group: "القيادة والمرافق",
      x: 47.0, y: 26.0, day: 1, night: 0,
      equipment: [], supervisor: "sup1",
      aliases: ["العهدة", "الشئون الادارية", "شؤون إدارية"],
      notes: "خدمة نهارية فقط" },

    { id: "control", nameAr: "غرفة المراقبة والعمليات", nameEn: "Control & Operations",
      category: "control", group: "القيادة والمرافق",
      x: 25.0, y: 25.0, day: 1, night: 1,
      equipment: [], supervisor: "ops",
      aliases: ["غرفة العمليات", "المراقبة", "العمليات", "غرفة مراقبة"],
      notes: "تعمل على مدار الورديتين — نقطة القيادة والسيطرة للمنظومة" },

    { id: "offices", nameAr: "مكاتب الموظفين والمخازن", nameEn: "Offices & Warehouses",
      category: "warehouse", group: "القيادة والمرافق",
      x: 35.0, y: 22.0, day: 1, night: 0,
      equipment: [], supervisor: "sup1",
      aliases: ["المخازن", "مكاتب الموظفين", "المخزن"],
      notes: "خدمة نهارية فقط" }
  ],

  /* ------------------------------------------------------------------
     أصول ومعالم تشغيلية (ليست نقاط أفراد)
     ------------------------------------------------------------------ */
  assets: [
    { id: "gen", nameAr: "مولدات الكهرباء", nameEn: "Power Generators",
      type: "generator", x: 29.0, y: 8.0, supervisor: "sup4",
      aliases: ["مولدات", "المولدات", "الكهرباء"],
      notes: "متابعة التشغيل وتزويد المولدات بالوقود ضمن نطاق مشرف المنطقة الجبلية — الموقع تقريبي" },
    { id: "m1", nameAr: "مصطبة 1", type: "mastaba", x: 92.0, y: 26.0 },
    { id: "m2", nameAr: "مصطبة 2", type: "mastaba", x: 87.0, y: 19.0 },
    { id: "m3", nameAr: "مصطبة 3", type: "mastaba", x: 81.0, y: 14.0 },
    { id: "m4", nameAr: "مصطبة 4", type: "mastaba", x: 76.0, y: 6.5 },
    { id: "m5", nameAr: "مصطبة 5", type: "mastaba", x: 58.0, y: 9.0 },
    { id: "m6", nameAr: "مصطبة 6", type: "mastaba", x: 46.0, y: 10.5 }
  ],

  /* ------------------------------------------------------------------
     المشرفون — ٤ قطاعات إشراف ثابتة في الورديتين
     polygon: حدود القطاع كنِسَب مئوية [x,y]
     ------------------------------------------------------------------ */
  supervisors: [
    { id: "sup1", code: "S1",
      nameAr: "مشرف المنطقة الإنشائية",
      nameEn: "Construction Sector",
      color: "#b8913f",
      anchor: { x: 63.0, y: 15.0 },
      polygon: [[30,27],[33.5,20],[39,13],[45,6],[52,2.5],[62,2],[72,2.8],[81,5],[89,10],[94.5,18],[95.5,28],[91,33],[83,28],[75,20],[65,15.5],[55,15.5],[46,19],[38,25],[33,28.5]],
      coverage: ["مكاتب الموظفين", "المخازن", "مصطبة 3", "مصطبة 4", "مصطبة 5", "مصطبة 6"],
      coverageIds: ["offices", "admin", "svc-m34", "m3", "m4", "m5", "m6"],
      equipment: [],
      mobility: null,
      brief: "الإشراف على تأمين المنطقة الإنشائية: مكاتب الموظفين والمخازن والمصاطب العليا 3–6" },

    { id: "sup2", code: "S2",
      nameAr: "مشرف البوابات الخارجية",
      nameEn: "External Gates Sector",
      color: "#d64a26",
      anchor: { x: 28.0, y: 60.5 },
      polygon: [[2,54.5],[20,54],[40,53.5],[50,53.2],[62,54],[76,54.5],[91,55],[93.5,62],[76,61.5],[60,62],[56.5,62.5],[55.5,68.5],[49.5,68.5],[48.6,62.5],[30,61.5],[10,61.5],[2,60.5]],
      coverage: ["باب 1", "باب 2", "باب 4"],
      coverageIds: ["gate1", "gate2", "gate4"],
      equipment: ["radio", "flashlight"],
      mobility: null,
      brief: "الإشراف على منظومة المداخل الخارجية وحركة الدخول والخروج على محور الطريق الرئيسي" },

    { id: "sup3", code: "S3",
      nameAr: "مشرف المنطقة السكنية للملاك",
      nameEn: "Owners Residential Sector",
      color: "#587795",
      anchor: { x: 46.0, y: 42.0 },
      polygon: [[3,53],[3,34],[9,29],[18,30.5],[28,32],[38,31.5],[48,33],[58,30],[68,28.5],[79,28],[89,33.5],[92.5,43],[88,51],[76,51],[62,52.5],[48,52.5],[34,53],[18,53.5]],
      coverage: ["المنطقة السكنية للملاك — الفلل والوحدات السكنية"],
      coverageIds: [],
      equipment: ["scooter", "radio"],
      mobility: "scooter",
      route: "ownersLoop",
      brief: "دورية متحركة بالسكوتر داخل المنطقة السكنية للملاك على مدار الوردية" },

    { id: "sup4", code: "S4",
      nameAr: "مشرف سكن العمال والمناطق الجبلية",
      nameEn: "Workers & Mountain Sector",
      color: "#6c7f57",
      anchor: { x: 21.0, y: 11.5 },
      polygon: [[3,20],[3.5,9],[9,3],[18,1.5],[30,1.2],[40,1.8],[47,3],[50.5,7.5],[46.5,12],[38,13],[29,14],[19,15.5],[9,18]],
      coverage: ["سكن عمال 1", "سكن عمال 2", "مولدات الكهرباء", "متابعة تزويد المولدات بالوقود", "منطقة المدقات بالجبل"],
      coverageIds: ["housing1", "housing2", "gen"],
      equipment: ["motorcycle", "radio", "flashlight"],
      mobility: "motorcycle",
      route: "mountainTrack",
      brief: "دورية متحركة بالموتوسيكل تغطي سكن العمال والمدقات الجبلية ومولدات الكهرباء ومتابعة تزويدها بالوقود" }
  ],

  /* ------------------------------------------------------------------
     نطاقات الحركة — مسارات مفاهيمية (ليست GPS)
     ------------------------------------------------------------------ */
  patrolRoutes: {
    ownersLoop: {
      labelAr: "نطاق حركة المشرف — سكوتر",
      closed: true,
      points: [[12,50],[10,44],[14,38],[22,34.5],[30,36],[38,34],[46,36],[54,33.5],[62,35],[70,31.5],[78,30.5],[86,33],[90,39],[86,46],[78,48.5],[68,47.5],[58,50],[48,49.5],[38,51],[28,52],[20,52.3]]
    },
    mountainTrack: {
      labelAr: "نطاق حركة المشرف — موتوسيكل",
      closed: false,
      points: [[6,19],[8,10],[13.5,5.5],[21,4],[29,7.8],[36,5],[43,4.8],[50,8.5],[58,8.8],[66,6],[76,6.5]]
    }
  },

  /* ------------------------------------------------------------------
     القيادة والهيكل الإداري
     ------------------------------------------------------------------ */
  managementTeam: [
    { id: "director", roleAr: "مدير الأمن", count: 1, tier: 1,
      duties: "الإشراف العام على كافة أعمال منظومة التأمين" },
    { id: "ops", roleAr: "مدير العمليات", count: 1, tier: 2,
      duties: "إدارة وتنفيذ العمليات اليومية للأمن",
      functions: ["تخطيط العمليات", "متابعة الأداء", "التنسيق مع الجهات المعنية", "تقارير العمليات"] },
    { id: "controlRoom", roleAr: "غرفة المراقبة والعمليات", count: null, tier: 2.5,
      side: true,
      duties: "مراقبة الكاميرات والتعامل مع البلاغات والحالات الطارئة",
      functions: ["مشغلو المراقبة", "متابعة البلاغات", "التواصل مع الفرق الميدانية", "توثيق الأحداث"] },
    { id: "adminAffairs", roleAr: "شئون إدارية", count: 2, tier: 2.5,
      side: true,
      duties: "إدارة شؤون العاملين والإجراءات الإدارية والعُهد",
      functions: ["موارد بشرية", "التدريب والتطوير", "المشتريات والمخازن", "الأرشيف والوثائق"] },
    { id: "supervisorsTier", roleAr: "مشرفو القطاعات", count: 4, tier: 3,
      duties: "الإشراف المباشر على أفراد الأمن في المواقع",
      functions: ["متابعة الانضباط", "جولات تفقدية", "حل المشكلات الميدانية", "رفع التقارير"] },
    { id: "officersTier", roleAr: "أفراد الأمن", count: 24, tier: 4,
      duties: "تنفيذ مهام الحراسة والتأمين وحماية المنشآت والأفراد" }
  ],

  /* اسم جهة الإشراف لغير القطاعات الأربعة */
  supervisorLabels: {
    ops: "القيادة المباشرة — إدارة العمليات"
  },

  /* ------------------------------------------------------------------
     عرض الخطة — خطوات الجولة الإرشادية
     cam: { x, y, k } — نقطة التركيز ومعامل التقريب
     ------------------------------------------------------------------ */
  presentation: [
    { id: "s1", num: "01", title: "نظرة عامة",
      body: "منظومة تأمين متكاملة لباي ماونت السخنة — تغطي المداخل الخمسة والمناطق السكنية والمنطقة الإنشائية والواجهة البحرية بقوة حضور يومية 24 فرد أمن و8 مشرفين.",
      cam: { x: 50, y: 38, k: 1.0 }, shift: "day", focus: "services", aerial: true },

    { id: "s2", num: "02", title: "المداخل",
      body: "خمسة مداخل مؤمّنة بستة أفراد نهاراً — المدخل 3 بفردين، وبوابة الشاطئ (مدخل 4) والمدخل 5 خدمتان نهاريتان.",
      cam: { x: 47, y: 59, k: 1.7 }, shift: "day", focus: "services",
      pulse: ["gate1", "gate2", "gate3", "gate4", "gate5"] },

    { id: "s3", num: "03", title: "المنطقة الإنشائية",
      body: "تأمين مكاتب الموظفين والمخازن نهاراً، وخدمتان ثابتتان للمصاطب: خدمة للمصطبتين 1+2 وخدمة بفردين للمصطبتين 3+4.",
      cam: { x: 68, y: 16, k: 1.55 }, shift: "day", focus: "services",
      pulse: ["svc-m12", "svc-m34", "offices", "admin"] },

    { id: "s4", num: "04", title: "المناطق السكنية",
      body: "حماية دائمة لسكن العمال 1 و2 على مدار الورديتين، ودورية متحركة بالسكوتر داخل المنطقة السكنية للملاك.",
      cam: { x: 42, y: 24, k: 1.25 }, shift: "day", focus: "services",
      layers: { routes: true }, pulse: ["housing1", "housing2"] },

    { id: "s5", num: "05", title: "القيادة والسيطرة",
      body: "غرفة مراقبة وعمليات تعمل نهاراً وليلاً — مراقبة الكاميرات، تلقي البلاغات، وقيادة الفرق الميدانية.",
      cam: { x: 27, y: 26, k: 2.1 }, shift: "day", focus: "services",
      pulse: ["control"] },

    { id: "s6", num: "06", title: "المناطق الجبلية والمولدات",
      body: "مشرف متحرك بالموتوسيكل يغطي المدقات الجبلية ومولدات الكهرباء ومتابعة تزويدها بالوقود.",
      cam: { x: 27, y: 10, k: 1.8 }, shift: "day", focus: "services",
      layers: { routes: true, mobility: true }, pulse: ["gen", "housing1", "housing2"] },

    { id: "s7", num: "07", title: "التوزيع النهاري",
      body: "14 فرد أمن على 12 نقطة ونطاق خدمة، بإشراف 4 مشرفي قطاعات.",
      cam: { x: 50, y: 38, k: 1.0 }, shift: "day", focus: "services", stat: "day" },

    { id: "s8", num: "08", title: "التحول إلى التوزيع الليلي",
      body: "أربع خدمات نهارية تخرج من الخدمة آلياً — تنتقل القوة من 14 إلى 10 مع بقاء كامل تغطية المداخل الرئيسية والسكن والقيادة.",
      cam: { x: 50, y: 38, k: 1.0 }, shift: "night", focus: "services", stat: "night",
      pulse: ["gate4", "gate5", "admin", "offices"] },

    { id: "s9", num: "09", title: "نطاقات المشرفين",
      body: "أربعة قطاعات إشراف ثابتة في الورديتين: المنطقة الإنشائية، البوابات الخارجية، سكن الملاك، وسكن العمال والمناطق الجبلية.",
      cam: { x: 50, y: 34, k: 1.05 }, shift: "night", focus: "supervision" },

    { id: "s10", num: "10", title: "الخلاصة التنفيذية",
      body: "",
      cam: { x: 50, y: 38, k: 1.0 }, shift: "day", focus: "services", summary: true }
  ],

  /* الطبقات الافتراضية عند الفتح */
  ui: {
    defaultLayers: {
      services: true,     /* الخدمات الأمنية */
      gates: true,        /* المداخل */
      supervisors: true,  /* المشرفون */
      sectors: false,     /* نطاقات الإشراف */
      radios: false,      /* أجهزة اللاسلكي */
      mobility: true,     /* وسائل الانتقال */
      generators: true,   /* مولدات الكهرباء */
      residential: false, /* المناطق السكنية */
      construction: true, /* المناطق الإنشائية */
      routes: false       /* المسارات / نطاق الحركة */
    },
    layerLabels: {
      services: "الخدمات الأمنية",
      gates: "المداخل",
      supervisors: "المشرفون",
      sectors: "نطاقات الإشراف",
      radios: "أجهزة اللاسلكي",
      mobility: "وسائل الانتقال",
      generators: "مولدات الكهرباء",
      residential: "المناطق السكنية",
      construction: "المناطق الإنشائية",
      routes: "المسارات / نطاق الحركة"
    }
  }
};

/* Node.js compatibility for the audit tool */
if (typeof module !== "undefined" && module.exports) { module.exports = BAYMOUNT_CONFIG; }
