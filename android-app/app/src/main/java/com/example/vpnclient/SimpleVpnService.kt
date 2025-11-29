package com.example.vpnclient

import android.app.Service
import android.content.Intent
import android.net.VpnService
import android.os.ParcelFileDescriptor
import android.util.Log
import java.io.IOException

class SimpleVpnService : VpnService() {

    companion object {
        const val TAG = "SimpleVpnService"
        const val EXTRA_SERVER = "server"
        const val ACTION_CONNECT = "com.example.vpnclient.CONNECT"
        const val ACTION_DISCONNECT = "com.example.vpnclient.DISCONNECT"
    }

    private var vpnInterface: ParcelFileDescriptor? = null
    private var tun2udp: Tun2Udp? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action
        if (action == ACTION_DISCONNECT) {
            stopVpn()
            stopSelf()
            return START_NOT_STICKY
        }

        val server = intent?.getStringExtra(EXTRA_SERVER) ?: return START_NOT_STICKY
        startVpn(server)
        return START_STICKY
    }

    private fun startVpn(server: String) {
        try {
            val builder = Builder()
            builder.setSession("SimpleVPN")
                .setMtu(1500)
                .addAddress("10.0.0.2", 24)
                .addRoute("0.0.0.0", 0)
                .addDnsServer("8.8.8.8")
            vpnInterface = builder.establish()
            Log.i(TAG, "VPN established: $vpnInterface")

            vpnInterface?.let { pfd ->
                tun2udp = Tun2Udp(pfd, server)
                tun2udp?.start()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start VPN", e)
            stopSelf()
        }
    }

    private fun stopVpn() {
        try {
            tun2udp?.stop()
            vpnInterface?.close()
        } catch (e: IOException) {
            Log.w(TAG, "Error closing vpn", e)
        } finally {
            tun2udp = null
            vpnInterface = null
        }
    }

    override fun onDestroy() {
        stopVpn()
        super.onDestroy()
    }
}
