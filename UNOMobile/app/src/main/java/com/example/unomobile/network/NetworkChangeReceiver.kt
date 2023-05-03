package com.example.unomobile.network

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import android.util.Log
import androidx.annotation.RequiresApi
import com.example.unomobile.activities.NoInternetActivity

class NetworkChangeReceiver : BroadcastReceiver() {

    @RequiresApi(Build.VERSION_CODES.M)
    override fun onReceive(context: Context, intent: Intent) {
        val connectivityManager = context.applicationContext.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork
        val networkCapabilities = connectivityManager.getNetworkCapabilities(network)
        Log.d("NetworkChangeReceiver", "Broadcast received")
        Log.d("NetworkChangeReceiver", network.toString())
        if (networkCapabilities == null || !networkCapabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)) {
            Log.d("NetworkChangeReceiver", "No network connection")
            // There is no network connection
            val intent = Intent(context, NoInternetActivity::class.java)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
        } else {
            val noInternetIntent = Intent("finish_no_internet_activity")
            context.sendBroadcast(noInternetIntent)
        }
    }
}
