# � Typesense Monitoring Dashboard

A powerful web-based monitoring dashboard for Typesense search engine instances. Monitor your collections in real-time, track collection performance, and get live statistics about your Typesense container resources.

## 🚀 Features

- **Collection Monitoring** - Monitor all your Typesense collections in one unified dashboard
- **Real-time Statistics** - Track live performance metrics and collection statistics
- **Instance Resources Monitoring** - Monitor CPU, memory, and other container resource usage of your Typesense instance
- **Interactive Dashboard** - Beautiful and intuitive UI for easy navigation and monitoring
- **Docker Support** - Available as a Docker image on Docker Hub for easy deployment

## 🧰 Tech Stack

- Go 1.21+ (Backend)
- RESTful API Architecture
- Docker & Docker Hub Distribution

## 📦 Installation

### Using Docker (Recommended)

Pull the image from Docker Hub:

```bash
docker pull your-username/typesense-monitoring-dashboard:latest

docker run -d \
  -p 8080:8080 \
  -e TYPESENSE_HOST=your-typesense-host \
  -e TYPESENSE_PORT=8108 \
  -e TYPESENSE_API_KEY=your-api-key \
  --name typesense-dashboard \
  your-username/typesense-monitoring-dashboard:latest
```

### From Source

```bash
# Clone the repo
git clone https://github.com/your-username/typesense-monitoring-dashboard.git
cd typesense-monitoring-dashboard

# Build and run
go build -o dashboard .
./dashboard
```

## 📊 What You Can Monitor

- Collection statistics and metrics
- Document counts and storage usage
- Search performance and query metrics
- Container resource utilization (CPU, Memory, Disk)
- Real-time instance health status
- Index statistics and optimization metrics

## 🐳 Docker Hub

This project is available as a Docker image on Docker Hub, making it easy to deploy and run in any containerized environment.
