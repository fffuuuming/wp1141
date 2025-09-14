# 🚀 Quick Deployment Guide

## Make Your Simulator Public (5 Minutes)

### Option 1: GitHub Pages (Easiest)

1. **Upload to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy crypto swap simulator"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your GitHub repository
   - Click "Settings" → "Pages"
   - Source: "Deploy from a branch"
   - Branch: "main"
   - Folder: "/ (root)"
   - Click "Save"

3. **Your simulator is live at:**
   ```
   https://YOUR_USERNAME.github.io/wp1141/hw1/
   ```

### Option 2: Netlify (Drag & Drop)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy:**
   - Go to [netlify.com](https://netlify.com)
   - Drag the `hw1` folder to the deploy area
   - Get your live URL instantly!

### Option 3: Vercel (Command Line)

1. **Install Vercel:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd hw1
   vercel
   ```

3. **Follow prompts** - done!

## 📱 Share Your Simulator

Once deployed, anyone can:
- ✅ Access it from any device
- ✅ Use it without installing anything
- ✅ Share the URL with others
- ✅ Bookmark it for later use

## 🔧 Troubleshooting

**If GitHub Pages doesn't work:**
- Make sure you're in the `hw1` folder
- Check that `index.html` is in the root of `hw1`
- Wait 5-10 minutes for GitHub to build

**If Netlify doesn't work:**
- Make sure you built the project first (`npm run build`)
- Check that the `dist` folder exists
- Try uploading just the contents of `hw1`

**If Vercel doesn't work:**
- Make sure you're logged in (`vercel login`)
- Check your internet connection
- Try again in a few minutes
