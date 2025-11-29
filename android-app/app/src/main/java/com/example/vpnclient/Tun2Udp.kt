package com.example.vpnclient

import android.net.VpnService
import android.os.ParcelFileDescriptor
import android.util.Log
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.InetSocketAddress
import java.net.SocketAddress
import java.nio.ByteBuffer
import java.nio.channels.DatagramChannel
import kotlin.concurrent.thread

class Tun2Udp(private val pfd: ParcelFileDescriptor, private val server: String) {
    companion object {
        const val TAG = "Tun2Udp"
        const val MAX_PACKET_SIZE = 32767
    }

    @Volatile
    private var running = true
    private var readerThread: Thread? = null
    private var writerThread: Thread? = null
    private var channel: DatagramChannel? = null

    fun start() {
        val parts = server.split(":")
        val host = parts[0]
        val port = if (parts.size > 1) parts[1].toInt() else 51820
        val serverAddr = InetSocketAddress(host, port)

        channel = DatagramChannel.open()
        channel?.bind(null)
        channel?.configureBlocking(true)

        val input = FileInputStream(pfd.fileDescriptor)
        val output = FileOutputStream(pfd.fileDescriptor)

        readerThread = thread(start = true, name = "TunReader") {
            try {
                val buffer = ByteArray(MAX_PACKET_SIZE)
                while (running) {
                    val len = input.read(buffer)
                    if (len > 0) {
                        val bb = ByteBuffer.wrap(buffer, 0, len)
                        channel?.send(bb, serverAddr)
                    } else if (len < 0) {
                        break
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Reader error", e)
            } finally {
                stop()
            }
        }

        writerThread = thread(start = true, name = "UdpReader") {
            try {
                val buf = ByteBuffer.allocateDirect(MAX_PACKET_SIZE)
                while (running) {
                    buf.clear()
                    val sa = channel?.receive(buf)
                    if (sa == null) {
                        continue
                    }
                    buf.flip()
                    val received = ByteArray(buf.limit())
                    buf.get(received)
                    output.write(received)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Writer error", e)
            } finally {
                stop()
            }
        }
    }

    fun stop() {
        running = false
        try {
            channel?.close()
        } catch (ignored: Exception) {
        }
        try {
            pfd.close()
        } catch (ignored: Exception) {
        }
        readerThread?.interrupt()
        writerThread?.interrupt()
    }
}
