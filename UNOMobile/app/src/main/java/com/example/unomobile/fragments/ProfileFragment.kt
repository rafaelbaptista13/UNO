package com.example.unomobile.fragments

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.AppCompatButton
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.example.unomobile.R
import com.example.unomobile.activities.LoginActivity
import com.example.unomobile.models.*
import com.example.unomobile.network.Api
import com.google.android.gms.tasks.OnCompleteListener
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.card.MaterialCardView
import com.google.firebase.messaging.FirebaseMessaging
import com.google.gson.Gson
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProfileFragment : Fragment() {

    private lateinit var trophies_button: MaterialCardView
    private lateinit var loading_bar: ProgressBar
    private lateinit var logout_button: AppCompatButton
    private var user: UserInfo? = null

    private lateinit var _context: Context

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_profile, container, false)

        val navBar = requireActivity().findViewById<BottomNavigationView>(R.id.bottom_navigation_view)
        if (navBar != null) {
            navBar.visibility = View.VISIBLE
        }

        if (isAdded) {
            _context = requireContext()
        } else {
            onDestroy()
            return view
        }

        val sharedPreferences = requireActivity().getSharedPreferences("data", AppCompatActivity.MODE_PRIVATE)
        val gson = Gson()
        val user_info = sharedPreferences.getString("user", "")
        user = gson.fromJson(user_info, UserInfo::class.java)
        view.findViewById<TextView>(R.id.name).text = user!!.first_name + " " + user!!.last_name

        loading_bar = view.findViewById(R.id.loading_progress_bar)

        logout_button = view.findViewById(R.id.logout_button)
        logout_button.setOnClickListener {
            logout()
        }

        val navController = findNavController()

        trophies_button = view.findViewById(R.id.trophies_button)
        trophies_button.setOnClickListener {
            navController.navigate(R.id.action_profileFragment_to_trophiesFragment)
        }

        lifecycleScope.launch {
            try {
                val call = Api.retrofitService.getCompletedActivities()

                call.enqueue(object: Callback<CompletedActivites> {
                    override fun onResponse(
                        call: Call<CompletedActivites>,
                        response: Response<CompletedActivites>
                    ) {
                        if (response.isSuccessful) {
                            view.findViewById<TextView>(R.id.activities_number).text = response.body()!!.completed_activities.toString()
                        }
                    }

                    override fun onFailure(call: Call<CompletedActivites>, t: Throwable) {
                        Log.i("ProfileFragment", "Failed request");
                        Log.i("ProfileFragment", t.message!!)
                    }

                })

            } catch (e: Exception) {
                Log.e("ProfileFragment", e.toString())
            }
        }

        return view
    }

    private fun logout() {

        logout_button.visibility = View.GONE
        loading_bar.visibility = View.VISIBLE

        val sharedPreferences = requireActivity().getSharedPreferences("data", AppCompatActivity.MODE_PRIVATE)

        FirebaseMessaging.getInstance().token.addOnCompleteListener(OnCompleteListener { task ->
            if (!task.isSuccessful) {
                Log.w("ProfileActivity", "Fetching FCM registration token failed", task.exception)
                return@OnCompleteListener
            }

            // Get the device token
            val token = task.result

            val device_token = DeviceToken(
                deviceToken = token
            )

            Api.retrofitService.logout(device_token).enqueue(object: Callback<ResponseMessage> {
                override fun onResponse(call: Call<ResponseMessage>, response: Response<ResponseMessage>) {
                    Log.i("ProfileFrament", response.toString())
                    if (response.isSuccessful) {
                        Log.i("ProfileFragment", "Response is successful")

                        val sharedPreferencesEdit = sharedPreferences.edit()
                        sharedPreferencesEdit.clear()
                        sharedPreferencesEdit.apply()

                        val intent = Intent(requireActivity(), LoginActivity::class.java)
                        startActivity(intent)
                    } else {
                        Toast.makeText(_context, "Ocorreu um erro ao sair da conta.", Toast.LENGTH_SHORT).show()
                        logout_button.visibility = View.VISIBLE
                        loading_bar.visibility = View.GONE
                    }
                }

                override fun onFailure(call: Call<ResponseMessage>, t: Throwable) {
                    logout_button.visibility = View.VISIBLE
                    loading_bar.visibility = View.GONE
                    Toast.makeText(_context, "Ocorreu um erro ao sair da conta. onFailure", Toast.LENGTH_SHORT).show()
                    t.printStackTrace()
                }
            })
        })

    }


}