package com.example.unomobile.activities

import android.content.Context
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.ImageView
import android.widget.TextView
import com.example.unomobile.MainActivity
import com.example.unomobile.R
import com.example.unomobile.fragments.*
import com.example.unomobile.fragments.questions.QuestionFragment
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.Api
import com.example.unomobile.network.cookieHandler
import com.example.unomobile.utils.ImageLoader
import com.google.gson.Gson
import java.net.HttpCookie
import java.net.URI

class ActivityPageFromNotification : AppCompatActivity() {

    var activity_id : Int? = null
    var activity_order : Int? = null
    var activity_title : String? = null
    var activity_type : String? = null
    var activity_description : String? = null
    var activity_game_mode : String? = null
    lateinit var activitygroup_name : String
    private var user: UserInfo? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_page_from_notification)
        ImageLoader.initialize(this, Api.client)

        val back_button = findViewById<ImageView>(R.id.back_button)
        back_button.setOnClickListener {
            var intent = Intent(this, MainActivity::class.java)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            startActivity(intent)
        }

        val userSharedPreferences = this.getSharedPreferences("data", MODE_PRIVATE)
        val gson = Gson()
        val user_info = userSharedPreferences.getString("user", "")
        user = gson.fromJson(user_info, UserInfo::class.java)

        val sharedPreferences = getSharedPreferences("uno", MODE_PRIVATE)
        activity_id = sharedPreferences.getInt("activity_id", -1)
        activity_order = sharedPreferences.getInt("activity_order", -1)
        activity_title = sharedPreferences.getString("activity_title", "")
        activity_type = sharedPreferences.getString("activity_type", "")
        activity_description = sharedPreferences.getString("activity_description", "")
        activity_game_mode = sharedPreferences.getString("activity_game_mode", "")
        activitygroup_name = sharedPreferences.getString("activitygroup_name", "")!!

        findViewById<TextView>(R.id.activitygroup_name).text = activitygroup_name

        val editor = userSharedPreferences.edit()

        // Get the current time in milliseconds
        val currentTimeMillis = System.currentTimeMillis()

        // Check if the token exists in SharedPreferences
        if (userSharedPreferences.contains("uno-session") && userSharedPreferences.contains("uno-session.sig")) {

            // Get the token's timestamp from SharedPreferences
            val tokenTimestamp = userSharedPreferences.getLong("token_timestamp", 0L)

            // Calculate the difference between the current time and the token's timestamp
            val timeDiffMillis = currentTimeMillis - tokenTimestamp

            // If the time difference is greater than or equal to 24 hours, remove the token from SharedPreferences
            val uno_session_sig = HttpCookie.parse(userSharedPreferences.getString("uno-session.sig", ""))
            val uno_session = HttpCookie.parse(userSharedPreferences.getString("uno-session", ""))
            cookieHandler.cookieStore.add(URI.create(com.example.unomobile.network.BASE_URL), uno_session[0])
            cookieHandler.cookieStore.add(URI.create(com.example.unomobile.network.BASE_URL), uno_session_sig[0])

            if (timeDiffMillis >= 24 * 60 * 60 * 1000) {
                MainActivity().forceLogout()
                Log.i(TAG, "User is not logged in.")
            }
        } else {
            Log.i(TAG, "User is not logged in.")
            sendToLoginActivity()
        }

        if (activity_type == "Exercise") {
            launchExerciseFragment()
        }
        if (activity_type == "Question") {
            launchQuestionFragment()
        }
        if (activity_type == "Game") {
            if (activity_game_mode == "Play") {
                launchGamePlayModeFragment()
            }
            if (activity_game_mode == "Identify") {
                launchGameIdentifyModeFragment()
            }
            if (activity_game_mode == "Build") {
                launchGameBuildModeFragment()
            }
        }
    }

    private fun launchExerciseFragment() {
        val fragment = ExerciseFragment.newInstance(activity_id!!, activity_order!!, activity_title!!, activity_description!!)

        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commit()
    }

    private fun launchQuestionFragment() {
        val fragment = QuestionFragment.newInstance(activity_id!!, activity_order!!)

        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commit()
    }

    private fun launchGamePlayModeFragment() {
        val fragment = GamePlayModeFragment.newInstance(activity_id!!, activity_order!!, activity_title!!, activity_description!!)

        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commit()
    }

    private fun launchGameIdentifyModeFragment() {
        val fragment = GameIdentifyModeFragment.newInstance(activity_id!!, activity_order!!, activity_title!!, activity_description!!)

        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commit()
    }

    private fun launchGameBuildModeFragment() {
        val fragment = GameBuildModeFragment.newInstance(activity_id!!, activity_order!!, activity_title!!, activity_description!!)

        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commit()
    }

    override fun onBackPressed() {
        var intent = Intent(this, MainActivity::class.java)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        startActivity(intent)
    }

    private fun sendToLoginActivity() {
        var intent = Intent(this@ActivityPageFromNotification, LoginActivity::class.java)
        startActivity(intent)
    }

    companion object {
        private const val TAG = "ActPagNotification"
    }
}