/* =====================================================================
   BAYMOUNT SECURITY OPERATIONS — CENTRAL CONFIGURATION
   خطة التأمين وتوزيع الخدمات — ملف الإعدادات المركزي
   ---------------------------------------------------------------------
   ✏️  EVERYTHING EDITABLE LIVES HERE — التعديل يتم من هذا الملف فقط
   • x / y : موقع العلامة على المخطط كنسبة مئوية من عرض/ارتفاع الصورة
             (0,0) = أعلى يسار الصورة — قابلة للضبط بعد المعاينة الميدانية
             يمكن أيضاً استخدام وضع التحرير المخفي: Ctrl+Shift+E
   • day / night : عدد أفراد الأمن في كل خدمة (0 = خارج الخدمة)
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
    /* lighter copy used for printing — phones drop very large images while rendering PDFs */
    printImage: "assets/masterplan-print.jpg",
    aerialImage: "assets/aerial.jpg",
    /* aspect ratio of the masterplan image (height / width) */
    planAspect: 1765 / 1674,
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
    nightOffLabel: "غير مفعّل بالخدمة الليلية",
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
      x: 81.7, y: 65.8, day: 1, night: 1,
      equipment: ["radio"], supervisor: "sup2",
      aliases: ["بوابة 1", "الباب 1"],
      notes: "المدخل الشرقي على الطريق الرئيسي" },

    { id: "gate2", nameAr: "مدخل 2", nameEn: "Gate 02",
      category: "entrance", group: "المداخل",
      x: 61.3, y: 64.3, day: 1, night: 1,
      equipment: ["radio"], supervisor: "sup3",
      aliases: ["بوابة 2", "الباب 2"],
      notes: "ضمن نطاق مشرف المنطقة السكنية" },

    { id: "gate3", nameAr: "مدخل 3", nameEn: "Gate 03",
      category: "entrance", group: "المداخل",
      x: 44.4, y: 62.2, day: 2, night: 1,
      equipment: ["radio"], supervisor: "sup2",
      aliases: ["بوابة 3", "الباب 3"],
      notes: "فردان نهاراً وفرد ليلاً — جهاز لاسلكي واحد مخصص للنقطة" },

    { id: "gate4", nameAr: "مدخل 4", nameEn: "Gate 04 · Beach W",
      category: "entrance", group: "المداخل",
      x: 44.6, y: 82.0, day: 1, night: 0,
      equipment: ["radio"], supervisor: "sup2",
      aliases: ["بوابة 4", "الباب 4", "باب الشاطئ", "باب الشاطي", "الشاطئ"],
      notes: "بوابة الواجهة البحرية الغربية — خارج الخدمة ليلاً" },

    { id: "gate5", nameAr: "مدخل 5", nameEn: "Gate 05 · Beach E",
      category: "entrance", group: "المداخل",
      x: 80.6, y: 82.4, day: 1, night: 0,
      equipment: ["radio"], supervisor: "sup3",
      aliases: ["بوابة 5", "الباب 5"],
      notes: "بوابة الواجهة البحرية الشرقية — خارج الخدمة ليلاً · ضمن نطاق مشرف المنطقة السكنية" },

    { id: "svc-m34", nameAr: "خدمة المصاطب ‎3+4‎", nameEn: "Mastaba 3+4",
      category: "post", group: "المنطقة الإنشائية",
      x: 76.9, y: 10.1, day: 2, night: 2,
      equipment: [], supervisor: "sup1",
      covers: ["m3", "m4"],
      aliases: ["مصطبة 3", "مصطبة 4"],
      notes: "خدمة مشتركة بفردين تغطي مصطبة 3 ومصطبة 4" },

    { id: "svc-m12", nameAr: "خدمة المصاطب ‎1+2‎", nameEn: "Mastaba 1+2",
      category: "post", group: "سكن الملاك",
      x: 88.7, y: 24.2, day: 1, night: 1,
      equipment: [], supervisor: "sup3",
      covers: ["m1", "m2"],
      aliases: ["مصطبة 1", "مصطبة 2", "المصاطب", "سكن الملاك"],
      notes: "المصاطب ‎1+2‎ — موقع سكن الملاك: خدمة واحدة مشتركة تغطي الموقعين" },

    { id: "housing1", nameAr: "سكن عمال 1", nameEn: "Workers Housing 01",
      category: "residential", group: "سكن العمال",
      x: 29.5, y: 13.2, day: 1, night: 1,
      equipment: [], supervisor: "sup4",
      aliases: ["سكني عمال 1", "سكن العمال"],
      notes: "أعلى منطقة مصطبة 6" },

    { id: "housing2", nameAr: "سكن عمال 2", nameEn: "Workers Housing 02",
      category: "residential", group: "سكن العمال",
      x: 38.5, y: 9.4, day: 1, night: 1,
      equipment: [], supervisor: "sup4",
      aliases: ["سكني عمال 2"],
      notes: "أعلى منطقة مصطبة 6" },

    { id: "admin", nameAr: "شئون إدارية وعهدة", nameEn: "Admin & Custody",
      category: "admin", group: "القيادة والمرافق",
      x: 43.0, y: 28.1, day: 1, night: 0,
      equipment: [], supervisor: "sup1",
      aliases: ["العهدة", "الشئون الادارية", "شؤون إدارية"],
      notes: "خارج الخدمة ليلاً" },

    { id: "control", nameAr: "غرفة المراقبة والعمليات", nameEn: "Control & Operations",
      category: "control", group: "القيادة والمرافق",
      x: 19.4, y: 27.0, day: 1, night: 1,
      equipment: [], supervisor: "ops",
      aliases: ["غرفة العمليات", "المراقبة", "العمليات", "غرفة مراقبة"],
      notes: "تعمل نهاراً وليلاً — نقطة القيادة والسيطرة للمنظومة" },

    { id: "offices", nameAr: "مكاتب الموظفين والمخازن", nameEn: "Offices & Warehouses",
      category: "warehouse", group: "القيادة والمرافق",
      x: 30.1, y: 23.6, day: 1, night: 1,
      equipment: [], supervisor: "sup1",
      aliases: ["المخازن", "مكاتب الموظفين", "المخزن"],
      notes: "خدمة نهاراً وليلاً" }
  ],

  /* ------------------------------------------------------------------
     أصول ومعالم تشغيلية (ليست نقاط أفراد)
     ------------------------------------------------------------------ */
  assets: [
    { id: "crusher", nameAr: "كسارة الحجارة", nameEn: "Stone Crusher",
      type: "industrial", icon: "i-crusher", quietLabel: true, x: 50.5, y: 8.4, supervisor: "sup4",
      aliases: ["كسارة", "كساره", "الكسارة", "كسارة حجارة"],
      notes: "أعلى منطقة مصطبة 6 — ضمن نطاق مشرف سكن العمال والمناطق الجبلية · الموقع تقريبي" },
    { id: "m1", nameAr: "مصطبة 1", type: "mastaba", zone: "سكني ملاك", x: 91.4, y: 28.1 },
    { id: "m2", nameAr: "مصطبة 2", type: "mastaba", zone: "سكني ملاك", x: 86.0, y: 20.2 },
    { id: "m3", nameAr: "مصطبة 3", type: "mastaba", zone: "إنشائية", x: 79.6, y: 14.6 },
    { id: "m4", nameAr: "مصطبة 4", type: "mastaba", zone: "إنشائية", x: 74.2, y: 6.2 },
    { id: "m5", nameAr: "مصطبة 5", type: "mastaba", zone: "إنشائية", x: 54.8, y: 9.0 },
    { id: "m6", nameAr: "مصطبة 6", type: "mastaba", zone: "سكني عمال", x: 44.5, y: 14.2 }
  ],

  /* ------------------------------------------------------------------
     المشرفون — ٤ قطاعات إشراف ثابتة نهاراً وليلاً
     polygon: حدود القطاع كنِسَب مئوية [x,y]
     ------------------------------------------------------------------ */
  supervisors: [
    { id: "sup1", code: "S1",
      nameAr: "مشرف المنطقة الإنشائية",
      nameEn: "Construction Sector",
      color: "#b8913f",
      anchor: { x: 60.2, y: 15.7 },
      polygon: [[26.9,29.2],[30.1,21.3],[36.6,13.5],[44.1,5.1],[51.6,1.7],[60.2,1.1],[69.9,2.0],[79.6,4.5],[87.1,10.1],[89.2,16.9],[84.9,22.5],[77.4,27.0],[69.9,21.3],[62.4,16.3],[52.7,15.7],[43.0,19.1],[34.4,27.0],[29.0,30.9]],
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
      anchor: { x: 22.6, y: 66.9 },
      polygon: [[0.0,60.1],[14.0,59.6],[35.5,59.0],[46.2,58.7],[59.1,59.6],[74.2,60.1],[90.3,60.7],[93.0,68.5],[74.2,68.0],[57.0,68.5],[50.5,69.1],[51.6,77.5],[52.7,84.8],[38.7,84.3],[40.9,77.5],[43.0,69.1],[24.7,68.0],[3.2,68.0],[0.0,66.9]],
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
      anchor: { x: 41.9, y: 46.1 },
      polygon: [[0.0,58.4],[0.0,37.1],[2.2,31.5],[11.8,33.1],[22.6,34.8],[33.3,34.3],[44.1,36.0],[54.8,32.6],[65.6,30.9],[77.4,30.3],[83.9,25.8],[89.2,18.5],[93.5,22.5],[93.0,32.6],[91.9,47.2],[87.1,56.2],[74.2,56.2],[59.1,57.9],[44.1,57.9],[29.0,58.4],[11.8,59.0]],
      coverage: ["المصاطب ‎1+2‎ — الفلل والوحدات السكنية للملاك", "مدخل 2 ومدخل 5"],
      coverageIds: ["gate2", "gate5", "svc-m12", "m1", "m2"],
      equipment: ["scooter", "radio"],
      mobility: "scooter",
      route: "ownersLoop",
      duty: "دورية متحركة بالسكوتر داخل المنطقة السكنية للملاك",
      brief: "دورية متحركة بالسكوتر داخل المنطقة السكنية للملاك على مدار الخدمة — المصاطب ‎1+2‎ والفلل والوحدات السكنية، والمدخلان 2 و5" },

    { id: "sup4", code: "S4",
      nameAr: "مشرف سكن العمال والمناطق الجبلية",
      nameEn: "Workers & Mountain Sector",
      color: "#6c7f57",
      anchor: { x: 15.1, y: 11.8 },
      polygon: [[0.0,21.3],[0.0,9.0],[2.2,2.2],[11.8,0.6],[24.7,0.2],[35.5,0.9],[46.2,1.5],[52.7,3.9],[47.3,8.4],[42.5,12.4],[33.3,13.5],[23.7,14.6],[12.9,16.3],[2.2,19.1]],
      coverage: ["سكن عمال 1", "سكن عمال 2", "مصطبة 6 — سكني عمال", "كسارة الحجارة أعلى منطقة 6", "تزويد مولدات الكهرباء بالسولار — 16 مولد", "منطقة المدقات بالجبل"],
      coverageIds: ["housing1", "housing2", "m6", "crusher"],
      equipment: ["motorcycle", "radio", "flashlight"],
      mobility: "motorcycle",
      route: "mountainTrack",
      duty: "سكن العمال والمدقات الجبلية والكسارة وتزويد المولدات بالسولار",
      brief: "دورية متحركة بالموتوسيكل تغطي سكن العمال والمدقات الجبلية وكسارة الحجارة، والإشراف على تزويد مولدات الكهرباء بالسولار — 16 مولد" }
  ],


  /* ------------------------------------------------------------------
     مناطق المخطط — تُعرض كتظليل من طبقات الخريطة
     from: يعيد استخدام حدود قطاع إشراف موجود بدل تكرار الإحداثيات
     ------------------------------------------------------------------ */
  zones: [
    /* سكن الملاك — المصاطب 1+2 */
    { id: "res-owners",  nameAr: "سكن الملاك — المصاطب \u200E1+2\u200E", layer: "residential", color: "#587795",
      polygon: [[80.5,23],[82,17.5],[86.5,14],[91,15],[94.5,19.5],[95,26],[92.5,31.5],[87.5,33],[83,30.5]] },
    /* سكن العمال — سكن عمال 1 و2 أعلى المصطبة 6 */
    { id: "res-workers", nameAr: "سكن العمال — أعلى المصطبة 6", layer: "residential", color: "#7c5a8f",
      polygon: [[24,17.5],[26,11.5],[31,8],[37,5.5],[43,6],[47.5,9.5],[46.5,15],[40,16.8],[33,18.5],[28,18.8]] },
    { id: "construction", nameAr: "المنطقة الإنشائية", layer: "construction", color: "#b8913f", from: "sup1" }
  ],
  /* ------------------------------------------------------------------
     نطاقات الحركة — مسارات مفاهيمية (ليست GPS)
     ------------------------------------------------------------------ */
  patrolRoutes: {
    ownersLoop: {
      labelAr: "نطاق حركة المشرف — سكوتر",
      closed: true,
      points: [[5.4,55.1],[3.2,48.3],[7.5,41.6],[16.1,37.6],[24.7,39.3],[33.3,37.1],[41.9,39.3],[50.5,36.5],[59.1,38.2],[67.7,34.3],[76.3,33.1],[84.9,36.0],[89.2,42.7],[84.9,50.6],[76.3,53.4],[65.6,52.2],[54.8,55.1],[44.1,54.5],[33.3,56.2],[22.6,57.3],[14.0,57.6]]
    },
    mountainTrack: {
      labelAr: "نطاق حركة المشرف — موتوسيكل",
      closed: false,
      points: [[1.5,20.2],[4.5,12.5],[10,8.5],[17,7.5],[24,9],[29.5,13.2],[38.5,9.4],[50.5,8.4],[53,11.5],[47,14]]
    },
    constructionTrack: {
      labelAr: "مداومة المرور — موتوسيكل",
      closed: false,
      points: [[28.0,28.1],[33.3,20.2],[39.8,13.5],[48.4,9.0],[57.0,6.7],[65.6,5.6],[73.1,7.9],[78.5,12.4],[83.9,18.0],[88.2,24.7]]
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
      cam: { x: 46.2, y: 41.6, k: 1.0 }, shift: "day", focus: "services", aerial: true },

    { id: "s2", num: "02", title: "المداخل",
      body: "خمسة مداخل مؤمّنة بستة أفراد نهاراً — المدخل 3 بفردين نهاراً وفرد ليلاً، ومدخلا الشاطئ 4 و5 خارج الخدمة ليلاً.",
      cam: { x: 59.1, y: 69.7, k: 1.45 }, shift: "day", focus: "services",
      pulse: ["gate1", "gate2", "gate3", "gate4", "gate5"] },

    { id: "s3", num: "03", title: "المنطقة الإنشائية",
      body: "تأمين مكاتب الموظفين والمخازن نهاراً وليلاً، وخدمة ثابتة بفردين للمصطبتين ‎3+4‎، مع مداومة مرور بالموتوسيكل لتنشيط التواجد الأمني.",
      cam: { x: 63.4, y: 15.7, k: 1.55 }, shift: "day", focus: "services",
      layers: { routes: true }, pulse: ["svc-m34", "offices", "admin"] },

    { id: "s4", num: "04", title: "المناطق السكنية",
      body: "حماية دائمة لسكن العمال 1 و2 أعلى مصطبة 6، وخدمة المصاطب ‎1+2‎ — موقع سكن الملاك، ودورية متحركة بالسكوتر داخل المنطقة السكنية.",
      cam: { x: 51.6, y: 21.3, k: 1.25 }, shift: "day", focus: "services",
      layers: { routes: true }, pulse: ["housing1", "housing2", "svc-m12"] },

    { id: "s5", num: "05", title: "القيادة والسيطرة",
      body: "غرفة مراقبة وعمليات تعمل نهاراً وليلاً — مراقبة الكاميرات، تلقي البلاغات، وقيادة الفرق الميدانية.",
      cam: { x: 21.5, y: 28.1, k: 2.1 }, shift: "day", focus: "services",
      pulse: ["control"] },

    { id: "s6", num: "06", title: "المناطق الجبلية والمولدات",
      body: "مشرف متحرك بالموتوسيكل يغطي المدقات الجبلية وكسارة الحجارة، ويشرف على تزويد مولدات الكهرباء بالسولار — 16 مولد.",
      cam: { x: 24.7, y: 9.0, k: 1.8 }, shift: "day", focus: "services",
      layers: { routes: true, mobility: true }, pulse: ["crusher", "housing1", "housing2"] },

    { id: "s7", num: "07", title: "التوزيع النهاري",
      body: "14 فرد أمن على 12 نقطة ونطاق خدمة، بإشراف 4 مشرفي قطاعات.",
      cam: { x: 46.2, y: 41.6, k: 1.0 }, shift: "day", focus: "services", stat: "day" },

    { id: "s8", num: "08", title: "التحول إلى التوزيع الليلي",
      body: "ثلاث خدمات تخرج من الخدمة ليلاً — مدخل 4 ومدخل 5 وشئون إدارية وعهدة — ويتحول المدخل 3 إلى فرد واحد: تنتقل القوة من 14 إلى 10 آلياً.",
      cam: { x: 46.2, y: 41.6, k: 1.0 }, shift: "night", focus: "services", stat: "night",
      pulse: ["gate4", "gate5", "admin", "gate3"] },

    { id: "s9", num: "09", title: "نطاقات المشرفين",
      body: "أربعة قطاعات إشراف ثابتة نهاراً وليلاً: المنطقة الإنشائية، البوابات الخارجية، سكن الملاك، وسكن العمال والمناطق الجبلية.",
      cam: { x: 46.2, y: 37.1, k: 1.05 }, shift: "night", focus: "supervision" },

    { id: "s10", num: "10", title: "الخلاصة التنفيذية",
      body: "",
      cam: { x: 46.2, y: 41.6, k: 1.0 }, shift: "day", focus: "services", summary: true }
  ],

  /* الطبقات الافتراضية عند الفتح */
  ui: {
    defaultLayers: {
      services: true,     /* الخدمات الأمنية */
      gates: true,        /* المداخل */
      supervisors: true,  /* المشرفون */
      sectors: false,     /* نطاقات الإشراف */
      radios: true,      /* أجهزة اللاسلكي */
      mobility: true,     /* وسائل الانتقال */
      residential: false, /* المناطق السكنية */
      construction: true, /* المناطق الإنشائية */
      routes: false       /* المسارات / نطاق الحركة */
    },
    /* only these appear in the layers panel — services, radios and mobility
       are always on (their icons ride on the markers themselves) */
    layerLabels: {
      gates: "المداخل",
      supervisors: "المشرفون",
      sectors: "نطاقات الإشراف",
      residential: "المناطق السكنية",
      construction: "المناطق الإنشائية",
      routes: "المسارات / نطاق الحركة"
    }
  }
};

/* Node.js compatibility for the audit tool */
if (typeof module !== "undefined" && module.exports) { module.exports = BAYMOUNT_CONFIG; }
