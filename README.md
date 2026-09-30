# NETWORK ANOMALY Detection (Simple & Easy)

A simple, beginner-friendly **Network Anomaly Detection** project using **K-Means** and **DBSCAN** (Unsupervised Machine Learning). 

Designed to be **effortless to understand, easy to explain in class, and ready to deploy to Render with 1 click**.

---

## 💡 How It Works (Explained in 30 Seconds)

1. **Unsupervised ML:** No pre-labeled dataset needed! The model learns what normal web traffic looks like and detects anything that deviates.
2. **K-Means:** Finds the center of normal web traffic. If a new packet is too far from the center, it's flagged as an **Outlier**.
3. **DBSCAN:** Looks for clusters. If an attack comes in (like a Port Scan), it lands in an empty space with no neighbors, so DBSCAN flags it as **Noise (-1)**.
4. **4 Simple Network Features:**
   * `duration`: How long the connection lasted.
   * `src_bytes`: Bytes sent out.
   * `dst_bytes`: Bytes received.
   * `count`: Number of connections made.

---

## 📁 Simple Project Structure

```text
├── app/
│   ├── ml_pipeline.py       # Simple K-Means & DBSCAN detection logic (~100 lines)
│   ├── traffic_simulator.py # Generates normal packets & attacks (~40 lines)
│   ├── api.py               # Simple FastAPI backend server (~50 lines)
│   └── static/
│       ├── index.html       # Clean HTML dashboard with 3 cards & 1 chart
│       └── app.js           # Simple JavaScript connecting frontend to backend
├── cli_demo.py              # Live colored terminal monitor (~45 lines)
├── render.yaml              # 1-Click Render Cloud deployment file
├── requirements.txt         # Required libraries
└── tests/
    └── test_system.py       # Fast automated tests
```

---

## 🚀 How to Run

### 1. Run the Web Dashboard
```powershell
python -m uvicorn app.api:app --reload --host 127.0.0.1 --port 8000
```
Open your browser at: **`http://localhost:8000`**

### 2. Run the Live Terminal Monitor
```powershell
python cli_demo.py
```

### 3. Run Automated Tests
```powershell
python -m pytest tests/test_system.py -v
```

---

## 🎓 How to Demonstrate in Class

1. Open **`http://localhost:8000`** on the projector.
2. Point to the **3 top cards** (Total Packets, Normal Traffic, Anomalies).
3. Click **"🔴 Simulate SYN Flood Attack"**:
   * Watch the Anomaly counter increase!
   * Watch a red cross appear far outside the green cluster on the chart!
   * Explain: *"K-Means calculated that the distance to the center was too large, and DBSCAN isolated it as noise."*
4. Run `python cli_demo.py` in your terminal to show colored live packet logs streaming in real time.
