package com.example.unomobile.fragments.week_content

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.unomobile.R
import com.example.unomobile.models.Activity
import com.example.unomobile.network.Api
import com.google.android.material.bottomnavigation.BottomNavigationView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response


class WeekContentFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var manager: RecyclerView.LayoutManager
    private lateinit var adapter: RecyclerView.Adapter<*>

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Hide Navbar
        val navBar = requireActivity().findViewById<BottomNavigationView>(R.id.bottom_navigation_view)
        navBar.visibility = View.GONE
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_week_content, container, false)
        val back_button = view.findViewById<ImageView>(R.id.back_button)
        back_button.setOnClickListener {
            Log.i("WeekContentFragment", "Back Button clicked")
            findNavController().navigate(R.id.action_weekContentFragment_to_contentFragment)
        }

        val title = view.findViewById<TextView>(R.id.title)
        title.text = "Semana " + arguments?.getInt("week_number")

        recyclerView = view.findViewById(R.id.recycler_view)
        manager = LinearLayoutManager(activity)
        recyclerView.layoutManager = manager
        recyclerView.adapter = WeekContentAdapter(listOf(), requireContext())
        getActivities()

        return view
    }

    private fun getActivities() {
        Api.retrofitService.getActivities(arguments?.getInt("week_id").toString()).enqueue(object: Callback<List<Activity>> {
            override fun onResponse(call: Call<List<Activity>>, response: Response<List<Activity>>) {
                Log.i("WeekContentFragment", response.toString())
                if (response.isSuccessful) {
                    Log.i("WeekContentFragment", "Response is successful")
                    adapter = WeekContentAdapter(response.body()!!, requireContext())
                    recyclerView.adapter = adapter
                }
            }

            override fun onFailure(call: Call<List<Activity>>, t: Throwable) {
                t.printStackTrace()
            }
        })
    }
}