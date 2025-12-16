# DevOps Lab Final Project

## Complete CI/CD Pipeline with Jenkins, Docker, Kubernetes, Prometheus & Grafana

---

## 📋 Project Overview

This project implements a **complete DevOps workflow** demonstrating:
- ✅ **Web Application**: Full-stack CRUD task manager with SQLite database
- ✅ **CI/CD Pipeline**: Automated Jenkins pipeline with 4 required stages
- ✅ **Containerization**: Docker for application packaging
- ✅ **Orchestration**: Kubernetes for deployment and scaling
- ✅ **Monitoring**: Prometheus for metrics collection and Grafana for visualization

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
│                  (Source Code + Configs)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ Git Pull
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Jenkins CI/CD Server                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Stage 1: Code Fetch       (Git Checkout)             │   │
│  │ Stage 2: Build & Test     (npm install/test)         │   │
│  │ Stage 3: Docker Build     (Build Image)              │   │
│  │ Stage 4: Push to Registry (DockerHub)                │   │
│  │ Stage 5: K8s Deployment   (Deploy App)               │   │
│  │ Stage 6: Monitoring       (Deploy Prom/Grafana)      │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ kubectl apply
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               Kubernetes Cluster (Minikube/EKS)              │
│                                                               │
│  ┌─────────────────┐  ┌──────────────────┐                  │
│  │   Namespace:    │  │   Namespace:     │                  │
│  │    default      │  │   monitoring     │                  │
│  ├─────────────────┤  ├──────────────────┤                  │
│  │ • Web App Pods  │  │ • Prometheus     │                  │
│  │ • Service       │  │ • Grafana        │                  │
│  │ • PVC (Storage) │  │                  │                  │
│  └─────────────────┘  └──────────────────┘                  │
│                                                               │
│  Exposes:                                                     │
│  • App: http://NodeIP:30080                                 │
│  • Prometheus: http://NodeIP:30090                          │
│  • Grafana: http://NodeIP:30300                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
final_project_repo/
├── app/                          # Node.js Application Source
│   ├── server.js                 # Express server with API routes
│   ├── package.json              # Dependencies & scripts
│   ├── public/
│   │   └── index.html           # Frontend UI
│   └── data/                     # SQLite database directory (created at runtime)
│
├── k8s/                          # Kubernetes Manifests
│   ├── pvc.yaml                  # PersistentVolumeClaim (1Gi storage)
│   ├── deployment.yaml           # App deployment (2 replicas)
│   └── service.yaml              # NodePort service (port 30080)
│
├── monitoring/                   # Monitoring Stack
│   ├── prometheus.yaml           # Prometheus deployment + config
│   └── grafana.yaml              # Grafana deployment + datasource
│
├── Dockerfile                    # Multi-stage Docker build
├── Jenkinsfile                   # CI/CD pipeline definition
└── README.md                     # This file
```

---

## 🚀 Application Details

### Technology Stack

- **Backend**: Node.js 20 + Express.js
- **Database**: SQLite3 (file-based, persistent storage)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Metrics**: Prometheus client for Node.js
- **Container**: Docker (Alpine-based for minimal size)

### Features

1. **CRUD Operations**: Create, Read, Update, Delete tasks
2. **Database Persistence**: All data stored in SQLite (`/data/tasks.db`)
3. **Health Checks**: `/health` endpoint for liveness/readiness probes
4. **Metrics Endpoint**: `/metrics` for Prometheus scraping
5. **Responsive UI**: Modern, gradient-based design

### API Endpoints

| Method | Endpoint          | Description                |
|--------|-------------------|----------------------------|
| GET    | `/`               | Serve web UI               |
| GET    | `/health`         | Health check               |
| GET    | `/metrics`        | Prometheus metrics         |
| GET    | `/api/tasks`      | Get all tasks              |
| GET    | `/api/tasks/:id`  | Get task by ID             |
| POST   | `/api/tasks`      | Create new task            |
| PUT    | `/api/tasks/:id`  | Update task                |
| DELETE | `/api/tasks/:id`  | Delete task                |

---

## 🔧 Prerequisites

### On Your Development Machine
- Git
- Docker
- kubectl
- Node.js 20+ (for local testing)

### On Jenkins Server (AWS EC2)
- Jenkins installed and running
- Docker installed
- kubectl configured
- Required plugins:
  - Git Plugin
  - Docker Pipeline Plugin
  - Kubernetes CLI Plugin
  - Credentials Binding Plugin

### Kubernetes Cluster
- Minikube (local) OR
- AWS EKS/GKE/AKS (cloud)
- `kubectl` access configured

---

## 📦 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/haseebshaikh03/final_project_devops.git
cd final_project_devops
```

### 2. Local Testing (Optional)

```bash
# Install dependencies
cd app
npm install

# Run locally
npm start

# Access at http://localhost:3000
```

### 3. Build Docker Image Locally (Optional)

```bash
# Build image
docker build -t sample-webapp:local .

# Run container
docker run -d -p 3000:3000 --name task-app sample-webapp:local

# Access at http://localhost:3000
# View logs: docker logs -f task-app
# Stop: docker stop task-app && docker rm task-app
```

---

## ⚙️ Jenkins Configuration

### Step 1: Add Jenkins Credentials

Add two credentials in Jenkins (`Manage Jenkins` → `Credentials`):

#### a) DockerHub Credentials
- **Kind**: Username with password
- **ID**: `dockerhub-creds`
- **Username**: Your DockerHub username
- **Password**: Your DockerHub password/token

#### b) Kubernetes Config
- **Kind**: Secret file
- **ID**: `kubeconfig`
- **File**: Upload your `~/.kube/config` file

### Step 2: Create Jenkins Pipeline Job

1. Go to Jenkins → **New Item**
2. Enter name: `DevOps-Lab-Final`
3. Select **Pipeline** → Click **OK**
4. Under **Pipeline** section:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/haseebshaikh03/final_project_devops.git`
   - **Branch**: `*/main`
   - **Script Path**: `Jenkinsfile`
5. Click **Save**

### Step 3: Run the Pipeline

1. Click **Build Now**
2. Monitor the pipeline execution in **Console Output**
3. All 6 stages should complete successfully

---

## 🎯 Pipeline Stages Explained

### Stage 1: Code Fetch Stage ✅
**Lab Requirement**: Fetch code from GitHub repository

```groovy
// Clones the GitHub repository
checkout scm
```

**Verification**: Check console output for successful git clone

---

### Stage 2: Build & Test ✅
**Purpose**: Validate application before containerization

```bash
npm install  # Install dependencies
npm test     # Run tests
```

**Verification**: Dependencies installed, tests pass (or graceful skip)

---

### Stage 3: Docker Image Creation Stage ✅
**Lab Requirement**: Build Docker container image

```bash
docker build -t IMAGE_NAME:TAG .
docker tag IMAGE_NAME:TAG IMAGE_NAME:latest
```

**Verification**: Check for two tags in `docker images`

---

### Stage 4: Push to DockerHub ✅
**Purpose**: Upload image to container registry

```bash
docker login -u USER -p PASS
docker push IMAGE_NAME:TAG
docker push IMAGE_NAME:latest
```

**Verification**: Images visible on DockerHub

---

### Stage 5: Kubernetes Deployment Stage ✅
**Lab Requirement**: Deploy app with PVC, Deployment, Service

```bash
kubectl apply -f k8s/pvc.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

**Verification**: 
- Pods running: `kubectl get pods`
- Service created: `kubectl get svc`
- PVC bound: `kubectl get pvc`

---

### Stage 6: Prometheus / Grafana Stage ✅
**Lab Requirement**: Deploy monitoring stack

```bash
kubectl apply -f monitoring/prometheus.yaml -n monitoring
kubectl apply -f monitoring/grafana.yaml -n monitoring
```

**Verification**:
- Prometheus pod running in `monitoring` namespace
- Grafana pod running in `monitoring` namespace
- Services exposed on NodePorts 30090 and 30300

---

## 🔍 Verification & Testing

### 1. Check Kubernetes Resources

```bash
# Check all resources in default namespace
kubectl get all

# Check PVC
kubectl get pvc

# Check monitoring namespace
kubectl get all -n monitoring

# Describe deployment
kubectl describe deployment sample-webapp-deployment

# Check pod logs
kubectl logs -l app=sample-webapp
```

### 2. Access the Application

Get your Node IP:
```bash
# For Minikube
minikube ip

# For cloud (EKS/GKE/AKS)
kubectl get nodes -o wide
```

Access URLs:
- **Application**: `http://<NODE_IP>:30080`
- **Prometheus**: `http://<NODE_IP>:30090`
- **Grafana**: `http://<NODE_IP>:30300` (admin/admin)

### 3. Test Application Functionality

1. Open the web UI
2. Create a new task (e.g., "Complete DevOps Lab")
3. Mark task as complete
4. Delete task
5. Refresh page - data should persist (stored in SQLite)

### 4. Verify Prometheus Scraping

1. Open Prometheus UI: `http://<NODE_IP>:30090`
2. Go to **Status** → **Targets**
3. Verify `sample-webapp` target is **UP**
4. Query example: `http_request_duration_seconds_count`

### 5. Configure Grafana Dashboard

1. Open Grafana: `http://<NODE_IP>:30300`
2. Login: `admin` / `admin`
3. Data source should auto-configure (Prometheus)
4. Create new dashboard:
   - Add panel
   - Query: `rate(http_request_duration_seconds_count[5m])`
   - Visualize request rate over time

---

## 📊 Monitoring Metrics Available

The application exposes these Prometheus metrics at `/metrics`:

### Default Node.js Metrics
- `process_cpu_user_seconds_total`
- `process_resident_memory_bytes`
- `nodejs_eventloop_lag_seconds`
- `nodejs_heap_size_total_bytes`

### Custom Application Metrics
- `http_request_duration_seconds` - HTTP request latency
- `tasks_total` - Counter for created tasks

### Example Prometheus Queries

```promql
# Request rate
rate(http_request_duration_seconds_count[5m])

# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Total tasks created
tasks_total

# Memory usage
process_resident_memory_bytes
```

---

## 🐛 Troubleshooting

### Pipeline Fails at Docker Build

**Issue**: Docker daemon not accessible
```bash
# On Jenkins server
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Pipeline Fails at Kubernetes Stage

**Issue**: Invalid kubeconfig
```bash
# Verify kubectl works on Jenkins server
kubectl cluster-info
kubectl get nodes

# Check credentials are correctly uploaded in Jenkins
```

### Pods in CrashLoopBackOff

**Issue**: Application fails to start
```bash
# Check pod logs
kubectl logs <pod-name>

# Check pod events
kubectl describe pod <pod-name>

# Common fixes:
# 1. Ensure image was pushed to DockerHub
# 2. Check PVC is bound
# 3. Verify resource limits
```

### Cannot Access Application

**Issue**: Service not reachable
```bash
# Verify service
kubectl get svc sample-webapp-service

# Check if pods are running
kubectl get pods -l app=sample-webapp

# For Minikube
minikube service sample-webapp-service --url

# Check firewall rules allow port 30080
```

### Prometheus Not Scraping

**Issue**: Targets showing as DOWN
```bash
# Verify app is exposing metrics
kubectl exec -it <pod-name> -- wget -O- http://localhost:3000/metrics

# Check Prometheus config
kubectl get configmap prometheus-config -n monitoring -o yaml

# Restart Prometheus
kubectl delete pod -l app=prometheus -n monitoring
```

---

## 📝 Lab Report Submission Checklist

### Required Files ✅

- [x] **Jenkinsfile** - [final_project_repo/Jenkinsfile](final_project_repo/Jenkinsfile)
- [x] **Dockerfile** - [final_project_repo/Dockerfile](final_project_repo/Dockerfile)
- [x] **deployment.yaml** - [final_project_repo/k8s/deployment.yaml](final_project_repo/k8s/deployment.yaml)
- [x] **service.yaml** - [final_project_repo/k8s/service.yaml](final_project_repo/k8s/service.yaml)
- [x] **pvc.yaml** - [final_project_repo/k8s/pvc.yaml](final_project_repo/k8s/pvc.yaml)
- [x] **prometheus.yaml** - [final_project_repo/monitoring/prometheus.yaml](final_project_repo/monitoring/prometheus.yaml)
- [x] **grafana.yaml** - [final_project_repo/monitoring/grafana.yaml](final_project_repo/monitoring/grafana.yaml)

### Screenshots to Include

1. ✅ **GitHub Repository** - Show complete repo structure
2. ✅ **Jenkins Pipeline** - All 6 stages passed (green)
3. ✅ **Docker Images** - DockerHub showing pushed images
4. ✅ **Kubernetes Pods** - `kubectl get pods` output
5. ✅ **Kubernetes Services** - `kubectl get svc` output
6. ✅ **Application UI** - Running web app with tasks
7. ✅ **Prometheus Targets** - Showing webapp target UP
8. ✅ **Grafana Dashboard** - Metrics visualization

### Documentation Sections

1. **Introduction**: Project overview and objectives
2. **Architecture**: System design and components
3. **Implementation Steps**: 
   - Jenkins setup
   - Pipeline configuration
   - Kubernetes deployment
4. **Testing & Verification**: Screenshots with explanations
5. **Monitoring**: Prometheus and Grafana configuration
6. **Challenges**: Issues faced and solutions
7. **Conclusion**: Learning outcomes

---

## 🎓 Learning Outcomes

By completing this project, you have demonstrated:

✅ **CI/CD Automation**: End-to-end pipeline from code to deployment
✅ **Containerization**: Docker best practices and multi-stage builds  
✅ **Orchestration**: Kubernetes deployments, services, and storage
✅ **Infrastructure as Code**: Declarative YAML configurations
✅ **Monitoring**: Metrics collection and visualization
✅ **Full-Stack Development**: Complete web application with database
✅ **DevOps Practices**: Automation, reproducibility, observability

---

## 📚 References & Resources

### Official Documentation
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

### Tutorials
- [Jenkins Pipeline Tutorial](https://www.jenkins.io/doc/book/pipeline/)
- [Kubernetes by Example](https://kubernetesbyexample.com/)
- [Prometheus Getting Started](https://prometheus.io/docs/prometheus/latest/getting_started/)

---

## 👥 Author

**DevOps Lab Student**  
Course: DevOps Engineering  
Institution: COMSATS University Islamabad

---

## 📄 License

This project is created for educational purposes as part of a DevOps lab course.

---

## 🙋 Support

For questions or issues:
1. Check the Troubleshooting section above
2. Review Jenkins console output for errors
3. Check Kubernetes pod logs: `kubectl logs <pod-name>`
4. Verify all prerequisites are met

---

## ✨ Next Steps & Improvements

After completing the basic lab, consider:

- [ ] Add **Jenkins webhooks** for automatic builds on git push
- [ ] Implement **Helm charts** for easier Kubernetes deployments
- [ ] Add **Ingress controller** for better routing
- [ ] Set up **persistent volumes** with cloud storage (EBS, etc.)
- [ ] Configure **horizontal pod autoscaling** (HPA)
- [ ] Add **security scanning** (Trivy, Snyk) to pipeline
- [ ] Implement **blue-green** or **canary deployments**
- [ ] Add **Slack/email notifications** for pipeline status
- [ ] Create **custom Grafana dashboards** with alerts
- [ ] Add **integration tests** to the pipeline

---

**🎉 Congratulations on completing your DevOps Lab Final Project! 🎉**
# Webhook test
