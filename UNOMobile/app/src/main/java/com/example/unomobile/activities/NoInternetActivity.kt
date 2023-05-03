package com.example.unomobile.activities

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.ConnectivityManager
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.core.content.ContextCompat
import com.example.unomobile.R
import com.example.unomobile.network.NetworkChangeReceiver

class NoInternetActivity : AppCompatActivity() {

    private val noInternetReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == "finish_no_internet_activity") {
                finish()
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_no_internet)
    }

    override fun onResume() {
        super.onResume()
        registerReceiver(noInternetReceiver, IntentFilter("finish_no_internet_activity"))
    }

    override fun onPause() {
        super.onPause()
        unregisterReceiver(noInternetReceiver)
    }

    override fun onBackPressed() {
        // Do nothing
    }
}