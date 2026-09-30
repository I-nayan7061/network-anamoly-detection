"""
Simple Machine Learning Pipeline for Network Anomaly Detection.
Uses K-Means and DBSCAN (Unsupervised Learning).
Easy to read and easy to explain.
"""

import numpy as np
from sklearn.cluster import DBSCAN, KMeans
from sklearn.preprocessing import StandardScaler

class SimpleAnomalyDetector:
    def __init__(self):
        # 1. Scaler to normalize numbers
        self.scaler = StandardScaler()
        
        # 2. K-Means: Groups normal traffic into 2 clusters
        self.kmeans = KMeans(n_clusters=2, random_state=42, n_init=10)
        
        # 3. DBSCAN: Flags isolated points as noise (-1)
        self.dbscan = DBSCAN(eps=1.5, min_samples=3)
        
        # Distance threshold for K-Means (calculated during training)
        self.kmeans_threshold = 2.5
        
        # Scaled baseline points for DBSCAN density evaluation
        self.baseline_scaled = None
        
        # List of recent network packets (maximum 100 packets)
        self.history = []
        
        # Train on normal traffic right away
        self.train_normal_baseline()

    def train_normal_baseline(self):
        """
        Creates a simple baseline of normal web browsing traffic.
        Features used: [duration (sec), src_bytes, dst_bytes, count]
        """
        np.random.seed(42)
        
        # 150 normal web browsing packets
        durations = np.random.uniform(0.1, 2.0, 150)
        src_bytes = np.random.uniform(100, 1500, 150)
        dst_bytes = np.random.uniform(500, 10000, 150)
        counts = np.random.uniform(1, 10, 150)
        
        baseline_data = np.column_stack([durations, src_bytes, dst_bytes, counts])
        
        # Fit scaler and K-Means
        scaled_data = self.scaler.fit_transform(baseline_data)
        self.kmeans.fit(scaled_data)
        self.baseline_scaled = scaled_data[:50]
        
        # Find maximum normal distance to cluster center
        distances = []
        for i, point in enumerate(scaled_data):
            center = self.kmeans.cluster_centers_[self.kmeans.labels_[i]]
            distances.append(np.linalg.norm(point - center))
        
        # Any distance higher than 95% of normal packets is considered an anomaly
        self.kmeans_threshold = float(np.percentile(distances, 95))
        
        # Add a few initial points to history so graphs aren't empty
        self.history = []
        for i in range(25):
            c_id = int(self.kmeans.labels_[i])
            c_center = self.kmeans.cluster_centers_[c_id]
            dist = float(np.linalg.norm(scaled_data[i] - c_center))
            self.history.append({
                "id": f"PKT-{i+1:03d}",
                "type": "Normal Traffic",
                "x": round(float(scaled_data[i][1]), 2),  # src_bytes (scaled)
                "y": round(float(scaled_data[i][2]), 2),  # dst_bytes (scaled)
                "cluster": c_id,
                "distance": round(dist, 2),
                "kmeans_result": "Normal",
                "kmeans_outlier": False,
                "dbscan_label": 0,
                "dbscan_result": "Normal Cluster",
                "dbscan_noise": False,
                "is_anomaly": False
            })

    def analyze_packet(self, pkt_id, pkt_type, duration, src_bytes, dst_bytes, count):
        """
        Analyzes 1 incoming packet with both K-Means and DBSCAN.
        """
        raw_features = np.array([[duration, src_bytes, dst_bytes, count]])
        scaled = self.scaler.transform(raw_features)
        
        # --- 1. K-MEANS CHECK ---
        cluster_id = int(self.kmeans.predict(scaled)[0])
        center = self.kmeans.cluster_centers_[cluster_id]
        dist = float(np.linalg.norm(scaled[0] - center))
        
        # If distance is greater than normal threshold, it's an outlier
        km_is_outlier = bool(dist > self.kmeans_threshold)
        
        # --- 2. DBSCAN CHECK ---
        # Add point to baseline in full 4D feature space
        all_points = np.vstack([self.baseline_scaled, scaled])
        db_labels = self.dbscan.fit_predict(all_points)
        latest_label = int(db_labels[-1])
        db_is_noise = bool(latest_label == -1)
        
        # --- FINAL VERDICT ---
        # Flagged if K-Means or DBSCAN marks it as an anomaly
        is_threat = bool(km_is_outlier or db_is_noise)
        
        result = {
            "id": pkt_id,
            "type": pkt_type,
            "x": round(float(scaled[0][1]), 2),  # for 2D chart
            "y": round(float(scaled[0][2]), 2),  # for 2D chart
            "cluster": cluster_id,
            "distance": round(dist, 2),
            "kmeans_result": "Outlier" if km_is_outlier else "Normal",
            "kmeans_outlier": km_is_outlier,
            "dbscan_label": latest_label,
            "dbscan_result": "Noise (-1)" if db_is_noise else "Cluster",
            "dbscan_noise": db_is_noise,
            "is_anomaly": is_threat
        }
        
        # Save to history (keep max 100)
        self.history.append(result)
        if len(self.history) > 100:
            self.history.pop(0)
            
        return result

    def get_stats(self):
        """Returns detailed stats for overview, K-Means, and DBSCAN dashboards."""
        total = len(self.history)
        anomalies = sum(1 for p in self.history if p["is_anomaly"])
        normal = total - anomalies

        km_outliers = sum(1 for p in self.history if p.get("kmeans_outlier", p.get("kmeans_result") == "Outlier"))
        km_normal = total - km_outliers
        
        db_noise = sum(1 for p in self.history if p.get("dbscan_noise", p.get("dbscan_result") == "Noise (-1)"))
        db_cluster = total - db_noise

        both_threat = sum(1 for p in self.history if (p.get("kmeans_outlier") and p.get("dbscan_noise")))
        both_normal = sum(1 for p in self.history if (not p.get("kmeans_outlier") and not p.get("dbscan_noise")))
        km_only = sum(1 for p in self.history if (p.get("kmeans_outlier") and not p.get("dbscan_noise")))
        db_only = sum(1 for p in self.history if (not p.get("kmeans_outlier") and p.get("dbscan_noise")))

        centers = [
            {"cluster": i, "x": round(float(c[1]), 2), "y": round(float(c[2]), 2)}
            for i, c in enumerate(self.kmeans.cluster_centers_)
        ]

        return {
            "total": total,
            "normal": normal,
            "anomalies": anomalies,
            "kmeans": {
                "normal": km_normal,
                "outliers": km_outliers,
                "threshold": round(self.kmeans_threshold, 2),
                "centers": centers,
                "k": 2
            },
            "dbscan": {
                "clusters": db_cluster,
                "noise": db_noise,
                "eps": 1.5,
                "min_samples": 3
            },
            "comparison": {
                "both_safe": both_normal,
                "both_anomaly": both_threat,
                "kmeans_only": km_only,
                "dbscan_only": db_only
            },
            "history": self.history
        }

    def reset(self):
        """Clears packet history."""
        self.train_normal_baseline()


# Global detector instance
detector = SimpleAnomalyDetector()
