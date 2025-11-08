# Atlastor

一個由 GitHub API 和 GSAP 驅動的動態、具備動畫效果的現代化個人作品集。

[![Deploy to GitHub Pages](https://github.com/likahang/Atlastor/actions/workflows/deploy.yml/badge.svg)](https://github.com/likahang/Atlastor/actions/workflows/deploy.yml)

**[➡️ 查看線上展示 (Live Demo)](https://likahang.github.io/Atlastor/)**

![Atlastor Screenshot](https://raw.githubusercontent.com/likahang/Atlastor/main/screenshot.png)

## 專案描述

**Atlastor** 是一個極簡風格的現代化作品集網站，旨在動態展示您的 GitHub 專案。它直接從 GitHub API 獲取您的儲存庫列表，並透過一個時尚、互動的介面呈現，該介面具有文字打亂動畫和懸停時顯示專案特定背景預覽圖等特色。

此專案著重於自動化和現代網頁技術，使用 GitHub Actions 來安全地管理 API 金鑰並自動部署到 GitHub Pages。

## ✨ 主要特色

-   **動態專案載入**：自動從 GitHub 獲取並顯示您最新的儲存庫。
-   **支援私有與公開儲存庫**：使用 GitHub 個人存取權杖 (PAT) 同時顯示您的私有和公開專案。
-   **互動式 UI**：利用 GSAP 的 `ScrambleTextPlugin` 實現引人入勝的懸停效果。
-   **專案預覽圖**：懸停在專案上時，會顯示該專案獨特的背景圖片。
-   **閒置動畫**：當使用者閒置時，會播放一個微妙而優雅的動畫。
-   **自動化部署**：透過 GitHub Actions，在推送到 `main` 分支時自動部署到 GitHub Pages。
-   **自動化部署**：透過 GitHub Actions，在發布新版本 (Release) 時自動部署到 GitHub Pages。
-   **響應式設計**：能夠適應不同尺寸的螢幕。

## 🛠️ 技術棧

-   **前端**：HTML5, CSS3, JavaScript (ES6+ Classes)
-   **動畫**：GSAP (GreenSock Animation Platform)
-   **CI/CD**：GitHub Actions
-   **部署**：GitHub Pages

## 🚀 設定與配置

若要將此作品集用於您自己的專案，請按照以下步驟操作：

### 1. Fork 或複製此儲存庫

首先，將此儲存庫 Fork 到您自己的 GitHub 帳戶，或使用 `git clone` 將其複製到本地。

### 2. 產生 GitHub 個人存取權杖 (PAT)

為了能讀取您的私有儲存庫，您需要一個 GitHub Token。

1.  前往您的 GitHub Personal Access Tokens 設定頁面。
2.  點擊 **"Generate new token"**。
3.  為 Token 命名（例如 `Atlastor-Portfolio`）。
4.  在 **"Repository access"** 部分，選擇 **"Only select repositories"**，然後選擇您 Fork 的這個 `Atlastor` 儲存庫。
5.  在 **"Permissions"** 下，找到 **"Contents"**，將其權限設為 **"Read-only"**。
6.  點擊 **"Generate token"** 並複製產生的 Token（`ghp_...`）。**請務必在離開頁面前複製它。**

### 3. 設定 Repository Secret

自動化部署流程需要透過 GitHub Secrets 來安全地存取您的 Token。

1.  在您 Fork 的 `Atlastor` 儲存庫頁面，點擊 **"Settings"** > **"Secrets and variables"** > **"Actions"**。
2.  點擊 **"New repository secret"**。
3.  **Name** 欄位**必須**填寫 `GH_TOKEN`。
4.  **Secret** 欄位貼上您剛剛複製的 Token。
5.  點擊 **"Add secret"**。

### 4. 更新基本設定

打開 `script.js` 檔案，修改 `CONFIG` 物件以符合您的需求：

```javascript
const CONFIG = {
  timeZone: "Asia/Taipei", // 您的時區
  timeUpdateInterval: 1000,
  githubUsername: "likahang", // 替換成您的 GitHub 使用者名稱
  repoCount: 20 // 您想顯示的專案數量
};
```

### 5. 觸發部署

完成以上設定後，前往專案的 **"Releases"** 頁面並 **"Create a new release"**。發布一個新版本 (例如 `v1.0.0`) 將會自動觸發部署流程，您的個人作品集網站將會自動部署完成！

## 🎨 客製化

### 專案預覽圖

懸停時顯示的預覽圖是透過讀取每個專案儲存庫根目錄下的 `preview.png` 檔案來實現的。

```
https://raw.githubusercontent.com/[YOUR_USERNAME]/[REPO_NAME]/main/preview.png
```

若要為您的專案設定預覽圖，只需將一張名為 `preview.png` 的圖片放置在該專案的 `main` (或預設) 分支的根目錄即可。

### 社交連結

在 `index.html` 中，您可以輕鬆修改右上角的社交連結：

```html
<nav class="corner-item top-right">
  <a href="YOUR_SPOTIFY_LINK_HERE">Spotify</a> |
  <a href="mailto:YOUR_EMAIL_HERE">Email</a> |
  <a href="YOUR_X_LINK_HERE" target="_blank" rel="noopener">X</a>
</nav>
```

## 授權

此專案採用 MIT License。