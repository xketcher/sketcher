# Simple TUN-over-UDP VPN (Android client + Go server)

Overview
--------
This repository contains:
- Android Studio app (Kotlin) that uses VpnService + a TUN -> UDP forwarder.
- A minimal Go server that creates a TUN device and forwards between that TUN and the UDP socket.

WARNING: This example is intended for learning and testing. It lacks authentication, encryption, DoS protection, and multi-client logic. Do NOT use this in production without adding encryption and authentication.

Server quick start
------------------
1. Install Go, then:
   go get github.com/songgao/water

2. Build the server:
   go build -o tunudp_server server/main.go

3. Run as root:
   sudo ./tunudp_server -tun-ip 10.0.0.1/24 -listen :51820

4. Enable IP forwarding / NAT:
   sudo sysctl -w net.ipv4.ip_forward=1
   sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

Client (Android) quick start
----------------------------
1. Open android-app/ in Android Studio.
2. Build & run on device. Enter server_ip:51820 and Connect.
3. Allow VPN permission when prompted.
