package com.example.unomobile.fragments

import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import androidx.navigation.fragment.findNavController
import com.example.unomobile.R

class WeekContentFragment : Fragment() {

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
        return view
    }

}