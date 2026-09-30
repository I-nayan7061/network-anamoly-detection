"""
Simple Terminal Monitor for Network Anomaly Detection.
Runs in your terminal with colored text (Green = Normal, Red = Attack).
"""

import time
import random
from app.ml_pipeline import detector
from app.traffic_simulator import create_packet

# Simple Colors
GREEN = "\033[92m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"

print("\n" + "=" * 65)
print("   NETWORK ANOMALY DETECTION - LIVE TERMINAL")
print("   Using K-Means & DBSCAN (Unsupervised ML)")
print("=" * 65 + "\n")
print(f"{'PACKET ID':<12} | {'TYPE':<22} | {'RESULT'}")
print("-" * 65)

traffic_types = ["normal", "normal", "normal", "syn_flood", "port_scan"]

try:
    for i in range(15):
        # Pick normal traffic or attack
        mode = random.choice(traffic_types)
        pkt = create_packet(mode)
        
        # Run ML model
        result = detector.analyze_packet(
            pkt_id=pkt["id"],
            pkt_type=pkt["type"],
            duration=pkt["duration"],
            src_bytes=pkt["src_bytes"],
            dst_bytes=pkt["dst_bytes"],
            count=pkt["count"]
        )
        
        # Color output
        if result["is_anomaly"]:
            status = f"{RED}{BOLD}[ATTACK DETECTED - {result['kmeans_result']} / {result['dbscan_result']}]{RESET}"
        else:
            status = f"{GREEN}[SAFE - Normal Traffic]{RESET}"
            
        print(f"{result['id']:<12} | {result['type']:<22} | {status}", flush=True)
        time.sleep(0.5)

except KeyboardInterrupt:
    pass

print("-" * 65)
stats = detector.get_stats()
print(f"Total: {stats['total']} | Normal: {stats['normal']} | Anomalies: {stats['anomalies']}")
print("Done!\n")
