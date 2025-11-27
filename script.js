const CONFIG = {
  timeZone: "Asia/Taipei",
  timeUpdateInterval: 1000,
  githubUsername: "likahang",
  repoCount: 20
};

class GithubPortfolio {
  constructor(username, count) {
    this.username = username;
    this.count = count;
    this.projectList = document.querySelector(".project-list");
    this.apiHeaders = { 'Accept': 'application/vnd.github.v3+json' }; // 將 headers 提升為實例屬性
  }

  async loadProjects() {
    if (!this.projectList) {
      console.error("Project list container not found!");
      return;
    }

    this.projectList.innerHTML = '<li class="loading-message">Fetching projects from GitHub...</li>';

    try {
      const repos = await this.fetchRepositories();
      console.log('✅ 成功獲取倉庫數量:', repos.length);
      console.log('📊 倉庫詳情:', repos.map(r => ({
        name: r.name,
        private: r.private,
        visibility: r.private ? '私人' : '公開',
        // 預先準備好版本欄位
        latest_release: { tag_name: 'N/A' } 
      })));
      
      this.renderProjects(repos);
    } catch (error) {
      console.error("❌ 載入 GitHub 專案失敗:", error);
      this.projectList.innerHTML = `<li class="error-message">Failed to load projects: ${error.message}</li>`;
    }
  }

  async fetchRepositories() {
    // 判斷使用哪個 API 端點
    let apiUrl;

    // 檢查並使用 Token
    if (window.LOCAL_CONFIG && window.LOCAL_CONFIG.githubToken) {
      const token = window.LOCAL_CONFIG.githubToken;
      this.apiHeaders['Authorization'] = `token ${token}`; // 設定實例屬性
      // 使用認證端點，可以獲取私有倉庫
      apiUrl = `https://api.github.com/user/repos?sort=pushed&per_page=${this.count}&affiliation=owner`;
      console.log('🔑 使用 GitHub Token (前8字符):', token.substring(0, 8) + '...');
      console.log('✅ 使用認證端點，將獲取私有倉庫');
    } else {
      // 沒有 Token，使用公開端點
      apiUrl = `https://api.github.com/users/${this.username}/repos?sort=pushed&per_page=${this.count}`;
      console.warn('⚠️ 未找到 GitHub Token，只能讀取公開倉庫');
    }

    console.log('📡 請求 URL:', apiUrl);
    console.log('📋 請求標頭:', this.apiHeaders);

    const response = await fetch(apiUrl, { headers: this.apiHeaders });
    
    console.log('📥 響應狀態:', response.status, response.statusText);
    
    // 檢查 Rate Limit
    const rateLimit = response.headers.get('X-RateLimit-Remaining');
    const rateLimitTotal = response.headers.get('X-RateLimit-Limit');
    console.log(`⏱️ API 使用限制: ${rateLimit}/${rateLimitTotal}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GitHub API 錯誤響應:', errorText);
      throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
    }
    
    const repos = await response.json();
    
    // 統計私有和公開倉庫
    const privateCount = repos.filter(r => r.private).length;
    const publicCount = repos.filter(r => !r.private).length;
    console.log(`📊 倉庫統計 - 私有: ${privateCount}, 公開: ${publicCount}`);
    
    return repos;
  }

  renderProjects(repos) {
    this.projectList.innerHTML = "";

    if (repos.length === 0) {
      this.projectList.innerHTML = '<li>No repositories found.</li>';
      return;
    }

    // 建立一個 Promise 陣列來獲取所有專案的最新版本
    const fetchVersionPromises = repos.map(repo => this.fetchLatestRelease(repo));

    // 等待所有版本資訊都回來
    Promise.all(fetchVersionPromises).then(() => {
      repos.forEach((repo, index) => {
        const projectItem = this.createProjectElement(repo, index);
        this.projectList.appendChild(projectItem);
      });
      console.log('✅ 渲染完成，共', repos.length, '個專案');
    });
  }

  async fetchLatestRelease(repo) {
    // 如果專案沒有發布過 Release，API 會回傳 404，這是正常行為
    // 我們不需要顯示錯誤，只需保持預設值即可
    try {
      const url = `https://api.github.com/repos/${repo.owner.login}/${repo.name}/releases/latest`;
      const response = await fetch(url, { headers: this.apiHeaders }); // 使用儲存的 apiHeaders
      if (response.ok) {
        repo.latest_release = await response.json();
      }
    } catch (error) {
      // 忽略單一專案獲取版本失敗的錯誤
    }
  }

  createProjectElement(repo, index) {
    const item = document.createElement("a");
    // 優先使用 repo.homepage (對應 GitHub 上的 Website 欄位)，
    // 如果為空，則退回使用 repo.html_url (專案的 GitHub 頁面)。
    item.href = repo.homepage || repo.html_url;
    item.target = "_blank";
    item.rel = "noopener noreferrer";
    item.className = "project-item";

    // 改善建議：動態載入每個專案自己的預覽圖
    // 您需要在每個 GitHub 專案的 main 分支根目錄下放置一張名為 'preview.png' 的圖片
    // 使用 repo.default_branch 來動態獲取預設分支名稱 (例如 'main' 或 'master')
    const previewImageUrl = `https://raw.githubusercontent.com/${this.username}/${repo.name}/${repo.default_branch}/preview.png`;
    item.dataset.image = previewImageUrl;

    const number = (index + 1).toString().padStart(2, '0');
    const description = repo.description || repo.name;
    const language = repo.language || "N/A";
    const visibility = repo.private ? "私人" : "公開";
    const version = repo.latest_release?.tag_name || "N/A";
    const date = new Date(repo.pushed_at).toLocaleDateString('en-CA');

    item.innerHTML = `
      <span class="project-data project-number hover-text">${number}</span>
      <span class="project-data description hover-text">${description}</span>
      <span class="project-data language hover-text">${language}</span>
      <span class="project-data visibility hover-text">${visibility}</span>
      <span class="project-data version hover-text">${version}</span>
      <span class="project-data date hover-text">${date.replace(/-/g, '/')}</span>
    `;
    return item;
  }
}

// AnimationManager 類保持不變
class AnimationManager {
  constructor() {
    this.backgroundImage = document.getElementById("backgroundImage");
    this.portfolioContainer = document.querySelector(".portfolio-container");
    this.init();
  }

  init() {
    const style = document.createElement('style');
    style.textContent = '.project-list > a.project-item { display: grid; }';
    document.head.appendChild(style);

    this.projectItems = document.querySelectorAll(".project-item");
    if (this.projectItems.length === 0) {
      return;
    }

    this.currentActiveIndex = -1;
    this.originalTexts = new Map();
    this.debounceTimeout = null;
    this.idleAnimation = null;
    this.isIdle = true;
    this.idleTimer = null;
    this.projectItems.forEach((item) => {
      const textElements = item.querySelectorAll(".hover-text");
      const texts = Array.from(textElements).map((el) => el.textContent);
      this.originalTexts.set(item, texts);
    });
    this.initializeAnimations();
  }

  initializeAnimations() {    
    this.preloadImages();
    this.projectItems.forEach((item, index) => {
      this.addEventListeners(item, index);
    });
    const container = document.querySelector(".portfolio-container");
    container.addEventListener("mouseleave", () => {
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      this.clearActiveStates();
      this.hideBackgroundImage();
      this.startIdleTimer();
    });
    this.startIdleTimer();
  }
  preloadImages() {
    this.projectItems.forEach((item) => {
      const imageUrl = item.dataset.image;
      if (imageUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
      }
    });
  }
  addEventListeners(item, index) {
    const textElements = item.querySelectorAll(".hover-text");
    const imageUrl = item.dataset.image;
    const originalTexts = this.originalTexts.get(item);
    const handleMouseEnter = () => {
      this.stopIdleAnimation();
      this.stopIdleTimer();
      this.isIdle = false;
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      if (this.currentActiveIndex === index) return;
      this.updateActiveStates(index);
      textElements.forEach((element, i) => {
        gsap.killTweensOf(element);
        gsap.to(element, {
          duration: 0.8,
          scrambleText: {
            text: originalTexts[i],
            chars: "qwerty1337h@ck3r",
            revealDelay: 0.3,
            speed: 0.4
          }
        });
      });
      if (imageUrl) {
        this.showBackgroundImage(imageUrl);
      }
    };
    const handleMouseLeave = () => {
      this.debounceTimeout = setTimeout(() => {
        textElements.forEach((element, i) => {
          gsap.killTweensOf(element);
          element.textContent = originalTexts[i];
        });
      }, 50);
    };
    item.addEventListener("mouseenter", handleMouseEnter);
    item.addEventListener("mouseleave", handleMouseLeave);
  }
  updateActiveStates(activeIndex) {
    this.currentActiveIndex = activeIndex;
    this.portfolioContainer.classList.add("has-active");
    this.projectItems.forEach((item, index) => {
      if (index === activeIndex) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }
  clearActiveStates() {
    this.currentActiveIndex = -1;
    this.portfolioContainer.classList.remove("has-active");
    this.projectItems.forEach((item) => {
      item.classList.remove("active");
      const textElements = item.querySelectorAll(".hover-text");
      const originalTexts = this.originalTexts.get(item);
      textElements.forEach((element, i) => {
        gsap.killTweensOf(element);
        element.textContent = originalTexts[i];
      });
    });
    this.startIdleTimer();
  }
  showBackgroundImage(imageUrl) {
    this.backgroundImage.style.transition = "none";
    this.backgroundImage.style.transform = "translate(-50%, -50%) scale(1.2)";
    this.backgroundImage.style.backgroundImage = `url(${imageUrl})`;
    this.backgroundImage.style.opacity = "1";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.backgroundImage.style.transition =
          "opacity 0.6s ease, transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        this.backgroundImage.style.transform =
          "translate(-50%, -50%) scale(1.0)";
      });
    });
  }
  hideBackgroundImage() {
    this.backgroundImage.style.opacity = "0";
  }
  startIdleTimer() {
    this.stopIdleTimer();
    this.idleTimer = setTimeout(() => {
      if (this.currentActiveIndex === -1) {
        this.isIdle = true;
        this.startIdleAnimation();
      }
    }, 3000);
  }
  stopIdleTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }
  startIdleAnimation() {
    if (this.idleAnimation) return;
    this.idleAnimation = gsap.timeline({
      repeat: -1,
      repeatDelay: 2
    });
    const columnElements = {
      descriptions: [...this.projectItems].map((item) =>
        item.querySelector(".description")
      ),
      languages: [...this.projectItems].map((item) =>
        item.querySelector(".language")
      ),
      visibilities: [...this.projectItems].map((item) =>
        item.querySelector(".visibility")
      ),
      versions: [...this.projectItems].map((item) =>
        item.querySelector(".version")
      ),
      dates: [...this.projectItems].map((item) => item.querySelector(".date"))
    };
    const totalRows = this.projectItems.length;
    const columnStartDelay = 0.2;
    const rowDelay = 0.05;
    const hideShowGap = totalRows * rowDelay * 0.5;
    Object.keys(columnElements).forEach((columnName, columnIndex) => {
      const elements = columnElements[columnName];
      if (!elements || elements.some(el => !el)) {
        return;
      }

      const columnStart = (columnIndex + 1) * columnStartDelay;
      elements.forEach((element, rowIndex) => {
        const hideTime = columnStart + rowIndex * rowDelay;
        this.idleAnimation.to(
          element,
          {
            duration: 0.1,
            opacity: 0.05,
            ease: "power2.inOut"
          },
          hideTime
        );
      });
      elements.forEach((element, rowIndex) => {
        const showTime = columnStart + hideShowGap + rowIndex * rowDelay;
        this.idleAnimation.to(
          element,
          {
            duration: 0.1,
            opacity: 1,
            ease: "power2.inOut"
          },
          showTime
        );
      });
    });
  }
  stopIdleAnimation() {
    if (this.idleAnimation) {
      this.idleAnimation.kill();
      this.idleAnimation = null;
      gsap.set([...document.querySelectorAll(".project-data")], {
        opacity: 1
      });
    }
  }
}

class TimeDisplay {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
    if (!this.element) {
      throw new Error(`Element with id '${elementId}' not found.`);
    }
  }
  start() {
    this.updateDisplay();
    setInterval(() => this.updateDisplay(), CONFIG.timeUpdateInterval);
  }
  updateDisplay() {
    const { hours, minutes, dayPeriod } = this.getCurrentTime();
    const timeString = `${hours}<span class="time-blink">:</span>${minutes} ${dayPeriod}`;
    this.element.innerHTML = timeString;
  }
  getCurrentTime() {
    const now = new Date();
    const options = {
      timeZone: CONFIG.timeZone,
      hour12: true,
      hour: "numeric",
      minute: "numeric",
      second: "numeric"
    };
    const formatter = new Intl.DateTimeFormat("en-US", options);
    const parts = formatter.formatToParts(now);
    return {
      hours: parts.find((part) => part.type === "hour").value,
      minutes: parts.find((part) => part.type === "minute").value,
      dayPeriod: parts.find((part) => part.type === "dayPeriod").value
    };
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log('🚀 頁面載入完成，開始初始化...');
  
  // 檢查配置
  if (window.LOCAL_CONFIG) {
    console.log('✅ LOCAL_CONFIG 已載入');
  } else {
    console.error('❌ LOCAL_CONFIG 未載入！請確認 config.local.js 是否正確引入');
  }

  const portfolio = new GithubPortfolio(CONFIG.githubUsername, CONFIG.repoCount);
  await portfolio.loadProjects();

  const animationManager = new AnimationManager();

  const timeDisplay = new TimeDisplay("current-time");
  timeDisplay.start();
  
  console.log('✅ 所有初始化完成');
});