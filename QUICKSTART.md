# 🚀 Quick Start Guide

## Get Your DevOps Lab Running in 5 Minutes!

---

## Prerequisites Check

```bash
# Verify you have these tools installed
git --version
docker --version
kubectl version --client
node --version  # Optional for local testing
```

---

## Step 1: Clone Repository (30 seconds)

```bash
git clone https://github.com/haseebshaikh03/final_project_devops.git
cd final_project_devops
```

---

## Step 2: Test Locally (Optional - 2 minutes)

```bash
cd app
npm install
npm start
```

Open browser: http://localhost:3000

**Press Ctrl+C to stop**

---

## Step 3: Configure Jenkins (2 minutes)

### A. Add DockerHub Credentials

1. Jenkins → Manage Jenkins → Credentials
2. Add → Username with password
   - ID: `dockerhub-creds`
   - Username: [your dockerhub username]
   - Password: [your dockerhub password]

### B. Add Kubernetes Config

1. Jenkins → Manage Jenkins → Credentials
2. Add → Secret file
   - ID: `kubeconfig`
   - File: Upload your `~/.kube/config`

---

## Step 4: Create & Run Pipeline (1 minute)

1. Jenkins → New Item
2. Name: `DevOps-Lab-Final`
3. Type: **Pipeline**
4. Pipeline Definition: **Pipeline script from SCM**
5. SCM: **Git**
6. Repository URL: `https://github.com/haseebshaikh03/final_project_devops.git`
7. Branch: `*/main`
8. Script Path: `Jenkinsfile`
9. **Save** → **Build Now**

---

## Step 5: Access Your Deployment (30 seconds)

### Get Node IP:

```bash
# For Minikube
minikube ip

# For Cloud Kubernetes
kubectl get nodes -o wide
```

### Access URLs:

```
Application:  http://<NODE_IP>:30080
Prometheus:   http://<NODE_IP>:30090
Grafana:      http://<NODE_IP>:30300 (admin/admin)
```

---

## Verification Commands

```bash
# Check if everything is running
kubectl get all
kubectl get all -n monitoring

# Check application logs
kubectl logs -l app=sample-webapp

# Check if database is persisting
kubectl exec -it <pod-name> -- ls -la /usr/src/app/data
```

---

## Common Issues & Fixes

### Issue: "Cannot connect to Docker daemon"
```bash
sudo usermod -aG docker $USER
sudo systemctl restart docker
# Log out and log back in
```

### Issue: "Pods in CrashLoopBackOff"
```bash
kubectl logs <pod-name>
kubectl describe pod <pod-name>
```

### Issue: "Cannot access application"
```bash
# Check firewall
sudo ufw allow 30080/tcp
sudo ufw allow 30090/tcp
sudo ufw allow 30300/tcp
```

---

## Next Steps

1. ✅ Create tasks in the web UI
2. ✅ View metrics in Prometheus
3. ✅ Create dashboard in Grafana
4. ✅ Take screenshots for your report

---

## Support

See [README.md](README.md) for detailed documentation.

**Good luck with your lab! 🎉**
