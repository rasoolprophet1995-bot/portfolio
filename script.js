document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // 1. Lightbox Functionality
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

    // ==========================================
    // 2. Mobile Menu Toggle
    // ==========================================
    const burger = document.getElementById('burger');
    const menu = document.getElementById('menu');
    if(burger && menu) {
        burger.addEventListener('click', () => {
            menu.classList.toggle('active');
        });
    }

    // ==========================================
    // 3. Live Clock
    // ==========================================
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const dateStr = now.toLocaleDateString('fa-IR');
        
        const clk = document.getElementById('clk');
        const clkDate = document.getElementById('clkDate');
        if(clk) clk.textContent = `${hours}:${minutes}:${seconds}`;
        if(clkDate) clkDate.textContent = dateStr;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // ==========================================
    // 4. Safe Chart Initialization (Main Dashboard)
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
    // 5. MULTI-SHEET ADJUSTMENT CALCULATOR
    // ==========================================
    const SHEET_ID = '1JSejA-6Re0AeyQAu6vg_uw-PqhxOLltM6HNMkfQFnDQ';
    let availableSheets = []; // لیست نام شیت‌ها
    let currentSheetData = []; // داده‌های شیت فعلی
    let adjChartInstance = null;

    // تابع کمکی برای تبدیل نام فارسی شیت به URL Encoded
    function encodeSheetName(name) {
        return encodeURIComponent(name.trim());
    }

    // ۱. دریافت لیست شیت‌ها
    async function fetchSheetNames() {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
        try {
            const response = await fetch(url);
            const text = await response.text();
            const jsonString = text.substring(47).slice(0, -2);
            const json = JSON.parse(jsonString);
            
            // معمولاً gviz فقط یک شیت را برمی‌گرداند مگر اینکه مشخص شود.
            // اما ما می‌دانیم شیت‌ها چه نام‌هایی دارند. 
            // برای اطمینان، اگر API نتوانست همه را بگیرد، از لیست دستی استفاده می‌کنیم.
            
            // لیست دستی شیت‌ها طبق گفته کاربر (برای اطمینان از پوشش کامل)
            const manualSheetList = [
                "ابنیه", "مکانیک", "برق", "مرمت", "راه", "راهداری", "تعمیر", 
                "انتقال اب", "شبکه توزیع", "چاه", "زهکشی", "سد سازی", "تحت فشار", 
                "فاضلاب", "توزیع اب روستایی", "قنات", "اب خیزداری", "خطوط زمینی", 
                "خطوط هوایی", "پست های انتقال", "تعمیر شبکه فوق توزیع", "توزیع نیروی برق", 
                "حفاری", "پسماند", "تاسیسات آب شرب", "تجهیزات آب و فاضلاب", 
                "نگهداشت تجهیزات برقی فاضلاب", "نگهداری شبکه فاضلاب"
            ];

            populateSheetDropdown(manualSheetList);
            document.getElementById('adjLoading').innerText = "یک بخش تخصصی را انتخاب کنید.";

        } catch (error) {
            console.error("Error fetching sheets:", error);
            // Fallback به لیست دستی در صورت خطا
            const manualSheetList = ["ابنیه", "مکانیک", "برق"]; 
            populateSheetDropdown(manualSheetList);
        }
    }

    function populateSheetDropdown(sheets) {
        const select = document.getElementById('adjFilterSheet');
        select.innerHTML = '<option value="">-- انتخاب شیت --</option>';
        sheets.forEach(sheet => {
            const option = document.createElement('option');
            option.value = sheet;
            option.textContent = sheet;
            select.appendChild(option);
        });
    }

    // ۲. لود کردن داده‌های یک شیت خاص
    window.loadSpecificSheet = async function() {
        const selectedSheet = document.getElementById('adjFilterSheet').value;
        if (!selectedSheet) return;

        const loadingEl = document.getElementById('adjLoading');
        loadingEl.innerText = `در حال بارگذاری داده‌های "${selectedSheet}"...`;
        loadingEl.style.display = 'block';
        
        // مخفی کردن KPIs و نمودار تا داده جدید بیاید
        document.getElementById('adjKpis').style.display = 'none';
        document.getElementById('adjChartSection').style.display = 'none';

        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeSheetName(selectedSheet)}&tqx=out:json`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const text = await response.text();
            const jsonString = text.substring(47).slice(0, -2);
            const json = JSON.parse(jsonString);
            
            if (!json.table.rows || json.table.rows.length === 0) {
                 throw new Error("ردیفی در این شیت یافت نشد.");
            }

            currentSheetData = json.table.rows.map(row => {
                const c = row.c;
                return {
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
            }).filter(item => item.list !== ''); 

            console.log(`Loaded ${currentSheetData.length} rows from sheet: ${selectedSheet}`);
            
            // پر کردن فیلترهای دیگر بر اساس داده‌های این شیت
            populateSubFilters(currentSheetData);
            
            loadingEl.style.display = 'none';
            document.getElementById('adjKpis').style.display = 'grid';
            document.getElementById('adjChartSection').style.display = 'grid';
            
            calculateAdjustment();

        } catch (error) {
            console.error("Error loading specific sheet:", error);
            loadingEl.innerHTML = `<span style="color:#ef4444">خطا در خواندن شیت "${selectedSheet}".<br>${error.message}</span>`;
        }
    }

    function populateSubFilters(data) {
        const uniqueLists = [...new Set(data.map(d => d.list).filter(Boolean))];
        const uniqueWork = [...new Set(data.map(d => `${d.workYear} ${d.workQuarter}`).filter(Boolean))];
        const uniqueBase = [...new Set(data.map(d => `${d.baseYear} ${d.baseQuarter}`).filter(Boolean))];
        const uniqueChapters = [...new Set(data.map(d => `فصل ${d.chapterNum}: ${d.chapterDesc}`).filter(Boolean))];

        fillSelect('adjFilterList', uniqueLists);
        fillSelect('adjFilterWork', uniqueWork);
        fillSelect('adjFilterBase', uniqueBase);
        fillSelect('adjFilterChapter', uniqueChapters);
    }

    function fillSelect(elementId, options) {
        const select = document.getElementById(elementId);
        if(!select) return;
        select.innerHTML = '<option value="all">همه موارد</option>';
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            select.appendChild(option);
        });
    }

    function calculateAdjustment() {
        if (currentSheetData.length === 0) return;

        const listVal = document.getElementById('adjFilterList')?.value || 'all';
        const workVal = document.getElementById('adjFilterWork')?.value || 'all';
        const baseVal = document.getElementById('adjFilterBase')?.value || 'all';
        const chapterVal = document.getElementById('adjFilterChapter')?.value || 'all';

        const filteredData = currentSheetData.filter(row => {
            const matchList = listVal === 'all' || row.list === listVal;
            const matchWork = workVal === 'all' || `${row.workYear} ${row.workQuarter}` === workVal;
            const matchBase = baseVal === 'all' || `${row.baseYear} ${row.baseQuarter}` === baseVal;
            const matchChapter = chapterVal === 'all' || `فصل ${row.chapterNum}: ${row.chapterDesc}` === chapterVal;
            return matchList && matchWork && matchBase && matchChapter;
        });

        if (filteredData.length > 0) {
            const data = filteredData[0];
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
                    <strong style="color:#ffb700">${document.getElementById('adjFilterSheet').value}</strong> :: 
                    شاخص <strong>${data.chapterDesc}</strong> در دوره <strong>${data.workYear} ${data.workQuarter}</strong> 
                    نسبت به مبنای <strong>${data.baseYear} ${data.baseQuarter}</strong>، ضریب تعدیل <strong style="color:#ff6b00">${data.adjCoeff.toFixed(3)}</strong> دارد.
                    <br>💰 مبلغ تعدیل: <strong>${data.adjRial.toLocaleString('fa-IR')} ریال</strong>
                `;
            }

            updateAdjChart(data.B, data.A);
        } else {
            clearCalcUI();
            const analysisEl = document.getElementById('adjAnalysis');
            if(analysisEl) analysisEl.innerText = 'داده‌ای با این ترکیب یافت نشد.';
        }
    }

    function setText(id, val) {
        const el = document.getElementById(id);
        if(el) el.innerText = val;
    }

    function clearCalcUI() {
        ['adjValB','adjValA','adjValCoeff','adjValPercent','adjValAmount','adjValRial'].forEach(id => {
            setText(id, '-');
        });
    }

    function updateAdjChart(b, a) {
        const canvasEl = document.getElementById('adjChart');
        if (!canvasEl || canvasEl.tagName.toLowerCase() !== 'canvas') return;

        const ctx = canvasEl.getContext('2d');
        if (adjChartInstance) adjChartInstance.destroy();

        Chart.defaults.color = '#94a3b8';
        Chart.defaults.borderColor = 'rgba(255,255,255,0.1)';
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
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1a1a1a',
                        titleColor: '#ffb700',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255,107,0,0.3)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y.toLocaleString('fa-IR');
                            }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } }
                }
            }
        });
    }

    // شروع برنامه
    fetchSheetNames();
});
