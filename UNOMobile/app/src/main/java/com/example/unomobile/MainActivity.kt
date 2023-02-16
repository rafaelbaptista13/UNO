package com.example.unomobile

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.NavController
import androidx.navigation.Navigation
import androidx.navigation.ui.NavigationUI.setupWithNavController
import com.example.unomobile.activities.LoginActivity
import com.example.unomobile.databinding.ActivityMainBinding
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.ApiService
import com.example.unomobile.network.cookieHandler
import com.google.gson.Gson




class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var navController: NavController
    private var isLoggedIn = false
    private var cookies = cookieHandler.cookieStore.cookies

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)



        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        navController = Navigation.findNavController(this, R.id.nav_host_fragment_container)
        setupWithNavController(binding.bottomNavigationView, navController)
    }

    override fun onStart() {
        super.onStart()

        isLoggedIn = cookies.any { obj -> obj.name == "uno-session" } && cookies.any { obj -> obj.name == "uno-session.sig" }

        if (!isLoggedIn) {
            Log.i("MainActivity", "User is not logged in.")
            sendToLoginActivity()
        } else {
            Log.i("MainActivity", "User is logged in.")
        }
    }

    private fun sendToLoginActivity() {
        var intent = Intent(this@MainActivity, LoginActivity::class.java)
        startActivity(intent)
    }

}