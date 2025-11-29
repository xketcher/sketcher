package com.example.vpnclient

import android.app.Activity
import android.content.Intent
import android.net.VpnService
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private val PREPARE_VPN = 1
    private lateinit var serverEdit: EditText
    private lateinit var connectBtn: Button
    private lateinit var statusView: TextView
    private var connected = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        serverEdit = findViewById(R.id.serverEdit)
        connectBtn = findViewById(R.id.connectBtn)
        statusView = findViewById(R.id.status)

        connectBtn.setOnClickListener {
            if (!connected) {
                val intent = VpnService.prepare(this)
                if (intent != null) {
                    startActivityForResult(intent, PREPARE_VPN)
                } else {
                    onActivityResult(PREPARE_VPN, Activity.RESULT_OK, null)
                }
            } else {
                val stop = Intent(this, SimpleVpnService::class.java)
                stop.action = SimpleVpnService.ACTION_DISCONNECT
                startService(stop)
                statusView.text = "Disconnected"
                connected = false
                connectBtn.text = "Connect"
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == PREPARE_VPN && resultCode == Activity.RESULT_OK) {
            val server = serverEdit.text.toString().trim()
            val intent = Intent(this, SimpleVpnService::class.java)
            intent.putExtra(SimpleVpnService.EXTRA_SERVER, server)
            intent.action = SimpleVpnService.ACTION_CONNECT
            startService(intent)
            statusView.text = "Connecting..."
            connected = true
            connectBtn.text = "Disconnect"
        }
    }
}
