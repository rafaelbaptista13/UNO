package com.example.unomobile.fragments

import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.AppCompatButton
import com.example.unomobile.R
import com.example.unomobile.activities.LoginActivity
import com.example.unomobile.models.ResponseMessage
import com.example.unomobile.network.Api
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProfileFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_profile, container, false)

        val logout_button = view.findViewById<AppCompatButton>(R.id.logout_button)
        logout_button.setOnClickListener {
            logout()
        }

        return view
    }

    private fun logout() {

        val sharedPreferences = requireActivity().getSharedPreferences("data", AppCompatActivity.MODE_PRIVATE)

        Api.retrofitService.logout().enqueue(object: Callback<ResponseMessage> {
            override fun onResponse(call: Call<ResponseMessage>, response: Response<ResponseMessage>) {
                Log.i("ProfileFrament", response.toString())
                if (response.isSuccessful) {
                    Log.i("ProfileFragment", "Response is successful")

                    val sharedPreferencesEdit = sharedPreferences.edit()
                    sharedPreferencesEdit.clear()
                    sharedPreferencesEdit.apply()

                    val intent = Intent(requireActivity(), LoginActivity::class.java)
                    startActivity(intent)
                }
            }

            override fun onFailure(call: Call<ResponseMessage>, t: Throwable) {
                t.printStackTrace()
            }
        })
    }


}