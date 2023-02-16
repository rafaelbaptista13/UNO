package com.example.unomobile.fragments.content

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
import com.example.unomobile.models.Content
import com.example.unomobile.network.Api
import com.google.android.material.bottomnavigation.BottomNavigationView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ContentFragment : Fragment() {

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
        val view = inflater.inflate(R.layout.fragment_content, container, false)

        recyclerView = view.findViewById(R.id.recycler_view)
        manager = LinearLayoutManager(activity)
        recyclerView.layoutManager = manager
        recyclerView.adapter = ContentAdapter(listOf())
        getContents()
        return view
    }

    private fun getContents() {
        Api.retrofitService.getContents().enqueue(object: Callback<List<Content>>{
            override fun onResponse(call: Call<List<Content>>, response: Response<List<Content>>) {
                Log.i("ContentFragment", response.toString())
                if (response.isSuccessful) {
                    Log.i("ContentFragment", "Response is successful")
                    adapter = ContentAdapter(response.body()!!)
                    recyclerView.adapter = adapter
                    (adapter as ContentAdapter).setOnItemClickListener(object : ContentAdapter.onItemClickListener{
                        override fun onItemClick(position: Int) {
                            val week = response.body()!![position]
                            Log.i("ContentFragment", "Clicked")
                            val bundle = Bundle()
                            bundle.putInt("week_id", week.id)
                            bundle.putInt("week_number", week.week_number)
                            findNavController().navigate(R.id.action_contentFragment_to_weekContentFragment, bundle)
                        }
                    })
                }
            }

            override fun onFailure(call: Call<List<Content>>, t: Throwable) {
                t.printStackTrace()
            }
        })
    }
}