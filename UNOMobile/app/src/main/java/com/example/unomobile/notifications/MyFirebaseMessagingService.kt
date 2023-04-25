package com.example.unomobile.notifications

import android.app.NotificationManager
import android.app.PendingIntent
import android.app.TaskStackBuilder
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.content.ContentProviderCompat.requireContext
import com.example.unomobile.MainActivity
import com.example.unomobile.R
import com.example.unomobile.activities.ActivityPageActivity
import com.example.unomobile.activities.ActivityPageFromNotification
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import org.json.JSONObject

class MyFirebaseMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Log.d(TAG, "Message received. ${remoteMessage.data}")
        // Check if the message contains data payload.
        remoteMessage.data["default"]?.isNotEmpty().let {
            val json_data = JSONObject(remoteMessage.data["default"]!!)

            // Get notification data.
            val title = json_data.getString("title")
            val message = json_data.getString("message")

            Log.d(TAG, "Message received. title=${title} message=${message}")

            val activity_id = json_data.optInt("activity_id")
            val activity_type = json_data.optString("activity_type")
            val activity_title = json_data.optString("activity_title")
            val activity_order = json_data.optInt("activity_order")
            val activity_description = json_data.optString("activity_description")
            val activity_game_mode = json_data.optString("activity_game_mode")
            val activitygroup_name = json_data.optString("activitygroup_name")

            Log.i(TAG, "activity_id=${activity_id} activity_type=${activity_type} activity_title=${activity_title} activity_order=${activity_order} activity_description=${activity_description} activity_game_mode=${activity_game_mode} activitygroup_name=${activitygroup_name} ")

            val stackBuilder = TaskStackBuilder.create(this)

            var mainActivityIntent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            }
            stackBuilder.addNextIntent(mainActivityIntent)

            if (activity_type != "") {
                val sharedPreferences = getSharedPreferences("uno", Context.MODE_PRIVATE)
                val editor = sharedPreferences.edit()
                editor.putInt("activity_id", activity_id)
                editor.putInt("activity_order", activity_order)
                editor.putString("activity_title", activity_title)
                editor.putString("activity_type", activity_type)
                editor.putString("activity_description", activity_description)
                editor.putString("activity_game_mode", activity_game_mode)
                editor.putString("activitygroup_name", activitygroup_name)
                editor.apply()

                var activityIntent = Intent(this, ActivityPageFromNotification::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                stackBuilder.addNextIntent(activityIntent)
            }

            val pendingIntent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                stackBuilder.getPendingIntent(0, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE)
            } else {
                stackBuilder.getPendingIntent(0, PendingIntent.FLAG_UPDATE_CURRENT)
            }


            // Create notification builder.
            val notificationBuilder = NotificationCompat.Builder(this, "notification_channel")
                .setContentTitle(title)
                .setContentText(message)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setSmallIcon(R.drawable.uno_icon)
                .setContentIntent(pendingIntent)

            // Show notification.
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.notify(0, notificationBuilder.build())
        }
    }

    override fun onNewToken(token: String) {
        Log.d(TAG, "Refreshed token: $token")
        // send the token to your server or perform any other required operations
    }

    companion object {
        private const val TAG = "MyFirebaseMsgService"
    }
}
