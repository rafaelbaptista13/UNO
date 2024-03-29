package com.example.unomobile.activities

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.AppCompatButton
import androidx.core.content.ContextCompat
import com.example.unomobile.R
import com.example.unomobile.fragments.*
import com.example.unomobile.fragments.questions.QuestionFragment
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.Api
import com.example.unomobile.utils.BorderedTextView
import com.google.gson.Gson
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ActivityPageActivity : AppCompatActivity() {

    var activities_id : Array<Int>? = null
    var activities_order : Array<Int>? = null
    var activities_title : Array<String>? = null
    var activities_type : Array<String>? = null
    var activities_description : Array<String>? = null
    var activities_status : Array<Boolean>? = null
    var activities_game_mode : Array<String>? = null
    var active_activity : Int = 0
    lateinit var activitygroup_name : String
    lateinit var activityGroupNameTextView : BorderedTextView
    private var user: UserInfo? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_page)

        val back_button = findViewById<ImageView>(R.id.back_button)
        back_button.setOnClickListener {
            Log.i("ActivityPageActivity", "Back Button clicked")
            sendBackToActivitiesFragment()
        }

        val sharedPreferences = this.getSharedPreferences("data", AppCompatActivity.MODE_PRIVATE)
        val gson = Gson()
        val user_info = sharedPreferences.getString("user", "")
        user = gson.fromJson(user_info, UserInfo::class.java)

        val previous_activity = findViewById<AppCompatButton>(R.id.previous_activity)
        val next_activity = findViewById<AppCompatButton>(R.id.next_activity)

        previous_activity.setOnClickListener {
            Log.i("ActivityPageActivity", "Previous Activity Button clicked")

            active_activity -= 1

            if (active_activity == 0) {
                previous_activity.visibility = View.INVISIBLE
            } else {
                previous_activity.visibility = View.VISIBLE
                next_activity.text = "Prosseguir"
            }

            // Get type of activity
            if (activities_type!![active_activity] == "Media") {
                launchMediaFragment()
            }
            if (activities_type!![active_activity] == "Exercise") {
                launchExerciseFragment()
            }
            if (activities_type!![active_activity] == "Question") {
                launchQuestionFragment()
            }
            if (activities_type!![active_activity] == "Game") {
                if (activities_game_mode!![active_activity] == "Play") {
                    launchGamePlayModeFragment()
                }
                if (activities_game_mode!![active_activity] == "Identify") {
                    launchGameIdentifyModeFragment()
                }
                if (activities_game_mode!![active_activity] == "Build") {
                    launchGameBuildModeFragment()
                }
            }
        }

        next_activity.setOnClickListener {
            Log.i("ActivityPageActivity", "Next Activity Button clicked")

            if (!activities_status!![active_activity] && activities_type!![active_activity] == "Media") {
                val call = Api.retrofitService.submitMediaActivity(user!!.class_id!!, activities_id!![active_activity])

                call.enqueue(object : Callback<ResponseBody> {
                    override fun onResponse(
                        call: Call<ResponseBody>,
                        response: Response<ResponseBody>
                    ) {
                        if (!response.isSuccessful) {
                            Toast.makeText(this@ActivityPageActivity, "Ocorreu um erro ao submeter a ativitidade.", Toast.LENGTH_SHORT).show()
                        } else {
                            Log.i("ActivityPageActivity", "Changed status of " + active_activity + " to true.")
                            activities_status!![active_activity] = true

                            if (active_activity == activities_id!!.size - 1) {
                                Log.i("ActivityPageActivity", "Last activity")
                                sendBackToActivitiesFragment()
                                return
                            }

                            active_activity += 1

                            if (active_activity == activities_id!!.size - 1) {
                                next_activity.text = "Terminar"
                            } else {
                                next_activity.text = "Prosseguir"
                                previous_activity.visibility = View.VISIBLE
                            }

                            // Get type of activity
                            if (activities_type!![active_activity] == "Media") {
                                launchMediaFragment()
                            }
                            if (activities_type!![active_activity] == "Exercise") {
                                launchExerciseFragment()
                            }
                            if (activities_type!![active_activity] == "Question") {
                                launchQuestionFragment()
                            }
                            if (activities_type!![active_activity] == "Game") {
                                if (activities_game_mode!![active_activity] == "Play") {
                                    launchGamePlayModeFragment()
                                }
                                if (activities_game_mode!![active_activity] == "Identify") {
                                    launchGameIdentifyModeFragment()
                                }
                                if (activities_game_mode!![active_activity] == "Build") {
                                    launchGameBuildModeFragment()
                                }
                            }


                        }
                    }

                    override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                        Toast.makeText(this@ActivityPageActivity, "Ocorreu um erro ao submeter a ativitidade.", Toast.LENGTH_SHORT).show()
                        Log.i("ActivityPageActivity", t.message.toString())
                    }

                })
            } else {

                if (active_activity == activities_id!!.size - 1) {
                    Log.i("ActivityPageActivity", "Last activity")
                    sendBackToActivitiesFragment()
                    return@setOnClickListener
                }

                active_activity += 1

                if (active_activity == activities_id!!.size - 1) {
                    next_activity.text = "Terminar"
                } else {
                    next_activity.text = "Prosseguir"
                    previous_activity.visibility = View.VISIBLE
                }

                // Get type of activity
                if (activities_type!![active_activity] == "Media") {
                    launchMediaFragment()
                }
                if (activities_type!![active_activity] == "Exercise") {
                    launchExerciseFragment()
                }
                if (activities_type!![active_activity] == "Question") {
                    launchQuestionFragment()
                }
                if (activities_type!![active_activity] == "Game") {
                    if (activities_game_mode!![active_activity] == "Play") {
                        launchGamePlayModeFragment()
                    }
                    if (activities_game_mode!![active_activity] == "Identify") {
                        launchGameIdentifyModeFragment()
                    }
                    if (activities_game_mode!![active_activity] == "Build") {
                        launchGameBuildModeFragment()
                    }
                }
            }
        }

        val bundle = intent.extras
        activities_id = bundle?.getIntArray("activities_id")?.toTypedArray()
        activities_order = bundle?.getIntArray("activities_order")?.toTypedArray()
        activities_title = bundle?.getStringArray("activities_title")
        activities_type = bundle?.getStringArray("activities_type")
        activities_description = bundle?.getStringArray("activities_description")
        activities_status = bundle?.getBooleanArray("activities_status")?.toTypedArray()
        activities_game_mode = bundle?.getStringArray("activities_game_mode")
        active_activity = bundle?.getInt("active_activity")!!
        activitygroup_name = bundle.getString("activitygroup_name")!!

        activityGroupNameTextView = findViewById(R.id.activitygroup_name)
        activityGroupNameTextView.text = activitygroup_name

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
        if (activities_type!![active_activity] == "Exercise") {
            launchExerciseFragment()
        }
        if (activities_type!![active_activity] == "Question") {
            launchQuestionFragment()
        }
        if (activities_type!![active_activity] == "Game") {
            if (activities_game_mode!![active_activity] == "Play") {
                launchGamePlayModeFragment()
            }
            if (activities_game_mode!![active_activity] == "Identify") {
                launchGameIdentifyModeFragment()
            }
            if (activities_game_mode!![active_activity] == "Build") {
                launchGameBuildModeFragment()
            }
        }
    }

    override fun onBackPressed() {
        sendBackToActivitiesFragment()
    }

    private fun sendBackToActivitiesFragment() {
        val resultIntent = Intent()
        val bundle = Bundle()

        if (activities_status!!.isNotEmpty()) {

            bundle.putBooleanArray("activities_status", activities_status!!.toBooleanArray())
            resultIntent.putExtras(bundle)
        }
        setResult(RESULT_OK, resultIntent)
        finish()
    }

    private fun launchMediaFragment() {
        val fragment = MediaFragment.newInstance(activities_id!![active_activity], activities_order!![active_activity], activities_title!![active_activity], activities_description!![active_activity])

        if (activities_title!![active_activity] == "Relaxamento Final") {
            activityGroupNameTextView.setColor(ContextCompat.getColor(this, R.color.final_relax_activity), ContextCompat.getColor(this, R.color.final_relax_activity_border))
        } else {
            activityGroupNameTextView.setColor(ContextCompat.getColor(this, R.color.content), ContextCompat.getColor(this, R.color.content_border))
        }

        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commit()
    }

    private fun launchExerciseFragment() {
        val fragment = ExerciseFragment.newInstance(activities_id!![active_activity], activities_order!![active_activity], activities_title!![active_activity], activities_description!![active_activity])

        activityGroupNameTextView.setColor(ContextCompat.getColor(this, R.color.exercise), ContextCompat.getColor(this, R.color.exercise_border))

        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commit()
    }

    private fun launchQuestionFragment() {
        val fragment = QuestionFragment.newInstance(activities_id!![active_activity], activities_order!![active_activity])

        activityGroupNameTextView.setColor(ContextCompat.getColor(this, R.color.question), ContextCompat.getColor(this, R.color.question_border))

        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commit()
    }

    private fun launchGamePlayModeFragment() {
        val fragment = GamePlayModeFragment.newInstance(activities_id!![active_activity], activities_order!![active_activity], activities_title!![active_activity], activities_description!![active_activity])

        activityGroupNameTextView.setColor(ContextCompat.getColor(this, R.color.game), ContextCompat.getColor(this, R.color.game_border))

        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commit()
    }

    private fun launchGameIdentifyModeFragment() {
        val fragment = GameIdentifyModeFragment.newInstance(activities_id!![active_activity], activities_order!![active_activity], activities_title!![active_activity], activities_description!![active_activity])

        activityGroupNameTextView.setColor(ContextCompat.getColor(this, R.color.game), ContextCompat.getColor(this, R.color.game_border))

        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commit()
    }

    private fun launchGameBuildModeFragment() {
        val fragment = GameBuildModeFragment.newInstance(activities_id!![active_activity], activities_order!![active_activity], activities_title!![active_activity], activities_description!![active_activity])

        activityGroupNameTextView.setColor(ContextCompat.getColor(this, R.color.game), ContextCompat.getColor(this, R.color.game_border))

        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commit()
    }
}