package com.example.unomobile.fragments

import android.net.Uri
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import android.widget.VideoView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.example.unomobile.R
import com.example.unomobile.models.Activity
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.Api
import com.google.gson.Gson
import com.squareup.picasso.Picasso
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ActivityFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_activity, container, false)

        val back_button = view.findViewById<ImageView>(R.id.back_button)
        back_button.setOnClickListener {
            Log.i("ActivityFragment", "Back Button clicked")
            findNavController().navigateUp()
        }

        val sharedPreferences = requireActivity().getSharedPreferences("data", AppCompatActivity.MODE_PRIVATE)
        val gson = Gson()
        val user_info = sharedPreferences.getString("user", "")
        val user = gson.fromJson(user_info, UserInfo::class.java)

        val type_text = view.findViewById<TextView>(R.id.type)
        type_text.text = arguments?.getInt("order").toString() + ". " + arguments?.getString("type")
        val title_text = view.findViewById<TextView>(R.id.title)
        title_text.text = arguments?.getString("title")

        val image = view.findViewById<ImageView>(R.id.image_view)
        val video = view.findViewById<VideoView>(R.id.video_view)
        val play_button = view.findViewById<ImageButton>(R.id.play_button)
        val pause_button = view.findViewById<ImageButton>(R.id.pause_button)

        lifecycleScope.launch {
            try {
                val call = Api.retrofitService.getActivity(user.class_id!!, arguments?.getInt("activity_id"))

                call.enqueue(object : Callback<Activity> {
                    override fun onResponse(call: Call<Activity>, response: Response<Activity>) {
                        Log.i("ActivityFragment", response.isSuccessful.toString());
                        if (response.isSuccessful) {
                            val activity_data = response.body()
                            if (activity_data!!.activitytype.name == "Media") {
                                // Get media type
                                Log.i("ActivityFragment", activity_data.toString());
                                Log.i("ActivityFragment", activity_data!!.media!!.media_type);
                                val media_type = activity_data!!.media!!.media_type.split("/")[0]

                                Log.i("ActivityFragment", media_type);
                                val media_path = "http://localhost:8080/api/activities/" + user.class_id!! + "/" + activity_data.activitygroup_id + "/" + activity_data.id + "/media"
                                if (media_type == "image") {
                                    image.visibility = View.VISIBLE
                                    video.visibility = View.GONE
                                    play_button.visibility = View.GONE
                                    pause_button.visibility = View.GONE

                                    Log.i("ActivityFragment", media_path);
                                    Picasso.get().load(media_path).into(image)
                                } else if (media_type == "video") {
                                    image.visibility = View.GONE
                                    video.visibility = View.VISIBLE
                                    play_button.visibility = View.GONE
                                    pause_button.visibility = View.GONE
                                    val videoUri = Uri.parse(media_path)
                                    video.setVideoURI(videoUri)
                                    video.start()
                                } else if (media_type == "audio") {
                                    image.visibility = View.GONE
                                    video.visibility = View.GONE
                                    play_button.visibility = View.VISIBLE
                                    pause_button.visibility = View.VISIBLE
                                }

                            }
                        }
                    }

                    override fun onFailure(call: Call<Activity>, t: Throwable) {
                        Log.i("ActivityFragment", "aqio");
                        TODO("Not yet implemented")

                    }
                })

            } catch (e: Exception) {
                Log.e("ActivityFragment", e.toString())
            }
        }

        return view
    }

}