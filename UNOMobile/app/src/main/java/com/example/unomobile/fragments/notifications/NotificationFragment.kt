package com.example.unomobile.fragments.notifications

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.unomobile.MainActivity
import com.example.unomobile.R
import com.example.unomobile.activities.ActivityPageFromNotification
import com.example.unomobile.models.Notification
import com.example.unomobile.models.ResponseMessage
import com.example.unomobile.network.Api
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class NotificationFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var manager: RecyclerView.LayoutManager
    private lateinit var adapter: RecyclerView.Adapter<*>
    private lateinit var data: MutableList<Notification>

    private lateinit var _context: Context

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_notification, container, false)

        if (isAdded) {
            _context = requireContext()
        } else {
            onDestroy()
            return view
        }

        recyclerView = view.findViewById(R.id.recycler_view)
        manager = LinearLayoutManager(activity)
        recyclerView.layoutManager = manager
        recyclerView.adapter = NotificationsAdapter(listOf(), requireContext())
        getNotifications()

        return view
    }

    private fun getNotifications() {
        Api.retrofitService.getNotifications().enqueue(object: Callback<List<Notification>> {
            override fun onResponse(
                call: Call<List<Notification>>,
                response: Response<List<Notification>>
            ) {
                Log.i("NotificationFragment", "Request")
                if (response.isSuccessful) {
                    data = (response.body() as MutableList<Notification>?)!!

                    adapter = NotificationsAdapter(data, requireContext())
                    recyclerView.adapter = adapter
                    (adapter as NotificationsAdapter).setOnItemClickListener(object : NotificationsAdapter.onItemClickListener{
                        override fun onItemClick(position: Int) {
                            val currentItem = data[position]

                            if (currentItem.type == "feedback_activity") {
                                val sharedPreferences = requireActivity().getSharedPreferences("uno", AppCompatActivity.MODE_PRIVATE)
                                val editor = sharedPreferences.edit()
                                editor.putInt("activity_id", currentItem.activity_id!!)
                                editor.putInt("activity_order", currentItem.activity_order!!)
                                editor.putString("activity_title", currentItem.activity_title)
                                editor.putString("activity_type", currentItem.activity_type)
                                editor.putString("activity_description", currentItem.activity_description)
                                editor.putString("activity_game_mode", currentItem.activity_game_mode)
                                editor.putString("activitygroup_name", currentItem.activitygroup_name)
                                editor.apply()

                                val intent = Intent(requireContext(), ActivityPageFromNotification::class.java)
                                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                                startActivity(intent)
                            }

                            if (currentItem.type == "new_trophy") {
                                val intent = Intent(requireContext(), MainActivity::class.java)
                                intent.putExtra("FRAGMENT_NAME", "TROPHIES_FRAGMENT")
                                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                                startActivity(intent)
                            }
                        }

                        override fun onDeleteAreaClick(position: Int) {
                            val currentItem = data[position]

                            Api.retrofitService.deleteNotification(currentItem.id).enqueue(object : Callback<ResponseMessage> {
                                override fun onResponse(
                                    call: Call<ResponseMessage>,
                                    response: Response<ResponseMessage>
                                ) {
                                    if (response.isSuccessful) {
                                        data.removeAt(position)
                                        Log.i("NotificationFragment", data.toString())
                                        adapter.notifyItemRemoved(position)
                                    } else {
                                        Toast.makeText(_context, "Ocorreu um erro ao apagar a notificação.", Toast.LENGTH_SHORT).show()
                                    }
                                }

                                override fun onFailure(call: Call<ResponseMessage>, t: Throwable) {
                                    t.printStackTrace()
                                    Toast.makeText(_context, "Ocorreu um erro ao apagar a notificação.", Toast.LENGTH_SHORT).show()
                                }

                            })
                        }
                    })
                }
            }

            override fun onFailure(call: Call<List<Notification>>, t: Throwable) {
                t.printStackTrace()
                Toast.makeText(_context, "Ocorreu um erro ao obter as notificações.", Toast.LENGTH_SHORT).show()
            }

        })
    }

}