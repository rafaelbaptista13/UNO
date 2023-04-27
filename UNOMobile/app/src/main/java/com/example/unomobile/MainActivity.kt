package com.example.unomobile

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.NavController
import androidx.navigation.Navigation
import androidx.navigation.ui.NavigationUI.setupWithNavController
import com.example.unomobile.activities.LoginActivity
import com.example.unomobile.databinding.ActivityMainBinding
import com.example.unomobile.models.DeviceToken
import com.example.unomobile.models.ResponseMessage
import com.example.unomobile.network.Api
import com.example.unomobile.network.cookieHandler
import com.example.unomobile.utils.ImageLoader
import com.google.android.gms.tasks.OnCompleteListener
import com.google.firebase.messaging.FirebaseMessaging
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.net.HttpCookie
import java.net.URI

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    lateinit var navController: NavController
    private var isLoggedIn = false
    private var cookies = cookieHandler.cookieStore.cookies
    private val CHANNEL_ID = "notification_channel"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ImageLoader.initialize(this, com.example.unomobile.network.client)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        navController = Navigation.findNavController(this, R.id.nav_host_fragment_container)
        setupWithNavController(binding.bottomNavigationView, navController)

        createNotificationChannel()
    }

    override fun onStart() {
        super.onStart()

        val sharedPreferences = getSharedPreferences("data", Context.MODE_PRIVATE)

        // Get the current time in milliseconds
        val currentTimeMillis = System.currentTimeMillis()

        // Check if the token exists in SharedPreferences
        if (sharedPreferences.contains("uno-session") && sharedPreferences.contains("uno-session.sig")) {

            // Get the token's timestamp from SharedPreferences
            val tokenTimestamp = sharedPreferences.getLong("token_timestamp", 0L)

            // Calculate the difference between the current time and the token's timestamp
            val timeDiffMillis = currentTimeMillis - tokenTimestamp

            // If the time difference is greater than or equal to 24 hours, remove the token from SharedPreferences
            val uno_session_sig = HttpCookie.parse(sharedPreferences.getString("uno-session.sig", ""))
            val uno_session = HttpCookie.parse(sharedPreferences.getString("uno-session", ""))
            cookieHandler.cookieStore.add(URI.create(com.example.unomobile.network.BASE_URL), uno_session[0])
            cookieHandler.cookieStore.add(URI.create(com.example.unomobile.network.BASE_URL), uno_session_sig[0])
            if (timeDiffMillis >= 24 * 60 * 60 * 1000) {
                forceLogout()
                Log.i("MainActivity", "User is not logged in.")
            }
        } else {
            Log.i("MainActivity", "User is not logged in.")
            sendToLoginActivity()
        }
    }

    private fun sendToLoginActivity() {
        var intent = Intent(this@MainActivity, LoginActivity::class.java)
        startActivity(intent)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Notification Title"
            val descriptionText = "Notification Description"
            val importance = NotificationManager.IMPORTANCE_DEFAULT
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply{
                description = descriptionText
            }
            val notificationManager: NotificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    fun forceLogout() {
        val sharedPreferences = this.getSharedPreferences("data", AppCompatActivity.MODE_PRIVATE)

        FirebaseMessaging.getInstance().token.addOnCompleteListener(OnCompleteListener { task ->
            if (!task.isSuccessful) {
                Log.w("MainActivity", "Fetching FCM registration token failed", task.exception)
                return@OnCompleteListener
            }

            // Get the device token
            val token = task.result

            val device_token = DeviceToken(
                deviceToken = token
            )

            Api.retrofitService.logout(device_token).enqueue(object: Callback<ResponseMessage> {
                override fun onResponse(call: Call<ResponseMessage>, response: Response<ResponseMessage>) {
                    Log.i("MainFrament", response.toString())
                    if (response.isSuccessful) {
                        Log.i("ProfileFragment", "Response is successful")

                        val sharedPreferencesEdit = sharedPreferences.edit()
                        sharedPreferencesEdit.clear()
                        sharedPreferencesEdit.apply()

                        val intent = Intent(this@MainActivity, LoginActivity::class.java)
                        startActivity(intent)
                    }
                }

                override fun onFailure(call: Call<ResponseMessage>, t: Throwable) {
                    val sharedPreferencesEdit = sharedPreferences.edit()
                    sharedPreferencesEdit.clear()
                    sharedPreferencesEdit.apply()

                    val intent = Intent(this@MainActivity, LoginActivity::class.java)
                    startActivity(intent)
                    t.printStackTrace()
                }
            })
        })

    }
}