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
    nightOffShort: "خارج الخدمة ليلاً",
    nightOffTitle: "خدمات خارج الخدمة ليلاً"
  },

  /* ------------------------------------------------------------------
     التجهيزات — قاموس الأنواع + الحصر المعتمد
     ------------------------------------------------------------------ */
  equipmentTypes: {
    radio:      { ar: "جهاز لاسلكي", icon: "i-radio" },
    flashlight: { ar: "كشاف إضاءة",  icon: "i-flash" },
    scooter:    { ar: "سكوتر",       icon: "i-scooter" },
    motorcycle: { ar: "موتوسيكل",    icon: "i-moto" }
  },
  /* الحصر الإجمالي المعتمد للتجهيزات */
  equipmentInventory: {
    radio: 15,
    flashlight: 5,
    scooter: 1,
    motorcycle: 2
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
     ترقيم المداخل وفق المخطط المعتمد من الإدارة
     ------------------------------------------------------------------ */
  securityPosts: [
    { id: "gate1", nameAr: "مدخل 1", nameEn: "Gate 01",
      category: "entrance", group: "المداخل",
      x: 83.0, y: 59.6, day: 1, night: 1,
      equipment: ["radio"], supervisor: "sup2",
      aliases: ["بوابة 1", "الباب 1"],
      notes: "المدخل الشرقي على الطريق الرئيسي" },

    { id: "gate2", nameAr: "مدخل 2", nameEn: "Gate 02",
      category: "entrance", group: "المداخل",
      x: 64.0, y: 58.2, day: 1, night: 1,
      equipment: ["radio"], supervisor: "sup3",
      aliases: ["بوابة 2", "الباب 2"],
      notes: "ضمن نطاق مشرف المنطقة السكنية" },

    { id: "gate3", nameAr: "مدخل 3", nameEn: "Gate 03",
      category: "entrance", group: "المداخل",
      x: 48.3, y: 56.4, day: 2, night: 1,
      equipment: ["radio"], supervisor: "sup2",
      aliases: ["بوابة 3", "الباب 3"],
      notes: "فردان نهاراً وفرد ليلاً — جهاز لاسلكي واحد مخصص للنقطة" },

    { id: "gate4", nameAr: "مدخل 4", nameEn: "Gate 04 · Beach W",
      category: "entrance", group: "المداخل",
      x: 48.5, y: 74.0, day: 1, night: 0,
      equipment: ["radio"], supervisor: "sup2",
      aliases: ["بوابة 4", "الباب 4", "باب الشاطئ", "باب الشاطي", "الشاطئ"],
      notes: "بوابة الواجهة البحرية الغربية — خارج الخدمة ليلاً" },

    { id: "gate5", nameAr: "مدخل 5", nameEn: "Gate 05 · Beach E",
      category: "entrance", group: "المداخل",
      x: 82.0, y: 74.3, day: 1, night: 0,
      equipment: ["radio"], supervisor: "sup3",
      aliases: ["بوابة 5", "الباب 5"],
      notes: "بوابة الواجهة البحرية الشرقية — خارج الخدمة ليلاً · ضمن نطاق مشرف المنطقة السكنية" },

    { id: "svc-m34", nameAr: "خدمة المصاطب ‎3+4‎", nameEn: "Mastaba 3+4",
      category: "post", group: "المنطقة الإنشائية",
      x: 78.5, y: 10.0, day: 2, night: 2,
      equipment: [], supervisor: "sup1",
      covers: ["m3", "m4"],
      aliases: ["مصطبة 3", "مصطبة 4"],
      notes: "خدمة مشتركة بفردين تغطي مصطبة 3 ومصطبة 4" },

    { id: "svc-m12", nameAr: "خدمة المصاطب ‎1+2‎", nameEn: "Mastaba 1+2",
      category: "post", group: "سكن الملاك",
      x: 89.5, y: 22.5, day: 1, night: 1,
      equipment: [], supervisor: "sup3",
      covers: ["m1", "m2"],
      aliases: ["مصطبة 1", "مصطبة 2", "المصاطب", "سكن الملاك"],
      notes: "المصاطب ‎1+2‎ — موقع سكن الملاك: خدمة واحدة مشتركة تغطي الموقعين" },

    { id: "housing1", nameAr: "سكن عمال 1", nameEn: "Workers Housing 01",
      category: "residential", group: "سكن العمال",
      x: 41.5, y: 6.8, day: 1, night: 1,
      equipment: [], supervisor: "sup4",
      aliases: ["سكني عمال 1", "سكن العمال"],
      notes: "أعلى منطقة مصطبة 6" },

    { id: "housing2", nameAr: "سكن عمال 2", nameEn: "Workers Housing 02",
      category: "residential", group: "سكن العمال",
      x: 46.5, y: 4.8, day: 1, night: 1,
      equipment: [], supervisor: "sup4",
      aliases: ["سكني عمال 2"],
      notes: "أعلى منطقة مصطبة 6" },

    { id: "admin", nameAr: "شئون إدارية وعهدة", nameEn: "Admin & Custody",
      category: "admin", group: "القيادة والمرافق",
      x: 47.0, y: 26.0, day: 1, night: 0,
      equipment: [], supervisor: "sup1",
      aliases: ["العهدة", "الشئون الادارية", "شؤون إدارية"],
      notes: "خارج الخدمة ليلاً" },

    { id: "control", nameAr: "غرفة المراقبة والعمليات", nameEn: "Control & Operations",
      category: "control", group: "القيادة والمرافق",
      x: 25.0, y: 25.0, day: 1, night: 1,
      equipment: [], supervisor: "ops",
      aliases: ["غرفة العمليات", "المراقبة", "العمليات", "غرفة مراقبة"],
      notes: "تعمل على مدار الورديتين — نقطة القيادة والسيطرة للمنظومة" },

    { id: "offices", nameAr: "مكاتب الموظفين والمخازن", nameEn: "Offices & Warehouses",
      category: "warehouse", group: "القيادة والمرافق",
      x: 35.0, y: 22.0, day: 1, night: 1,
      equipment: [], supervisor: "sup1",
      aliases: ["المخازن", "مكاتب الموظفين", "المخزن"],
      notes: "خدمة على مدار الورديتين" }
  ],

  /* ------------------------------------------------------------------
     أصول ومعالم تشغيلية (ليست نقاط أفراد)
     ------------------------------------------------------------------ */
  assets: [
    { id: "crusher", nameAr: "كسارة الحجارة", nameEn: "Stone Crusher",
      type: "industrial", icon: "i-crusher", x: 53.5, y: 4.2, supervisor: "sup4",
      aliases: ["كسارة", "كساره", "الكسارة", "كسارة حجارة"],
      notes: "أعلى منطقة مصطبة 6 — ضمن نطاق مشرف سكن العمال والمناطق الجبلية · الموقع تقريبي" },
    { id: "m1", nameAr: "مصطبة 1", type: "mastaba", zone: "سكني ملاك", x: 92.0, y: 26.0 },
    { id: "m2", nameAr: "مصطبة 2", type: "mastaba", zone: "سكني ملاك", x: 87.0, y: 19.0 },
    { id: "m3", nameAr: "مصطبة 3", type: "mastaba", zone: "إنشائية", x: 81.0, y: 14.0 },
    { id: "m4", nameAr: "مصطبة 4", type: "mastaba", zone: "إنشائية", x: 76.0, y: 6.5 },
    { id: "m5", nameAr: "مصطبة 5", type: "mastaba", zone: "إنشائية", x: 58.0, y: 9.0 },
    { id: "m6", nameAr: "مصطبة 6", type: "mastaba", zone: "سكني عمال", x: 46.0, y: 10.5 }
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
      polygon: [[32,27],[35,20],[41,13],[48,5.5],[55,2.5],[63,2],[72,2.8],[81,5],[88,10],[90,16],[86,21],[79,25],[72,20],[65,15.5],[56,15],[47,18],[39,25],[34,28.5]],
      coverage: ["مكاتب الموظفين", "المخازن", "مصطبة 3", "مصطبة 4", "مصطبة 5"],
      coverageIds: ["offices", "admin", "svc-m34", "m3", "m4", "m5"],
      equipment: [],
      mobility: "motorcycle",
      route: "constructionTrack",
      duty: "متابعة كافة التحركات ومداومة المرور لتنشيط التواجد الأمني",
      brief: "متابعة كافة التحركات في المنطقة الإنشائية ومداومة المرور بالموتوسيكل لتنشيط التواجد الأمني — مكاتب الموظفين والمخازن والمصاطب 3–5" },

    { id: "sup2", code: "S2",
      nameAr: "مشرف البوابات الخارجية",
      nameEn: "External Gates Sector",
      color: "#d64a26",
      anchor: { x: 28.0, y: 60.5 },
      polygon: [[2,54.5],[20,54],[40,53.5],[50,53.2],[62,54],[76,54.5],[91,55],[93.5,62],[76,61.5],[60,62],[54,62.5],[55,70],[56,76.5],[43,76],[45,70],[47,62.5],[30,61.5],[10,61.5],[2,60.5]],
      coverage: ["باب 1", "باب 3", "باب 4"],
      coverageIds: ["gate1", "gate3", "gate4"],
      equipment: ["radio", "flashlight"],
      mobility: null,
      duty: "متابعة الانضباط وتنفيذ تعليمات التفتيش في الدخول والخروج",
      brief: "الإشراف على منظومة المداخل الخارجية — متابعة الانضباط وتنفيذ تعليمات التفتيش في الدخول والخروج" },

    { id: "sup3", code: "S3",
      nameAr: "مشرف المنطقة السكنية للملاك",
      nameEn: "Owners Residential Sector",
      color: "#587795",
      anchor: { x: 46.0, y: 42.0 },
      polygon: [[3,53],[3,34],[9,29],[18,30.5],[28,32],[38,31.5],[48,33],[58,30],[68,28.5],[79,28],[85,24],[90,17.5],[94,21],[93.5,30],[92.5,43],[88,51],[76,51],[62,52.5],[48,52.5],[34,53],[18,53.5]],
      coverage: ["المصاطب ‎1+2‎ — الفلل والوحدات السكنية للملاك", "مدخل 2 ومدخل 5"],
      coverageIds: ["gate2", "gate5", "svc-m12", "m1", "m2"],
      equipment: ["scooter", "radio"],
      mobility: "scooter",
      route: "ownersLoop",
      duty: "دورية متحركة بالسكوتر داخل المنطقة السكنية للملاك",
      brief: "دورية متحركة بالسكوتر داخل المنطقة السكنية للملاك على مدار الوردية — المصاطب ‎1+2‎ والفلل والوحدات السكنية، والمدخلان 2 و5" },

    { id: "sup4", code: "S4",
      nameAr: "مشرف سكن العمال والمناطق الجبلية",
      nameEn: "Workers & Mountain Sector",
      color: "#6c7f57",
      anchor: { x: 21.0, y: 11.5 },
      polygon: [[3,20],[3.5,9],[9,3],[18,1.5],[30,1.2],[40,1.8],[50,2.3],[56,4.5],[51,8.5],[46.5,12],[38,13],[29,14],[19,15.5],[9,18]],
      coverage: ["سكن عمال 1", "سكن عمال 2", "مصطبة 6 — سكني عمال", "كسارة الحجارة أعلى منطقة 6", "تزويد مولدات الكهرباء بالسولار — 16 مولد", "منطقة المدقات بالجبل"],
      coverageIds: ["housing1", "housing2", "m6", "crusher"],
      equipment: ["motorcycle", "radio", "flashlight"],
      mobility: "motorcycle",
      route: "mountainTrack",
      duty: "سكن العمال والمدقات الجبلية والكسارة وتزويد المولدات بالسولار",
      brief: "دورية متحركة بالموتوسيكل تغطي سكن العمال والمدقات الجبلية وكسارة الحجارة، والإشراف على تزويد مولدات الكهرباء بالسولار — 16 مولد" }
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
      points: [[6,19],[9,10],[14,6],[22,5],[30,6.5],[36,5.5],[41.5,6.8],[46.5,4.8],[53.5,4.2],[50,8.5],[46,10.5]]
    },
    constructionTrack: {
      labelAr: "مداومة المرور — موتوسيكل",
      closed: false,
      points: [[33,26],[38,19],[44,13],[52,9],[60,7],[68,6],[75,8],[80,12],[85,17],[89,23]]
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
      functions: ["موارد بشرية", "التدريب والتطوير", "الأرشيف والوثائق"] },
    { id: "supervisorsTier", roleAr: "مشرفو القطاعات", count: 4, tier: 3,
      duties: "الإشراف المباشر على أفراد الأمن في المواقع",
      functions: ["جولات تفقدية", "حل المشكلات الميدانية", "رفع التقارير"] },
    { id: "officersTier", roleAr: "أفراد الأمن", count: 24, tier: 4,
      duties: "تنفيذ مهام الحراسة والتأمين وحماية مستلزمات البناء والمخازن والملاك" }
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
      body: "خمسة مداخل مؤمّنة بستة أفراد نهاراً — المدخل 3 بفردين نهاراً وفرد ليلاً، ومدخلا الشاطئ 4 و5 خارج الخدمة ليلاً.",
      cam: { x: 62, y: 63, k: 1.45 }, shift: "day", focus: "services",
      pulse: ["gate1", "gate2", "gate3", "gate4", "gate5"] },

    { id: "s3", num: "03", title: "المنطقة الإنشائية",
      body: "تأمين مكاتب الموظفين والمخازن على مدار الورديتين، وخدمة ثابتة بفردين للمصطبتين ‎3+4‎، مع مداومة مرور بالموتوسيكل لتنشيط التواجد الأمني.",
      cam: { x: 66, y: 15, k: 1.55 }, shift: "day", focus: "services",
      layers: { routes: true }, pulse: ["svc-m34", "offices", "admin"] },

    { id: "s4", num: "04", title: "المناطق السكنية",
      body: "حماية دائمة لسكن العمال 1 و2 أعلى مصطبة 6، وخدمة المصاطب ‎1+2‎ — موقع سكن الملاك، ودورية متحركة بالسكوتر داخل المنطقة السكنية.",
      cam: { x: 55, y: 20, k: 1.25 }, shift: "day", focus: "services",
      layers: { routes: true }, pulse: ["housing1", "housing2", "svc-m12"] },

    { id: "s5", num: "05", title: "القيادة والسيطرة",
      body: "غرفة مراقبة وعمليات تعمل نهاراً وليلاً — مراقبة الكاميرات، تلقي البلاغات، وقيادة الفرق الميدانية.",
      cam: { x: 27, y: 26, k: 2.1 }, shift: "day", focus: "services",
      pulse: ["control"] },

    { id: "s6", num: "06", title: "المناطق الجبلية والمولدات",
      body: "مشرف متحرك بالموتوسيكل يغطي المدقات الجبلية وكسارة الحجارة، ويشرف على تزويد مولدات الكهرباء بالسولار — 16 مولد.",
      cam: { x: 30, y: 9, k: 1.8 }, shift: "day", focus: "services",
      layers: { routes: true, mobility: true }, pulse: ["crusher", "housing1", "housing2"] },

    { id: "s7", num: "07", title: "التوزيع النهاري",
      body: "14 فرد أمن على 12 نقطة ونطاق خدمة، بإشراف 4 مشرفي قطاعات.",
      cam: { x: 50, y: 38, k: 1.0 }, shift: "day", focus: "services", stat: "day" },

    { id: "s8", num: "08", title: "التحول إلى التوزيع الليلي",
      body: "ثلاث خدمات تخرج من الخدمة ليلاً — مدخل 4 ومدخل 5 وشئون إدارية وعهدة — ويتحول المدخل 3 إلى فرد واحد: تنتقل القوة من 14 إلى 10 آلياً.",
      cam: { x: 50, y: 38, k: 1.0 }, shift: "night", focus: "services", stat: "night",
      pulse: ["gate4", "gate5", "admin", "gate3"] },

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
      residential: "المناطق السكنية",
      construction: "المناطق الإنشائية",
      routes: "المسارات / نطاق الحركة"
    }
  }
};

/* Node.js compatibility for the audit tool */
if (typeof module !== "undefined" && module.exports) { module.exports = BAYMOUNT_CONFIG; }
