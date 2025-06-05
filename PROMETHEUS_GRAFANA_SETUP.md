# 📈 Monitoring with Prometheus and Grafana

This guide explains how to run Prometheus and Grafana alongside the MCP Project Manager during development.

## Requirements

- Docker and Docker Compose installed
- Backend running with the `/metrics` endpoint enabled

## Quick Start

1. Create a `docker-compose.yml` file with the following content:

   ```yaml
   version: '3'
   services:
     prometheus:
       image: prom/prometheus
       volumes:
         - ./prometheus.yml:/etc/prometheus/prometheus.yml
       ports:
         - '9090:9090'
     grafana:
       image: grafana/grafana
       ports:
         - '3001:3000'
   ```

2. Create `prometheus.yml` next to the compose file:

   ```yaml
   global:
     scrape_interval: 15s
   scrape_configs:
     - job_name: 'mcp-backend'
       static_configs:
         - targets: ['host.docker.internal:8000']
   ```

3. Start the services:

   ```bash
   docker compose up -d
   ```

4. Access Prometheus at [http://localhost:9090](http://localhost:9090) and Grafana at [http://localhost:3001](http://localhost:3001).
   Add Prometheus as a data source in Grafana and import dashboards as needed.

With the backend running, Prometheus will scrape metrics from `http://localhost:8000/metrics` and Grafana can visualize request and error rates.
