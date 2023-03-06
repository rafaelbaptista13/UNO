package com.example.unomobile.fragments.activities

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.unomobile.R
import com.example.unomobile.activities.ActivityPageActivity
import com.example.unomobile.models.Activity
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.Api
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.gson.Gson
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response


class ActivitiesFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var manager: RecyclerView.LayoutManager
    private lateinit var adapter: RecyclerView.Adapter<*>

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
            findNavController().navigate(R.id.action_activitiesFragment_to_activitygroupsFragment)
        }

        val title = view.findViewById<TextView>(R.id.title)
        title.text = arguments?.getString("name")

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
                    adapter = ActivitiesAdapter(response.body()!!, requireContext())
                    recyclerView.adapter = adapter
                    (adapter as ActivitiesAdapter).setOnItemClickListener(object : ActivitiesAdapter.onItemClickListener{
                        override fun onItemClick(position: Int) {
                            val activity = response.body()!![position]
                            Log.i("ActivitiesFragment", "Clicked")
                            val bundle = Bundle()
                            bundle.putIntArray("activities_id", response.body()!!.map { it.id }.toIntArray())
                            bundle.putIntArray("activities_order", response.body()!!.map { it.order }.toIntArray())
                            bundle.putStringArray("activities_title", response.body()!!.map { it.title }.toTypedArray())
                            bundle.putStringArray("activities_type", response.body()!!.map { it.activitytype.name }.toTypedArray())
                            bundle.putStringArray("activities_description", response.body()!!.map { it.description }.toTypedArray())
                            bundle.putInt("active_activity", position)

                            var intent = Intent(requireContext(), ActivityPageActivity::class.java)
                            intent.putExtras(bundle)
                            startActivity(intent)
                        }
                    })
                }
            }

            override fun onFailure(call: Call<List<Activity>>, t: Throwable) {
                t.printStackTrace()
            }
        })
    }
}