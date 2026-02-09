# ⚖️ Load Balancer

A lightweight, production-ready **HTTP/HTTPS Load Balancer** built using **Bun** and **TypeScript**. This project was developed step-by-step as a systems-level learning exercise, covering everything from request routing to health checks, retries, SSL termination, Dockerization, and end-to-end testing.

---

## 🚀 How to Run

### 1️⃣ Install Dependencies

Make sure you have **Bun** installed.

```bash
bun install
```

### 2️⃣ Start Backend Servers (Example)

```bash
bun run src/mock-backend.ts
```

(Or run your own backend services on the configured ports.)

### 3️⃣ Run the Load Balancer

```bash
bun run src/index.ts
```

The load balancer will start on:

```
http://localhost:7000
```

---

## 🔐 Run with HTTPS (Optional)

Generate self‑signed certificates:

```bash
openssl req -nodes -new -x509 \
  -keyout key.pem \
  -out cert.pem \
  -days 365 \
  -subj "/CN=localhost"
```

Enable SSL in `config.json`:

```json
{
  "ssl": {
    "enabled": true,
    "key_path": "./key.pem",
    "cert_path": "./cert.pem"
  }
}
```

Now access via:

```
https://localhost:7000
```

---

## 🐳 Run with Docker

### Build Image

```bash
docker build -t bun-lb .
```

### Run Container

```bash
docker run -p 7000:7000 bun-lb
```

---

## 🧪 End-to-End Test

Runs a full system test with mock backends, traffic distribution, and failure handling.

```bash
bun test/e2e.ts
```

---

## ✨ Features Implemented

### ⚙️ Core

- Round‑Robin Load Balancing
- HTTP Proxying
- Config‑driven architecture

### ❤️ Health Management

- Passive health checks (mark unhealthy on failure)
- Active health checks (periodic ping)
- Automatic removal & recovery of unhealthy servers

### 🔁 Reliability

- Retry logic on backend failure
- Zero‑downtime request handling

### 🔐 Security

- HTTPS termination (SSL/TLS)
- Optional HTTP → HTTPS support

### 🐳 DevOps

- Fully Dockerized
- Lightweight `oven/bun:alpine` image

### 🧪 Testing

- End‑to‑End traffic distribution testing
- Failure simulation & recovery validation

---

## 🏁 Why This Project Matters

This project demonstrates **real backend engineering skills**:

- Networking fundamentals
- Distributed system reliability
- Production‑style configuration
- Observability through logs

Perfect as:

- A systems‑design learning project
- A portfolio‑ready backend showcase
- A base for building API gateways or service meshes

---

🔥 Built with curiosity, Bun, and clean engineering principles.
