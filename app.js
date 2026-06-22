// 3-Roll Production Calculator - Core Application Logic

// ==========================================
// 1. CONSTANTS & DATABASE INITIALIZATION
// ==========================================

const DEFAULT_TREATMENTS = [
    { code: "EESV", compound: "B1779", thickness: "1.07 mm", speed: 15, length: 400, timePerRoll: 27 },
    { code: "DDSV", compound: "B1779", thickness: "2.00 mm", speed: 12, length: 150, timePerRoll: 13 },
    { code: "RP08", compound: "F2471", thickness: "1.21 mm", speed: 30, length: 450, timePerRoll: 15 },
    { code: "RU53", compound: "F2471", thickness: "1.20 mm", speed: 30, length: 400, timePerRoll: 13 },
    { code: "RU13", compound: "F4057", thickness: "1.60 mm", speed: 25, length: 400, timePerRoll: 16 },
    { code: "RU11", compound: "F4057", thickness: "1.40 mm", speed: 27, length: 400, timePerRoll: 15 },
    { code: "RP09", compound: "F4057", thickness: "1.40 mm", speed: 29, length: 450, timePerRoll: 16 },
    { code: "RP10", compound: "F4057", thickness: "1.20 mm", speed: 29, length: 450, timePerRoll: 16 },
    { code: "NU27", compound: "F740A", thickness: "0.90 mm", speed: 30, length: 400, timePerRoll: 13 },
    { code: "NB32", compound: "F740A", thickness: "0.80 mm", speed: 30, length: 450, timePerRoll: 15 },
    { code: "N824", compound: "F1252", thickness: "0.81 mm", speed: 30, length: 450, timePerRoll: 15 },
    { code: "NC18", compound: "F1252", thickness: "1.00 mm", speed: 20, length: 300, timePerRoll: 15 },
    { code: "NC16", compound: "F1252", thickness: "0.90 mm", speed: 25, length: 300, timePerRoll: 12 },
    { code: "NC12", compound: "F1252", thickness: "0.71 mm", speed: 25, length: 300, timePerRoll: 12 },
    { code: "NC51", compound: "F1252", thickness: "0.81 mm", speed: 28, length: 450, timePerRoll: 16 },
    { code: "NC50", compound: "F1252", thickness: "0.71 mm", speed: 28, length: 450, timePerRoll: 16 },
    { code: "N814", compound: "F1252", thickness: "1.00 mm", speed: 30, length: 450, timePerRoll: 15 },
    { code: "N813", compound: "F1252", thickness: "1.00 mm", speed: 30, length: 450, timePerRoll: 15 },
    { code: "N815", compound: "F1252", thickness: "0.81 mm", speed: 30, length: 450, timePerRoll: 15 },
    { code: "N825", compound: "F1252", thickness: "1.00 mm", speed: 30, length: 450, timePerRoll: 15 },
    { code: "JM52", compound: "F1252", thickness: "1.45 mm", speed: 20, length: 350, timePerRoll: 18 },
    { code: "JM45", compound: "F1145", thickness: "1.45 mm", speed: 20, length: 350, timePerRoll: 18 },
    { code: "JM11", compound: "G1211", thickness: "1.45 mm", speed: 20, length: 350, timePerRoll: 18 },
    { code: "JR52", compound: "F1252", thickness: "1.65 mm", speed: 20, length: 350, timePerRoll: 18 },
    { code: "JR11", compound: "G1211", thickness: "1.65 mm", speed: 20, length: 350, timePerRoll: 18 },
    { code: "JR45", compound: "F1145", thickness: "1.65 mm", speed: 20, length: 350, timePerRoll: 18 },
    { code: "NE45", compound: "F1145", thickness: "0.89 mm", speed: 27, length: 300, timePerRoll: 11 },
    { code: "RT27", compound: "J26R7", thickness: "0.80 mm", speed: 27, length: 400, timePerRoll: 15 },
    { code: "JM06", compound: "F1145", thickness: "1.65 mm", speed: 20, length: 300, timePerRoll: 15 },
    { code: "JM02", compound: "F1145", thickness: "1.27 mm", speed: 14, length: 100, timePerRoll: 7 },
    { code: "NH34", compound: "F1145", thickness: "1.40 mm", speed: 20, length: 300, timePerRoll: 15 },
    { code: "CN16", compound: "F1071", thickness: "0.89 mm", speed: 18, length: 200, timePerRoll: 11 },
    { code: "CN21", compound: "F1071", thickness: "0.89 mm", speed: 18, length: 200, timePerRoll: 11 },
    { code: "CN50", compound: "F1071", thickness: "0.71 mm", speed: 18, length: 200, timePerRoll: 11 }
];

const DEFAULT_SETTINGS = {
    startTime: "07:00",
    endTime: "15:00",
    startupTime: 15,
    plannedDowntime: 0,
    codeChangeTime: 5,
    firebaseUrl: "https://roll-planning-default-rtdb.firebaseio.com/"
};

const DEFAULT_JOBS = [
    { code: "RU53", rolls: 12 },
    { code: "NC16", rolls: 18 }
];

// Color palette for dynamic charts and segments
const SEGMENT_COLORS = [
    "#3b82f6", // Blue
    "#f97316", // Orange
    "#10b981", // Green
    "#a855f7", // Purple
    "#ec4899", // Pink
    "#eab308", // Yellow
    "#06b6d4", // Cyan
    "#f43f5e", // Rose
    "#84cc16", // Lime
    "#6366f1"  // Indigo
];
const DOWNTIME_COLOR = "#64748b"; // Slate Grey
const STARTUP_COLOR = "#06b6d4"; // Cyan
const REMAINING_COLOR = "rgba(255, 255, 255, 0.05)"; // Transparent dark
const CODE_CHANGE_COLOR = "#a855f7"; // Violet / Purple

const SPECS_VERSION = "1.8";
if (localStorage.getItem("specs_version") !== SPECS_VERSION) {
    const oldSettings = JSON.parse(localStorage.getItem("operation_settings")) || {};
    const mergedSettings = { ...DEFAULT_SETTINGS, ...oldSettings, firebaseUrl: DEFAULT_SETTINGS.firebaseUrl };
    
    localStorage.setItem("operation_settings", JSON.stringify(mergedSettings));
    
    if (!localStorage.getItem("treatment_db")) {
        localStorage.setItem("treatment_db", JSON.stringify(DEFAULT_TREATMENTS));
    }
    if (!localStorage.getItem("daily_jobs")) {
        localStorage.setItem("daily_jobs", JSON.stringify(DEFAULT_JOBS));
    }
    localStorage.setItem("specs_version", SPECS_VERSION);
}

// State variables loaded from LocalStorage or Defaults
let treatmentDb = JSON.parse(localStorage.getItem("treatment_db")) || DEFAULT_TREATMENTS;
let currentJobs = JSON.parse(localStorage.getItem("daily_jobs")) || DEFAULT_JOBS;
let settings = JSON.parse(localStorage.getItem("operation_settings")) || DEFAULT_SETTINGS;

// Backup variables for Preview Mode
let originalJobsBackup = null;
let originalSettingsBackup = null;
let isPreviewMode = false;
let previewPlanId = null;

// Save helper functions
function saveDbToStorage() {
    localStorage.setItem("treatment_db", JSON.stringify(treatmentDb));
    if (settings.firebaseUrl) {
        saveCloudData("treatment_db", treatmentDb);
    }
}

function saveJobsToStorage() {
    localStorage.setItem("daily_jobs", JSON.stringify(currentJobs));
}

function saveSettingsToStorage() {
    localStorage.setItem("operation_settings", JSON.stringify(settings));
    if (settings.firebaseUrl) {
        saveCloudData("operation_settings", settings);
    }
}

// ==========================================
// 2. DOM ELEMENTS & INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    initializeSystem();
});

async function initializeSystem() {
    initLiveClock();
    initTabs();
    
    // Check if cloud sync is configured
    if (settings.firebaseUrl) {
        updateCloudStatusUI("connecting");
        
        // Fetch data from Firebase
        const cloudDb = await fetchCloudData("treatment_db");
        const cloudPlans = await fetchCloudData("saved_plans");
        const cloudSettings = await fetchCloudData("operation_settings");
        
        let syncSuccess = false;
        
        if (cloudDb !== null) {
            treatmentDb = cloudDb;
            localStorage.setItem("treatment_db", JSON.stringify(treatmentDb));
            syncSuccess = true;
        }
        if (cloudPlans !== null) {
            localStorage.setItem("saved_plans", JSON.stringify(cloudPlans));
            syncSuccess = true;
        }
        if (cloudSettings !== null) {
            const oldUrl = settings.firebaseUrl;
            settings = { ...DEFAULT_SETTINGS, ...cloudSettings, firebaseUrl: oldUrl };
            localStorage.setItem("operation_settings", JSON.stringify(settings));
            syncSuccess = true;
        }
        
        if (syncSuccess) {
            updateCloudStatusUI("connected");
            showToast("เชื่อมต่อและซิงค์ข้อมูลกับ Cloud สำเร็จ", "success");
        } else {
            updateCloudStatusUI("error");
            showToast("การเชื่อมต่อ Cloud ขัดข้อง กำลังใช้ข้อมูลในเครื่อง", "error");
        }
    } else {
        updateCloudStatusUI("local");
    }

    loadSettingsIntoForm();
    renderDatabaseTable();
    renderJobsTable();
    setupEventListeners();
    calculateAll();
}

// ==========================================
// 3. UI HELPER & SYSTEM FUNCTIONS
// ==========================================

function initLiveClock() {
    const clockEl = document.getElementById("live-time");
    setInterval(() => {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString("th-TH");
    }, 1000);
}

function initTabs() {
    const navButtons = document.querySelectorAll(".nav-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");

            // If switching away from planner or history, exit preview mode
            if (isPreviewMode && targetTab !== "planner" && targetTab !== "history") {
                exitPreviewMode();
            }

            // Update Active Nav Button
            navButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // Update Active Content Tab
            tabContents.forEach(tab => {
                tab.classList.remove("active");
                if (tab.id === `tab-${targetTab}`) {
                    tab.classList.add("active");
                }
            });

            // Trigger background sync from Cloud when clicking tabs to get latest updates
            if (settings.firebaseUrl) {
                if (targetTab === "history" || targetTab === "planner" || targetTab === "database") {
                    fetchCloudData("treatment_db").then(cloudDb => {
                        if (cloudDb !== null) {
                            treatmentDb = cloudDb;
                            localStorage.setItem("treatment_db", JSON.stringify(treatmentDb));
                            if (targetTab === "database") renderDatabaseTable();
                            else if (targetTab === "planner") renderJobsTable();
                        }
                    });
                }
                
                if (targetTab === "history") {
                    fetchCloudData("saved_plans").then(cloudPlans => {
                        if (cloudPlans !== null) {
                            localStorage.setItem("saved_plans", JSON.stringify(cloudPlans));
                            renderHistoryTable();
                        }
                    });
                }
            } else {
                // If not using cloud, just render history locally
                if (targetTab === "history") {
                    renderHistoryTable();
                }
            }
        });
    });
}

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    
    // Style by type
    if (type === "error") {
        toast.style.borderColor = "var(--color-danger-glow)";
        toast.style.borderLeft = "4px solid var(--color-danger)";
    } else {
        toast.style.borderColor = "var(--border-color-glow)";
        toast.style.borderLeft = "4px solid var(--color-primary)";
    }
    
    toast.classList.add("active");
    setTimeout(() => {
        toast.classList.remove("active");
    }, 3000);
}

function formatMinutes(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60);
    if (hours === 0) {
        return `${mins} นาที`;
    }
    return `${hours} ชม. ${mins.toString().padStart(2, "0")} นาที`;
}

// Get standard time calculation for a treatment code
function getTreatmentCalculations(spec) {
    if (!spec) return { runTimePerRoll: 0, totalTimePerRoll: 0 };
    const timePerRoll = spec.timePerRoll || 0;
    return {
        runTimePerRoll: timePerRoll,
        totalTimePerRoll: timePerRoll
    };
}

// ==========================================
// 4. CALCULATION ENGINE & STATS
// ==========================================

function parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
}

function formatMinutesToTime(totalMinutes) {
    const wrappedMinutes = (totalMinutes + 1440) % 1440;
    const h = Math.floor(wrappedMinutes / 60);
    const m = Math.round(wrappedMinutes % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function calculateAll() {
    let totalRolls = 0;
    let totalRunMinutes = 0;
    const itemsBreakdown = [];
    let codeChangeCount = 0;

    const singleCodeChangeTime = settings.codeChangeTime !== undefined ? settings.codeChangeTime : 5;

    // Calculate each job row
    currentJobs.forEach((job, index) => {
        const spec = treatmentDb.find(t => t.code === job.code);
        if (!spec) return;

        const calcs = getTreatmentCalculations(spec);
        const jobTotalTime = calcs.totalTimePerRoll * job.rolls;

        totalRolls += job.rolls;
        totalRunMinutes += jobTotalTime;

        itemsBreakdown.push({
            type: "job",
            code: job.code,
            rolls: job.rolls,
            totalMinutes: jobTotalTime,
            color: SEGMENT_COLORS[index % SEGMENT_COLORS.length]
        });

        // Check if there is a next job and if code changes
        if (index < currentJobs.length - 1) {
            const nextJob = currentJobs[index + 1];
            if (nextJob.code !== job.code) {
                codeChangeCount++;
                itemsBreakdown.push({
                    type: "code_change",
                    label: `เปลี่ยนโค้ด (${job.code} → ${nextJob.code})`,
                    totalMinutes: singleCodeChangeTime,
                    color: CODE_CHANGE_COLOR
                });
            }
        }
    });

    const totalCodeChangeTime = codeChangeCount * singleCodeChangeTime;
    const startupTime = settings.startupTime !== undefined ? settings.startupTime : 15;
    const plannedDowntime = settings.plannedDowntime !== undefined ? settings.plannedDowntime : 0;
    const totalNeededMinutes = startupTime + totalRunMinutes + plannedDowntime + totalCodeChangeTime;

    // Shift Calculations
    const startMinutes = parseTimeToMinutes(settings.startTime || "07:00");
    const endMinutes = parseTimeToMinutes(settings.endTime || "15:00");
    
    let regularShiftMinutes = endMinutes - startMinutes;
    if (regularShiftMinutes <= 0) {
        regularShiftMinutes += 1440; // Over midnight wrap
    }

    // OT Calculation
    let otMinutes = 0;
    if (totalNeededMinutes > regularShiftMinutes) {
        otMinutes = totalNeededMinutes - regularShiftMinutes;
    }

    const finishMinutes = startMinutes + totalNeededMinutes;
    const finishTimeStr = formatMinutesToTime(finishMinutes);

    // Update KPI Card values
    document.getElementById("kpi-total-time").textContent = formatMinutes(totalNeededMinutes);
    document.getElementById("kpi-total-minutes").textContent = `${Math.round(totalNeededMinutes)} นาที (รวม Start Up ${startupTime} น.)`;
    document.getElementById("kpi-total-rolls").textContent = `${totalRolls} ม้วน`;

    const avgTimePerRoll = totalRolls > 0 ? (totalRunMinutes / totalRolls) : 0;
    document.getElementById("kpi-avg-time-per-roll").textContent = `เฉลี่ย ${avgTimePerRoll.toFixed(1)} นาที/ม้วน`;

    // Utilization Gauge (Normalized against regular shift capacity)
    const utilizationRate = (totalNeededMinutes / regularShiftMinutes) * 100;
    const uPercent = utilizationRate.toFixed(1);
    document.getElementById("kpi-utilization").textContent = `${uPercent}%`;
    document.getElementById("kpi-available-time").textContent = `รันงาน ${formatMinutes(totalNeededMinutes)} จากเวลาปกติ ${formatMinutes(regularShiftMinutes)}`;

    // Set gauge ring circle stroke
    const circle = document.getElementById("gauge-fill");
    const cappedPercent = Math.min(100, utilizationRate);
    circle.style.stroke_dasharray = `${cappedPercent}, 100`; // Note: using dasharray directly via style
    circle.setAttribute("stroke-dasharray", `${cappedPercent}, 100`);

    // Alert color change if overcapacity
    if (utilizationRate > 100) {
        circle.style.stroke = "var(--color-danger)";
        document.getElementById("kpi-utilization").style.color = "var(--color-danger)";
    } else if (utilizationRate > 85) {
        circle.style.stroke = "var(--color-orange)";
        document.getElementById("kpi-utilization").style.color = "var(--color-orange)";
    } else {
        circle.style.stroke = "var(--color-green)";
        document.getElementById("kpi-utilization").style.color = "var(--color-green)";
    }

    // Update OT Card
    const finishOtValueEl = document.getElementById("kpi-finish-ot");
    const otHoursSubEl = document.getElementById("kpi-ot-hours");
    
    finishOtValueEl.textContent = `${finishTimeStr} น.`;
    if (otMinutes > 0) {
        const otHours = (otMinutes / 60).toFixed(1);
        otHoursSubEl.innerHTML = `<span class="text-danger" style="font-weight:600;">เกินเวลาปกติ | OT ${formatMinutes(otMinutes)} (${otHours} ชม.)</span>`;
        finishOtValueEl.style.color = "var(--color-danger)";
    } else {
        otHoursSubEl.textContent = `ปกติเลิก ${settings.endTime || "15:00"} น. | ไม่มี OT`;
        finishOtValueEl.style.color = "var(--text-primary)";
    }

    // Update Detail Box in Right Panel
    document.getElementById("summary-workday").textContent = `${(regularShiftMinutes / 60).toFixed(1)} ชม. (${regularShiftMinutes} นาที)`;
    document.getElementById("summary-run-time").textContent = `${Math.round(totalRunMinutes)} นาที`;
    document.getElementById("summary-downtime").textContent = `${plannedDowntime} นาที (+ Startup ${startupTime} น.)`;
    
    // Update Code Change summary in UI
    const codeChangeSummaryEl = document.getElementById("summary-code-change");
    if (codeChangeSummaryEl) {
        codeChangeSummaryEl.textContent = totalCodeChangeTime > 0 ? `${totalCodeChangeTime} นาที (${codeChangeCount} ครั้ง)` : "0 นาที";
    }

    const remainingEl = document.getElementById("summary-remaining-time");
    const remainingMinutes = Math.max(0, regularShiftMinutes - totalNeededMinutes);
    if (totalNeededMinutes > regularShiftMinutes) {
        remainingEl.textContent = `เกินเวลาปกติ (OT) ${Math.round(totalNeededMinutes - regularShiftMinutes)} นาที`;
        remainingEl.className = "text-danger";
    } else {
        remainingEl.textContent = `${Math.round(remainingMinutes)} นาที`;
        remainingEl.className = "text-green";
    }

    // Draw Stacked Progress Bar & Legend
    const totalCapacityForBar = Math.max(regularShiftMinutes, totalNeededMinutes);
    renderBreakdownChart(itemsBreakdown, startupTime, plannedDowntime, totalCapacityForBar, regularShiftMinutes, totalCodeChangeTime, codeChangeCount);
}

function renderBreakdownChart(items, startup, downtime, totalCapacity, regularShiftMinutes, codeChangeTotal, codeChangeCount) {
    const stackContainer = document.getElementById("progress-stack");
    const legendList = document.getElementById("legend-list");
    
    // Clear dynamic blocks
    stackContainer.innerHTML = "";
    legendList.innerHTML = "";

    if (items.length === 0 && startup === 0 && downtime === 0) {
        stackContainer.style.display = "none";
        legendList.innerHTML = "<p style='color: var(--text-muted); font-size: 13px; text-align: center;'>ไม่มีข้อมูลแผนงาน</p>";
        return;
    }
    stackContainer.style.display = "flex";

    // Add Startup Segment first
    if (startup > 0) {
        const startupPercent = (startup / totalCapacity) * 100;
        const segment = document.createElement("div");
        segment.className = "progress-segment";
        segment.style.width = `${startupPercent}%`;
        segment.style.backgroundColor = STARTUP_COLOR;
        segment.setAttribute("data-tooltip", `เตรียมระบบ Start Up: ${formatMinutes(startup)}`);
        stackContainer.appendChild(segment);

        // Legend for Startup
        const legend = document.createElement("div");
        legend.className = "legend-item";
        legend.innerHTML = `
            <div class="legend-info">
                <span class="legend-color" style="background-color: ${STARTUP_COLOR}"></span>
                <strong>เวลาเตรียมระบบ (Start Up)</strong>
            </div>
            <strong>${formatMinutes(startup)}</strong>
        `;
        legendList.appendChild(legend);
    }

    // Draw Stacked Bars for Jobs and Code Changes
    items.forEach(item => {
        const widthPercent = (item.totalMinutes / totalCapacity) * 100;
        if (widthPercent <= 0) return;

        const segment = document.createElement("div");
        segment.className = "progress-segment";
        segment.style.width = `${widthPercent}%`;
        segment.style.backgroundColor = item.color;
        
        if (item.type === "job") {
            segment.setAttribute("data-tooltip", `${item.code}: ${formatMinutes(item.totalMinutes)} (${item.rolls} ม้วน)`);
        } else {
            segment.setAttribute("data-tooltip", `${item.label}: ${formatMinutes(item.totalMinutes)}`);
        }
        stackContainer.appendChild(segment);

        // Add Job to Legend (Code Change legend is grouped separately)
        if (item.type === "job") {
            const legend = document.createElement("div");
            legend.className = "legend-item";
            legend.innerHTML = `
                <div class="legend-info">
                    <span class="legend-color" style="background-color: ${item.color}"></span>
                    <strong>${item.code}</strong>
                    <span>(${item.rolls} ม้วน)</span>
                </div>
                <strong>${formatMinutes(item.totalMinutes)}</strong>
            `;
            legendList.appendChild(legend);
        }
    });

    // Add grouped Code Change Legend
    if (codeChangeTotal > 0) {
        const legend = document.createElement("div");
        legend.className = "legend-item";
        legend.innerHTML = `
            <div class="legend-info">
                <span class="legend-color" style="background-color: ${CODE_CHANGE_COLOR}"></span>
                <strong>เวลาเปลี่ยนสเปกสะสม (Code Change)</strong>
                <span>(${codeChangeCount} ครั้ง)</span>
            </div>
            <strong>${formatMinutes(codeChangeTotal)}</strong>
        `;
        legendList.appendChild(legend);
    }

    // Add Downtime Segment
    if (downtime > 0) {
        const downtimePercent = (downtime / totalCapacity) * 100;
        const segment = document.createElement("div");
        segment.className = "progress-segment";
        segment.style.width = `${downtimePercent}%`;
        segment.style.backgroundColor = DOWNTIME_COLOR;
        segment.setAttribute("data-tooltip", `เวลาหยุดตามแผน: ${formatMinutes(downtime)}`);
        stackContainer.appendChild(segment);

        // Legend for Downtime
        const legend = document.createElement("div");
        legend.className = "legend-item";
        legend.innerHTML = `
            <div class="legend-info">
                <span class="legend-color" style="background-color: ${DOWNTIME_COLOR}"></span>
                <strong>เวลาหยุดสะสม (Downtime)</strong>
            </div>
            <strong>${formatMinutes(downtime)}</strong>
        `;
        legendList.appendChild(legend);
    }

    // Add Remaining Space Segment
    const totalSpentTime = startup + items.reduce((acc, i) => acc + i.totalMinutes, 0) + downtime;
    if (regularShiftMinutes > totalSpentTime) {
        const remaining = regularShiftMinutes - totalSpentTime;
        const remainingPercent = (remaining / totalCapacity) * 100;
        const segment = document.createElement("div");
        segment.className = "progress-segment";
        segment.style.width = `${remainingPercent}%`;
        segment.style.backgroundColor = REMAINING_COLOR;
        segment.setAttribute("data-tooltip", `เวลาทำงานปกติคงเหลือ: ${formatMinutes(remaining)}`);
        stackContainer.appendChild(segment);

        // Legend for Remaining
        const legend = document.createElement("div");
        legend.className = "legend-item";
        legend.innerHTML = `
            <div class="legend-info">
                <span class="legend-color" style="background-color: rgba(255,255,255,0.1)"></span>
                <span>เวลาทำงานปกติคงเหลือ (Remaining Capacity)</span>
            </div>
            <strong class="text-green">${formatMinutes(remaining)}</strong>
        `;
        legendList.appendChild(legend);
    }
}

// ==========================================
// 5. JOBS TABLE MANAGEMENT
// ==========================================

function renderJobsTable() {
    const tbody = document.getElementById("job-list");
    const emptyState = document.getElementById("no-jobs-message");
    
    tbody.innerHTML = "";

    // Show/hide add job button based on preview mode
    const addJobBtn = document.getElementById("btn-add-job");
    if (addJobBtn) {
        addJobBtn.disabled = isPreviewMode;
        addJobBtn.style.display = isPreviewMode ? "none" : "inline-flex";
    }
    
    // Show/hide save plan button in header based on preview mode
    const saveTriggerBtn = document.getElementById("btn-save-plan-trigger");
    if (saveTriggerBtn) {
        saveTriggerBtn.disabled = isPreviewMode;
        saveTriggerBtn.style.display = isPreviewMode ? "none" : "inline-flex";
    }

    if (currentJobs.length === 0) {
        emptyState.style.display = "flex";
        return;
    }
    emptyState.style.display = "none";

    currentJobs.forEach((job, index) => {
        const tr = document.createElement("tr");
        tr.setAttribute("data-index", index);

        // Select Options
        let optionsHtml = "";
        treatmentDb.forEach(t => {
            const selected = t.code === job.code ? "selected" : "";
            optionsHtml += `<option value="${t.code}" ${selected}>${t.code}</option>`;
        });

        const spec = treatmentDb.find(t => t.code === job.code) || treatmentDb[0];
        if (spec && job.code !== spec.code) {
            job.code = spec.code; // Fix mismatch if database item was deleted
        }

        const calcs = getTreatmentCalculations(spec);
        const rowTotalMinutes = calcs.totalTimePerRoll * job.rolls;

        const disabledAttr = isPreviewMode ? "disabled" : "";

        tr.innerHTML = `
            <td>
                <select class="select-input job-code-select" ${disabledAttr}>
                    ${optionsHtml}
                </select>
            </td>
            <td><span class="job-compound text-muted">${spec ? (spec.compound || "-") : "-"}</span></td>
            <td><span class="job-thickness text-muted">${spec ? spec.thickness : "-"}</span></td>
            <td><span class="job-speed text-muted">${spec ? spec.speed : "-"} MPM</span></td>
            <td><span class="job-time-per-roll text-bold">${calcs.totalTimePerRoll} นาที</span></td>
            <td>
                <input type="number" class="number-input job-rolls-input" min="1" step="1" value="${job.rolls}" ${disabledAttr}>
            </td>
            <td><span class="job-total-time text-highlight">${formatMinutes(rowTotalMinutes)}</span></td>
            <td style="text-align: center;">
                <button class="btn-delete-row" title="ลบรายการรันงาน" ${disabledAttr}>
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    // Attach row events
    if (!isPreviewMode) {
        attachRowEventListeners();
    }
}

function attachRowEventListeners() {
    const rows = document.querySelectorAll("#job-list tr");
    
    rows.forEach(tr => {
        const index = parseInt(tr.getAttribute("data-index"));
        const select = tr.querySelector(".job-code-select");
        const rollsInput = tr.querySelector(".job-rolls-input");
        const deleteBtn = tr.querySelector(".btn-delete-row");

        // Code selector change
        select.addEventListener("change", (e) => {
            const newCode = e.target.value;
            currentJobs[index].code = newCode;
            saveJobsToStorage();
            
            // Fast cell updates before full calculation
            const spec = treatmentDb.find(t => t.code === newCode);
            const calcs = getTreatmentCalculations(spec);
            tr.querySelector(".job-compound").textContent = spec.compound || "-";
            tr.querySelector(".job-thickness").textContent = spec.thickness;
            tr.querySelector(".job-speed").textContent = `${spec.speed} MPM`;
            tr.querySelector(".job-time-per-roll").textContent = `${calcs.totalTimePerRoll} นาที`;
            
            updateRowTotalTime(tr, calcs.totalTimePerRoll, currentJobs[index].rolls);
            calculateAll();
        });

        // Rolls input change
        rollsInput.addEventListener("input", (e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 1) val = 1;
            
            currentJobs[index].rolls = val;
            saveJobsToStorage();

            const spec = treatmentDb.find(t => t.code === currentJobs[index].code);
            const calcs = getTreatmentCalculations(spec);
            
            updateRowTotalTime(tr, calcs.totalTimePerRoll, val);
            calculateAll();
        });

        // Delete Row
        deleteBtn.addEventListener("click", () => {
            currentJobs.splice(index, 1);
            saveJobsToStorage();
            renderJobsTable();
            calculateAll();
            showToast("ลบรายการรันงานเรียบร้อยแล้ว", "success");
        });
    });
}

function updateRowTotalTime(rowElement, timePerRoll, rolls) {
    const totalMin = timePerRoll * rolls;
    rowElement.querySelector(".job-total-time").textContent = formatMinutes(totalMin);
}

// ==========================================
// 6. MASTER DATABASE MANAGEMENT
// ==========================================

function renderDatabaseTable() {
    const tbody = document.getElementById("db-treatment-list");
    tbody.innerHTML = "";

    treatmentDb.forEach((spec) => {
        const calcs = getTreatmentCalculations(spec);
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td class="text-bold">${spec.code}</td>
            <td>${spec.compound || "-"}</td>
            <td>${spec.thickness || "-"}</td>
            <td>${spec.speed} MPM</td>
            <td>${spec.length} m</td>
            <td><span class="text-highlight">${spec.timePerRoll} นาที/ม้วน</span></td>
            <td style="text-align: center;">
                <button class="btn btn-secondary btn-sm btn-icon-only btn-edit-db" data-code="${spec.code}" title="แก้ไขข้อมูล">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn btn-danger btn-sm btn-icon-only btn-delete-db" data-code="${spec.code}" title="ลบข้อมูล">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    // Attach DB Action Listeners
    attachDbRowEventListeners();
}

function attachDbRowEventListeners() {
    // Edit item
    document.querySelectorAll(".btn-edit-db").forEach(btn => {
        btn.addEventListener("click", () => {
            const code = btn.getAttribute("data-code");
            const spec = treatmentDb.find(t => t.code === code);
            if (!spec) return;

            openTreatmentModal("edit", spec);
        });
    });

    // Delete item
    document.querySelectorAll(".btn-delete-db").forEach(btn => {
        btn.addEventListener("click", () => {
            const code = btn.getAttribute("data-code");
            
            // Check if code is in use in current daily jobs
            const inUse = currentJobs.some(job => job.code === code);
            if (inUse) {
                alert(`ไม่สามารถลบโค้ด "${code}" ได้เนื่องจากกำลังถูกใช้งานในตารางแผนงานวันนี้ กรุณาลบออกจากแผนก่อนลบจากฐานข้อมูล`);
                return;
            }

            if (confirm(`คุณแน่ใจหรือไม่ที่จะลบรหัส "${code}" ออกจากฐานข้อมูล?`)) {
                treatmentDb = treatmentDb.filter(t => t.code !== code);
                saveDbToStorage();
                renderDatabaseTable();
                renderJobsTable(); // update selection dropdowns
                calculateAll();
                showToast(`ลบรหัส "${code}" สำเร็จ`, "success");
            }
        });
    });
}

// ==========================================
// 7. MODAL & SETTINGS ENGINE
// ==========================================

const modal = document.getElementById("modal-treatment");

function openTreatmentModal(mode = "add", spec = null) {
    const titleEl = document.getElementById("modal-title");
    const modeEl = document.getElementById("modal-action-mode");
    const origCodeEl = document.getElementById("modal-original-code");
    
    const inputCode = document.getElementById("modal-input-code");
    const inputCompound = document.getElementById("modal-input-compound") || document.createElement("input");
    const inputThickness = document.getElementById("modal-input-thickness");
    const inputSpeed = document.getElementById("modal-input-speed");
    const inputLength = document.getElementById("modal-input-length");
    const inputTimeRoll = document.getElementById("modal-input-time-roll");

    modeEl.value = mode;

    if (mode === "edit" && spec) {
        titleEl.textContent = `แก้ไขรหัส Treatment: ${spec.code}`;
        origCodeEl.value = spec.code;
        
        inputCode.value = spec.code;
        inputCode.disabled = true; // don't change key directly
        if (document.getElementById("modal-input-compound")) {
            document.getElementById("modal-input-compound").value = spec.compound || "";
        }
        inputThickness.value = spec.thickness;
        inputSpeed.value = spec.speed;
        inputLength.value = spec.length;
        inputTimeRoll.value = spec.timePerRoll;
    } else {
        titleEl.textContent = "เพิ่มรหัส Treatment ใหม่";
        origCodeEl.value = "";
        
        inputCode.value = "";
        inputCode.disabled = false;
        if (document.getElementById("modal-input-compound")) {
            document.getElementById("modal-input-compound").value = "";
        }
        inputThickness.value = "";
        inputSpeed.value = "";
        inputLength.value = "";
        inputTimeRoll.value = "";
    }

    modal.classList.add("active");
}

function closeTreatmentModal() {
    modal.classList.remove("active");
}

function loadSettingsIntoForm() {
    document.getElementById("setting-start-time").value = settings.startTime || "07:00";
    document.getElementById("setting-end-time").value = settings.endTime || "15:00";
    document.getElementById("setting-startup-time").value = settings.startupTime !== undefined ? settings.startupTime : 15;
    document.getElementById("setting-planned-downtime").value = settings.plannedDowntime !== undefined ? settings.plannedDowntime : 0;
    document.getElementById("setting-code-change-time").value = settings.codeChangeTime || 5;
}

// ==========================================
// 8. EXPORTS & ATTACH EVENTS
// ==========================================

function setupEventListeners() {
    // Add Daily Job Event
    document.getElementById("btn-add-job").addEventListener("click", () => {
        if (treatmentDb.length === 0) {
            showToast("กรุณาเพิ่มรหัสในฐานข้อมูลก่อนวางแผนงาน", "error");
            return;
        }
        // Add default using first available spec
        currentJobs.push({
            code: treatmentDb[0].code,
            rolls: 5
        });
        saveJobsToStorage();
        renderJobsTable();
        calculateAll();
        showToast("เพิ่มแถวทำงานรันใหม่เรียบร้อย", "success");
    });

    // Save Settings Event
    document.getElementById("btn-save-settings").addEventListener("click", () => {
        const startTime = document.getElementById("setting-start-time").value;
        const endTime = document.getElementById("setting-end-time").value;
        const startupTime = parseInt(document.getElementById("setting-startup-time").value);
        const downtime = parseInt(document.getElementById("setting-planned-downtime").value);
        const codeChangeTime = parseInt(document.getElementById("setting-code-change-time").value);

        if (!startTime || !endTime) {
            showToast("กรุณากรอกเวลาเริ่มและเวลาเลิกงาน", "error");
            return;
        }

        if (isNaN(startupTime) || startupTime < 0 || startupTime > 180) {
            showToast("เวลา Start Up ต้องอยู่ระหว่าง 0 - 180 นาที", "error");
            return;
        }

        if (isNaN(downtime) || downtime < 0 || downtime > 1440) {
            showToast("เวลาซ่อมบำรุงประจำวันต้องอยู่ระหว่าง 0 - 1440 นาที", "error");
            return;
        }

        if (isNaN(codeChangeTime) || codeChangeTime < 0 || codeChangeTime > 180) {
            showToast("เวลาเปลี่ยนโค้ดต้องอยู่ระหว่าง 0 - 180 นาที", "error");
            return;
        }

        settings.startTime = startTime;
        settings.endTime = endTime;
        settings.startupTime = startupTime;
        settings.plannedDowntime = downtime;
        settings.codeChangeTime = codeChangeTime;
        saveSettingsToStorage();
        
        calculateAll();
        showToast("บันทึกการตั้งค่าแล้ว", "success");
    });

    // Reset All Database Event
    document.getElementById("btn-reset-db").addEventListener("click", () => {
        if (confirm("ต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นโรงงานใช่หรือไม่? แผนงานและรหัสที่เพิ่มเข้าไปใหม่จะถูกลบ!")) {
            localStorage.clear();
            treatmentDb = DEFAULT_TREATMENTS;
            currentJobs = DEFAULT_JOBS;
            settings = DEFAULT_SETTINGS;
            
            saveDbToStorage();
            saveJobsToStorage();
            saveSettingsToStorage();

            loadSettingsIntoForm();
            renderDatabaseTable();
            renderJobsTable();
            calculateAll();
            showToast("รีเซ็ตระบบเป็นค่าเริ่มต้นเรียบร้อยแล้ว", "success");
        }
    });

    // CSV Export
    document.getElementById("btn-export-csv").addEventListener("click", exportToCSV);

    // Print
    document.getElementById("btn-print").addEventListener("click", () => {
        window.print();
    });

    // Add DB item trigger
    document.getElementById("btn-add-db-item").addEventListener("click", () => {
        openTreatmentModal("add");
    });

    // Modal cancellation/close
    document.getElementById("modal-btn-close").addEventListener("click", closeTreatmentModal);
    document.getElementById("modal-btn-cancel").addEventListener("click", closeTreatmentModal);
    
    // Close modal on clicking backdrop
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeTreatmentModal();
    });

    // Modal Form Submit (Save code spec)
    document.getElementById("modal-form").addEventListener("submit", (e) => {
        e.preventDefault();

        const mode = document.getElementById("modal-action-mode").value;
        const code = document.getElementById("modal-input-code").value.trim().toUpperCase();
        const compound = document.getElementById("modal-input-compound") ? document.getElementById("modal-input-compound").value.trim() : "";
        const thickness = document.getElementById("modal-input-thickness").value.trim();
        const speed = parseFloat(document.getElementById("modal-input-speed").value);
        const length = parseInt(document.getElementById("modal-input-length").value);
        const timePerRoll = parseFloat(document.getElementById("modal-input-time-roll").value) || 0;

        if (!code || isNaN(speed) || isNaN(length) || isNaN(timePerRoll)) {
            showToast("กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน", "error");
            return;
        }

        if (mode === "add") {
            // Check duplicated key
            const isExist = treatmentDb.some(t => t.code === code);
            if (isExist) {
                showToast(`รหัส "${code}" มีอยู่ในฐานข้อมูลแล้ว`, "error");
                return;
            }

            treatmentDb.push({ code, compound, thickness, speed, length, timePerRoll });
            showToast(`เพิ่มรหัส "${code}" สำเร็จ`);
        } else {
            // Edit mode
            const index = treatmentDb.findIndex(t => t.code === code);
            if (index !== -1) {
                treatmentDb[index] = { code, compound, thickness, speed, length, timePerRoll };
                showToast(`บันทึกรหัส "${code}" สำเร็จ`);
            }
        }

        saveDbToStorage();
        closeTreatmentModal();
        renderDatabaseTable();
        renderJobsTable(); // update selection lists in jobs planner
        calculateAll();
    });

    // Save Plan Modal Event Listeners
    document.getElementById("btn-save-plan-trigger").addEventListener("click", openSavePlanModal);
    document.getElementById("modal-save-btn-close").addEventListener("click", closeSavePlanModal);
    document.getElementById("modal-save-btn-cancel").addEventListener("click", closeSavePlanModal);
    
    const saveModal = document.getElementById("modal-save-plan");
    saveModal.addEventListener("click", (e) => {
        if (e.target === saveModal) closeSavePlanModal();
    });

    document.getElementById("modal-save-form").addEventListener("submit", (e) => {
        e.preventDefault();
        
        const dateVal = document.getElementById("save-plan-date").value;
        const noteVal = document.getElementById("save-plan-note").value.trim();
        
        if (!dateVal) {
            showToast("กรุณาระบุวันที่ของแผนงาน", "error");
            return;
        }

        const savedPlans = JSON.parse(localStorage.getItem("saved_plans")) || [];
        
        const newPlan = {
            id: "plan_" + Date.now(),
            date: dateVal,
            note: noteVal,
            jobs: JSON.parse(JSON.stringify(currentJobs)),
            settings: JSON.parse(JSON.stringify(settings)),
            timestamp: Date.now()
        };

        savedPlans.push(newPlan);
        localStorage.setItem("saved_plans", JSON.stringify(savedPlans));
        
        closeSavePlanModal();
        showToast("บันทึกแผนงานประจำวันเรียบร้อยแล้ว", "success");
        
        const historyTab = document.getElementById("tab-history");
        if (historyTab && historyTab.classList.contains("active")) {
            renderHistoryTable();
        }
        
        if (settings.firebaseUrl) {
            saveCloudData("saved_plans", savedPlans);
        }
    });

    // Exit Preview Mode Event Listener
    const exitPreviewBtn = document.getElementById("btn-exit-preview");
    if (exitPreviewBtn) {
        exitPreviewBtn.addEventListener("click", exitPreviewMode);
    }

    // Cloud Database Save Sync
    const btnSaveCloud = document.getElementById("btn-save-cloud");
    if (btnSaveCloud) {
        btnSaveCloud.addEventListener("click", async () => {
            const urlInput = document.getElementById("setting-firebase-url").value.trim();
            if (!urlInput) {
                showToast("กรุณากรอก URL ของ Firebase", "error");
                return;
            }
            
            if (!urlInput.startsWith("http://") && !urlInput.startsWith("https://")) {
                showToast("URL ต้องเริ่มต้นด้วย http:// หรือ https://", "error");
                return;
            }

            settings.firebaseUrl = urlInput;
            saveSettingsToStorage();
            
            updateCloudStatusUI("connecting");
            
            const testFetch = await fetchCloudData("treatment_db");
            if (testFetch !== null) {
                treatmentDb = testFetch;
                localStorage.setItem("treatment_db", JSON.stringify(treatmentDb));
                
                const cloudPlans = await fetchCloudData("saved_plans");
                if (cloudPlans !== null) {
                    localStorage.setItem("saved_plans", JSON.stringify(cloudPlans));
                }
                
                const cloudSettings = await fetchCloudData("operation_settings");
                if (cloudSettings !== null) {
                    const oldUrl = settings.firebaseUrl;
                    settings = { ...DEFAULT_SETTINGS, ...cloudSettings, firebaseUrl: oldUrl };
                    localStorage.setItem("operation_settings", JSON.stringify(settings));
                }

                updateCloudStatusUI("connected");
                renderDatabaseTable();
                renderJobsTable();
                loadSettingsIntoForm();
                calculateAll();
                showToast("เชื่อมต่อ Cloud และดาวน์โหลดข้อมูลเสร็จสิ้น", "success");
            } else {
                showToast("ไม่พบข้อมูลบนคลาวด์ กำลังอัปโหลดข้อมูลเริ่มต้น...", "success");
                
                const successDb = await saveCloudData("treatment_db", treatmentDb);
                const savedPlans = JSON.parse(localStorage.getItem("saved_plans")) || [];
                const successPlans = await saveCloudData("saved_plans", savedPlans);
                const successSettings = await saveCloudData("operation_settings", settings);

                if (successDb && successSettings && successPlans) {
                    updateCloudStatusUI("connected");
                    showToast("อัปโหลดข้อมูลเครื่องนี้ขึ้นคลาวด์และเปิดซิงค์สำเร็จ", "success");
                } else {
                    updateCloudStatusUI("error");
                    showToast("ไม่สามารถเข้าถึงฐานข้อมูล Firebase ได้ กรุณาตรวจสอบกฎความปลอดภัย", "error");
                }
            }
        });
    }

    // Cloud Database Clear Sync
    const btnClearCloud = document.getElementById("btn-clear-cloud");
    if (btnClearCloud) {
        btnClearCloud.addEventListener("click", () => {
            if (confirm("ต้องการยกเลิกการเชื่อมต่อกับคลาวด์และสลับกลับมาใช้ฐานข้อมูลในเครื่องนี้ใช่หรือไม่? (ข้อมูลจะเก็บแยกกัน)")) {
                settings.firebaseUrl = "";
                saveSettingsToStorage();
                updateCloudStatusUI("local");
                document.getElementById("setting-firebase-url").value = "";
                showToast("ยกเลิกการซิงค์ Cloud เรียบร้อยแล้ว", "success");
            }
        });
    }
}

function exportToCSV(dateStr) {
    if (currentJobs.length === 0) {
        showToast("ไม่มีรายการทำงานที่จะส่งออก", "error");
        return;
    }

    let csvContent = "\ufeff"; // Add BOM for excel Thai letters compatibility
    
    // Title & Metadata
    csvContent += `3roll Daily planning plan,,,,,,, \n`;
    csvContent += `พิมพ์เมื่อวันที่,${new Date().toLocaleDateString("th-TH")},,,,,, \n\n`;

    // Shift & Settings info
    const startM = parseTimeToMinutes(settings.startTime || "07:00");
    const endM = parseTimeToMinutes(settings.endTime || "15:00");
    let shiftM = endM - startM;
    if (shiftM <= 0) shiftM += 1440;

    const codeChangeRate = settings.codeChangeTime !== undefined ? settings.codeChangeTime : 5;
    csvContent += `เวลาเริ่มงาน,${settings.startTime || "07:00"},,,เวลาเลิกงานปกติ,${settings.endTime || "15:00"},\n`;
    csvContent += `เวลา Start Up,${settings.startupTime !== undefined ? settings.startupTime : 15} นาที,,,เวลาหยุด Downtime,${settings.plannedDowntime !== undefined ? settings.plannedDowntime : 0} นาที,,,เวลาเปลี่ยนโค้ด,${codeChangeRate} นาที/ครั้ง\n\n`;

    // Table Headers
    csvContent += "ลำดับ (Seq),รหัสวัสดุ (Code),รหัส Compound,ความหนา (Thickness),ความเร็ว (Speed-MPM),เวลาต่อม้วน (Min/Roll),จำนวนม้วน (Rolls),เวลารวม (Total Time-min)\n";

    let totalRolls = 0;
    let totalMinutes = 0;
    let codeChangeCount = 0;

    currentJobs.forEach((job, index) => {
        const spec = treatmentDb.find(t => t.code === job.code);
        const calcs = getTreatmentCalculations(spec);
        const totalJobTime = calcs.totalTimePerRoll * job.rolls;

        totalRolls += job.rolls;
        totalMinutes += totalJobTime;

        csvContent += `${index + 1},${job.code},${spec ? (spec.compound || "-") : "-"},${spec ? spec.thickness : "-"},${spec ? spec.speed : "-"},${calcs.totalTimePerRoll},${job.rolls},${totalJobTime.toFixed(1)}\n`;

        // Count code changes
        if (index < currentJobs.length - 1) {
            const nextJob = currentJobs[index + 1];
            if (nextJob.code !== job.code) {
                codeChangeCount++;
            }
        }
    });

    const totalCodeChangeTime = codeChangeCount * codeChangeRate;
    const startupM = settings.startupTime !== undefined ? settings.startupTime : 15;
    const downtimeM = settings.plannedDowntime !== undefined ? settings.plannedDowntime : 0;
    const overallTotal = totalMinutes + startupM + downtimeM + totalCodeChangeTime;
    let otM = 0;
    if (overallTotal > shiftM) {
        otM = overallTotal - shiftM;
    }

    // Summary lines
    csvContent += `\n`;
    csvContent += `,,,เวลา Start Up,,,${startupM} นาที\n`;
    csvContent += `,,,เวลารันงานสุทธิ,,${totalRolls} ม้วน,${totalMinutes.toFixed(1)} นาที\n`;
    csvContent += `,,,เวลาเปลี่ยนโค้ดสะสม,,${codeChangeCount} ครั้ง,${totalCodeChangeTime} นาที\n`;
    csvContent += `,,,เวลาหยุด Downtime,,,${downtimeM} นาที\n`;
    csvContent += `,,,เวลารวมทั้งหมด,,,${overallTotal.toFixed(1)} นาที (${(overallTotal / 60).toFixed(2)} ชั่วโมง)\n`;
    csvContent += `,,,เวลาเลิกงานรันจริง,,,${formatMinutesToTime(startM + overallTotal)} น.\n`;
    csvContent += `,,,ชั่วโมง OT,,,${(otM / 60).toFixed(1)} ชั่วโมง (${otM} นาที)\n`;
    
    // Create download trigger
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const filenameDate = typeof dateStr === 'string' ? dateStr : new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `3roll-daily-planning-${filenameDate}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==========================================
// 9. DAILY PLAN SAVE & HISTORY LOG SYSTEM
// ==========================================

function openSavePlanModal() {
    if (currentJobs.length === 0) {
        showToast("ไม่มีรายการทำงานที่จะบันทึก", "error");
        return;
    }
    
    document.getElementById("save-plan-note").value = "";
    
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000));
    document.getElementById("save-plan-date").value = localDate.toISOString().split("T")[0];

    const totalRolls = currentJobs.reduce((sum, j) => sum + j.rolls, 0);
    let totalRunMinutes = 0;
    let codeChangeCount = 0;
    const singleCodeChangeTime = settings.codeChangeTime !== undefined ? settings.codeChangeTime : 5;
    
    currentJobs.forEach((job, index) => {
        const spec = treatmentDb.find(t => t.code === job.code);
        if (!spec) return;
        const calcs = getTreatmentCalculations(spec);
        totalRunMinutes += calcs.totalTimePerRoll * job.rolls;
        if (index < currentJobs.length - 1) {
            const nextJob = currentJobs[index + 1];
            if (nextJob.code !== job.code) {
                codeChangeCount++;
            }
        }
    });
    
    const totalCodeChangeTime = codeChangeCount * singleCodeChangeTime;
    const startupTime = settings.startupTime !== undefined ? settings.startupTime : 15;
    const plannedDowntime = settings.plannedDowntime !== undefined ? settings.plannedDowntime : 0;
    const totalNeededMinutes = startupTime + totalRunMinutes + plannedDowntime + totalCodeChangeTime;

    document.getElementById("save-preview-jobs-count").textContent = `${currentJobs.length} รายการ`;
    document.getElementById("save-preview-total-rolls").textContent = `${totalRolls} ม้วน`;
    document.getElementById("save-preview-total-time").textContent = formatMinutes(totalNeededMinutes);

    document.getElementById("modal-save-plan").classList.add("active");
}

function closeSavePlanModal() {
    document.getElementById("modal-save-plan").classList.remove("active");
}

function renderHistoryTable() {
    const tbody = document.getElementById("history-plan-list");
    const emptyState = document.getElementById("no-history-message");
    if (!tbody || !emptyState) return;

    tbody.innerHTML = "";
    const savedPlans = JSON.parse(localStorage.getItem("saved_plans")) || [];

    if (savedPlans.length === 0) {
        emptyState.style.display = "flex";
        return;
    }
    emptyState.style.display = "none";

    savedPlans.sort((a, b) => b.timestamp - a.timestamp);

    savedPlans.forEach(plan => {
        const tr = document.createElement("tr");
        const totalRolls = plan.jobs.reduce((sum, j) => sum + j.rolls, 0);

        let badgesHtml = '<div class="job-preview-container">';
        plan.jobs.forEach(j => {
            badgesHtml += `
                <span class="job-badge">
                    <span class="job-badge-code">${j.code}</span>
                    <span class="job-badge-rolls">(${j.rolls})</span>
                </span>
            `;
        });
        badgesHtml += '</div>';

        const dateObj = new Date(plan.date);
        const thaiDate = dateObj.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });

        tr.innerHTML = `
            <td class="text-bold">${thaiDate}</td>
            <td class="text-muted">${plan.note || "-"}</td>
            <td class="text-bold text-highlight">${totalRolls} ม้วน</td>
            <td>${badgesHtml}</td>
            <td style="text-align: center;">
                <button class="btn btn-success btn-sm btn-preview-plan" data-id="${plan.id}" title="ดูรายละเอียดบนแดชบอร์ด">
                    <i class="fa-solid fa-gauge"></i> ดูแดชบอร์ด
                </button>
                <button class="btn btn-primary btn-sm btn-load-plan" data-id="${plan.id}" title="โหลดแผนงานนี้เข้าสู่ระบบ">
                    <i class="fa-solid fa-cloud-arrow-down"></i> โหลดแผน
                </button>
                <button class="btn btn-secondary btn-sm btn-export-history-csv" data-id="${plan.id}" title="ส่งออก CSV แผนงานนี้">
                    <i class="fa-solid fa-file-csv"></i> CSV
                </button>
                <button class="btn btn-danger btn-sm btn-delete-plan" data-id="${plan.id}" title="ลบแผนงานย้อนหลัง">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    attachHistoryActions();
}

function attachHistoryActions() {
    document.querySelectorAll(".btn-preview-plan").forEach(btn => {
        btn.addEventListener("click", () => {
            const planId = btn.getAttribute("data-id");
            enterPreviewMode(planId);
        });
    });

    document.querySelectorAll(".btn-load-plan").forEach(btn => {
        btn.addEventListener("click", () => {
            const planId = btn.getAttribute("data-id");
            if (confirm("ต้องการโหลดแผนงานนี้เข้ามาแทนที่แผนงานปัจจุบันใช่หรือไม่? ข้อมูลปัจจุบันที่ยังไม่ได้บันทึกจะหายไป")) {
                loadPlanFromHistory(planId);
            }
        });
    });

    document.querySelectorAll(".btn-export-history-csv").forEach(btn => {
        btn.addEventListener("click", () => {
            const planId = btn.getAttribute("data-id");
            exportHistoryPlanToCSV(planId);
        });
    });

    document.querySelectorAll(".btn-delete-plan").forEach(btn => {
        btn.addEventListener("click", () => {
            const planId = btn.getAttribute("data-id");
            if (confirm("คุณต้องการลบประวัติแผนงานนี้ใช่หรือไม่?")) {
                deletePlanFromHistory(planId);
            }
        });
    });
}

function loadPlanFromHistory(planId) {
    const savedPlans = JSON.parse(localStorage.getItem("saved_plans")) || [];
    const plan = savedPlans.find(p => p.id === planId);
    if (!plan) {
        showToast("ไม่พบข้อมูลแผนงาน", "error");
        return;
    }

    currentJobs = JSON.parse(JSON.stringify(plan.jobs));
    if (plan.settings) {
        settings = JSON.parse(JSON.stringify(plan.settings));
    }

    saveJobsToStorage();
    saveSettingsToStorage();

    loadSettingsIntoForm();
    renderJobsTable();
    calculateAll();

    showToast("โหลดแผนงานประวัติย้อนหลังเรียบร้อยแล้ว", "success");

    const plannerBtn = document.querySelector('.nav-btn[data-tab="planner"]');
    if (plannerBtn) {
        plannerBtn.click();
    }
}

function exportHistoryPlanToCSV(planId) {
    const savedPlans = JSON.parse(localStorage.getItem("saved_plans")) || [];
    const plan = savedPlans.find(p => p.id === planId);
    if (!plan) {
        showToast("ไม่พบข้อมูลแผนงาน", "error");
        return;
    }

    const originalJobs = JSON.parse(JSON.stringify(currentJobs));
    const originalSettings = JSON.parse(JSON.stringify(settings));

    currentJobs = plan.jobs;
    settings = plan.settings || settings;

    exportToCSV(plan.date);

    currentJobs = originalJobs;
    settings = originalSettings;

    showToast("ส่งออกไฟล์ CSV เรียบร้อยแล้ว", "success");
}

function deletePlanFromHistory(planId) {
    let savedPlans = JSON.parse(localStorage.getItem("saved_plans")) || [];
    savedPlans = savedPlans.filter(p => p.id !== planId);
    localStorage.setItem("saved_plans", JSON.stringify(savedPlans));
    
    if (settings.firebaseUrl) {
        saveCloudData("saved_plans", savedPlans);
    }

    // If the plan being deleted is currently previewed, exit preview mode
    if (isPreviewMode && previewPlanId === planId) {
        exitPreviewMode();
    }
    
    renderHistoryTable();
    showToast("ลบประวัติแผนงานเรียบร้อยแล้ว", "success");
}

function enterPreviewMode(planId) {
    const savedPlans = JSON.parse(localStorage.getItem("saved_plans")) || [];
    const plan = savedPlans.find(p => p.id === planId);
    if (!plan) {
        showToast("ไม่พบข้อมูลแผนงาน", "error");
        return;
    }

    // Save active state if not already in preview mode
    if (!isPreviewMode) {
        originalJobsBackup = JSON.parse(JSON.stringify(currentJobs));
        originalSettingsBackup = JSON.parse(JSON.stringify(settings));
    }

    // Load history plan data
    currentJobs = JSON.parse(JSON.stringify(plan.jobs));
    settings = JSON.parse(JSON.stringify(plan.settings || settings));
    
    isPreviewMode = true;
    previewPlanId = planId;

    // Display banner and set text
    const banner = document.getElementById("preview-mode-banner");
    const dateEl = document.getElementById("preview-banner-date");
    const noteEl = document.getElementById("preview-banner-note");
    const noteWrap = document.getElementById("preview-banner-note-wrap");

    if (banner) {
        const dateObj = new Date(plan.date);
        const thaiDate = dateObj.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
        dateEl.textContent = thaiDate;
        
        if (plan.note) {
            noteEl.textContent = plan.note;
            noteWrap.style.display = "inline";
        } else {
            noteWrap.style.display = "none";
        }
        
        banner.style.display = "flex";
    }

    // Recalculate and re-render Planner
    renderJobsTable();
    calculateAll();

    // Switch tab to Planner
    const plannerBtn = document.querySelector('.nav-btn[data-tab="planner"]');
    if (plannerBtn) {
        plannerBtn.click();
    }
    
    showToast("กำลังแสดงพรีวิวประวัติแผนงานย้อนหลัง", "success");
}

function exitPreviewMode() {
    if (!isPreviewMode) return;

    // Restore active state
    if (originalJobsBackup) currentJobs = originalJobsBackup;
    if (originalSettingsBackup) settings = originalSettingsBackup;

    originalJobsBackup = null;
    originalSettingsBackup = null;
    isPreviewMode = false;
    previewPlanId = null;

    // Hide banner
    const banner = document.getElementById("preview-mode-banner");
    if (banner) {
        banner.style.display = "none";
    }

    // Recalculate and re-render Planner
    renderJobsTable();
    calculateAll();
    
    showToast("กลับสู่แผนงานปัจจุบันเรียบร้อยแล้ว", "success");
}

// ==========================================
// 10. CLOUD DATABASE SYNC SERVICES
// ==========================================

function updateCloudStatusUI(status) {
    const statusEl = document.getElementById("cloud-connection-status");
    const inputUrl = document.getElementById("setting-firebase-url");
    if (!statusEl) return;
    
    if (inputUrl && settings.firebaseUrl) {
        inputUrl.value = settings.firebaseUrl;
    }

    if (status === "connecting") {
        statusEl.className = "text-orange";
        statusEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> กำลังตรวจสอบการเชื่อมต่อ Cloud...`;
    } else if (status === "connected") {
        statusEl.className = "text-green";
        statusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> เชื่อมต่อ Cloud สำเร็จ (ข้อมูลแชร์ร่วมกันแล้ว)`;
    } else if (status === "error") {
        statusEl.className = "text-danger";
        statusEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> เชื่อมต่อขัดข้อง (ใช้ข้อมูล Local ในเครื่องชั่วคราว)`;
    } else {
        statusEl.className = "text-muted";
        statusEl.innerHTML = `<i class="fa-solid fa-circle-info"></i> กำลังใช้ฐานข้อมูลภายในเครื่อง (Local Storage)`;
    }
}

async function fetchCloudData(endpoint) {
    if (!settings.firebaseUrl) return null;
    try {
        let baseUrl = settings.firebaseUrl.trim();
        if (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);
        
        const url = `${baseUrl}/${endpoint}.json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Firebase fetch failed");
        return await res.json();
    } catch (e) {
        console.error(`Error reading ${endpoint} from Cloud:`, e);
        return null;
    }
}

async function saveCloudData(endpoint, data) {
    if (!settings.firebaseUrl) return false;
    try {
        let baseUrl = settings.firebaseUrl.trim();
        if (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);
        
        const url = `${baseUrl}/${endpoint}.json`;
        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        return res.ok;
    } catch (e) {
        console.error(`Error saving ${endpoint} to Cloud:`, e);
        return false;
    }
}
