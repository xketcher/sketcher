Simple TUN <-> UDP server (Go)
------------------------------

This server creates a TUN device (tun0), assigns an IP, and forwards packets between the TUN device and a client UDP socket.

Build:
  go get github.com/songgao/water
  go build -o tunudp_server main.go

Run:
  sudo ./tunudp_server -tun-ip 10.0.0.1/24 -listen :51820

Enable IP forwarding and NAT:
  sudo sysctl -w net.ipv4.ip_forward=1
  sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
