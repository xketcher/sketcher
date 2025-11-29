package main

import (
    "flag"
    "fmt"
    "github.com/songgao/water"
    "io"
    "log"
    "net"
    "os/exec"
    "strings"
    "time"
)

func setupTun(tunIP string) (*water.Interface, error) {
    ifce, err := water.New(water.Config{
        DeviceType: water.TUN,
    })
    if err != nil {
        return nil, err
    }
    name := ifce.Name()
    parts := strings.Split(tunIP, "/")
    ip := parts[0]
    cidr := parts[1]
    cmd := exec.Command("ip", "addr", "add", fmt.Sprintf("%s/%s", ip, cidr), "dev", name)
    if out, err := cmd.CombinedOutput(); err != nil {
        log.Printf("ip addr add failed: %s %v", string(out), err)
    }
    cmd = exec.Command("ip", "link", "set", "dev", name, "up")
    if out, err := cmd.CombinedOutput(); err != nil {
        log.Printf("ip link set up failed: %s %v", string(out), err)
    }
    return ifce, nil
}

func main() {
    var tunIP string
    var listen string
    flag.StringVar(&tunIP, "tun-ip", "10.0.0.1/24", "IP for server TUN (e.g. 10.0.0.1/24)")
    flag.StringVar(&listen, "listen", ":51820", "UDP listen address")
    flag.Parse()

    ifce, err := setupTun(tunIP)
    if err != nil {
        log.Fatalf("Failed to setup TUN: %v", err)
    }
    defer ifce.Close()
    log.Printf("TUN interface %s ready", ifce.Name())

    pc, err := net.ListenPacket("udp", listen)
    if err != nil {
        log.Fatalf("Failed to listen on UDP %s: %v", listen, err)
    }
    defer pc.Close()
    log.Printf("Listening on UDP %s", listen)

    var clientAddr net.Addr

    go func() {
        buf := make([]byte, 65535)
        for {
            n, addr, err := pc.ReadFrom(buf)
            if err != nil {
                log.Printf("UDP read error: %v", err)
                return
            }
            clientAddr = addr
            packet := make([]byte, n)
            copy(packet, buf[:n])
            _, err = ifce.Write(packet)
            if err != nil {
                log.Printf("Write to TUN failed: %v", err)
            }
        }
    }()

    go func() {
        buf := make([]byte, 65535)
        for {
            n, err := ifce.Read(buf)
            if err != nil {
                if err == io.EOF {
                    return
                }
                log.Printf("TUN read error: %v", err)
                return
            }
            if clientAddr != nil {
                _, err := pc.WriteTo(buf[:n], clientAddr)
                if err != nil {
                    log.Printf("UDP write to client failed: %v", err)
                }
            }
        }
    }()

    for {
        time.Sleep(5 * time.Second)
    }
}