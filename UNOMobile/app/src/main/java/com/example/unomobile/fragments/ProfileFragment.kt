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
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.AppCompatButton
import com.example.unomobile.R
import com.example.unomobile.activities.LoginActivity
import com.example.unomobile.models.DeviceToken
import com.example.unomobile.models.ResponseMessage
import com.example.unomobile.models.UserInfoToLogin
import com.example.unomobile.network.Api
import com.google.android.gms.tasks.OnCompleteListener
import com.google.firebase.messaging.FirebaseMessaging
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProfileFragment : Fragment() {

    private lateinit var loading_bar: ProgressBar
    private lateinit var logout_button: AppCompatButton

    private lateinit var _context: Context

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_profile, container, false)

        if (isAdded) {
            _context = requireContext()
        } else {
            onDestroy()
            return view
        }

        loading_bar = view.findViewById(R.id.loading_progress_bar)

        logout_button = view.findViewById(R.id.logout_button)
        logout_button.setOnClickListener {
            logout()
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