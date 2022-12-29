package com.example.unomobile.fragments.content

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.unomobile.R
import com.example.unomobile.models.Content
import com.example.unomobile.network.Api
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
        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_content, container, false)

        recyclerView = view.findViewById(R.id.recycler_view)
        manager = LinearLayoutManager(activity)
        recyclerView.layoutManager = manager
        getContents()
        return view
    }

    private fun getContents() {
        Api.retrofitService.getContents().enqueue(object: Callback<List<Content>>{
            override fun onResponse(call: Call<List<Content>>, response: Response<List<Content>>) {
                if (response.isSuccessful) {
                    adapter = ContentAdapter(response.body()!!)
                    recyclerView.adapter = adapter
                }
            }

            override fun onFailure(call: Call<List<Content>>, t: Throwable) {
                t.printStackTrace()
            }
        })
    }
}