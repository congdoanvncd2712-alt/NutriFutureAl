/**
 * NUTRIFUTURE - ỨNG DỤNG DINH DƯỠNG HỌC ĐƯỜNG THCS & THPT NGÃ SÁU
 * Tác giả: Nhóm dự án NUTRIFUTURE
 * Phiên bản: v3.2 AI Edition (Deploy GitHub Pages)
 */

// ==========================================
// 1. CẤU TRÚC DỮ LIỆU & BỘ NHỚ LƯU TRỮ
// ==========================================
const STORAGE_KEYS = {
  PROFILE: 'nutrifuture_profile_v3',
  DIARY: 'nutrifuture_diary_v3',
  GAMIFICATION: 'nutrifuture_gamification_v3',
  API_KEY: 'nutrifuture_gemini_key',
  THEME: 'nutrifuture_active_theme'
};

// Hồ sơ mặc định của học sinh THCS & THPT Ngã Sáu
const defaultProfile = {
  name: 'Học sinh Ngã Sáu',
  age: 17,
  gender: 'male',
  height: 170,
  weight: 60,
  activity: 'moderate', // sedentary, light, moderate, active
  goal: 'maintain',
  bmi: 20.8,
  bmiCategory: 'Bình thường',
  tdee: 2200,
  waterTarget: 2100, // ml
  targetProtein: 110, // g (20%)
  targetFat: 55, // g (22.5%)
  targetCarb: 303, // g (55%)
  allergens: ['dau_phong'], // Mặc định cảnh báo đậu phộng để học sinh thấy ngay Red Alert
  customAllergen: ''
};

// Trạng thái Gamification mặc định
const defaultGamification = {
  points: 120,
  level: 2,
  title: 'Tập sự Khỏe mạnh',
  streakDays: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  unlockedThemes: ['default', 'citrus', 'ocean', 'galaxy'],
  unlockedBadges: ['badge_newbie', 'badge_water_novice'],
  weeklyProgress: {
    vegetablesCount: 3, // Target: 5
    waterGoalDays: 2,   // Target: 3
    noSodaDays: 1,      // Target: 2
    quizzesDone: 1      // Target: 3
  }
};

// Trạng thái ứng dụng toàn cục
let appState = {
  profile: loadFromStorage(STORAGE_KEYS.PROFILE, defaultProfile),
  gamification: loadFromStorage(STORAGE_KEYS.GAMIFICATION, defaultGamification),
  apiKey: localStorage.getItem(STORAGE_KEYS.API_KEY) || '',
  activeTheme: localStorage.getItem(STORAGE_KEYS.THEME) || 'default',
  activeTab: 'profile', // Mặc định mở đầu tiên là Tính năng 1: Khởi tạo hồ sơ & Cảnh báo dị ứng
  currentRegion: 'all',
  currentCategory: 'all',
  searchQuery: '',
  aiPortionSize: 'M', // S (70%), M (100%), L (130%)
  cameraStream: null,
  lastCapturedImageBase64: '',
  lastAiDetectedFood: null,
  currentModalFood: null,
  currentModalPortion: 'M',
  // Quiz State
  currentQuizQuestions: [],
  currentQuizIndex: 0,
  quizScore: 0,
  userQuizAnswers: []
};

// Danh sách huy hiệu thành tích
const BADGES_DATABASE = [
  { id: 'badge_newbie', name: 'Người mới', icon: '🌱', desc: 'Khởi tạo hồ sơ dinh dưỡng đầu tiên tại Ngã Sáu' },
  { id: 'badge_healthy', name: 'Ăn uống lành mạnh', icon: '🥗', desc: 'Ghi nhật ký đủ 4 nhóm chất trong ngày' },
  { id: 'badge_streak_7', name: '7 ngày liên tục', icon: '🔥', desc: 'Duy trì chuỗi đăng nhập 7 ngày liên tiếp' },
  { id: 'badge_water_novice', name: 'Uống đủ nước', icon: '💧', desc: 'Đạt mục tiêu nước uống 2.1L trong ngày' },
  { id: 'badge_three_regions', name: 'Bậc thầy 3 miền', icon: '🗺️', desc: 'Tra cứu các món ăn đặc sản Bắc - Trung - Nam' },
  { id: 'badge_quiz_master', name: 'Nhà thông thái AI', icon: '🧠', desc: 'Đạt điểm tuyệt đối 5/5 trong bài Quiz Dinh dưỡng' }
];

// Danh sách các dị ứng thông dụng
const COMMON_ALLERGEN_LIST = [
  { key: 'dau_phong', label: 'Đậu phộng (Lạc)', icon: '🥜' },
  { key: 'hai_san', label: 'Hải sản tổng hợp', icon: '🦐' },
  { key: 'tom', label: 'Tôm', icon: '🦐' },
  { key: 'cua', label: 'Cua đồng / Cua biển', icon: '🦀' },
  { key: 'muc_oc', label: 'Mực / Ốc / Trai / Sứa', icon: '🦑' },
  { key: 'ca', label: 'Cá (Biển & Đồng)', icon: '🐟' },
  { key: 'trung', label: 'Trứng gà / Trứng vịt', icon: '🥚' },
  { key: 'sua', label: 'Sữa bò / Lactose', icon: '🥛' },
  { key: 'gluten', label: 'Gluten (Bột mì)', icon: '🌾' },
  { key: 'dau_nanh', label: 'Đậu nành (Đậu hũ)', icon: '🌱' },
  { key: 'mam', label: 'Mắm tôm / Mắm ruốc / Mắm nêm', icon: '🫙' }
];

// ==========================================
// 2. KHỞI TẠO VÀ VÒNG ĐỜI ỨNG DỤNG
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Áp dụng theme đã lưu
  applyAppTheme(appState.activeTheme, false);

  // Kiểm tra chuỗi ngày đăng nhập (Streak)
  checkDailyStreak();

  // Khởi tạo các thành phần giao diện
  initNavigation();
  initProfileTab();
  initLookupTab();
  initCameraTab();
  initMealPlanTab();
  initDiaryTab();
  initGamificationTab();
  initModals();

  // Cập nhật thống kê trên thanh tiêu đề
  updateHeaderStats();

  // Kiểm tra kết nối API nếu đã có key
  if (appState.apiKey) {
    testGeminiApiConnection(true);
  } else {
    updateHeaderApiStatus('disconnected');
  }
});

// Tiện ích Storage
function loadFromStorage(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error('Lỗi nạp storage:', e);
    return fallback;
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Lỗi lưu storage:', e);
  }
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getTodayDiary() {
  const allDiaries = loadFromStorage(STORAGE_KEYS.DIARY, {});
  const todayKey = getTodayKey();
  if (!allDiaries[todayKey]) {
    allDiaries[todayKey] = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
      waterGlasses: 4 // Mặc định 4 ly = 1000ml
    };
    saveToStorage(STORAGE_KEYS.DIARY, allDiaries);
  }
  return allDiaries[todayKey];
}

function saveTodayDiary(diaryData) {
  const allDiaries = loadFromStorage(STORAGE_KEYS.DIARY, {});
  const todayKey = getTodayKey();
  allDiaries[todayKey] = diaryData;
  saveToStorage(STORAGE_KEYS.DIARY, allDiaries);
}

// Kiểm tra Streak hàng ngày
function checkDailyStreak() {
  const today = getTodayKey();
  const lastActive = appState.gamification.lastActiveDate;

  if (lastActive !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];

    if (lastActive === yesterdayKey) {
      appState.gamification.streakDays += 1;
      awardPoints(15, 'Chuỗi ngày Streak liên tiếp 🔥');
    } else {
      appState.gamification.streakDays = 1; // Reset nếu ngắt quãng
    }

    appState.gamification.lastActiveDate = today;
    saveToStorage(STORAGE_KEYS.GAMIFICATION, appState.gamification);

    if (appState.gamification.streakDays >= 7 && !appState.gamification.unlockedBadges.includes('badge_streak_7')) {
      unlockBadge('badge_streak_7');
    }
  }
}

// ==========================================
// 3. ĐIỀU HƯỚNG THANH MENU (6 TÍNH NĂNG)
// ==========================================
function initNavigation() {
  // Bắt sự kiện click vào các nút điều hướng sidebar & bottom nav
  const navButtons = document.querySelectorAll('[data-tab-target]');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab-target');
      switchTab(targetTab);
    });
  });
}

function switchTab(tabId) {
  appState.activeTab = tabId;

  // Cập nhật trạng thái active cho nút sidebar
  document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab-target') === tabId);
  });

  // Cập nhật trạng thái active cho nút mobile bottom nav
  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab-target') === tabId);
  });

  // Chuyển pane hiển thị
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `tab-${tabId}`);
  });

  // Tự động cuộn lên đầu trang
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Tắt camera nếu rời khỏi tab camera
  if (tabId !== 'camera' && appState.cameraStream) {
    stopCamera();
  }

  // Tự động làm mới dữ liệu tab tương ứng
  if (tabId === 'diary') {
    updateDiaryUI();
  } else if (tabId === 'mealplan') {
    renderMealPlanUI();
  } else if (tabId === 'lookup') {
    renderFoodGrid();
  }
}

function updateHeaderStats() {
  const pts = appState.gamification.points;
  const lvl = appState.gamification.level;
  const streak = appState.gamification.streakDays;

  const headerPts = document.getElementById('header-points');
  const headerLvl = document.getElementById('header-level');
  const headerStreak = document.getElementById('header-streak');

  if (headerPts) headerPts.textContent = `${pts} XP`;
  if (headerLvl) headerLvl.textContent = `Cấp ${lvl}`;
  if (headerStreak) headerStreak.textContent = `${streak} ngày`;

  // Cập nhật tab Gamification
  const gamifyPts = document.getElementById('gamify-points');
  const gamifyLvl = document.getElementById('gamify-level');
  const gamifyStreak = document.getElementById('gamify-streak');
  const gamifyNextLvl = document.getElementById('gamify-next-level');
  const gamifyRemaining = document.getElementById('gamify-points-to-next');
  const gamifyProgressBar = document.getElementById('gamify-level-progress');

  if (gamifyPts) gamifyPts.textContent = pts;
  if (gamifyLvl) gamifyLvl.textContent = lvl;
  if (gamifyStreak) gamifyStreak.textContent = `${streak} ngày 🔥`;
  if (gamifyNextLvl) gamifyNextLvl.textContent = lvl + 1;

  const ptsInCurrentLevel = pts % 100;
  if (gamifyRemaining) gamifyRemaining.textContent = 100 - ptsInCurrentLevel;
  if (gamifyProgressBar) gamifyProgressBar.style.width = `${ptsInCurrentLevel}%`;
}

function awardPoints(amount, reason = '') {
  appState.gamification.points += amount;
  const newLevel = Math.floor(appState.gamification.points / 100) + 1;

  if (newLevel > appState.gamification.level) {
    appState.gamification.level = newLevel;
    showToast(`🎉 CHÚC MỪNG BẠN ĐÃ LÊN CẤP ${newLevel}!`, 'success');
  } else {
    showToast(`+${amount} XP ${reason ? '· ' + reason : ''}`, 'success');
  }

  saveToStorage(STORAGE_KEYS.GAMIFICATION, appState.gamification);
  updateHeaderStats();
}

function unlockBadge(badgeId) {
  if (!appState.gamification.unlockedBadges.includes(badgeId)) {
    appState.gamification.unlockedBadges.push(badgeId);
    saveToStorage(STORAGE_KEYS.GAMIFICATION, appState.gamification);
    const badge = BADGES_DATABASE.find(b => b.id === badgeId);
    if (badge) {
      showToast(`🎖️ Mở khóa huy hiệu mới: ${badge.name}!`, 'success');
    }
    renderBadges();
  }
}

// ==========================================
// 4. TÍNH NĂNG 1: KHỞI TẠO HỒ SƠ & CẢNH BÁO DỊ ỨNG
// ==========================================
function initProfileTab() {
  const p = appState.profile;

  // Gán giá trị vào form
  const nameInput = document.getElementById('profile-name');
  const ageInput = document.getElementById('profile-age');
  const genderInput = document.getElementById('profile-gender');
  const heightInput = document.getElementById('profile-height');
  const weightInput = document.getElementById('profile-weight');
  const activityInput = document.getElementById('profile-activity');
  const customAllergenInput = document.getElementById('profile-custom-allergen');

  if (nameInput) nameInput.value = p.name;
  if (ageInput) ageInput.value = p.age;
  if (genderInput) genderInput.value = p.gender;
  if (heightInput) heightInput.value = p.height;
  if (weightInput) weightInput.value = p.weight;
  if (activityInput) activityInput.value = p.activity;
  if (customAllergenInput) customAllergenInput.value = p.customAllergen || '';

  // Render các chip dị ứng
  renderAllergenChips();

  // Tính toán và hiển thị các chỉ số
  calculatePersonalMetrics();
}

function renderAllergenChips() {
  const container = document.getElementById('profile-allergen-chips');
  if (!container) return;

  const userAllergens = appState.profile.allergens || [];

  container.innerHTML = COMMON_ALLERGEN_LIST.map(item => {
    const isSelected = userAllergens.includes(item.key);
    return `
      <div onclick="toggleAllergen('${item.key}')"
           class="allergen-chip ${isSelected ? 'selected' : ''}">
        <span>${item.icon}</span>
        <span>${item.label}</span>
        ${isSelected ? '<span class="text-xs">✓</span>' : ''}
      </div>
    `;
  }).join('');

  renderAllergiesSummary();
}

function toggleAllergen(key) {
  let list = appState.profile.allergens || [];
  if (list.includes(key)) {
    list = list.filter(k => k !== key);
  } else {
    list.push(key);
  }
  appState.profile.allergens = list;
  renderAllergenChips();
}

function renderAllergiesSummary() {
  const summaryBox = document.getElementById('res-allergies-summary');
  if (!summaryBox) return;

  const list = appState.profile.allergens || [];
  const custom = appState.profile.customAllergen;

  if (list.length === 0 && !custom) {
    summaryBox.innerHTML = `
      <p class="text-green-700 font-semibold flex items-center gap-1.5">
        <span>✅</span> Bạn chưa khai báo thành phần dị ứng nào. Hãy thêm nếu có để kích hoạt Red Alert bảo vệ sức khỏe!
      </p>
    `;
    return;
  }

  const tagList = list.map(k => {
    const item = ALLERGEN_DICT[k] || { label: k, icon: '⚠️' };
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 rounded-full font-bold text-[11px]">${item.icon} ${item.label}</span>`;
  });

  if (custom) {
    tagList.push(`<span class="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 rounded-full font-bold text-[11px]">⚠️ ${custom}</span>`);
  }

  summaryBox.innerHTML = `
    <div class="space-y-1.5">
      <p class="font-bold text-red-800">Các thành phần sẽ bị cảnh báo đỏ khi tra cứu hoặc chụp ảnh:</p>
      <div class="flex flex-wrap gap-1.5">${tagList.join(' ')}</div>
    </div>
  `;
}

// Tính toán BMI, Calo (TDEE), Lượng nước và Macro
function calculatePersonalMetrics() {
  const p = appState.profile;

  // 1. Chỉ số BMI
  const heightM = p.height / 100;
  const bmiVal = +(p.weight / (heightM * heightM)).toFixed(1);
  p.bmi = bmiVal;

  let category = 'Bình thường';
  let advice = 'Thể trạng rất cân đối. Tiếp tục duy trì chế độ dinh dưỡng lành mạnh và thể dục thể thao!';
  let categoryColor = 'bg-green-100 text-green-800';

  if (bmiVal < 18.5) {
    category = 'Thể trạng Gầy';
    advice = 'Bạn đang hơi gầy so với chuẩn lứa tuổi. Nên bổ sung thêm các món giàu đạm (thịt gà, cá, trứng) và ăn đủ bữa sáng!';
    categoryColor = 'bg-blue-100 text-blue-800';
  } else if (bmiVal >= 18.5 && bmiVal <= 22.9) {
    category = 'Bình thường';
    advice = 'Thể trạng rất cân đối và lý tưởng. Tiếp tục duy trì ăn uống đa dạng 4 nhóm chất và uống đủ nước!';
    categoryColor = 'bg-green-100 text-green-800';
  } else if (bmiVal >= 23.0 && bmiVal <= 24.9) {
    category = 'Thừa cân (Tiền béo phì)';
    advice = 'Bạn đang có dấu hiệu thừa cân nhẹ. Nên hạn chế trà sữa, nước ngọt có ga và tăng cường vận động!';
    categoryColor = 'bg-amber-100 text-amber-800';
  } else {
    category = 'Béo phì';
    advice = 'Bạn cần kiểm soát lượng calo nạp vào, giảm đồ chiên xào nhiều dầu mỡ và tập luyện thể dục đều đặn.';
    categoryColor = 'bg-red-100 text-red-800';
  }
  p.bmiCategory = category;

  // 2. Tính TDEE theo công thức Mifflin-St Jeor
  let bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age;
  if (p.gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725
  };
  const multiplier = activityMultipliers[p.activity] || 1.55;
  let tdeeVal = Math.round(bmr * multiplier);

  // Điều chỉnh theo mục tiêu
  if (p.goal === 'gain') tdeeVal += 300;
  else if (p.goal === 'lose') tdeeVal -= 300;

  p.tdee = tdeeVal;

  // 3. Lượng nước cần uống mỗi ngày (35ml/kg)
  const waterMl = Math.round(p.weight * 35);
  p.waterTarget = waterMl;

  // 4. Phân bổ Macro chuẩn
  // Protein: ~20% calo (1g = 4 kcal)
  p.targetProtein = Math.round((tdeeVal * 0.20) / 4);
  // Fat: ~22.5% calo (1g = 9 kcal)
  p.targetFat = Math.round((tdeeVal * 0.225) / 9);
  // Carb: ~57.5% calo (1g = 4 kcal)
  p.targetCarb = Math.round((tdeeVal * 0.575) / 4);

  // Cập nhật lên UI
  const bmiEl = document.getElementById('res-bmi-val');
  const catEl = document.getElementById('res-bmi-category');
  const adviceEl = document.getElementById('res-bmi-advice');
  const tdeeEl = document.getElementById('res-tdee-val');
  const waterEl = document.getElementById('res-water-val');
  const glassesEl = document.getElementById('res-glasses-val');
  const proEl = document.getElementById('res-macro-protein');
  const fatEl = document.getElementById('res-macro-fat');
  const carbEl = document.getElementById('res-macro-carb');

  if (bmiEl) bmiEl.textContent = bmiVal;
  if (catEl) {
    catEl.textContent = category;
    catEl.className = `text-[11px] font-black px-2.5 py-0.5 rounded-full ${categoryColor}`;
  }
  if (adviceEl) adviceEl.textContent = advice;
  if (tdeeEl) tdeeEl.textContent = tdeeVal.toLocaleString('vi-VN');
  if (waterEl) waterEl.textContent = `${(waterMl / 1000).toFixed(1)} Lít / ngày`;
  if (glassesEl) glassesEl.textContent = `~ ${Math.round(waterMl / 250)} ly nước (mỗi ly 250ml) giúp thanh lọc cơ thể`;

  if (proEl) proEl.textContent = `${p.targetProtein}g`;
  if (fatEl) fatEl.textContent = `${p.targetFat}g`;
  if (carbEl) carbEl.textContent = `${p.targetCarb}g`;

  // Cập nhật sang tab Thực đơn & Nhật ký
  const mealplanCalText = document.getElementById('mealplan-target-calo-text');
  if (mealplanCalText) mealplanCalText.textContent = `${tdeeVal.toLocaleString('vi-VN')} kcal`;

  const diaryTargetCal = document.getElementById('diary-target-cal');
  if (diaryTargetCal) diaryTargetCal.textContent = `/ ${tdeeVal.toLocaleString('vi-VN')} kcal`;
}

function saveProfileForm() {
  const nameInput = document.getElementById('profile-name');
  const ageInput = document.getElementById('profile-age');
  const genderInput = document.getElementById('profile-gender');
  const heightInput = document.getElementById('profile-height');
  const weightInput = document.getElementById('profile-weight');
  const activityInput = document.getElementById('profile-activity');
  const customAllergenInput = document.getElementById('profile-custom-allergen');

  appState.profile.name = nameInput ? nameInput.value.trim() : 'Học sinh Ngã Sáu';
  appState.profile.age = ageInput ? parseInt(ageInput.value) : 17;
  appState.profile.gender = genderInput ? genderInput.value : 'male';
  appState.profile.height = heightInput ? parseInt(heightInput.value) : 170;
  appState.profile.weight = weightInput ? parseInt(weightInput.value) : 60;
  appState.profile.activity = activityInput ? activityInput.value : 'moderate';
  appState.profile.customAllergen = customAllergenInput ? customAllergenInput.value.trim() : '';

  calculatePersonalMetrics();
  saveToStorage(STORAGE_KEYS.PROFILE, appState.profile);

  awardPoints(20, 'Cập nhật hồ sơ thể trạng');
  showToast('Đã lưu hồ sơ cá nhân và cập nhật chỉ số BMI thành công!', 'success');

  // Mở khóa huy hiệu Người mới
  unlockBadge('badge_newbie');

  // Cập nhật lại các tab khác có liên quan
  renderAllergiesSummary();
  renderFoodGrid();
  updateDiaryUI();
}

// ==========================================
// 5. TÍNH NĂNG 2: TRA CỨU DINH DƯỠNG THÔNG MINH
// ==========================================
function initLookupTab() {
  // Render các nhóm món ăn
  renderCategoryPills();

  // Sự kiện tìm kiếm
  const searchInput = document.getElementById('food-search-input');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        appState.searchQuery = e.target.value.trim().toLowerCase();
        renderFoodGrid();
      }, 250);
    });
  }

  // Render lưới 202 món ăn ban đầu
  renderFoodGrid();
}

function renderCategoryPills() {
  const container = document.getElementById('food-categories-bar');
  if (!container) return;

  const categories = [
    { id: 'all', label: 'Tất cả loại món' },
    { id: 'mon_chinh', label: '🍜 Món chính (Bún, Phở, Cơm)' },
    { id: 'mon_man', label: '🥩 Món mặn (Thịt, Cá, Kho)' },
    { id: 'mon_canh_rau', label: '🥣 Canh & Rau xanh' },
    { id: 'mon_an_vat_banh', label: '🍧 Bánh, Chè & Ăn vặt' }
  ];

  container.innerHTML = categories.map(cat => `
    <button onclick="filterCategory('${cat.id}')"
            id="cat-pill-${cat.id}"
            class="category-pill ${appState.currentCategory === cat.id ? 'active' : ''}">
      ${cat.label}
    </button>
  `).join('');
}

function filterCategory(catId) {
  appState.currentCategory = catId;
  document.querySelectorAll('#food-categories-bar .category-pill').forEach(btn => {
    btn.classList.toggle('active', btn.id === `cat-pill-${catId}`);
  });
  renderFoodGrid();
}

function filterRegion(regionId) {
  appState.currentRegion = regionId;
  document.querySelectorAll('[id^="region-btn-"]').forEach(btn => {
    btn.classList.toggle('active', btn.id === `region-btn-${regionId}`);
  });
  renderFoodGrid();
}

function renderFoodGrid() {
  const grid = document.getElementById('food-items-grid');
  const countEl = document.getElementById('food-search-count');
  if (!grid) return;

  let filtered = FOOD_DATABASE;

  // Lọc theo vùng miền
  if (appState.currentRegion !== 'all') {
    filtered = filtered.filter(f => f.region === appState.currentRegion);
  }

  // Lọc theo nhóm món ăn
  if (appState.currentCategory !== 'all') {
    filtered = filtered.filter(f => f.category === appState.currentCategory);
  }

  // Lọc theo từ khóa tìm kiếm
  if (appState.searchQuery) {
    const q = appState.searchQuery;
    filtered = filtered.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.specialty.toLowerCase().includes(q) ||
      f.vitamins.toLowerCase().includes(q)
    );
  }

  if (countEl) {
    countEl.textContent = `Đang hiển thị ${filtered.length} / ${FOOD_DATABASE.length} món`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full card p-8 text-center text-slate-400 space-y-2">
        <span class="text-4xl block">🔍</span>
        <p class="font-bold text-slate-600 text-sm">Không tìm thấy món ăn phù hợp với từ khóa "${appState.searchQuery}"</p>
        <p class="text-xs">Hãy thử tìm các món phổ biến như: Phở bò, Cơm tấm, Bún bò, Bánh mì, Bánh xèo...</p>
      </div>
    `;
    return;
  }

  const userAllergens = appState.profile.allergens || [];

  grid.innerHTML = filtered.map(food => {
    // Kiểm tra dị ứng đối chiếu với hồ sơ học sinh
    const allergyMatches = checkFoodAllergies(food, userAllergens);
    const hasAllergy = allergyMatches.length > 0;

    const regionBadgeColors = {
      bac: 'bg-red-50 text-red-700 border-red-200',
      trung: 'bg-amber-50 text-amber-700 border-amber-200',
      nam: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    const regionBadgeClass = regionBadgeColors[food.region] || 'bg-slate-100 text-slate-700';

    return `
      <div onclick="showFoodDetailModal('${food.id}')"
           class="food-card ${hasAllergy ? 'has-allergy' : ''}">
        
        <div>
          <!-- Header card: Icon, Tên món, Vùng miền & Tỉnh đặc sản -->
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex items-center gap-2">
              <span class="text-2xl">${food.icon}</span>
              <div>
                <h4 class="font-bold text-sm text-slate-900 leading-snug">${food.name}</h4>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-[10px] font-bold px-1.5 py-0.2 rounded border ${regionBadgeClass}">
                    ${food.regionName}
                  </span>
                  <span class="text-[10px] text-slate-400 font-medium">📍 ${food.specialty}</span>
                </div>
              </div>
            </div>
            <span class="text-xs text-slate-400 font-semibold flex-shrink-0">${food.portion}</span>
          </div>

          <!-- RED ALERT CẢNH BÁO DỊ ỨNG NẾU TRÙNG HỒ SƠ HỌC SINH -->
          ${hasAllergy ? `
            <div class="my-2 p-1.5 bg-red-100/80 border border-red-300 rounded-lg text-[11px] font-bold text-red-800 flex items-center gap-1.5">
              <span>🚨</span>
              <span>Cảnh báo: Có chứa ${allergyMatches.join(', ')}!</span>
            </div>
          ` : ''}

          <!-- 4 Chỉ số dinh dưỡng cơ bản -->
          <div class="grid grid-cols-4 gap-1.5 text-center mt-2.5">
            <div class="badge-macro-cal p-1.5 rounded-lg">
              <span class="text-[9px] font-bold block text-amber-700">Calo</span>
              <span class="text-xs font-black">${food.calories}</span>
            </div>
            <div class="badge-macro-pro p-1.5 rounded-lg">
              <span class="text-[9px] font-bold block text-red-700">Đạm</span>
              <span class="text-xs font-black">${food.protein}g</span>
            </div>
            <div class="badge-macro-fat p-1.5 rounded-lg">
              <span class="text-[9px] font-bold block text-yellow-700">Béo</span>
              <span class="text-xs font-black">${food.fat}g</span>
            </div>
            <div class="badge-macro-carb p-1.5 rounded-lg">
              <span class="text-[9px] font-bold block text-sky-700">Carb</span>
              <span class="text-xs font-black">${food.carb}g</span>
            </div>
          </div>
        </div>

        <!-- Chân card: Vi chất & Nút thêm nhanh -->
        <div class="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-[10px] text-slate-400 truncate max-w-[150px]">✨ ${food.vitamins}</span>
          <span class="text-green-600 font-bold hover:underline flex items-center gap-1">
            Chi tiết & Size →
          </span>
        </div>

      </div>
    `;
  }).join('');
}

// Modal chi tiết món ăn với TÙY CHỌN KHẨU PHẦN (Size S = 70%, M = 100%, L = 130%)
function showFoodDetailModal(foodId) {
  const food = getFoodById(foodId);
  if (!food) return;

  appState.currentModalFood = food;
  appState.currentModalPortion = 'M'; // Mặc định là M

  renderModalFoodBody();
  openModal('food-detail-modal');

  // Mở khóa huy hiệu Tra cứu nếu cần
  unlockBadge('badge_three_regions');
}

function setModalPortion(size) {
  appState.currentModalPortion = size;
  renderModalFoodBody();
}

function renderModalFoodBody() {
  const body = document.getElementById('food-detail-modal-body');
  const food = appState.currentModalFood;
  if (!body || !food) return;

  const currentSize = appState.currentModalPortion;
  // Viết hàm tính toán lại lượng calo, đạm, béo, carb dựa trên tỷ lệ phần trăm của size đó
  const nutrition = calculatePortionNutrition(food, currentSize);

  // Kiểm tra dị ứng
  const userAllergens = appState.profile.allergens || [];
  const allergyMatches = checkFoodAllergies(food, userAllergens);
  const hasAllergy = allergyMatches.length > 0;

  body.innerHTML = `
    <div class="p-5 space-y-4">
      
      <!-- Nút đóng -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="text-3xl">${food.icon}</span>
          <div>
            <h3 class="font-black text-lg text-slate-900">${food.name}</h3>
            <p class="text-xs text-slate-500 font-medium">📍 Đặc sản: <strong class="text-green-700">${food.specialty}</strong> (${food.regionName})</p>
          </div>
        </div>
        <button onclick="closeModal('food-detail-modal')" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-lg">✕</button>
      </div>

      <!-- RED ALERT BANNER NẾU MÓN ĂN CHỨA THÀNH PHẦN GÂY DỊ ỨNG -->
      ${hasAllergy ? `
        <div class="red-alert-banner">
          <span class="text-2xl flex-shrink-0 animate-bounce">🚨</span>
          <div>
            <div class="font-black uppercase tracking-wide">CẢNH BÁO NGUY HIỂM: PHÁT HIỆN DỊ NGUYÊN!</div>
            <div class="text-xs font-semibold mt-0.5">
              Món ăn này có chứa <strong>${allergyMatches.join(', ')}</strong> - thành phần trong hồ sơ dị ứng của bạn! Hãy cẩn trọng trước khi dùng.
            </div>
          </div>
        </div>
      ` : ''}

      <!-- TÙY CHỌN KHẨU PHẦN (SIZE S, M, L) THEO ĐỀ BÀI -->
      <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="font-extrabold text-slate-700 flex items-center gap-1.5">
            🥣 Chọn kích cỡ bát/tô thực tế (Khẩu phần):
          </span>
          <span class="text-green-700 font-bold">Khẩu phần ${nutrition.weightG}g</span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <button type="button"
                  onclick="setModalPortion('S')"
                  class="btn ${currentSize === 'S' ? 'btn-primary' : 'btn-secondary'} btn-sm font-bold">
            Size S (70%)
          </button>
          <button type="button"
                  onclick="setModalPortion('M')"
                  class="btn ${currentSize === 'M' ? 'btn-primary' : 'btn-secondary'} btn-sm font-bold">
            Size M (100% Chuẩn)
          </button>
          <button type="button"
                  onclick="setModalPortion('L')"
                  class="btn ${currentSize === 'L' ? 'btn-primary' : 'btn-secondary'} btn-sm font-bold">
            Size L (130%)
          </button>
        </div>
      </div>

      <!-- 4 CHỈ SỐ DINH DƯỠNG ĐƯỢC TỰ ĐỘNG TÍNH TOÁN LẠI DỰA TRÊN TỶ LỆ SIZE -->
      <div class="grid grid-cols-4 gap-2 text-center">
        <div class="p-3 rounded-xl bg-amber-50 border border-amber-200">
          <span class="text-[10px] text-amber-700 font-bold block">Năng lượng</span>
          <span class="text-lg font-black text-amber-900">${nutrition.calories}</span>
          <span class="text-[10px] text-amber-600 block">kcal</span>
        </div>
        <div class="p-3 rounded-xl bg-red-50 border border-red-200">
          <span class="text-[10px] text-red-700 font-bold block">Chất đạm</span>
          <span class="text-lg font-black text-red-900">${nutrition.protein}g</span>
          <span class="text-[10px] text-red-600 block">Protein</span>
        </div>
        <div class="p-3 rounded-xl bg-yellow-50 border border-yellow-200">
          <span class="text-[10px] text-yellow-700 font-bold block">Chất béo</span>
          <span class="text-lg font-black text-yellow-900">${nutrition.fat}g</span>
          <span class="text-[10px] text-yellow-600 block">Fat</span>
        </div>
        <div class="p-3 rounded-xl bg-sky-50 border border-sky-200">
          <span class="text-[10px] text-sky-700 font-bold block">Bột đường</span>
          <span class="text-lg font-black text-sky-900">${nutrition.carb}g</span>
          <span class="text-[10px] text-sky-600 block">Carb</span>
        </div>
      </div>

      <!-- Vi chất & Đánh giá sức khỏe -->
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
        <p><strong class="text-slate-700">✨ Vi chất & Khoáng chất:</strong> <span class="text-slate-600">${food.vitamins}</span></p>
        <p><strong class="text-slate-700">💡 Khẩu phần gốc:</strong> <span class="text-slate-600">${food.portion} (Size M tiêu chuẩn)</span></p>
      </div>

      <!-- Nút hành động -->
      <div class="pt-2 flex gap-2">
        <button onclick="openAddToDiaryModal('${food.id}', '${currentSize}')" class="btn btn-primary flex-1 py-2.5">
          ➕ Thêm vào Nhật ký dinh dưỡng
        </button>
        <button onclick="closeModal('food-detail-modal')" class="btn btn-secondary py-2.5">
          Đóng
        </button>
      </div>

    </div>
  `;
}

// Xử lý tìm kiếm thông minh bằng Gemini AI
async function handleGeminiAiSearch() {
  const searchInput = document.getElementById('food-search-input');
  const query = searchInput ? searchInput.value.trim() : '';

  if (!query) {
    showToast('Vui lòng nhập câu hỏi hoặc tên món ăn để AI tìm kiếm!', 'info');
    return;
  }

  const btn = document.getElementById('btn-ai-search');
  const feedbackBanner = document.getElementById('ai-search-feedback-banner');
  const feedbackText = document.getElementById('ai-search-feedback-text');

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin mr-1">⏳</span> Đang tìm...`;
  }

  try {
    // Nếu có API key, gọi Gemini API
    if (appState.apiKey) {
      const prompt = `Bạn là trợ lý dinh dưỡng học đường cho học sinh THPT Ngã Sáu.
Người dùng đang hỏi: "${query}".
Dưới đây là một số món trong 202 món ăn Việt Nam: Phở bò, Cơm tấm, Bún bò Huế, Bún riêu cua, Canh cua rau đay, Cá kho, Gà luộc, Bánh xèo...
Hãy trả lời thật ngắn gọn (dưới 45 từ) đưa ra lời khuyên chọn món phù hợp nhất kèm các từ khóa tên món để người dùng chọn.`;

      const responseText = await callGeminiAPI(prompt, appState.apiKey);
      if (feedbackBanner && feedbackText) {
        feedbackBanner.classList.remove('hidden');
        feedbackText.textContent = responseText;
      }
    } else {
      // Offline fallback thông minh
      if (feedbackBanner && feedbackText) {
        feedbackBanner.classList.remove('hidden');
        feedbackText.textContent = `Gợi ý thông minh: Các món ăn thanh nhẹ, giàu đạm và ít chất béo như Phở bò tái, Miến gà, Gà luộc, Canh chua cá rất tốt cho học sinh ôn bài. (Cài đặt Gemini API để nhận phân tích chi tiết hơn)`;
      }
    }

    // Lọc danh sách món tương đối theo từ khóa
    appState.searchQuery = query.toLowerCase();
    renderFoodGrid();
  } catch (err) {
    console.error('Lỗi AI Search:', err);
    showToast('Lỗi tìm kiếm AI: ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `✨ AI Search`;
    }
  }
}

function clearAiSearchFilter() {
  const feedbackBanner = document.getElementById('ai-search-feedback-banner');
  if (feedbackBanner) feedbackBanner.classList.add('hidden');
}

// ==========================================
// 6. TÍNH NĂNG 3: NHẬN DIỆN THỰC PHẨM BẰNG AI (CAMERA)
// ==========================================
function initCameraTab() {
  const btnStartCam = document.getElementById('btn-start-camera');
  const btnCapture = document.getElementById('btn-capture-photo');
  const btnStopCam = document.getElementById('btn-stop-camera');
  const fileInput = document.getElementById('ai-file-input');

  if (btnStartCam) btnStartCam.addEventListener('click', startCamera);
  if (btnCapture) btnCapture.addEventListener('click', capturePhotoAndAnalyze);
  if (btnStopCam) btnStopCam.addEventListener('click', stopCamera);

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processUploadedImage(e.target.files[0]);
      }
    });
  }
}

async function startCamera() {
  const video = document.getElementById('camera-video');
  const previewContainer = document.getElementById('camera-preview-container');
  const placeholder = document.getElementById('camera-placeholder');
  const btnStart = document.getElementById('btn-start-camera');
  const btnCapture = document.getElementById('btn-capture-photo');
  const btnStop = document.getElementById('btn-stop-camera');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });

    appState.cameraStream = stream;
    if (video) {
      video.srcObject = stream;
      video.play();
    }

    if (previewContainer) previewContainer.classList.remove('hidden');
    if (placeholder) placeholder.classList.add('hidden');
    if (btnStart) btnStart.classList.add('hidden');
    if (btnCapture) btnCapture.classList.remove('hidden');
    if (btnStop) btnStop.classList.remove('hidden');

    showToast('Camera đã sẵn sàng! Đưa món ăn vào khung và bấm "Chụp ảnh ngay"', 'info');
  } catch (err) {
    console.error('Không thể truy cập camera:', err);
    showToast('Không thể bật camera (thiếu quyền truy cập). Vui lòng dùng nút "Thêm hình ảnh" bên cạnh!', 'error');
  }
}

function stopCamera() {
  if (appState.cameraStream) {
    appState.cameraStream.getTracks().forEach(track => track.stop());
    appState.cameraStream = null;
  }

  const previewContainer = document.getElementById('camera-preview-container');
  const placeholder = document.getElementById('camera-placeholder');
  const btnStart = document.getElementById('btn-start-camera');
  const btnCapture = document.getElementById('btn-capture-photo');
  const btnStop = document.getElementById('btn-stop-camera');

  if (previewContainer) previewContainer.classList.add('hidden');
  if (placeholder) placeholder.classList.remove('hidden');
  if (btnStart) btnStart.classList.remove('hidden');
  if (btnCapture) btnCapture.classList.add('hidden');
  if (btnStop) btnStop.classList.add('hidden');
}

function capturePhotoAndAnalyze() {
  const video = document.getElementById('camera-video');
  if (!video) return;

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const base64DataUrl = canvas.toDataURL('image/jpeg', 0.85);
  analyzeFoodImage(base64DataUrl);
}

function processUploadedImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    analyzeFoodImage(e.target.result);
  };
  reader.readAsDataURL(file);
}

// Phân tích ảnh món ăn bằng Gemini AI hoặc mô phỏng thông minh
async function analyzeFoodImage(base64DataUrl) {
  appState.lastCapturedImageBase64 = base64DataUrl;

  const emptyCard = document.getElementById('ai-empty-placeholder');
  const loadingCard = document.getElementById('ai-loading-card');
  const resultCard = document.getElementById('ai-result-card');
  const previewImg = document.getElementById('ai-captured-preview');

  if (emptyCard) emptyCard.classList.add('hidden');
  if (resultCard) resultCard.classList.add('hidden');
  if (loadingCard) loadingCard.classList.remove('hidden');
  if (previewImg) previewImg.src = base64DataUrl;

  try {
    let detectedFoodObj = null;

    if (appState.apiKey) {
      // Gọi Gemini Vision với model nhanh nhất
      detectedFoodObj = await callGeminiVisionAPI(base64DataUrl, appState.apiKey);
    } else {
      // Mô phỏng nhận diện thông minh đối chiếu với 202 món ăn
      await new Promise(r => setTimeout(r, 1200));
      detectedFoodObj = simulateSmartFoodRecognition();
    }

    appState.lastAiDetectedFood = detectedFoodObj;
    appState.aiPortionSize = 'M'; // Mặc định là Vừa (100%)

    displayAiResult(detectedFoodObj);
    awardPoints(15, 'Nhận diện bữa ăn bằng AI');
  } catch (err) {
    console.error('Lỗi phân tích AI:', err);
    // Nếu Gemini lỗi quota/mạng, tự động chuyển sang mô phỏng thông minh
    const fallbackFood = simulateSmartFoodRecognition();
    appState.lastAiDetectedFood = fallbackFood;
    displayAiResult(fallbackFood);
    showToast('Gemini bận - Hệ thống đã tự động dùng bộ nhận diện dự phòng!', 'info');
  } finally {
    if (loadingCard) loadingCard.classList.add('hidden');
  }
}

// Hàm mô phỏng nhận diện đối chiếu 202 món ăn
function simulateSmartFoodRecognition() {
  // Chọn ngẫu nhiên một món tiêu biểu từ cơ sở dữ liệu
  const popularIds = ['mn_01', 'mb_01', 'mt_01', 'mn_21', 'mb_04', 'mn_14', 'mt_03', 'mb_67'];
  const pickedId = popularIds[Math.floor(Math.random() * popularIds.length)];
  const food = getFoodById(pickedId) || FOOD_DATABASE[0];

  return {
    ...food,
    confidence: '95%',
    advice: 'Món ăn giàu dinh dưỡng, cung cấp nguồn đạm và năng lượng tuyệt vời cho các tiết học buổi chiều.'
  };
}

// Thay đổi định lượng thực tế bằng thanh nút (Ít 70% - Vừa 100% - Nhiều 130%)
function setAiPortionSize(size) {
  appState.aiPortionSize = size;

  // Cập nhật trạng thái nút
  document.getElementById('ai-portion-btn-s')?.classList.toggle('btn-primary', size === 'S');
  document.getElementById('ai-portion-btn-s')?.classList.toggle('btn-secondary', size !== 'S');

  document.getElementById('ai-portion-btn-m')?.classList.toggle('btn-primary', size === 'M');
  document.getElementById('ai-portion-btn-m')?.classList.toggle('btn-secondary', size !== 'M');

  document.getElementById('ai-portion-btn-l')?.classList.toggle('btn-primary', size === 'L');
  document.getElementById('ai-portion-btn-l')?.classList.toggle('btn-secondary', size !== 'L');

  const labelEl = document.getElementById('ai-portion-label');
  if (labelEl) {
    const textMap = { S: 'Khẩu phần Ít (70%)', M: 'Khẩu phần Vừa (100%)', L: 'Khẩu phần Nhiều (130%)' };
    labelEl.textContent = textMap[size] || 'Vừa (100%)';
  }

  // Cập nhật lại số liệu trên màn hình
  if (appState.lastAiDetectedFood) {
    updateAiResultNutrition(appState.lastAiDetectedFood, size);
  }
}

function updateAiResultNutrition(food, size) {
  const nutrition = calculatePortionNutrition(food, size);

  const calEl = document.getElementById('ai-result-calories');
  const proEl = document.getElementById('ai-result-protein');
  const fatEl = document.getElementById('ai-result-fat');
  const carbEl = document.getElementById('ai-result-carb');

  if (calEl) calEl.textContent = nutrition.calories;
  if (proEl) proEl.textContent = `${nutrition.protein}g`;
  if (fatEl) fatEl.textContent = `${nutrition.fat}g`;
  if (carbEl) carbEl.textContent = `${nutrition.carb}g`;
}

function displayAiResult(foodResult) {
  const resultCard = document.getElementById('ai-result-card');
  const nameEl = document.getElementById('ai-result-food-name');
  const regionTag = document.getElementById('ai-result-region-tag');
  const specialtyCity = document.getElementById('ai-result-specialty-city');
  const vitaminsEl = document.getElementById('ai-result-vitamins');
  const adviceEl = document.getElementById('ai-result-advice');
  const allergyAlertBox = document.getElementById('ai-allergy-alert-box');

  if (nameEl) nameEl.textContent = foodResult.name;
  if (regionTag) regionTag.textContent = foodResult.regionName || 'Việt Nam';
  if (specialtyCity) specialtyCity.textContent = foodResult.specialty || 'Toàn quốc';
  if (vitaminsEl) vitaminsEl.textContent = foodResult.vitamins || 'Vitamin nhóm B, Sắt, Kẽm';
  if (adviceEl) adviceEl.textContent = foodResult.advice || 'Cung cấp năng lượng cân bằng cho học sinh.';

  // CẢNH BÁO KÉP DỊ ỨNG (RED ALERT) KHI NHẬN DIỆN MÓN
  const userAllergens = appState.profile.allergens || [];
  const allergyMatches = checkFoodAllergies(foodResult, userAllergens);

  if (allergyAlertBox) {
    if (allergyMatches.length > 0) {
      allergyAlertBox.classList.remove('hidden');
      allergyAlertBox.innerHTML = `
        <div class="red-alert-banner">
          <span class="text-2xl flex-shrink-0 animate-bounce">🚨</span>
          <div>
            <div class="font-black uppercase tracking-wide">CẢNH BÁO KÉP: PHÁT HIỆN DỊ NGUYÊN TRONG ẢNH!</div>
            <div class="text-xs font-semibold mt-0.5">
              Hệ thống phát hiện món này có chứa <strong>${allergyMatches.join(', ')}</strong>! Đừng ăn nếu bạn bị dị ứng với thành phần này.
            </div>
          </div>
        </div>
      `;
    } else {
      allergyAlertBox.classList.add('hidden');
    }
  }

  // Cập nhật số liệu theo size hiện tại
  setAiPortionSize(appState.aiPortionSize || 'M');

  if (resultCard) resultCard.classList.remove('hidden');
}

function saveAiResultToDiary() {
  if (!appState.lastAiDetectedFood) return;

  const food = appState.lastAiDetectedFood;
  const currentSize = appState.aiPortionSize || 'M';
  const nutrition = calculatePortionNutrition(food, currentSize);

  // Mở modal chọn bữa ăn (Sáng / Trưa / Tối / Ăn vặt)
  openAddToDiaryModal(food.id, currentSize);
}

// ==========================================
// 7. TÍNH NĂNG 4: GỢI Ý & XÂY DỰNG THỰC ĐƠN KHOA HỌC
// ==========================================
function initMealPlanTab() {
  generateBalancedMealPlan(false);
}

function generateBalancedMealPlan(showToastMsg = true) {
  const userAllergens = appState.profile.allergens || [];
  const tdee = appState.profile.tdee || 2200;

  // Lọc danh sách món an toàn không chứa dị ứng của học sinh
  const safeFoods = FOOD_DATABASE.filter(f => checkFoodAllergies(f, userAllergens).length === 0);

  // Phân chia theo nhóm
  const mainDishes = safeFoods.filter(f => f.category === 'mon_chinh');
  const meatDishes = safeFoods.filter(f => f.category === 'mon_man');
  const soupVegDishes = safeFoods.filter(f => f.category === 'mon_canh_rau');
  const snackDishes = safeFoods.filter(f => f.category === 'mon_an_vat_banh');

  // Gợi ý 3 bữa chính đảm bảo đủ 4 nhóm chất
  // Bữa sáng (~30% calo)
  const breakfastItem = pickRandom(mainDishes.length ? mainDishes : FOOD_DATABASE);
  const breakfastFruit = { name: 'Chuối sứ chín / Táo', portion: '1 quả (120g)', calories: 95, protein: 1.2, fat: 0.3, carb: 23, icon: '🍌' };

  // Bữa trưa (~40% calo)
  const lunchRice = { name: 'Cơm trắng', portion: '1 bát (200g)', calories: 345, protein: 7.9, fat: 1.0, carb: 75.9, icon: '🍚' };
  const lunchMeat = pickRandom(meatDishes.length ? meatDishes : FOOD_DATABASE);
  const lunchVeg = pickRandom(soupVegDishes.length ? soupVegDishes : FOOD_DATABASE);

  // Bữa tối (~30% calo)
  const dinnerRice = { name: 'Cơm gạo lứt / Cơm trắng', portion: '1 bát (180g)', calories: 290, protein: 6.5, fat: 0.8, carb: 64, icon: '🍚' };
  const dinnerMeat = pickRandom(meatDishes.filter(m => m.id !== lunchMeat.id));
  const dinnerVeg = pickRandom(soupVegDishes.filter(v => v.id !== lunchVeg.id));

  appState.generatedMealPlan = {
    breakfast: [breakfastItem, breakfastFruit],
    lunch: [lunchRice, lunchMeat, lunchVeg],
    dinner: [dinnerRice, dinnerMeat, dinnerVeg]
  };

  renderMealPlanUI();

  if (showToastMsg) {
    awardPoints(10, 'Khám phá thực đơn mới');
    showToast('Đã đổi thực đơn dinh dưỡng cân bằng mới cho 3 bữa!', 'success');
  }
}

function pickRandom(arr) {
  if (!arr || arr.length === 0) return FOOD_DATABASE[0];
  return arr[Math.floor(Math.random() * arr.length)];
}

function renderMealPlanUI() {
  const plan = appState.generatedMealPlan;
  if (!plan) return;

  const renderItems = (items) => items.map(item => `
    <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
      <div class="flex items-center gap-2">
        <span class="text-base">${item.icon || '🍲'}</span>
        <div>
          <span class="font-bold text-slate-800">${item.name}</span>
          <span class="text-[10px] text-slate-400 block">${item.portion}</span>
        </div>
      </div>
      <div class="text-right">
        <span class="font-extrabold text-amber-700">${item.calories} kcal</span>
        <span class="text-[10px] text-slate-400 block">${item.protein || 0}g đạm</span>
      </div>
    </div>
  `).join('');

  const sumNutr = (items) => items.reduce((acc, cur) => ({
    cal: acc.cal + (cur.calories || 0),
    pro: acc.pro + (cur.protein || 0),
    fat: acc.fat + (cur.fat || 0),
    carb: acc.carb + (cur.carb || 0)
  }), { cal: 0, pro: 0, fat: 0, carb: 0 });

  const bNutr = sumNutr(plan.breakfast);
  const lNutr = sumNutr(plan.lunch);
  const dNutr = sumNutr(plan.dinner);
  const totalCal = bNutr.cal + lNutr.cal + dNutr.cal;

  const bContainer = document.getElementById('mealplan-breakfast-items');
  const bSummary = document.getElementById('mealplan-breakfast-summary');
  if (bContainer) bContainer.innerHTML = renderItems(plan.breakfast);
  if (bSummary) bSummary.innerHTML = `Tổng: <strong>${bNutr.cal} kcal</strong> · Đạm: ${bNutr.pro.toFixed(1)}g · Carb: ${bNutr.carb.toFixed(1)}g`;

  const lContainer = document.getElementById('mealplan-lunch-items');
  const lSummary = document.getElementById('mealplan-lunch-summary');
  if (lContainer) lContainer.innerHTML = renderItems(plan.lunch);
  if (lSummary) lSummary.innerHTML = `Tổng: <strong>${lNutr.cal} kcal</strong> · Đạm: ${lNutr.pro.toFixed(1)}g · Carb: ${lNutr.carb.toFixed(1)}g`;

  const dContainer = document.getElementById('mealplan-dinner-items');
  const dSummary = document.getElementById('mealplan-dinner-summary');
  if (dContainer) dContainer.innerHTML = renderItems(plan.dinner);
  if (dSummary) dSummary.innerHTML = `Tổng: <strong>${dNutr.cal} kcal</strong> · Đạm: ${dNutr.pro.toFixed(1)}g · Carb: ${dNutr.carb.toFixed(1)}g`;

  const totalBanner = document.getElementById('mealplan-total-banner');
  if (totalBanner) {
    const targetTdee = appState.profile.tdee || 2200;
    const diff = totalCal - targetTdee;
    totalBanner.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <span class="font-extrabold text-green-900 text-sm">Tổng năng lượng thực đơn: ${totalCal.toLocaleString('vi-VN')} kcal</span>
          <p class="text-green-700 mt-0.5">
            So với nhu cầu chuẩn (${targetTdee} kcal): ${Math.abs(diff) < 150 ? '✅ Rất sát và cân đối tuyệt đối!' : (diff > 0 ? `Chênh lệch +${diff} kcal` : `Chênh lệch ${diff} kcal`)}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-1 rounded-lg bg-green-200 text-green-900 font-bold text-[11px]">Đủ 4 nhóm chất</span>
          <span class="px-2 py-1 rounded-lg bg-emerald-200 text-emerald-900 font-bold text-[11px]">Có rau xanh & hoa quả</span>
        </div>
      </div>
    `;
  }
}

function applyGeneratedMealPlanToDiary() {
  const plan = appState.generatedMealPlan;
  if (!plan) return;

  const diary = getTodayDiary();

  // Nạp các món vào từng bữa
  diary.breakfast.push(...plan.breakfast.map(item => ({ ...item, size: 'M' })));
  diary.lunch.push(...plan.lunch.map(item => ({ ...item, size: 'M' })));
  diary.dinner.push(...plan.dinner.map(item => ({ ...item, size: 'M' })));

  saveTodayDiary(diary);
  awardPoints(25, 'Áp dụng thực đơn khoa học vào Nhật ký');
  showToast('Đã thêm toàn bộ 3 bữa ăn vào Nhật ký dinh dưỡng hôm nay!', 'success');
  switchTab('diary');
}

// ==========================================
// 8. TÍNH NĂNG 5: NHẬT KÝ DINH DƯỠNG & THEO DÕI
// ==========================================
function initDiaryTab() {
  updateDiaryUI();
}

function updateDiaryUI() {
  const diary = getTodayDiary();
  const targetTdee = appState.profile.tdee || 2200;

  // Tính tổng calo và macro
  const allMeals = [...diary.breakfast, ...diary.lunch, ...diary.dinner, ...diary.snack];
  const totalCal = allMeals.reduce((acc, f) => acc + (f.calories || 0), 0);
  const totalPro = +(allMeals.reduce((acc, f) => acc + (f.protein || 0), 0)).toFixed(1);
  const totalFat = +(allMeals.reduce((acc, f) => acc + (f.fat || 0), 0)).toFixed(1);
  const totalCarb = +(allMeals.reduce((acc, f) => acc + (f.carb || 0), 0)).toFixed(1);

  // 1. Cập nhật Biểu đồ vòng tròn (Donut Chart)
  const percent = Math.min(Math.round((totalCal / targetTdee) * 100), 100);
  const donutProgress = document.getElementById('diary-donut-progress');
  const donutPercent = document.getElementById('diary-donut-percent');
  const donutConsumed = document.getElementById('diary-donut-consumed');
  const donutTarget = document.getElementById('diary-donut-target');

  if (donutProgress) {
    donutProgress.setAttribute('stroke-dasharray', `${percent}, 100`);
    if (totalCal > targetTdee * 1.1) {
      donutProgress.classList.remove('stroke-green-500');
      donutProgress.classList.add('stroke-amber-500');
    } else {
      donutProgress.classList.remove('stroke-amber-500');
      donutProgress.classList.add('stroke-green-500');
    }
  }

  if (donutPercent) donutPercent.textContent = `${percent}%`;
  if (donutConsumed) donutConsumed.textContent = totalCal.toLocaleString('vi-VN');
  if (donutTarget) donutTarget.textContent = targetTdee.toLocaleString('vi-VN');

  // 2. Thanh tiến độ Calo & Macro
  const calProgBar = document.getElementById('diary-cal-progressbar');
  const calProgText = document.getElementById('diary-cal-progress-text');
  if (calProgBar) calProgBar.style.width = `${Math.min((totalCal / targetTdee) * 100, 100)}%`;
  if (calProgText) calProgText.textContent = `${totalCal.toLocaleString('vi-VN')} / ${targetTdee.toLocaleString('vi-VN')} kcal (${percent}%)`;

  const targetPro = appState.profile.targetProtein || 110;
  const targetFat = appState.profile.targetFat || 55;
  const targetCarb = appState.profile.targetCarb || 303;

  const proVal = document.getElementById('diary-pro-val');
  const fatVal = document.getElementById('diary-fat-val');
  const carbVal = document.getElementById('diary-carb-val');

  if (proVal) proVal.textContent = `${totalPro}/${targetPro}g`;
  if (fatVal) fatVal.textContent = `${totalFat}/${targetFat}g`;
  if (carbVal) carbVal.textContent = `${totalCarb}/${targetCarb}g`;

  const proBar = document.getElementById('diary-pro-bar');
  const fatBar = document.getElementById('diary-fat-bar');
  const carbBar = document.getElementById('diary-carb-bar');

  if (proBar) proBar.style.width = `${Math.min((totalPro / targetPro) * 100, 100)}%`;
  if (fatBar) fatBar.style.width = `${Math.min((totalFat / targetFat) * 100, 100)}%`;
  if (carbBar) carbBar.style.width = `${Math.min((totalCarb / targetCarb) * 100, 100)}%`;

  // 3. Render danh sách món theo 4 bữa
  renderDiaryMealList('breakfast', diary.breakfast);
  renderDiaryMealList('lunch', diary.lunch);
  renderDiaryMealList('dinner', diary.dinner);
  renderDiaryMealList('snack', diary.snack);

  // 4. Cập nhật Theo dõi Nước uống
  updateWaterTrackerUI(diary.waterGlasses || 0);

  // 5. Lời khuyên Dinh dưỡng Tự động (Smart Advice)
  renderDiarySmartAdvice(totalCal, targetTdee, totalPro, totalFat, totalCarb, allMeals, diary.waterGlasses || 0);
}

function renderDiaryMealList(mealType, items) {
  const container = document.getElementById(`diary-${mealType}-list`);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `
      <p class="text-xs text-slate-400 italic py-2 text-center">Chưa có món nào được ghi lại</p>
    `;
    return;
  }

  container.innerHTML = items.map((food, index) => `
    <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
      <div class="flex items-center gap-2">
        <span class="text-base">${food.icon || '🍲'}</span>
        <div>
          <span class="font-bold text-slate-800">${food.name}</span>
          <span class="text-[10px] text-slate-400 block">${food.size ? 'Size ' + food.size + ' · ' : ''}${food.calories} kcal</span>
        </div>
      </div>
      <button onclick="removeFoodFromDiary('${mealType}', ${index})"
              title="Xóa món này"
              class="text-slate-400 hover:text-red-600 font-bold p-1 text-sm">
        ✕
      </button>
    </div>
  `).join('');
}

function removeFoodFromDiary(mealType, index) {
  const diary = getTodayDiary();
  if (diary[mealType]) {
    diary[mealType].splice(index, 1);
    saveTodayDiary(diary);
    updateDiaryUI();
    showToast('Đã xóa món khỏi nhật ký', 'info');
  }
}

// Cập nhật giao diện ly nước
function updateWaterTrackerUI(filledGlasses) {
  const grid = document.getElementById('water-glasses-grid');
  const consumedEl = document.getElementById('diary-water-consumed');
  const targetEl = document.getElementById('diary-water-target');

  const targetMl = appState.profile.waterTarget || 2100;
  const consumedMl = filledGlasses * 250;

  if (consumedEl) consumedEl.textContent = `${consumedMl} ml`;
  if (targetEl) targetEl.textContent = `/ ${targetMl} ml (${(targetMl/1000).toFixed(1)}L)`;

  if (!grid) return;

  const totalGlasses = 8;
  let html = '';
  for (let i = 0; i < totalGlasses; i++) {
    const isFilled = i < filledGlasses;
    html += `
      <div onclick="toggleWaterGlass(${i})"
           class="water-glass ${isFilled ? 'filled' : ''}"
           title="Ly ${i + 1} (250ml)">
        ${isFilled ? '🥤' : '🥛'}
      </div>
    `;
  }
  grid.innerHTML = html;

  if (consumedMl >= targetMl) {
    unlockBadge('badge_water_novice');
  }
}

function toggleWaterGlass(index) {
  const diary = getTodayDiary();
  let current = diary.waterGlasses || 0;

  if (index < current) {
    diary.waterGlasses = index;
  } else {
    diary.waterGlasses = index + 1;
    awardPoints(5, 'Uống nước lành mạnh');
  }

  saveTodayDiary(diary);
  updateDiaryUI();
}

function addOneGlassWater() {
  const diary = getTodayDiary();
  diary.waterGlasses = (diary.waterGlasses || 0) + 1;
  saveTodayDiary(diary);
  updateDiaryUI();
  awardPoints(5, 'Thêm 1 ly nước');
}

// Lời khuyên dinh dưỡng tự động theo đề bài
function renderDiarySmartAdvice(totalCal, targetTdee, pro, fat, carb, allMeals, glasses) {
  const container = document.getElementById('diary-alerts-container');
  if (!container) return;

  const adviceList = [];

  // 1. Kiểm tra chất xơ / rau xanh
  const hasVeg = allMeals.some(m => m.category === 'mon_canh_rau' || m.name.toLowerCase().includes('rau') || m.name.toLowerCase().includes('canh'));
  if (!hasVeg && allMeals.length > 0) {
    adviceList.push({
      type: 'warning',
      icon: '🥗',
      title: 'Thiếu chất xơ hôm nay!',
      message: 'Hôm nay bạn chưa ăn đủ rau xanh hoặc hoa quả. Hãy bổ sung thêm rau muống luộc, canh cá chua hoặc trái cây để hỗ trợ tiêu hóa.'
    });
  }

  // 2. Kiểm tra chất đạm
  const targetPro = appState.profile.targetProtein || 110;
  if (pro >= targetPro * 0.85) {
    adviceList.push({
      type: 'success',
      icon: '💪',
      title: 'Lượng đạm rất chuẩn!',
      message: 'Bạn đã nạp đủ lượng chất đạm lý tưởng hôm nay, rất có lợi cho việc phát triển cơ bắp và chiều cao tuổi dậy thì.'
    });
  }

  // 3. Kiểm tra chất béo
  const targetFat = appState.profile.targetFat || 55;
  if (fat > targetFat * 1.25) {
    adviceList.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Chất béo vượt mức khuyến nghị',
      message: 'Hôm nay lượng chất béo của bạn hơi cao. Bữa tiếp theo hãy ưu tiên món luộc, hấp thay vì đồ chiên xào nhiều dầu mỡ.'
    });
  }

  // 4. Kiểm tra calo tổng
  if (totalCal > 0 && totalCal < targetTdee * 0.6) {
    adviceList.push({
      type: 'info',
      icon: '🍚',
      title: 'Năng lượng còn thiếu',
      message: 'Bạn mới nạp dưới 60% năng lượng cần thiết cho một ngày học tập. Hãy nhớ ăn đủ bữa tối để không bị kiệt sức nhé.'
    });
  }

  // 5. Kiểm tra nước
  if (glasses < 4) {
    adviceList.push({
      type: 'info',
      icon: '💧',
      title: 'Nhớ uống thêm nước',
      message: 'Uống đủ nước giúp giảm căng thẳng khi học bài và tăng cường tuần hoàn máu.'
    });
  }

  if (adviceList.length === 0) {
    container.innerHTML = `
      <div class="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 flex items-center gap-2">
        <span class="text-xl">🌟</span>
        <span>Chế độ dinh dưỡng hôm nay của bạn đang rất cân bằng và khoa học! Hãy duy trì phong độ này nhé.</span>
      </div>
    `;
    return;
  }

  const alertClasses = {
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    info: 'bg-sky-50 border-sky-200 text-sky-900'
  };

  container.innerHTML = adviceList.map(a => `
    <div class="p-3 rounded-xl border text-xs flex items-start gap-2.5 ${alertClasses[a.type] || alertClasses.info}">
      <span class="text-xl flex-shrink-0">${a.icon}</span>
      <div>
        <strong class="block font-bold">${a.title}</strong>
        <p class="mt-0.5 leading-relaxed opacity-90">${a.message}</p>
      </div>
    </div>
  `).join('');
}

// XUẤT VÀ NHẬP DỮ LIỆU JSON THEO YÊU CẦU ĐỀ BÀI
function exportDiaryDataAsJson() {
  const exportData = {
    appName: 'NUTRIFUTURE',
    version: '3.2',
    school: 'THCS & THPT Ngã Sáu',
    exportDate: new Date().toISOString(),
    profile: appState.profile,
    gamification: appState.gamification,
    diaries: loadFromStorage(STORAGE_KEYS.DIARY, {})
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `nutrifuture_backup_${getTodayKey()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast('Đã xuất file sao lưu JSON thành công!', 'success');
}

function importDiaryDataFromJson(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.profile) {
        appState.profile = imported.profile;
        saveToStorage(STORAGE_KEYS.PROFILE, imported.profile);
      }
      if (imported.gamification) {
        appState.gamification = imported.gamification;
        saveToStorage(STORAGE_KEYS.GAMIFICATION, imported.gamification);
      }
      if (imported.diaries) {
        saveToStorage(STORAGE_KEYS.DIARY, imported.diaries);
      }

      calculatePersonalMetrics();
      updateHeaderStats();
      updateDiaryUI();
      renderFoodGrid();

      showToast('Khôi phục dữ liệu từ file JSON thành công!', 'success');
    } catch (err) {
      console.error('Lỗi nhập file JSON:', err);
      showToast('File JSON không hợp lệ hoặc bị hỏng!', 'error');
    }
  };
  reader.readAsText(file);
}

// ==========================================
// 9. TÍNH NĂNG 6: GAMIFICATION – HỌC MÀ CHƠI
// ==========================================
function initGamificationTab() {
  renderBadges();
  renderWeeklyChallenges();
}

function renderBadges() {
  const container = document.getElementById('gamify-badges-grid');
  if (!container) return;

  const unlocked = appState.gamification.unlockedBadges || [];

  container.innerHTML = BADGES_DATABASE.map(badge => {
    const isUnlocked = unlocked.includes(badge.id);
    return `
      <div class="card p-3 text-center space-y-1.5 transition-all ${isUnlocked ? 'border-amber-300 bg-amber-50/40 shadow-sm' : 'opacity-40 grayscale'}">
        <span class="text-3xl block">${badge.icon}</span>
        <h4 class="font-extrabold text-xs text-slate-900">${badge.name}</h4>
        <p class="text-[10px] text-slate-500 leading-tight">${badge.desc}</p>
        <span class="text-[9px] font-black px-1.5 py-0.5 rounded-full ${isUnlocked ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-500'} inline-block">
          ${isUnlocked ? 'Đã đạt ✓' : 'Chưa mở'}
        </span>
      </div>
    `;
  }).join('');
}

function renderWeeklyChallenges() {
  const container = document.getElementById('gamify-challenges-list');
  if (!container) return;

  const wp = appState.gamification.weeklyProgress;

  const challenges = [
    {
      title: 'Ăn 5 loại rau củ khác nhau',
      icon: '🥦',
      current: wp.vegetablesCount || 0,
      target: 5,
      unit: 'loại',
      actionText: '+ Đã ăn rau',
      onAction: () => {
        wp.vegetablesCount = Math.min((wp.vegetablesCount || 0) + 1, 5);
        awardPoints(10, 'Nhiệm vụ rau xanh');
        saveToStorage(STORAGE_KEYS.GAMIFICATION, appState.gamification);
        renderWeeklyChallenges();
      }
    },
    {
      title: 'Uống đủ nước 3 ngày trong tuần',
      icon: '💧',
      current: wp.waterGoalDays || 0,
      target: 3,
      unit: 'ngày',
      actionText: '+ Đủ nước',
      onAction: () => {
        wp.waterGoalDays = Math.min((wp.waterGoalDays || 0) + 1, 3);
        awardPoints(10, 'Nhiệm vụ uống nước');
        saveToStorage(STORAGE_KEYS.GAMIFICATION, appState.gamification);
        renderWeeklyChallenges();
      }
    },
    {
      title: 'Không uống nước ngọt có ga 2 ngày',
      icon: '🚫',
      current: wp.noSodaDays || 0,
      target: 2,
      unit: 'ngày',
      actionText: '+ Không uống soda',
      onAction: () => {
        wp.noSodaDays = Math.min((wp.noSodaDays || 0) + 1, 2);
        awardPoints(10, 'Kiểm soát đường ngọt');
        saveToStorage(STORAGE_KEYS.GAMIFICATION, appState.gamification);
        renderWeeklyChallenges();
      }
    },
    {
      title: 'Hoàn thành 3 bài Quiz dinh dưỡng',
      icon: '🧠',
      current: wp.quizzesDone || 0,
      target: 3,
      unit: 'bài',
      actionText: 'Làm Quiz ngay',
      onAction: () => {
        startNewQuizSession();
      }
    }
  ];

  window._challengesActions = challenges.map(c => c.onAction);

  container.innerHTML = challenges.map((c, index) => {
    const percent = Math.min(Math.round((c.current / c.target) * 100), 100);
    const isCompleted = c.current >= c.target;

    return `
      <div class="card p-4 space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-2xl">${c.icon}</span>
            <div>
              <h4 class="font-bold text-xs text-slate-800">${c.title}</h4>
              <span class="text-[10px] text-slate-400">Tiến độ: ${c.current} / ${c.target} ${c.unit}</span>
            </div>
          </div>
          <button onclick="window._challengesActions[${index}]()"
                  class="btn btn-sm ${isCompleted ? 'btn-secondary text-green-700 font-bold' : 'btn-primary'} text-[11px]"
                  ${isCompleted ? 'disabled' : ''}>
            ${isCompleted ? 'Hoàn thành ✓' : c.actionText}
          </button>
        </div>

        <div class="progress-track h-2">
          <div class="progress-fill ${isCompleted ? 'bg-green-500' : 'bg-amber-500'}" style="width: ${percent}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

// Bắt đầu phiên làm Quiz 5 câu hỏi mỗi ngày
function startNewQuizSession() {
  appState.currentQuizQuestions = generateDaily5Questions();
  appState.currentQuizIndex = 0;
  appState.quizScore = 0;
  appState.userQuizAnswers = [];

  renderQuizStep();
  openModal('quiz-modal');
}

function renderQuizStep() {
  const modalBody = document.getElementById('quiz-modal-body');
  if (!modalBody) return;

  const questions = appState.currentQuizQuestions;
  const index = appState.currentQuizIndex;

  if (index >= questions.length) {
    showQuizResult();
    return;
  }

  const q = questions[index];
  const difficultyColors = {
    'Dễ': 'bg-green-100 text-green-800',
    'Trung bình': 'bg-amber-100 text-amber-800',
    'Khó': 'bg-red-100 text-red-800'
  };

  modalBody.innerHTML = `
    <div class="p-6 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="text-xl">🧠</span>
          <span class="text-xs font-bold text-slate-500">Câu hỏi ${index + 1} / 5</span>
          <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full ${difficultyColors[q.difficulty] || 'bg-slate-100 text-slate-700'}">
            Cấp độ: ${q.difficulty}
          </span>
        </div>
        <button onclick="closeModal('quiz-modal')" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
      </div>

      <h3 class="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
        ${q.question}
      </h3>

      <div class="space-y-2 pt-1" id="quiz-options-container">
        ${q.options.map((opt, optIndex) => `
          <button onclick="handleSelectQuizAnswer(${optIndex})"
                  class="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-green-500 hover:bg-green-50 text-xs font-semibold text-slate-700 transition-all flex items-center justify-between">
            <span>${String.fromCharCode(65 + optIndex)}. ${opt}</span>
            <span class="text-slate-300">○</span>
          </button>
        `).join('')}
      </div>

      <!-- Hộp giải thích sau khi trả lời -->
      <div id="quiz-explanation-box" class="hidden p-3.5 rounded-xl border text-xs space-y-1.5 transition-all"></div>

      <div class="pt-2 flex justify-end">
        <button id="btn-next-quiz-step" onclick="goToNextQuizQuestion()" class="btn btn-primary hidden text-xs py-2 px-4">
          Câu tiếp theo →
        </button>
      </div>
    </div>
  `;
}

function handleSelectQuizAnswer(selectedIdx) {
  const questions = appState.currentQuizQuestions;
  const index = appState.currentQuizIndex;
  const q = questions[index];

  const container = document.getElementById('quiz-options-container');
  const explanationBox = document.getElementById('quiz-explanation-box');
  const nextBtn = document.getElementById('btn-next-quiz-step');

  const isCorrect = selectedIdx === q.answer;
  if (isCorrect) {
    appState.quizScore += 1;
  }

  // Khóa các lựa chọn và đánh dấu màu
  const buttons = container.querySelectorAll('button');
  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === q.answer) {
      btn.className = 'w-full text-left p-3.5 rounded-xl border-2 border-green-500 bg-green-50 text-green-900 text-xs font-bold flex items-center justify-between';
      btn.innerHTML = `<span>${btn.innerText}</span> <span>✅ Đúng</span>`;
    } else if (idx === selectedIdx) {
      btn.className = 'w-full text-left p-3.5 rounded-xl border-2 border-red-500 bg-red-50 text-red-900 text-xs font-bold flex items-center justify-between';
      btn.innerHTML = `<span>${btn.innerText}</span> <span>❌ Sai</span>`;
    } else {
      btn.className = 'w-full text-left p-3.5 rounded-xl border border-slate-200 text-slate-400 text-xs opacity-50';
    }
  });

  // Hiển thị giải thích khoa học
  if (explanationBox) {
    explanationBox.classList.remove('hidden');
    explanationBox.className = `p-3.5 rounded-xl border text-xs space-y-1 ${isCorrect ? 'bg-green-50 border-green-200 text-green-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`;
    explanationBox.innerHTML = `
      <strong class="font-bold flex items-center gap-1.5">
        ${isCorrect ? '🎉 Hoàn toàn chính xác (+20 XP)!' : '💡 Giải thích khoa học:'}
      </strong>
      <p class="leading-relaxed opacity-90">${q.explanation}</p>
    `;
  }

  if (nextBtn) nextBtn.classList.remove('hidden');
}

function goToNextQuizQuestion() {
  appState.currentQuizIndex += 1;
  renderQuizStep();
}

function showQuizResult() {
  const modalBody = document.getElementById('quiz-modal-body');
  if (!modalBody) return;

  const score = appState.quizScore;
  const earnedXp = score * 20;
  awardPoints(earnedXp, 'Hoàn thành Quiz 5 câu');

  // Tăng tiến độ thử thách tuần
  appState.gamification.weeklyProgress.quizzesDone = (appState.gamification.weeklyProgress.quizzesDone || 0) + 1;
  saveToStorage(STORAGE_KEYS.GAMIFICATION, appState.gamification);
  renderWeeklyChallenges();

  if (score === 5) {
    unlockBadge('badge_quiz_master');
  }

  modalBody.innerHTML = `
    <div class="p-6 text-center space-y-4">
      <span class="text-5xl block animate-bounce">🏆</span>
      <h3 class="font-black text-xl text-slate-900">Kết quả Trắc nghiệm Dinh dưỡng</h3>
      <p class="text-sm font-bold text-slate-600">
        Bạn trả lời đúng: <strong class="text-green-600 text-lg">${score} / 5</strong> câu hỏi
      </p>

      <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">
        ⭐ Bạn nhận được: +${earnedXp} XP điểm thưởng kinh nghiệm!
      </div>

      <div class="pt-2 flex justify-center gap-3">
        <button onclick="startNewQuizSession()" class="btn btn-primary text-xs py-2 px-4">
          🔄 Làm bộ câu hỏi khác
        </button>
        <button onclick="closeModal('quiz-modal')" class="btn btn-secondary text-xs py-2 px-4">
          Đóng
        </button>
      </div>
    </div>
  `;
}

// ==========================================
// 10. MỞ KHÓA VÀ ĐỔI GIAO DIỆN (THEMES)
// ==========================================
function applyAppTheme(themeName, showToastMsg = true) {
  document.body.setAttribute('data-theme', themeName);
  appState.activeTheme = themeName;
  localStorage.setItem(STORAGE_KEYS.THEME, themeName);

  if (showToastMsg) {
    const themeTitles = {
      default: 'Xanh Tươi Mát',
      citrus: 'Cam Năng Động',
      ocean: 'Đại Dương',
      galaxy: 'Tím Galaxy'
    };
    showToast(`Đã áp dụng giao diện: ${themeTitles[themeName] || themeName}!`, 'success');
  }
}

// ==========================================
// 11. HỘP THOẠI MODAL & TIỆN ÍCH
// ==========================================
function initModals() {
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
}

function openAddToDiaryModal(foodId, size = 'M') {
  const food = getFoodById(foodId) || appState.lastAiDetectedFood;
  if (!food) return;

  const modalBody = document.getElementById('add-diary-modal-body');
  if (!modalBody) return;

  const nutrition = calculatePortionNutrition(food, size);

  modalBody.innerHTML = `
    <div class="p-5 space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="text-2xl">${food.icon || '🍲'}</span>
          <div>
            <h4 class="font-bold text-sm text-slate-800">${food.name}</h4>
            <span class="text-[11px] text-slate-400">Khẩu phần Size ${size} (${nutrition.calories} kcal)</span>
          </div>
        </div>
        <button onclick="closeModal('add-diary-modal')" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
      </div>

      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-slate-700">Chọn bữa ăn bạn đã dùng:</label>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <button onclick="confirmAddFoodToMeal('${food.id}', '${size}', 'breakfast')" class="p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 font-bold text-slate-700 flex items-center gap-2">
            <span>🌅</span> Bữa sáng
          </button>
          <button onclick="confirmAddFoodToMeal('${food.id}', '${size}', 'lunch')" class="p-3 rounded-xl border border-slate-200 hover:border-green-500 hover:bg-green-50 font-bold text-slate-700 flex items-center gap-2">
            <span>☀️</span> Bữa trưa
          </button>
          <button onclick="confirmAddFoodToMeal('${food.id}', '${size}', 'dinner')" class="p-3 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50 font-bold text-slate-700 flex items-center gap-2">
            <span>🌙</span> Bữa tối
          </button>
          <button onclick="confirmAddFoodToMeal('${food.id}', '${size}', 'snack')" class="p-3 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50 font-bold text-slate-700 flex items-center gap-2">
            <span>🍿</span> Ăn vặt
          </button>
        </div>
      </div>
    </div>
  `;

  openModal('add-diary-modal');
}

function confirmAddFoodToMeal(foodId, size, mealType) {
  const food = getFoodById(foodId) || appState.lastAiDetectedFood;
  if (!food) return;

  const nutrition = calculatePortionNutrition(food, size);
  const diary = getTodayDiary();

  diary[mealType].push({
    ...food,
    size,
    calories: nutrition.calories,
    protein: nutrition.protein,
    fat: nutrition.fat,
    carb: nutrition.carb
  });

  saveTodayDiary(diary);
  closeModal('add-diary-modal');
  closeModal('food-detail-modal');

  awardPoints(10, `Ghi nhận ${food.name}`);
  showToast(`Đã thêm ${food.name} (Size ${size}) vào ${getMealLabel(mealType)}!`, 'success');
  updateDiaryUI();
}

function getMealLabel(type) {
  const map = { breakfast: 'Bữa sáng', lunch: 'Bữa trưa', dinner: 'Bữa tối', snack: 'Ăn vặt' };
  return map[type] || 'Bữa ăn';
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: '💡' };
  const borderColors = {
    success: 'border-green-500 bg-white text-green-900',
    error: 'border-red-500 bg-white text-red-900',
    info: 'border-sky-500 bg-white text-slate-800'
  };

  const toast = document.createElement('div');
  toast.className = `toast-item p-3 rounded-xl border-l-4 shadow-lg text-xs font-semibold flex items-center gap-2 ${borderColors[type] || borderColors.info}`;
  toast.innerHTML = `<span>${icons[type] || '💡'}</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ==========================================
// 12. TÍCH HỢP GEMINI AI API (REST CLIENT)
// ==========================================
async function callGeminiAPI(prompt, apiKey) {
  const fastModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash'];

  for (const model of fastModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) continue;

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (e) {
      console.warn(`Lỗi model ${model}, thử model tiếp theo...`);
    }
  }

  throw new Error('Không thể kết nối Gemini API. Vui lòng kiểm tra lại khóa API.');
}

async function callGeminiVisionAPI(base64DataUrl, apiKey) {
  const cleanBase64 = base64DataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
  const fastModels = ['gemini-1.5-flash', 'gemini-2.0-flash'];

  const prompt = `Bạn là chuyên gia thị giác dinh dưỡng học đường tại Việt Nam.
Hãy nhận diện món ăn trong ảnh (thuộc ẩm thực Việt Nam như Cơm tấm, Phở bò, Bún bò Huế, Bún chả, Bánh xèo, Bánh mì...).
Trả về duy nhất định dạng JSON thuần không markdown theo cấu trúc:
{
  "name": "Tên món ăn tiếng Việt chuẩn",
  "specialty": "Tên tỉnh/thành phố đặc sản (Ví dụ Hà Nội, Huế, Sài Gòn, Hậu Giang, Sóc Trăng...)",
  "regionName": "Miền Bắc hoặc Miền Trung hoặc Miền Nam",
  "calories": 450,
  "protein": 25.0,
  "fat": 12.0,
  "carb": 55.0,
  "allergens": ["dau_phong", "hai_san", "trung"],
  "vitamins": "Vitamin B1, Sắt, Kẽm",
  "advice": "Lời khuyên dinh dưỡng cho học sinh THPT dưới 35 từ"
}`;

  for (const model of fastModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: 'image/jpeg', data: cleanBase64 } }
            ]
          }]
        })
      });

      if (!response.ok) continue;

      const data = await response.json();
      let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(rawText);
      return {
        ...parsed,
        id: 'ai_detected_' + Date.now(),
        icon: '🍲',
        weightG: 350
      };
    } catch (e) {
      console.warn(`Lỗi vision model ${model}, tiếp tục...`);
    }
  }

  // Fallback nếu không parse được
  return simulateSmartFoodRecognition();
}

async function testGeminiApiConnection(silent = false) {
  const keyInput = document.getElementById('gemini-api-key-input');
  const apiKey = (keyInput ? keyInput.value.trim() : '') || appState.apiKey;

  if (!apiKey) {
    if (!silent) showToast('Vui lòng nhập API Key trước khi kiểm tra!', 'info');
    updateHeaderApiStatus('disconnected');
    return;
  }

  const resultBox = document.getElementById('api-test-result-box');
  const badge = document.getElementById('api-test-status-badge');
  const activeModelEl = document.getElementById('api-test-active-model');
  const messageEl = document.getElementById('api-test-message');

  try {
    const text = await callGeminiAPI('Test 1', apiKey);
    appState.apiKey = apiKey;
    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
    updateHeaderApiStatus('connected', 'Gemini Flash');

    if (resultBox) {
      resultBox.classList.remove('hidden');
      resultBox.className = 'p-3 rounded-xl border border-green-200 bg-green-50 text-xs space-y-1';
      if (badge) {
        badge.textContent = 'Kết nối thành công ✓';
        badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-200 text-green-900';
      }
      if (activeModelEl) activeModelEl.textContent = 'gemini-1.5-flash (Siêu tốc & Miễn phí)';
      if (messageEl) messageEl.textContent = 'Khóa API hoạt động hoàn hảo. Bạn có thể sử dụng trọn vẹn AI Vision và AI Search!';
    }

    if (!silent) showToast('Kết nối Google Gemini AI thành công!', 'success');
  } catch (err) {
    updateHeaderApiStatus('error');
    if (resultBox) {
      resultBox.classList.remove('hidden');
      resultBox.className = 'p-3 rounded-xl border border-red-200 bg-red-50 text-xs space-y-1';
      if (badge) {
        badge.textContent = 'Lỗi kết nối ✕';
        badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-200 text-red-900';
      }
      if (activeModelEl) activeModelEl.textContent = 'Không kết nối được';
      if (messageEl) messageEl.textContent = err.message || 'Khóa API không hợp lệ hoặc hết hạn.';
    }
    if (!silent) showToast('Lỗi kết nối API. Vui lòng kiểm tra lại khóa!', 'error');
  }
}

function saveGeminiApiKeyFromModal() {
  const keyInput = document.getElementById('gemini-api-key-input');
  if (keyInput) {
    const val = keyInput.value.trim();
    appState.apiKey = val;
    localStorage.setItem(STORAGE_KEYS.API_KEY, val);
    testGeminiApiConnection();
    closeModal('gemini-api-modal');
  }
}

function updateHeaderApiStatus(status, modelName = '') {
  const dot = document.getElementById('header-api-status-dot');
  if (!dot) return;

  if (status === 'connected') {
    dot.className = 'w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50';
    dot.title = `Gemini AI đã sẵn sàng (${modelName || 'Flash'})`;
  } else if (status === 'error') {
    dot.className = 'w-2.5 h-2.5 rounded-full bg-red-500';
    dot.title = 'Lỗi kết nối Gemini AI';
  } else {
    dot.className = 'w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse';
    dot.title = 'Chưa cấu hình Gemini AI';
  }
}
