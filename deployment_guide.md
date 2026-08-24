# 🐙 How to Host "The Bead Room by Pallas" on GitHub

Here is the complete step-by-step guide to push your project to **GitHub** and host it live!

---

## 🛠️ Step 1: Upload Your Project to a GitHub Repository

### 1. Create a New Repository on GitHub
1. Log into your account on [GitHub.com](https://github.com).
2. Click the **`+`** icon at the top right -> Select **New repository**.
3. Name your repository: `the-bead-room`
4. Choose **Public** (or **Private**).
5. Click **Create repository**.

### 2. Push Code via Git Terminal
Open PowerShell or Command Prompt inside your project folder (`C:\Users\PRATEEK\.gemini\antigravity\scratch\the-bead-room`) and run:

```bash
git init
git add .
git commit -m "Initial commit for The Bead Room by Pallas"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/the-bead-room.git
git push -u origin main
```
*(Replace `YOUR_USERNAME` with your actual GitHub username!)*

---

## 🌐 Step 2: Choose Your Hosting Method

### 🌟 Option A: GitHub + Render (Recommended for Full Backend + Admin Login + Uploads)

Since GitHub Pages only hosts static files, connecting your GitHub repository to **Render** gives you a complete full-stack website with backend API, admin login, product uploads, and email inquiries for **FREE**!

1. Go to [Render.com](https://render.com) and click **Sign Up** -> **Continue with GitHub**.
2. Click **New +** -> **Web Service**.
3. Select your `the-bead-room` GitHub repository.
4. Fill in these 3 settings:
   - **Name**: `the-bead-room`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Click **Create Web Service**.
6. Render will automatically build your app from GitHub and give you a free live URL: `https://the-bead-room.onrender.com`.

---

### 📄 Option B: GitHub Pages (`github.io`)

If you want to host the storefront directly on GitHub's free domain (`username.github.io/the-bead-room`):

1. Open your repository on [GitHub.com](https://github.com).
2. Click **Settings** (top navigation tab).
3. On the left sidebar, click **Pages**.
4. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`
   - **Branch**: Select `main` / `root` (or `public`)
5. Click **Save**.
6. Within 1–2 minutes, GitHub will publish your live website at:
   `https://YOUR_USERNAME.github.io/the-bead-room/`
