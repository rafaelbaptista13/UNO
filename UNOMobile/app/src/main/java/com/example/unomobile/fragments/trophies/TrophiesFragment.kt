package com.example.unomobile.fragments.trophies

import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.unomobile.R
import com.example.unomobile.fragments.supportmaterials.SupportMaterialsAdapter
import com.example.unomobile.models.SupportMaterial
import com.example.unomobile.models.Trophy
import com.example.unomobile.network.Api
import com.google.android.material.bottomnavigation.BottomNavigationView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class TrophiesFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var manager: RecyclerView.LayoutManager
    private lateinit var adapter: RecyclerView.Adapter<*>
    private lateinit var data: List<Trophy>

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Hide Navbar
        val navBar = requireActivity().findViewById<BottomNavigationView>(R.id.bottom_navigation_view)
        navBar.visibility = View.GONE

        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_trophies, container, false)
        val back_button = view.findViewById<ImageView>(R.id.back_button)
        back_button.setOnClickListener {
            Log.i("TrophiesFragment", "Back Button clicked")
            findNavController().navigate(R.id.action_trophiesFragment_to_profileFragment)
            findNavController().popBackStack(R.id.trophiesFragment, true)
        }

        recyclerView = view.findViewById(R.id.recycler_view)
        manager = LinearLayoutManager(activity)
        recyclerView.layoutManager = manager
        recyclerView.adapter = TrophiesAdapter(listOf(), requireContext())
        getTrophies()

        return view
    }

    private fun getTrophies() {
        Api.retrofitService.getTrophies().enqueue(object: Callback<List<Trophy>> {
            override fun onResponse(call: Call<List<Trophy>>, response: Response<List<Trophy>>) {
                Log.i("TrophiesFragment", response.toString())
                if (response.isSuccessful) {
                    Log.i("TrophiesFragment", "Response is successful")
                    data = response.body()!!

                    adapter = TrophiesAdapter(data, requireContext())
                    recyclerView.adapter = adapter

                }
            }

            override fun onFailure(call: Call<List<Trophy>>, t: Throwable) {
                t.printStackTrace()
            }

        })
    }

}