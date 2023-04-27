package com.example.unomobile.fragments.activities

import android.app.Activity.RESULT_OK
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.content.res.AppCompatResources
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.unomobile.R
import com.example.unomobile.activities.ActivityPageActivity
import com.example.unomobile.models.Activity
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.Api
import com.example.unomobile.network.CacheManager
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.gson.Gson
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response


class ActivitiesFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var manager: RecyclerView.LayoutManager
    private lateinit var adapter: RecyclerView.Adapter<*>
    private lateinit var data: List<Activity>

    private lateinit var content_text: TextView
    private lateinit var exercise_text: TextView
    private lateinit var question_text: TextView
    private lateinit var game_text: TextView
    private lateinit var content_progress_bar: ProgressBar
    private lateinit var exercise_progress_bar: ProgressBar
    private lateinit var question_progress_bar: ProgressBar
    private lateinit var game_progress_bar: ProgressBar
    private lateinit var content_number_text: TextView
    private lateinit var exercise_number_text: TextView
    private lateinit var question_number_text: TextView
    private lateinit var game_number_text: TextView

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Hide Navbar
        val navBar = requireActivity().findViewById<BottomNavigationView>(R.id.bottom_navigation_view)
        navBar.visibility = View.GONE

        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_activities, container, false)
        val back_button = view.findViewById<ImageView>(R.id.back_button)
        back_button.setOnClickListener {
            Log.i("ActivitiesFragment", "Back Button clicked")

            val cache_keys = CacheManager.getCache().keys
            for (item in cache_keys) {
                CacheManager.getCache().removeResource(item)
            }

            findNavController().navigate(R.id.action_activitiesFragment_to_activitygroupsFragment)
            findNavController().popBackStack(R.id.activitiesFragment, true)
        }

        val title = view.findViewById<TextView>(R.id.title)
        title.text = arguments?.getString("name")

        content_text = view.findViewById(R.id.content_text)
        exercise_text = view.findViewById(R.id.exercise_text)
        question_text = view.findViewById(R.id.question_text)
        game_text = view.findViewById(R.id.game_text)
        content_progress_bar = view.findViewById(R.id.content_progress_bar)
        exercise_progress_bar = view.findViewById(R.id.exercise_progress_bar)
        question_progress_bar = view.findViewById(R.id.question_progress_bar)
        game_progress_bar = view.findViewById(R.id.game_progress_bar)
        content_number_text = view.findViewById(R.id.content_number_text)
        exercise_number_text = view.findViewById(R.id.exercise_number_text)
        question_number_text = view.findViewById(R.id.question_number_text)
        game_number_text = view.findViewById(R.id.game_number_text)

        recyclerView = view.findViewById(R.id.recycler_view)
        manager = LinearLayoutManager(activity)
        recyclerView.layoutManager = manager
        recyclerView.adapter = ActivitiesAdapter(listOf(), requireContext())
        getActivities()

        return view
    }

    private fun getActivities() {
        val sharedPreferences = requireActivity().getSharedPreferences("data", AppCompatActivity.MODE_PRIVATE)
        val gson = Gson()
        val user_info = sharedPreferences.getString("user", "")
        val user = gson.fromJson(user_info, UserInfo::class.java)

        Api.retrofitService.getActivities(user.class_id!!, arguments?.getInt("id").toString()).enqueue(object: Callback<List<Activity>> {
            override fun onResponse(call: Call<List<Activity>>, response: Response<List<Activity>>) {
                Log.i("ActivitiesFragment", response.toString())
                if (response.isSuccessful) {
                    Log.i("ActivitiesFragment", "Response is successful")
                    data = response.body()!!

                    val total_content_activities = data.count { it.activitytype.name == "Media" }
                    val total_exercise_activities = data.count { it.activitytype.name == "Exercise" }
                    val total_question_activities = data.count { it.activitytype.name == "Question" }
                    val total_game_activities = data.count { it.activitytype.name == "Game" }
                    Log.i("ActivitiesFragment", total_content_activities.toString() + " - " + total_exercise_activities.toString() + " - " + total_question_activities.toString() + " - " + total_game_activities.toString())

                    if (total_content_activities != 0) {
                        val completed_content_activities = data.count { it.activitytype.name == "Media" && it.completed == true }
                        updateActivityStatusCard(content_number_text, content_progress_bar, completed_content_activities, total_content_activities)
                        setActivityTypeStatusCardVisible(content_text, content_progress_bar, content_number_text)
                    }
                    if (total_exercise_activities != 0) {
                        val completed_exercise_activities = data.count { it.activitytype.name == "Exercise" && it.completed == true }
                        updateActivityStatusCard(exercise_number_text, exercise_progress_bar, completed_exercise_activities, total_exercise_activities)
                        setActivityTypeStatusCardVisible(exercise_text, exercise_progress_bar, exercise_number_text)
                    }
                    if (total_question_activities != 0) {
                        val completed_question_activities = data.count { it.activitytype.name == "Question" && it.completed == true }
                        updateActivityStatusCard(question_number_text, question_progress_bar, completed_question_activities, total_question_activities)
                        setActivityTypeStatusCardVisible(question_text, question_progress_bar, question_number_text)
                    }
                    if (total_game_activities != 0) {
                        val completed_game_activities = data.count { it.activitytype.name == "Game" && it.completed == true }
                        updateActivityStatusCard(game_number_text, game_progress_bar, completed_game_activities, total_game_activities)
                        setActivityTypeStatusCardVisible(game_text, game_progress_bar, game_number_text)
                    }

                    adapter = ActivitiesAdapter(data, requireContext())
                    recyclerView.adapter = adapter
                    (adapter as ActivitiesAdapter).setOnItemClickListener(object : ActivitiesAdapter.onItemClickListener{
                        override fun onItemClick(position: Int) {
                            Log.i("ActivitiesFragment", "Clicked")
                            val bundle = Bundle()
                            bundle.putIntArray("activities_id", response.body()!!.map { it.id }.toIntArray())
                            bundle.putIntArray("activities_order", response.body()!!.map { it.order }.toIntArray())
                            bundle.putStringArray("activities_title", response.body()!!.map { it.title }.toTypedArray())
                            bundle.putStringArray("activities_type", response.body()!!.map { it.activitytype.name }.toTypedArray())
                            bundle.putStringArray("activities_description", response.body()!!.map { it.description }.toTypedArray())
                            bundle.putBooleanArray("activities_status", response.body()!!.map { it.completed ?: false }.toBooleanArray())
                            bundle.putStringArray("activities_game_mode", response.body()!!.map { it.game_activity?.mode ?: "" }.toTypedArray())
                            bundle.putInt("active_activity", position)
                            bundle.putString("activitygroup_name", arguments?.getString("name"))

                            var intent = Intent(requireContext(), ActivityPageActivity::class.java)
                            intent.putExtras(bundle)
                            myActivityResultLauncher.launch(intent)
                        }
                    })
                }
            }

            override fun onFailure(call: Call<List<Activity>>, t: Throwable) {
                t.printStackTrace()
            }
        })
    }

    val myActivityResultLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == RESULT_OK) {
            val _data = result.data
            val modifiedData = _data?.getBooleanArrayExtra("activities_status")

            if (modifiedData != null) {
                for (index in data.indices) {
                    if (data[index].completed != modifiedData[index]) {
                        if (data[index].activitytype.name == "Media") {
                            val total = content_number_text.text.split("/")[1].toInt()
                            val new_completed = content_number_text.text.split("/")[0].toInt() + 1
                            updateActivityStatusCard(content_number_text, content_progress_bar, new_completed, total)
                        }
                        if (data[index].activitytype.name == "Exercise") {
                            val total = exercise_number_text.text.split("/")[1].toInt()
                            val new_completed = exercise_number_text.text.split("/")[0].toInt() + 1
                            updateActivityStatusCard(exercise_number_text, exercise_progress_bar, new_completed, total)
                        }
                        if (data[index].activitytype.name == "Question") {
                            val total = question_number_text.text.split("/")[1].toInt()
                            val new_completed = question_number_text.text.split("/")[0].toInt() + 1
                            updateActivityStatusCard(question_number_text, question_progress_bar, new_completed, total)
                        }
                        if (data[index].activitytype.name == "Game") {
                            val total = game_number_text.text.split("/")[1].toInt()
                            val new_completed = game_number_text.text.split("/")[0].toInt() + 1
                            updateActivityStatusCard(game_number_text, game_progress_bar, new_completed, total)
                        }
                        data[index].completed = modifiedData[index]
                        recyclerView.adapter!!.notifyItemChanged(index)
                    }
                }
            }
        }
    }

    private fun updateActivityStatusCard(number_text: TextView, progressBar: ProgressBar, completed: Int, total: Int) {
        number_text.text = completed.toString() + "/" + total.toString()
        val progress = ((completed.toFloat() / total.toFloat()) * 100).toInt()
        if (progress == 100) {
            progressBar.progressDrawable = AppCompatResources.getDrawable(requireContext(), R.drawable.greenprogress)
        } else {
            progressBar.progressDrawable = AppCompatResources.getDrawable(requireContext(), R.drawable.yellowprogress)
        }
        progressBar.progress = ((completed.toFloat() / total.toFloat()) * 100).toInt()
    }

    private fun setActivityTypeStatusCardVisible(text : TextView, progress_bar : ProgressBar, number_text: TextView) {
        text.visibility = View.VISIBLE
        progress_bar.visibility = View.VISIBLE
        number_text.visibility = View.VISIBLE
    }

}