package com.example.unomobile.fragments.supportmaterials

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.unomobile.R
import com.example.unomobile.activities.ActivityPageActivity
import com.example.unomobile.activities.SupportMaterialActivity
import com.example.unomobile.models.SupportMaterial
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.Api
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.gson.Gson
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response


class SupportMaterialsFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var manager: RecyclerView.LayoutManager
    private lateinit var adapter: RecyclerView.Adapter<*>
    private lateinit var data: List<SupportMaterial>

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Hide Navbar
        val navBar = requireActivity().findViewById<BottomNavigationView>(R.id.bottom_navigation_view)
        navBar.visibility = View.GONE

        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_supportmaterials, container, false)
        val back_button = view.findViewById<ImageView>(R.id.back_button)
        back_button.setOnClickListener {
            Log.i("MaterialsFragment", "Back Button clicked")
            findNavController().navigate(R.id.action_supportmaterialsFragment_to_homeFragment)
            findNavController().popBackStack(R.id.supportmaterialsFragment, true)
        }

        recyclerView = view.findViewById(R.id.recycler_view)
        manager = LinearLayoutManager(activity)
        recyclerView.layoutManager = manager
        recyclerView.adapter = SupportMaterialsAdapter(listOf(), requireContext())
        getSupportMaterials()

        return view
    }

    private fun getSupportMaterials() {
        val sharedPreferences = requireActivity().getSharedPreferences("data", AppCompatActivity.MODE_PRIVATE)
        val gson = Gson()
        val user_info = sharedPreferences.getString("user", "")
        val user = gson.fromJson(user_info, UserInfo::class.java)

        Api.retrofitService.getSupportMaterials(user.class_id!!).enqueue(object: Callback<List<SupportMaterial>> {
            override fun onResponse(call: Call<List<SupportMaterial>>, response: Response<List<SupportMaterial>>) {
                Log.i("MaterialsFragment", response.toString())
                if (response.isSuccessful) {
                    Log.i("MaterialsFragment", "Response is successful")
                    data = response.body()!!

                    adapter = SupportMaterialsAdapter(data, requireContext())
                    recyclerView.adapter = adapter
                    (adapter as SupportMaterialsAdapter).setOnItemClickListener(object : SupportMaterialsAdapter.onItemClickListener{
                        override fun onItemClick(position: Int) {
                            Log.i("MaterialsFragment", "Clicked")
                            val bundle = Bundle()
                            val currentItem = data[position]
                            bundle.putInt("supportmaterial_id", currentItem.id)
                            bundle.putInt("supportmaterial_order", currentItem.order)
                            bundle.putString("supportmaterial_title", currentItem.title)
                            bundle.putString("supportmaterial_description", currentItem.description)
                            bundle.putString("supportmaterial_media_type", currentItem.media_type)

                            var intent = Intent(requireContext(), SupportMaterialActivity::class.java)
                            intent.putExtras(bundle)
                            startActivity(intent)
                        }
                    })
                }
            }

            override fun onFailure(call: Call<List<SupportMaterial>>, t: Throwable) {
                t.printStackTrace()
            }
        })
    }

}