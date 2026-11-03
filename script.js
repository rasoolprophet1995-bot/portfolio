document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // 1. UI Elements & Helpers
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = document.getElementById('lightboxClose');
    const galleryImages = document.querySelectorAll('.gallery-trigger');

    if(galleryImages.length > 0) {
        galleryImages.forEach(img => {
            img.addEventListener('click', function() {
                lightboxImg.src = this.src;
                lightboxCaption.textContent = this.alt || this.title;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => { lightboxImg.src = ''; }, 300);
    }

    if(closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if(lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) closeLightbox();
        });
    }
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) closeLightbox();
    });

    const burger = document.getElementById('burger');
    const menu = document.getElementById('menu');
    if(burger && menu) {
        burger.addEventListener('click', () => menu.classList.toggle('active'));
    }

    function updateClock() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        const d = now.toLocaleDateString('fa-IR');
        const clk = document.getElementById('clk');
        const clkDate = document.getElementById('clkDate');
        if(clk) clk.textContent = `${h}:${m}:${s}`;
        if(clkDate) clkDate.textContent = d;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // ==========================================
    // 2. Main Dashboard Charts (Static Demo)
    // ==========================================
    const chartSContainer = document.getElementById('chart-s');
    if(chartSContainer && chartSContainer.tagName.toLowerCase() === 'canvas') {
        try {
            new Chart(chartSContainer.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['ماه ۱', 'ماه ۲', 'ماه ۳', 'ماه ۴', 'ماه ۵', 'ماه ۶'],
                    datasets: [
                        { label: 'PV', data: [10, 25, 40, 55, 70, 85], borderColor: '#ff6b00', tension: 0.4, backgroundColor: 'rgba(255,107,0,0.1)', fill: true },
                        { label: 'EV', data: [8, 22, 38, 58, 72, 88], borderColor: '#22c55e', tension: 0.4, backgroundColor: 'rgba(34,197,94,0.1)', fill: true }
                    ]
                },
                options: { 
                    responsive: true, maintainAspectRatio: false, 
                    plugins: { legend: { labels: { color: '#94a3b8' } } }, 
                    scales: { 
                        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }, 
                        x: { ticks: { color: '#94a3b8' }, grid: { display: false } } 
                    } 
                }
            });
        } catch(err) { console.warn("Chart S Error:", err); }
    }

    const chartDonutContainer = document.getElementById('chart-donut');
    if(chartDonutContainer && chartDonutContainer.tagName.toLowerCase() === 'canvas') {
        try {
            new Chart(chartDonutContainer.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['سیویل', 'مکانیکال', 'پایپینگ', 'برق'],
                    datasets: [{ data: [30, 25, 35, 10], backgroundColor: ['#ff6b00', '#ffb700', '#22c55e', '#3b82f6'], borderWidth: 0 }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }
            });
        } catch(err) { console.warn("Chart Donut Error:", err); }
    }

    // ==========================================
    // 3. AUTOMATIC MULTI-SHEET CALCULATOR ENGINE
    // ==========================================
    const SHEET_ID = '1JSejA-6Re0AeyQAu6vg_uw-PqhxOLltM6HNMkfQFnDQ';
    
    // لیست دقیق نام شیت‌ها برای اسکن خودکار
    const TARGET_SHEETS = [
        "ابنیه", "مکانیک", "برق", "مرمت", "راه", "راهداری", "تعمیر", 
        "انتقال اب", "شبکه توزیع", "چاه", "زهکشی", "سد سازی", "تحت فشار", 
        "فاضلاب", "توزیع اب روستایی", "قنات", "اب خیزداری", "خطوط زمینی", 
        "خطوط هوایی", "پست های انتقال", "تعمیر شبکه فوق توزیع", "توزیع نیروی برق", 
        "حفاری", "پسماند", "تاسیسات آب شرب", "تجهیزات آب و فاضلاب", 
        "نگهداشت تجهیزات برقی فاضلاب", "نگهداری شبکه فاضلاب"
    ];

    let masterData = []; // اینجا همه داده‌ها جمع می‌شوند
    let adjChartInstance = null;

    async function initCalculator() {
        const loadingEl = document.getElementById('adjLoading');
        if(!loadingEl) return;
        
        loadingEl.innerText = "در حال اسکن خودکار ۲۸ شیت تخصصی...";
        loadingEl.style.display = 'block';
        
        masterData = []; // ریست کردن داده‌ها
        
        // حلقه روی تمام شیت‌ها
        for (let sheetName of TARGET_SHEETS) {
            try {
                const encodedName = encodeURIComponent(sheetName.trim());
                const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodedName}&tqx=out:json`;
                
                const response = await fetch(url);
                if (!response.ok) continue; // اگر شیتی نبود، رد شو
                
                const text = await response.text();
                // بررسی اینکه آیا پاسخ JSON معتبر است یا خیر (گاهی گوگل خطا می‌دهد)
                if(text.includes("<html>") || !text.startsWith("/*")) continue;

                const jsonString = text.substring(47).slice(0, -2);
                const json = JSON.parse(jsonString);
                
                if (json.table && json.table.rows) {
                    const rows = json.table.rows.map(row => {
                        const c = row.c;
                        return {
                            sheetName: sheetName, // ثبت نام شیت مبدأ
                            list: c[1]?.v || '',           // B: فهرست
                            workYear: c[2]?.v || '',       // C: سال کارکرد
                            workQuarter: c[3]?.v || '',    // D: سه ماهه کارکرد
                            baseYear: c[4]?.v || '',       // E: سال مبنا
                            baseQuarter: c[5]?.v || '',    // F: سه ماهه مبنا
                            chapterNum: c[8]?.v || '',     // I: شماره فصل
                            chapterDesc: c[9]?.v || '',    // J: شرح فصل
                            B: parseFloat(c[10]?.v) || 0,  // K: شاخص مبنا
                            A: parseFloat(c[11]?.v) || 0,  // L: شاخص کارکرد
                            adjCoeff: parseFloat(c[12]?.v) || 0,   // M: ضریب تعدیل
                            workAmount: parseFloat(c[13]?.v) || 0, // N: مبلغ کارکرد
                            adjRial: parseFloat(c[14]?.v) || 0     // O: مبلغ تعدیل
                        };
                    }).filter(item => item.list !== '' && item.B > 0); // فقط ردیف‌های معتبر

                    masterData.push(...rows);
                    console.log(`Sheet "${sheetName}": ${rows.length} valid rows found.`);
                }
            } catch (err) {
                // نادیده گرفتن خطاهای جزئی هر شیت
                continue;
            }
        }

        console.log(`Total Master Data Rows: ${masterData.length}`);
        
        if(masterData.length > 0) {
            finishInit(true);
        } else {
            loadingEl.innerHTML = '<span style="color:#ef4444">هیچ داده معتبری در شیت‌ها یافت نشد.</span>';
        }
    }

    function finishInit(isSuccess) {
        const loadingEl = document.getElementById('adjLoading');
        if(loadingEl) loadingEl.style.display = 'none';

        // پر کردن لیست کشویی اول با نام شیت‌هایی که داده دارند
        const uniqueSheets = [...new Set(masterData.map(d => d.sheetName))].sort();
        populateSelect('adjFilterSheet', uniqueSheets, '-- انتخاب بخش --');
        
        // رویداد تغییر شیت
        document.getElementById('adjFilterSheet').addEventListener('change', onSheetChange);

        // نمایش بخش‌ها
        document.getElementById('adjKpis').style.display = 'grid';
        document.getElementById('adjChartSection').style.display = 'grid';
        
        // اجرای اولیه محاسبه (همه موارد)
        calculateAdjustment();
    }

    function onSheetChange() {
        // وقتی شیت عوض شد، فیلترهای زیرمجموعه را آپدیت کن
        const selectedSheet = document.getElementById('adjFilterSheet').value;
        const filteredBySheet = selectedSheet === 'all' ? masterData : masterData.filter(d => d.sheetName === selectedSheet);
        
        const lists = [...new Set(filteredBySheet.map(d => d.list).filter(Boolean))];
        const works = [...new Set(filteredBySheet.map(d => `${d.workYear} ${d.workQuarter}`).filter(Boolean))];
        const bases = [...new Set(filteredBySheet.map(d => `${d.baseYear} ${d.baseQuarter}`).filter(Boolean))];
        const chapters = [...new Set(filteredBySheet.map(d => `فصل ${d.chapterNum}: ${d.chapterDesc}`).filter(Boolean))];

        populateSelect('adjFilterList', lists, 'همه');
        populateSelect('adjFilterWork', works, 'همه');
        populateSelect('adjFilterBase', bases, 'همه');
        populateSelect('adjFilterChapter', chapters, 'همه');

        calculateAdjustment();
    }

    function populateSelect(id, options, defaultLabel) {
        const el = document.getElementById(id);
        if(!el) return;
        el.innerHTML = `<option value="all">${defaultLabel}</option>`;
        options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt;
            o.textContent = opt;
            el.appendChild(o);
        });
    }

    function calculateAdjustment() {
        const sheetVal = document.getElementById('adjFilterSheet')?.value || 'all';
        const listVal = document.getElementById('adjFilterList')?.value || 'all';
        const workVal = document.getElementById('adjFilterWork')?.value || 'all';
        const baseVal = document.getElementById('adjFilterBase')?.value || 'all';
        const chapVal = document.getElementById('adjFilterChapter')?.value || 'all';

        const result = masterData.filter(row => {
            const mSheet = sheetVal === 'all' || row.sheetName === sheetVal;
            const mList = listVal === 'all' || row.list === listVal;
            const mWork = workVal === 'all' || `${row.workYear} ${row.workQuarter}` === workVal;
            const mBase = baseVal === 'all' || `${row.baseYear} ${row.baseQuarter}` === baseVal;
            const mChap = chapVal === 'all' || `فصل ${row.chapterNum}: ${row.chapterDesc}` === chapVal;
            return mSheet && mList && mWork && mBase && mChap;
        });

        if(result.length > 0) {
            const data = result[0]; // گرفتن اولین مورد منطبق
            const percent = data.adjCoeff > 0 ? (data.adjCoeff - 1) * 100 : 0;

            setText('adjValB', data.B.toLocaleString('fa-IR'));
            setText('adjValA', data.A.toLocaleString('fa-IR'));
            setText('adjValCoeff', data.adjCoeff.toFixed(3).toLocaleString('fa-IR'));
            setText('adjValPercent', percent.toFixed(1).toLocaleString('fa-IR') + '٪');
            setText('adjValAmount', data.workAmount > 0 ? data.workAmount.toLocaleString('fa-IR') + ' ریال' : '-');
            setText('adjValRial', data.adjRial > 0 ? data.adjRial.toLocaleString('fa-IR') + ' ریال' : '-');

            const analysisEl = document.getElementById('adjAnalysis');
            if(analysisEl) {
                analysisEl.innerHTML = `
                    <div style="margin-bottom:8px;"><i class="fas fa-layer-group"></i> <strong style="color:#ffb700">${data.sheetName}</strong></div>
                    <div><i class="fas fa-book-open"></i> <strong>${data.chapterDesc}</strong> (${data.chapterNum})</div>
                    <div style="margin-top:8px;">ضریب تعدیل: <strong style="color:#ff6b00;font-size:1.1rem">${data.adjCoeff.toFixed(3)}</strong></div>
                    <div>مبلغ تعدیل: <strong style="color:#22c55e">${data.adjRial.toLocaleString('fa-IR')} ریال</strong></div>
                `;
            }
            updateAdjChart(data.B, data.A);
        } else {
            clearCalcUI();
        }
    }

    function setText(id, val) {
        const el = document.getElementById(id);
        if(el) el.innerText = val;
    }

    function clearCalcUI() {
        ['adjValB','adjValA','adjValCoeff','adjValPercent','adjValAmount','adjValRial'].forEach(id => setText(id, '-'));
        const a = document.getElementById('adjAnalysis');
        if(a) a.innerText = 'داده‌ای یافت نشد.';
    }

    function updateAdjChart(b, a) {
        const canvasEl = document.getElementById('adjChart');
        if (!canvasEl || canvasEl.tagName.toLowerCase() !== 'canvas') return;
        const ctx = canvasEl.getContext('2d');
        if (adjChartInstance) adjChartInstance.destroy();

        Chart.defaults.color = '#94a3b8';
        Chart.defaults.font.family = 'Vazirmatn';

        adjChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['شاخص مبنا (B)', 'شاخص کارکرد (A)'],
                datasets: [{
                    label: 'مقدار شاخص',
                    data: [b, a],
                    backgroundColor: ['rgba(255, 255, 255, 0.2)', '#ff6b00'],
                    borderRadius: 6,
                    barThickness: 50
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // شروع فرآیند
    initCalculator();
});
