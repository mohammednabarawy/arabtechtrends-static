---
title: "شرح Metasploit | تنزيل ميتاسبلويت واحترافها"
description: "ميتاسبلويت هي واحدة من أقوى الأدوات التي يعتمد عليها من يعمل في مجال أمن المعلومات واختبار الاختراق، والتي تسمح للمستخدم بإجراء عملية فحص شامل لنظام مستهدف واكتشاف ثغرات أمنية موجودة به والقيام بتجربة الاختراق من خلال حمولة (Payload) جاهزة "
pubDate: "2025-07-06T12:19:55"
updatedDate: "2025-07-07T10:55:00"
author: "Arab Tech Trends"
category: "دروس تقنية ومقالات"
tags: []
image: ""
draft: false
sourceUrl: "https://www.arabtechtrends.com/metasploit-html/"
---

<p></p>
<div>
<div class="separator" style="clear: both; text-align: center;"><a href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjqnB1cELINmOGUhkDruRmX8LlOWa6Td-06jS5pO5kSALXzmWuJ3Q3frA1-4UPcTZH6dIT1iezqrjvsaJnfpnBtGxOhcqoodJ4kux9mXP2dLgxiCcBOX_Z4HSvXPyZGKxEMcmVpwlA63LOa68WtRuYfbc7uxcurSCsIn4IHWhOdHC-w7kl8meR5wVcgosk/s1200-rw/metasploit.webp" style="margin-left: 1em; margin-right: 1em;"></a></div>
<p>ميتاسبلويت هي واحدة من أقوى الأدوات التي يعتمد عليها من يعمل في مجال أمن المعلومات واختبار الاختراق، والتي تسمح للمستخدم بإجراء عملية فحص شامل لنظام مستهدف واكتشاف ثغرات أمنية موجودة به والقيام بتجربة الاختراق من خلال حمولة (Payload) جاهزة توفرها الأداة. في هذا المقال إن شاء الله سنتعرف بالتفصيل على ما هي أداة Metasploit وكيفية عملها وما هي مميزاتها؟ وكيفية تنزيل ميتاسبلويت للأندرويد وأيضًا أفضل مصادر مجانية لتعلمها.</p>
<p><span></span></p>
<div id="ez-toc-container" class="ez-toc-v2_0_85 ez-toc-wrap-right counter-hierarchy ez-toc-counter-rtl ez-toc-light-blue ez-toc-container-direction">
<div class="ez-toc-title-container">
<p class="ez-toc-title" style="cursor:inherit">محتوى المقالة</p>
<span class="ez-toc-title-toggle"><a href="#" class="ez-toc-pull-right ez-toc-btn ez-toc-btn-xs ez-toc-btn-default ez-toc-toggle" aria-label="Toggle Table of Content"><span class="ez-toc-js-icon-con"><span class=""><span class="eztoc-hide" style="display:none;">Toggle</span><span class="ez-toc-icon-toggle-span"><svg style="fill: #999;color:#999" xmlns="http://www.w3.org/2000/svg" class="list-377408" width="20px" height="20px" viewBox="0 0 24 24" fill="none"><path d="M6 6H4v2h2V6zm14 0H8v2h12V6zM4 11h2v2H4v-2zm16 0H8v2h12v-2zM4 16h2v2H4v-2zm16 0H8v2h12v-2z" fill="currentColor"></path></svg><svg style="fill: #999;color:#999" class="arrow-unsorted-368013" xmlns="http://www.w3.org/2000/svg" width="10px" height="10px" viewBox="0 0 24 24" version="1.2" baseProfile="tiny"><path d="M18.2 9.3l-6.2-6.3-6.2 6.3c-.2.2-.3.4-.3.7s.1.5.3.7c.2.2.4.3.7.3h11c.3 0 .5-.1.7-.3.2-.2.3-.5.3-.7s-.1-.5-.3-.7zM5.8 14.7l6.2 6.3 6.2-6.3c.2-.2.3-.5.3-.7s-.1-.5-.3-.7c-.2-.2-.4-.3-.7-.3h-11c-.3 0-.5.1-.7.3-.2.2-.3.5-.3.7s.1.5.3.7z"/></svg></span></span></span></a></span></div>
<nav><ul class='ez-toc-list ez-toc-list-level-1 ' ><li class='ez-toc-page-1 ez-toc-heading-level-2'><a class="ez-toc-link ez-toc-heading-1" href="https://www.arabtechtrends.com/metasploit-html/#%D9%85%D8%A7_%D9%87%D9%8A_%D9%85%D9%8A%D8%AA%D8%A7%D8%B3%D8%A8%D9%84%D9%88%D9%8A%D8%AA_Metasploit%D8%9F" >ما هي ميتاسبلويت Metasploit؟</a></li><li class='ez-toc-page-1 ez-toc-heading-level-2'><a class="ez-toc-link ez-toc-heading-2" href="https://www.arabtechtrends.com/metasploit-html/#%D9%83%D9%8A%D9%81_%D8%AA%D8%B9%D9%85%D9%84_%D8%A3%D8%AF%D8%A7%D8%A9_Metasploit%D8%9F" >كيف تعمل أداة Metasploit؟</a></li><li class='ez-toc-page-1 ez-toc-heading-level-2'><a class="ez-toc-link ez-toc-heading-3" href="https://www.arabtechtrends.com/metasploit-html/#%D9%85%D8%A7_%D9%87%D9%8A_%D9%85%D9%85%D9%8A%D8%B2%D8%A7%D8%AA_%D9%85%D9%8A%D8%AA%D8%A7%D8%B3%D8%A8%D9%84%D9%88%D9%8A%D8%AA%D8%9F" >ما هي مميزات ميتاسبلويت؟</a></li><li class='ez-toc-page-1 ez-toc-heading-level-2'><a class="ez-toc-link ez-toc-heading-4" href="https://www.arabtechtrends.com/metasploit-html/#%D8%A3%D9%88%D8%A7%D9%85%D8%B1_Metasploit" >أوامر Metasploit</a></li><li class='ez-toc-page-1 ez-toc-heading-level-2'><a class="ez-toc-link ez-toc-heading-5" href="https://www.arabtechtrends.com/metasploit-html/#%D8%AA%D9%86%D8%B2%D9%8A%D9%84_%D9%85%D9%8A%D8%AA%D8%A7%D8%B3%D8%A8%D9%84%D9%88%D9%8A%D8%AA_%D9%84%D9%84%D8%A3%D9%86%D8%AF%D8%B1%D9%88%D9%8A%D8%AF" >تنزيل ميتاسبلويت للأندرويد</a></li><li class='ez-toc-page-1 ez-toc-heading-level-2'><a class="ez-toc-link ez-toc-heading-6" href="https://www.arabtechtrends.com/metasploit-html/#%D9%85%D8%B5%D8%A7%D8%AF%D8%B1_%D8%AA%D8%B9%D9%84%D9%85_%D8%A3%D8%AF%D8%A7%D8%A9_%D9%85%D9%8A%D8%AA%D8%A7%D8%B3%D8%A8%D9%84%D9%88%D9%8A%D8%AA" >مصادر تعلم أداة ميتاسبلويت</a><ul class='ez-toc-list-level-3' ><li class='ez-toc-heading-level-3'><a class="ez-toc-link ez-toc-heading-7" href="https://www.arabtechtrends.com/metasploit-html/#1-_%D8%A7%D9%84%D9%85%D9%88%D9%82%D8%B9_%D8%A7%D9%84%D8%B1%D8%B3%D9%85%D9%8A_%D9%84%D9%84%D8%A3%D8%AF%D8%A7%D8%A9" >1- الموقع الرسمي للأداة</a></li><li class='ez-toc-page-1 ez-toc-heading-level-3'><a class="ez-toc-link ez-toc-heading-8" href="https://www.arabtechtrends.com/metasploit-html/#2-_%D9%83%D8%AA%D8%A7%D8%A8_Metasploit_The_Penetration_Tester_S_Guide" >2- كتاب Metasploit The Penetration Tester S Guide</a></li><li class='ez-toc-page-1 ez-toc-heading-level-3'><a class="ez-toc-link ez-toc-heading-9" href="https://www.arabtechtrends.com/metasploit-html/#3-_%D9%83%D8%AA%D8%A7%D8%A8_Metasploit_Penetration_Testing_Cookbook" >3- كتاب Metasploit Penetration Testing Cookbook</a></li><li class='ez-toc-page-1 ez-toc-heading-level-3'><a class="ez-toc-link ez-toc-heading-10" href="https://www.arabtechtrends.com/metasploit-html/#4-_%D9%83%D9%88%D8%B1%D8%B3_Metasploit_For_Beginners" >4- كورس Metasploit For Beginners</a></li></ul></li></ul></nav></div>
<h2 style="text-align: right;"><span class="ez-toc-section" id="%D9%85%D8%A7_%D9%87%D9%8A_%D9%85%D9%8A%D8%AA%D8%A7%D8%B3%D8%A8%D9%84%D9%88%D9%8A%D8%AA_Metasploit%D8%9F"></span>ما هي ميتاسبلويت Metasploit؟<span class="ez-toc-section-end"></span></h2>
<div style="text-align: right;">&#8211; أداة ميتاسبلويت هي عبارة عن إطار عمل مفتوح المصدر مبني باستخدام <a href="https://www.netaawy.com/2018/03/Ruby-programming-language.html" target="_blank">لغة روبي وهي واحدة من أشهر الأدوات التي يتم الاعتماد عليها في مجال صيد الثغرات Bug Bounty بسبب ما تقدمه من مميزات لمختبر الاختراق كما سنتعرف في هذا المقال إن شاء الله.</div>
<p>&#8211; توفر Metasploit على المستخدم الكثير من الوقت والجهد في عملية البحث الخاصّ به عن الثغرات وكتابة الكود الخاصّ باستغلال الثغرة وغير ذلك من الأمور. كما أنها توفر واجهة رسومية تساعد المبتدئين في المجال على استكشاف هذا العالم.</p>
<div style="text-align: right;">&#8211; فهذه الأداة واحدة من أقوى الأدوات التي يعتمد عليها مهندسو الشبكات لحماية شبكاتهم عبر البحث عن أي ثغرات أمنية فيها، ومحاولة استغلالها، ثم ترقيع أي ثغرات أمنية قد يتم اكتشافها، وكذلك يستخدمه من يحاول الهجوم على الشبكات بشكل خبيث.</div>
<h2 style="text-align: right;"><span class="ez-toc-section" id="%D9%83%D9%8A%D9%81_%D8%AA%D8%B9%D9%85%D9%84_%D8%A3%D8%AF%D8%A7%D8%A9_Metasploit%D8%9F"></span>كيف تعمل أداة Metasploit؟<span class="ez-toc-section-end"></span></h2>
<div class="separator" style="clear: both; text-align: center;"><a href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgo5JlrJCf9mXFPIH37X2KNSIjhsiIWQMu1QF8S-iq8csLdPtKBmLuejcxKjYwfxtcoQtONe_eQjwQ3-xChwsqmi0fWYAl_VV3GQq4jbf9n7xuod6LPAExF3Mr5MTxUDN1iQPdBnNrdJJcw_WBNH3Q5K1ccKQfUEwvMWMqx-YDfWrRrQGAMFmUvm3yCY54/s900-rw/%D9%85%D9%8A%D8%AA%D8%A7%D8%B3%D8%A8%D9%84%D9%88%D9%8A%D8%AA.webp" style="margin-left: 1em; margin-right: 1em;"><img decoding="async" alt="ميتاسبلويت" border="0" data-original-height="506" data-original-width="900" src="https://www.arabtechtrends.com/wp-content/uploads/2025/07/1751793592_570_شرح-Metasploit-تنزيل-ميتاسبلويت-واحترافها.webp.webp" title="ميتاسبلويت"/></a></div>
<div>&#8211; تُعد ميتاسبلويت بيئة عمل متكاملة توفر الكثير من الأدوات التي تمكّن مسخدميها من القيام باختبار الاختراق بدايةً من فحص ثغرات المواقع والبحث عنها في قائمة الموجودة بالفعل في قاعدة بياناتها، ثم اختيار الحمولة / Payload التي يمكن استخدامها لاختراق ناجح ثم تجربة الاختراق بشكل فعلي.</div>
<div style="text-align: right;">
<p>&#8211; تضم الأداة الكثير من الأدوات التي يمكن استخدامها في عملية الاستطلاع مثل Nmap | Nessus لاكتشاف الثغرات في الأنظمة، بعد ذلك يتم اختيار البايلود Payload المناسبة للثغرة المكتشفة واستخدامها في اختراق الهدف.</p>
<div>&#8211; بعد الاختراق يمكن باستخدام ميتاسبلويت أيضًا عمل تصعيد للامتيازات التي تحصل عليها كمخترق مثل تصوير الشاشة أو جمع نقرات المستخدم على لوحة المفاتيح أو التجسس على اتصاله بالإنترنت أو غير ذلك.</div>
</div>
<h2 style="text-align: right;"><span class="ez-toc-section" id="%D9%85%D8%A7_%D9%87%D9%8A_%D9%85%D9%85%D9%8A%D8%B2%D8%A7%D8%AA_%D9%85%D9%8A%D8%AA%D8%A7%D8%B3%D8%A8%D9%84%D9%88%D9%8A%D8%AA%D8%9F"></span>ما هي مميزات ميتاسبلويت؟<span class="ez-toc-section-end"></span></h2>
<div style="text-align: right;">
<ol style="text-align: right;">
<li>أداة مجانية مفتوحة المصدر.</li>
<li>يتم تطوير الأداة بشكل مستمر ولها مجتمع ضخم.</li>
<li>يمكن تخصيص الأداة لتلائم استخدام أو تجربة خاصّة.</li>
<li>يمكن تثبيت ميتاسبلويت على Termux واستخدامها عبر الأندرويد.</li>
<li>يمكنك استخدامها كشخص مسئول عن تأمين شبكات لفحص أمان الشبكة.</li>
<li>تأتي بشكل افتراضي مع توزيعات لينكس المخصصّة للاختراق مثل توزيعة كالي.</li>
<li>يمكن استخدام الأداة للعثور على ثغرات في الأنظمة الأمنية لمن يعمل في مجال صيد الثغرات.</li>
<li>توفر الكثير من الجهد والوقت في تنصيب الأدوات التي تحتاجها وكتابة كود الاستغلال وغير ذلك.</li>
<li>أداة لا غنى عن تعلمها واستخدامها لمن يبحث عن تعلم الاختراق الأخلاقي والعمل في هذا المجال.</li>
<li>توفر بيئة متكاملة بكل الأدوات التي قد تحتاج إليها من أجل العثور على نقاط ضغف وحتى الاختراق.</li>
</ol>
<h2 style="text-align: right;"><span class="ez-toc-section" id="%D8%A3%D9%88%D8%A7%D9%85%D8%B1_Metasploit"></span>أوامر Metasploit<span class="ez-toc-section-end"></span></h2>
<p>&#8211; توجد الكثير من أوامر ميتاسبلويت التي يمكن استخدامها للتحكم في الأداة والقيام بالأمور التي تريدها سواءً بالبحث أو باستغلال الثغرات والهجوم وما إلى ذلك.</p>
<p>&#8211; يمكن الرجوع إلى الدليل الخاصّ بالشركة المطوّرة للأداة من الرابط في أسفل هذه الفقرة من أجل معرفة هذه الأوامر، وفيم تستخدم؟ وما هي الأوامر التي قد تحتاج إليها لتنفيذ الهجوم الخاصّ بك.</p>
</p></div>
<h2 style="text-align: right;"><span class="ez-toc-section" id="%D8%AA%D9%86%D8%B2%D9%8A%D9%84_%D9%85%D9%8A%D8%AA%D8%A7%D8%B3%D8%A8%D9%84%D9%88%D9%8A%D8%AA_%D9%84%D9%84%D8%A3%D9%86%D8%AF%D8%B1%D9%88%D9%8A%D8%AF"></span>تنزيل ميتاسبلويت للأندرويد<span class="ez-toc-section-end"></span></h2>
<p><center><i class="msgs info">«اضغط على الصورة بالأسفل لتشغيل الفيديو»</i></center></p>
<div style="text-align: right;">&#8211; بالرغم من أن أداة ميتاسبلويت مخصصة للاستخدام على الحواسيب، إلا أنه من الممكن استخدام الأداة على أجهزة الأندرويد، سواءً كانت لديك صلاحية الروت أو لا، ولكن يفضل امتلاكها بالطبع ليكون لديك الصلاحية للقيام بكافّة الأمور التي قد تحتاج الأداة إليها.</div>
<div style="text-align: right;">&#8211; لا يمكن تنزيل ميتاسبلويت للأندرويد بشكل مباشر، ولكن يمكن الاعتماد على تطبيق Termux وهو محاكي الطرفية المعروف للأندرويد، والذي من خلاله يمكنك تنزيل ميتاسبلويت واستخدامها على هاتفك الأندرويد.</div>
<p>&#8211; يمكنكم مراجعة الفيديو في بداية هذه الفقرة للتعرف على كيفة تحميل Metasploit على Termux ويمكنكم الوصول من الأسفل إلى الروابط المستخدمة.</p>
<h2 style="text-align: right;"><span class="ez-toc-section" id="%D9%85%D8%B5%D8%A7%D8%AF%D8%B1_%D8%AA%D8%B9%D9%84%D9%85_%D8%A3%D8%AF%D8%A7%D8%A9_%D9%85%D9%8A%D8%AA%D8%A7%D8%B3%D8%A8%D9%84%D9%88%D9%8A%D8%AA"></span>مصادر تعلم أداة ميتاسبلويت<span class="ez-toc-section-end"></span></h2>
<div style="text-align: right;">&#8211; أخيرًا سنتحدث عن مجموعة مصادر وأيضًا دورات اختراق تشرح أداة Metasploit بشكل عملي، وكيف يمكنك احتراف استخدام هذه الأداة المميزة بشكل مجاني تمامًا.</div>
<h3 style="text-align: right;"><span class="ez-toc-section" id="1-_%D8%A7%D9%84%D9%85%D9%88%D9%82%D8%B9_%D8%A7%D9%84%D8%B1%D8%B3%D9%85%D9%8A_%D9%84%D9%84%D8%A3%D8%AF%D8%A7%D8%A9"></span>1- الموقع الرسمي للأداة<span class="ez-toc-section-end"></span></h3>
<p>&#8211; يمكنك مراجعة التوثيق الخاصّ بالأداة على الموقع الرسمي والذي يضم كل المعلومات التي تحتاج إلى معرفتها عن الأداة بشكل مفصّل، بالإضافة كيفية الاستخدام الأمثل للأداة وطرق تجربتها بشكل عملي وما إلى ذلك.</p>
<h3 style="text-align: right;"><span class="ez-toc-section" id="2-_%D9%83%D8%AA%D8%A7%D8%A8_Metasploit_The_Penetration_Tester_S_Guide"></span>2- كتاب Metasploit The Penetration Tester S Guide<span class="ez-toc-section-end"></span></h3>
<div style="text-align: right;">&#8211; كتاب Metasploit The Penetration Tester S Guide هو واحد من أقوى المصادر المتوفرة التي يمكن من خلالها فهم طريقة عمل الأداة وكيفية استخدامها بشكل فعّال في عمليات الاستطلاع وكذلك تعليم الهكر باستخدامها. يمكنكم تحميل الكتاب مجانًا بصيغة PDF من موقع Internet Archive من الرابط التالي.</div>
<h3 style="text-align: right;"><span class="ez-toc-section" id="3-_%D9%83%D8%AA%D8%A7%D8%A8_Metasploit_Penetration_Testing_Cookbook"></span>3- كتاب Metasploit Penetration Testing Cookbook<span class="ez-toc-section-end"></span></h3>
<p>&#8211; هذا الكتاب أيضًا من المراجع المميزة التي يمكن الاعتماد عليها، ويتميز بوجود شرح مصوّر أكثر من الكتاب السابق، وأيضًا يمكنك تحميله مجانًا من الرابط التالي.</p>
<h3 style="text-align: right;"><span class="ez-toc-section" id="4-_%D9%83%D9%88%D8%B1%D8%B3_Metasploit_For_Beginners"></span>4- كورس Metasploit For Beginners<span class="ez-toc-section-end"></span></h3>
<p>&#8211; هذا كورس عملي يمكنك مشاهدته على اليوتيوب للتعرف أكثر على أداة ميتاسبلويت وكيفية استخدامها. الدورة قديمة نوعًا ما، لكنها ما زال توفر الكثير من المعلومات المفيدة عن الأداة وطرق استخدامها.</p>
</div>

