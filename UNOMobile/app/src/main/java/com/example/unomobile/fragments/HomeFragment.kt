package com.example.unomobile.fragments

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.example.unomobile.R
import com.example.unomobile.models.UserInfo
import com.google.gson.Gson

class HomeFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_home, container, false)

        val gson = Gson()
        val sharedPreferences = requireActivity().getSharedPreferences("data", AppCompatActivity.MODE_PRIVATE)
        val userInfo = gson.fromJson(sharedPreferences.getString("user", ""), UserInfo::class.java)

        if (userInfo !== null) {
            val title = view.findViewById<TextView>(R.id.title)
            title.text = "Olá " + userInfo.first_name + "!"
        }
        return view
    }

}