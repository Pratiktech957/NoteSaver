# 🌐 Proxy Server - Complete Guide

## What is a Proxy?

A Proxy Server is an intermediary that sits between a client and a destination server.

Instead of:

```text
Client → Server
```

Communication becomes:

```text
Client → Proxy → Server
```

The proxy receives the request, processes it, and forwards it to the target server.

---

# Real World Example

Without Proxy:

```text
You → Store
```

With Proxy:

```text
You → Assistant → Store
```

The assistant communicates with the store on your behalf.

---

# Basic Architecture

```text
┌────────┐
│ Client │
└────┬───┘
     │
     ▼
┌────────┐
│ Proxy  │
└────┬───┘
     │
     ▼
┌────────┐
│ Server │
└────────┘
```

---

# Why Use a Proxy?

## 1. Hide Client IP

Without Proxy:

```text
Client IP → Server
```

With Proxy:

```text
Client → Proxy → Server
```

The server sees the Proxy IP instead of the client's IP.

---

## 2. Security

Proxy acts as a protective layer between clients and servers.

```text
Internet
   │
   ▼
 Proxy
   │
   ▼
 Internal Network
```

Benefits:

* Reduces direct exposure
* Filters malicious traffic
* Adds access control

---

## 3. Traffic Filtering

Organizations use proxies to control internet access.

```text
Employee
   │
   ▼
 Proxy
   │
   ├── Allow Google
   └── Block Social Media
```

---

## 4. Caching

Frequently requested data can be stored by the proxy.

```text
Client
   │
   ▼
Proxy Cache
   │
   ▼
Server
```

Benefits:

* Faster responses
* Reduced server load
* Better performance

---

# Hardware Proxy

A dedicated physical device that performs proxy functions.

Examples:

* Cisco Secure Web Appliance
* Blue Coat ProxySG
* Fortinet Proxy
* F5 BIG-IP

Architecture:

```text
Users
  │
  ▼
Hardware Proxy
  │
  ▼
Internet
```

Used in:

* Banks
* Government organizations
* Large enterprises

---

# Software Proxy

A software application installed on a server.

Examples:

* Nginx
* Squid Proxy
* HAProxy
* Apache Proxy

Architecture:

```text
Server
 ├── Application
 └── Proxy Software
```

---

# Types of Proxies

## Forward Proxy

Represents the client.

```text
Client
  │
  ▼
Forward Proxy
  │
  ▼
Internet
```

Purpose:

* Hide client identity
* Filter web access

---

## Reverse Proxy

Represents the server.

```text
Users
  │
  ▼
Reverse Proxy
  │
  ▼
Backend Servers
```

Purpose:

* Load balancing
* Security
* SSL termination
* Caching

Examples:

* Nginx
* Cloudflare
* HAProxy

---

# Vite Proxy

## Problem

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

Different origins can cause CORS issues.

---

## Solution

Use Vite Proxy.

```text
Browser
   │
   ▼
Vite Dev Server
   │
   ▼
Express Server
```

Request Flow:

```text
axios("/api/notes")
       │
       ▼
localhost:5173
       │
       ▼
Vite Proxy
       │
       ▼
localhost:5000/api/notes
```

---

# Vite Configuration

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

---

# Why Use Proxy in Vite?

1. Bypass CORS issues
2. Cleaner API URLs
3. Easier deployment
4. Acts as an intermediary
5. Keeps frontend and backend decoupled

---

# Interview Questions

### What is a Proxy?

A proxy is an intermediary server that receives requests from clients and forwards them to destination servers.

### Difference Between Forward Proxy and Reverse Proxy?

| Forward Proxy     | Reverse Proxy        |
| ----------------- | -------------------- |
| Represents Client | Represents Server    |
| Hides Client IP   | Hides Server Details |
| Client Side       | Server Side          |

### Why Do We Use Vite Proxy?

To forward frontend API requests to the backend during development, avoiding CORS issues and keeping API calls clean.

### Is Vite Proxy Used in Production?

No.

Production systems typically use:

* Nginx
* Cloudflare
* HAProxy
* AWS Load Balancer

---

# Quick Revision

```text
Forward Proxy  → Protects Client
Reverse Proxy  → Protects Server

Vite Proxy     → Development
Nginx Proxy    → Production
```
