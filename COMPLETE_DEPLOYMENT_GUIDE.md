# 🚀 Complete ShibaCoder Deployment Guide

## ✅ STEP 1: Backend Deployed Successfully!
**Your Python FastAPI backend is now live on Railway!** 🎉

---

## 🔥 STEP 2: Get Your Railway URL

Run this command to get your backend URL:

```powershell
railway service list
railway domain
```

Your Railway URL will look like:
`https://shibacoder-production-abc123.railway.app`

**⚠️ SAVE THIS URL - You'll need it for the frontend!**

---

## 📝 STEP 3: Update Frontend Configuration

Update your frontend to connect to the deployed backend:

1. Open `frontend/src/config.js`
2. Replace `YOUR-RAILWAY-APP-URL` with your actual Railway URL
3. Make sure both `wsUrl` and `apiUrl` are updated

**Example:**
```javascript
production: {
  wsUrl: 'wss://shibacoder-production-abc123.railway.app/ws',
  apiUrl: 'https://shibacoder-production-abc123.railway.app'
}
```

---

## 🌐 STEP 4: Deploy Frontend to Vercel

### 🎯 **RECOMMENDED: Automatic GitHub Deployment**

**Best for ongoing development - deploy by pushing to GitHub!**

1. **Push your code to GitHub** (if not already)
2. **Go to [vercel.com](https://vercel.com)**
3. **Sign in with GitHub**
4. **Click "Import Project"**
5. **Select your ShibaCoder repository**
6. **Configure settings:**
   - Framework: **Vite**
   - Root Directory: **frontend**
   - Build Command: **npm run build**
   - Output Directory: **dist**
7. **Click Deploy**

**🎉 Result: Every `git push` to main = automatic deployment!**

### 📱 Alternative: Manual Deployment

**If you prefer manual control:**

```powershell
cd frontend
npm install -g vercel  # If not installed
vercel --prod
```

**Follow prompts and select Vite framework**

---

## 🔧 STEP 5: Update Backend CORS Settings

Update your backend to allow all origins (easiest for deployment):

```python
# In backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 5.1 Redeploy Backend
```powershell
cd backend
railway up
```

---

## 🎮 STEP 6: Test Your Deployed Game!

1. Visit your Vercel URL: `https://shibacoder-abc123.vercel.app`
2. Create a lobby
3. Open the same URL in a different browser/device
4. Join the lobby
5. Start a multiplayer coding battle!

---

## 🔄 **Future Updates Made Easy:**

### **Backend Updates:**
```powershell
# 1. Make changes to backend files
# 2. Redeploy
cd backend
railway up
```

### **Frontend Updates:**
**With GitHub (Automatic):**
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel deploys automatically! 🎉
```

**With Manual:**
```powershell
cd frontend
vercel --prod
```

---

## 🎯 Success Criteria

✅ **Backend deployed on Railway**  
✅ **Frontend config updated with Railway URL**  
✅ **Frontend deployed on Vercel (GitHub or Manual)**  
✅ **Backend CORS updated to allow all origins**  
✅ **Backend redeployed**  
✅ **Multiplayer game working from any device**  

---

## 🌍 Final Result

After completing all steps:
- **Your game works from ANY computer/device in the world**
- **You can turn off your PC and the game stays online**
- **Friends can join from anywhere with just a URL**
- **Real-time multiplayer coding battles**
- **Easy updates: just push to GitHub!** (if using automatic deployment)

---

## 🚨 Troubleshooting

**If WebSocket connection fails:**
1. Check Railway URL is correct (https, not http)
2. Make sure WebSocket URL uses `wss://` not `ws://`
3. Verify CORS settings allow all origins

**If build fails:**
1. Check all dependencies are installed
2. Verify environment variables are set
3. Check build logs for specific errors

---

## 📞 Need Help?

Common issues:
- **Connection refused**: Check URL format and spelling
- **CORS errors**: Verify allowed origins in backend
- **Build fails**: Check package.json and dependencies

You're almost there! 🚀 

## **Quick Test - Try This URL:**

**Can you visit this link and tell me what you see?**
**https://shibacoder-production.up.railway.app**

## **Also Check Your Frontend Config:** 