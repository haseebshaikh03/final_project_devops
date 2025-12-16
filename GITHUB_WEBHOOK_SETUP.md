# 🔗 GitHub Webhook Setup for Jenkins Auto-Trigger

This guide configures automatic Jenkins pipeline execution when you push code to GitHub.

---

## 📋 Prerequisites

- ✅ Jenkins server running and accessible from the internet
- ✅ GitHub repository (haseebshaikh03/final_project_devops)
- ✅ Jenkins GitHub plugin installed

---

## 🔧 Step 1: Configure Jenkins

### 1.1 Install GitHub Plugin

1. Go to **Manage Jenkins** → **Plugins** → **Available plugins**
2. Search for "GitHub Integration"
3. Install:
   - ✅ GitHub plugin
   - ✅ GitHub Branch Source Plugin
4. Restart Jenkins if required

### 1.2 Configure GitHub Server in Jenkins

1. Go to **Manage Jenkins** → **System**
2. Scroll to **GitHub** section
3. Click **Add GitHub Server** → **GitHub Server**
4. Configure:
   - **Name**: `    `
   - **API URL**: `https://api.github.com` (default)
   - **Credentials**: Add a GitHub Personal Access Token (see Step 2)
5. Click **Test connection** to verify
6. Click **Save**


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
---

## 🔑 Step 2: Create GitHub Personal Access Token

### 2.1 Generate Token in GitHub

1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **Generate new token** → **Generate new token (classic)**
3. Configure token:
   - **Note**: `Jenkins Webhook Token`
   - **Expiration**: 90 days (or No expiration for testing)
   - **Scopes**: Check these:
     - ✅ `repo` (all sub-scopes)
     - ✅ `admin:repo_hook` (all sub-scopes)
4. Click **Generate token**
5. **COPY THE TOKEN** (you won't see it again!)

### 2.2 Add Token to Jenkins

1. In Jenkins → **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
2. Click **Add Credentials**
3. Configure:
   - **Kind**: `Secret text`
   - **Secret**: Paste your GitHub token
   - **ID**: `github-token`
   - **Description**: `GitHub Personal Access Token`
4. Click **Create**

---

## 🌐 Step 3: Configure GitHub Webhook

### 3.1 Get Jenkins Webhook URL

Your Jenkins webhook URL format:
```
http://YOUR_JENKINS_IP:8080/github-webhook/
```

**Example:**
- Public IP: `http://54.123.45.67:8080/github-webhook/`
- Domain: `http://jenkins.yourdomain.com/github-webhook/`
- Localhost (for testing): `http://localhost:8080/github-webhook/`

⚠️ **Important**: 
- Must end with `/github-webhook/`
- Jenkins must be accessible from the internet (GitHub needs to reach it)
- If using AWS EC2, ensure Security Group allows port 8080 from `0.0.0.0/0`

### 3.2 Add Webhook to GitHub Repository

1. Go to your GitHub repository: `https://github.com/haseebshaikh03/final_project_devops`
2. Click **Settings** → **Webhooks** → **Add webhook**
3. Configure webhook:
   - **Payload URL**: `http://YOUR_JENKINS_IP:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Secret**: Leave empty (or add for security)
   - **Which events**: Select `Just the push event`
   - **Active**: ✅ Checked
4. Click **Add webhook**

### 3.3 Test the Webhook

1. GitHub will send a test ping
2. Check the webhook page - you should see a **green checkmark** ✅
3. If you see a **red X** ❌, click on it to see the error:
   - `Connection refused` → Jenkins is not accessible from internet
   - `404 Not Found` → Check the URL (must end with `/github-webhook/`)
   - `Timeout` → Firewall or security group blocking traffic

---

## ⚙️ Step 4: Configure Jenkins Job

### 4.1 Enable GitHub Hook Trigger

1. Open your Jenkins job (final_project_devops pipeline)
2. Click **Configure**
3. In **Build Triggers** section, check:
   - ✅ **GitHub hook trigger for GITScm polling**
4. Click **Save**

**Note**: The Jenkinsfile has already been updated with `triggers { githubPush() }` to enable this.

---

## 🧪 Step 5: Test the Auto-Trigger

### 5.1 Make a Test Commit

From your local repository:

```bash
# Navigate to your repo
cd final_project_repo

# Make a small change (e.g., update README)
echo "\n<!-- Test webhook -->" >> README.md

# Commit and push
git add .
git commit -m "Test webhook auto-trigger"
git push origin main
```

### 5.2 Verify Jenkins Triggered

1. Go to Jenkins dashboard
2. Within **10-30 seconds**, you should see:
   - New build starting automatically
   - Build triggered by "GitHub push by haseebshaikh03"
3. Click on the build to see console output

---

## 🔍 Troubleshooting

### Problem: Webhook shows "Connection refused"

**Solution:**
```bash
# On Jenkins server, verify it's listening
sudo netstat -tulpn | grep 8080

# If using AWS EC2, check security group
# Must allow: Inbound TCP 8080 from 0.0.0.0/0

# If using firewall, allow port 8080
sudo ufw allow 8080/tcp
```

### Problem: Webhook shows "404 Not Found"

**Solution:**
- URL must be: `http://YOUR_IP:8080/github-webhook/` (note the trailing slash)
- Verify GitHub plugin is installed in Jenkins

### Problem: Webhook delivers but Jenkins doesn't trigger

**Solution:**
1. Check Jenkins logs:
   ```bash
   # On Jenkins server
   sudo tail -f /var/log/jenkins/jenkins.log
   ```
2. Verify "GitHub hook trigger" is enabled in job configuration
3. Ensure Jenkinsfile has `triggers { githubPush() }` block

### Problem: Need to use Jenkins behind NAT/private network

**Solution Option 1 - Use ngrok (for testing):**
```bash
# Download and install ngrok
ngrok http 8080

# Copy the forwarding URL (e.g., https://abc123.ngrok.io)
# Use this in GitHub webhook: https://abc123.ngrok.io/github-webhook/
```

**Solution Option 2 - Poll SCM (fallback):**
If webhook can't reach Jenkins, use polling instead:

Update Jenkinsfile:
```groovy
triggers {
    pollSCM('H/5 * * * *')  // Poll GitHub every 5 minutes
}
```

---

## 📊 Webhook Delivery History

To view webhook activity:

1. Go to GitHub repo → **Settings** → **Webhooks**
2. Click on your webhook
3. Click **Recent Deliveries** tab
4. See all push events and Jenkins responses

**Successful delivery:**
- ✅ Green checkmark
- Response: `200 OK`

**Failed delivery:**
- ❌ Red X
- Click to see error details

---

## 🎯 Expected Workflow

After setup, your workflow is:

```
1. Developer makes code changes locally
2. Developer runs: git push origin main
3. GitHub receives push event
4. GitHub webhook triggers Jenkins (within 10-30 seconds)
5. Jenkins pipeline executes automatically:
   ✅ Stage 1: Code Fetch
   ✅ Stage 2: Build & Test
   ✅ Stage 3: Docker Build
   ✅ Stage 4: Docker Push
   ✅ Stage 5: K8s Deployment
   ✅ Stage 6: Deploy Monitoring
6. Application auto-deploys to Kubernetes
7. Developer verifies at http://NODE_IP:30080
```

**Total time: ~3-5 minutes from push to deployment! 🚀**

---

## 🔐 Security Best Practices

### 1. Use Webhook Secret

For production, secure your webhook:

**In GitHub webhook:**
- Add a secret token (random string)

**In Jenkins:**
1. Install "GitHub Pull Request Builder" plugin
2. Add webhook secret to credentials
3. Configure in GitHub server settings

### 2. Restrict Jenkins Access

```bash
# Use firewall to allow only GitHub IPs
# GitHub webhook IPs: https://api.github.com/meta

# Example for EC2 security group:
# Allow inbound 8080 from GitHub IP ranges only
```

### 3. Use HTTPS

For production Jenkins:
- Set up SSL certificate
- Use `https://jenkins.yourdomain.com/github-webhook/`
- Prevents man-in-the-middle attacks

---

## 📱 Alternative: GitHub Actions → Jenkins

If webhook doesn't work, trigger Jenkins from GitHub Actions:

Create `.github/workflows/trigger-jenkins.yml`:

```yaml
name: Trigger Jenkins
on:
  push:
    branches: [main]

jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Jenkins Job
        run: |
          curl -X POST \
            http://YOUR_JENKINS_IP:8080/job/final_project_devops/build \
            --user ${{ secrets.JENKINS_USER }}:${{ secrets.JENKINS_TOKEN }}
```

---

## ✅ Verification Checklist

- [ ] GitHub plugin installed in Jenkins
- [ ] Personal access token created and added to Jenkins
- [ ] Webhook added to GitHub repository
- [ ] Webhook test shows green checkmark ✅
- [ ] Jenkins job configured with "GitHub hook trigger"
- [ ] Jenkinsfile has `triggers { githubPush() }` block
- [ ] Test push triggers Jenkins build automatically
- [ ] Build completes successfully

---

## 📞 Quick Reference

| Item | Value |
|------|-------|
| **Jenkins Webhook URL** | `http://YOUR_IP:8080/github-webhook/` |
| **GitHub Repo** | `https://github.com/haseebshaikh03/final_project_devops` |
| **Required GitHub Scopes** | `repo`, `admin:repo_hook` |
| **Jenkins Plugin** | GitHub Integration Plugin |
| **Trigger Delay** | 10-30 seconds after push |

---

## 🎓 For Lab Report

### Screenshots to Include:

1. ✅ **GitHub Webhook Configuration**
   - Settings → Webhooks page showing webhook URL
   - Recent deliveries showing successful 200 OK responses

2. ✅ **Jenkins Build Trigger**
   - Jenkins job configuration showing "GitHub hook trigger" enabled
   - Build history showing "Started by GitHub push"

3. ✅ **Automatic Build Execution**
   - Console output showing build triggered by git push
   - All 6 stages completed successfully

4. ✅ **Jenkinsfile Triggers Block**
   - Code snippet showing `triggers { githubPush() }`

---

**🎉 Congratulations! Your CI/CD pipeline is now fully automated!**

Every git push will automatically:
- Build Docker image
- Push to DockerHub
- Deploy to Kubernetes
- Update monitoring stack

**No manual intervention needed!** 🚀
