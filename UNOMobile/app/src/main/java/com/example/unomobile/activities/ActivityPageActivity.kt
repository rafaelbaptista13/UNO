package com.example.unomobile.activities

import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.AppCompatButton
import androidx.navigation.fragment.findNavController
import com.example.unomobile.R
import com.example.unomobile.fragments.MediaFragment

class ActivityPageActivity : AppCompatActivity() {

    var activities_id : Array<Int>? = null
    var activities_order : Array<Int>? = null
    var activities_title : Array<String>? = null
    var activities_type : Array<String>? = null
    var activities_description : Array<String>? = null
    var active_activity : Int = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_page)

        val back_button = findViewById<ImageView>(R.id.back_button)
        back_button.setOnClickListener {
            Log.i("ActivityPageActivity", "Back Button clicked")
            super.onBackPressed()
        }

        val previous_activity = findViewById<AppCompatButton>(R.id.previous_activity)
        val next_activity = findViewById<AppCompatButton>(R.id.next_activity)

        previous_activity.setOnClickListener {
            Log.i("ActivityPageActivity", "Previous Activity Button clicked")

            active_activity -= 1

            if (active_activity == 0) {
                previous_activity.visibility = View.INVISIBLE
            } else {
                previous_activity.visibility = View.VISIBLE
                next_activity.text = "Avançar"
            }

            // Get type of activity
            if (activities_type!![active_activity] == "Media") {
                launchMediaFragment()
            }
        }

        next_activity.setOnClickListener {
            Log.i("ActivityPageActivity", "Next Activity Button clicked")

            if (active_activity == activities_id!!.size - 1) {
                super.onBackPressed()
                return@setOnClickListener
            }

            active_activity += 1

            if (active_activity == activities_id!!.size - 1) {
                next_activity.text = "Terminar"
            } else {
                next_activity.text = "Avançar"
                previous_activity.visibility = View.VISIBLE
            }

            // Get type of activity
            if (activities_type!![active_activity] == "Media") {
                launchMediaFragment()
            }
        }

        val bundle = intent.extras
        activities_id = bundle?.getIntArray("activities_id")?.toTypedArray()
        activities_order = bundle?.getIntArray("activities_order")?.toTypedArray()
        activities_title = bundle?.getStringArray("activities_title")
        activities_type = bundle?.getStringArray("activities_type")
        activities_description = bundle?.getStringArray("activities_description")
        active_activity = bundle?.getInt("active_activity")!!

        // Fix Buttons
        if (active_activity == activities_id!!.size - 1) {
            next_activity.text = "Terminar"
        }
        if (active_activity == 0) {
            previous_activity.visibility = View.INVISIBLE
        }

        if (activities_type!![active_activity] == "Media") {
            launchMediaFragment()
        }

    }


    private fun launchMediaFragment() {
        val fragment = MediaFragment.newInstance(activities_id!![active_activity], activities_order!![active_activity], activities_title!![active_activity], activities_description!![active_activity])

        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commit()
    }
}