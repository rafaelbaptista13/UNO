package com.example.unomobile.fragments.activitygroups

import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.unomobile.R
import com.example.unomobile.models.ActivityGroup
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.Api
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.gson.Gson
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ActivityGroupsFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var manager: RecyclerView.LayoutManager
    private lateinit var adapter: RecyclerView.Adapter<*>

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Set NavBar visible
        val navBar = requireActivity().findViewById<BottomNavigationView>(R.id.bottom_navigation_view)
        navBar.visibility = View.VISIBLE

        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_activitygroups, container, false)

        recyclerView = view.findViewById(R.id.recycler_view)
        manager = LinearLayoutManager(activity)
        recyclerView.layoutManager = manager
        recyclerView.adapter = ActivityGroupsAdapter(listOf())
        getActivityGroups()
        return view
    }

    private fun getActivityGroups() {
        val sharedPreferences = requireActivity().getSharedPreferences("data", AppCompatActivity.MODE_PRIVATE)
        val gson = Gson()
        val user_info = sharedPreferences.getString("user", "")
        val user = gson.fromJson(user_info, UserInfo::class.java)

        Api.retrofitService.getActivityGroups(user.class_id!!).enqueue(object: Callback<List<ActivityGroup>>{
            override fun onResponse(call: Call<List<ActivityGroup>>, response: Response<List<ActivityGroup>>) {
                Log.i("ActivityGroupsFragment", response.toString())
                if (response.isSuccessful) {
                    Log.i("ActivityGroupsFragment", "Response is successful")
                    adapter = ActivityGroupsAdapter(response.body()!!)
                    recyclerView.adapter = adapter
                    (adapter as ActivityGroupsAdapter).setOnItemClickListener(object : ActivityGroupsAdapter.onItemClickListener{
                        override fun onItemClick(position: Int) {
                            val activitygroup = response.body()!![position]
                            val bundle = Bundle()
                            bundle.putInt("id", activitygroup.id)
                            bundle.putInt("order", activitygroup.order)
                            bundle.putString("name", activitygroup.name)
                            findNavController().navigate(R.id.action_activitygroupFragment_to_activitiesFragment, bundle)
                        }
                    })
                }
            }

            override fun onFailure(call: Call<List<ActivityGroup>>, t: Throwable) {
                t.printStackTrace()
            }
        })
    }
}