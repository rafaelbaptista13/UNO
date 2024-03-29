package com.example.unomobile.fragments

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.example.unomobile.R
import com.example.unomobile.activities.FullScreenActivity
import com.example.unomobile.models.Activity
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.Api
import com.example.unomobile.network.CacheManager
import com.example.unomobile.network.Api.client
import com.example.unomobile.utils.ImageLoader
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.MediaItem
import com.google.android.exoplayer2.ext.okhttp.OkHttpDataSource
import com.google.android.exoplayer2.source.ProgressiveMediaSource
import com.google.android.exoplayer2.ui.StyledPlayerView
import com.google.gson.Gson
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MediaFragment : Fragment() {

    private var player: ExoPlayer? = null
    private var playerView: StyledPlayerView? = null
    private var media_path: String? = null
    private var media_type: String? = null

    private var title: String? = null
    private var description: String? = null
    private var order: Int? = null
    private var activity_id: Int? = null

    private lateinit var _context: Context

    companion object {
        fun newInstance(activity_id: Int, order: Int, title: String, description: String?) = MediaFragment().apply {
            arguments = bundleOf(
                "activity_id" to activity_id,
                "order" to order,
                "title" to title,
                "description" to description
            )
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (arguments != null) {
            title = arguments?.getString("title")
            description = arguments?.getString("description")
            order = arguments?.getInt("order")
            activity_id = arguments?.getInt("activity_id")
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_media, container, false)

        val sharedPreferences = requireActivity().getSharedPreferences("data", AppCompatActivity.MODE_PRIVATE)
        val gson = Gson()
        val user_info = sharedPreferences.getString("user", "")
        val user = gson.fromJson(user_info, UserInfo::class.java)

        if (activity_id == null) {
            return view
        }

        if (isAdded) {
            _context = requireContext()
        } else {
            onDestroy()
            return view
        }

        val type_text = view.findViewById<com.example.unomobile.utils.BorderedTextView>(R.id.type)
        type_text.text = order.toString() + ". Conteúdo"
        val title_text = view.findViewById<com.example.unomobile.utils.BorderedTextView>(R.id.title)
        title_text.text = title
        val description_text = view.findViewById<TextView>(R.id.description)
        description_text.text = description

        if (title == "Relaxamento Final") {
            type_text.setColor(ContextCompat.getColor(_context, R.color.final_relax_activity), ContextCompat.getColor(_context, R.color.final_relax_activity_border))
            title_text.setColor(ContextCompat.getColor(_context, R.color.final_relax_activity), ContextCompat.getColor(_context, R.color.final_relax_activity_border))
            description_text.setTextColor(ContextCompat.getColor(_context, R.color.final_relax_activity))
        }

        Log.i("MediaFragment", order.toString())
        Log.i("MediaFragment", activity_id.toString())
        Log.i("MediaFragment", title.toString())
        Log.i("MediaFragment", description.toString())

        val image = view.findViewById<ImageView>(R.id.image_view)
        val video = view.findViewById<StyledPlayerView>(R.id.video_view)

        lifecycleScope.launch {
            try {
                val call = Api.retrofitService.getActivity(
                    user.class_id!!,
                    activity_id
                )

                call.enqueue(object : Callback<Activity> {
                    override fun onResponse(call: Call<Activity>, response: Response<Activity>) {
                        Log.i("ActivityFragment", response.isSuccessful.toString());
                        if (response.isSuccessful) {
                            val activity_data = response.body()
                            media_path = com.example.unomobile.network.BASE_URL + "activities/" + user.class_id + "/" + activity_data!!.id + "/media"
                            if (activity_data.media_activity!!.media_type != null) {
                                // Get media type
                                media_type = activity_data.media_activity.media_type!!.split("/")[0]

                                Log.i("ActivityFragment", media_type!!);

                                when (media_type) {
                                    "image" -> {
                                        image.visibility = View.VISIBLE
                                        video.visibility = View.GONE

                                        ImageLoader.picasso.load(media_path).into(image)
                                    }
                                    "video", "audio" -> {
                                        image.visibility = View.GONE
                                        video.visibility = View.VISIBLE

                                        playerView = video
                                        setFullScreenListener()
                                        initPlayer()
                                    }
                                }

                            }
                        }
                    }

                    override fun onFailure(call: Call<Activity>, t: Throwable) {
                        Log.i("ActivityFragment", "Failed request");
                        Log.i("ActivityFragment", t.message!!)
                    }
                })


            } catch (e: Exception) {
                Log.e("MediaFragment", e.toString())
            }
        }

        return view
    }

    private fun initPlayer() {
        // Create an ExoPlayer and set it as the player for content.
        player = ExoPlayer.Builder(_context).build()
        playerView?.player = player

        val uri = Uri.parse(media_path)
        val mediaSource = ProgressiveMediaSource.Factory(CacheManager.getCacheDataSourceFactory(client))
            .createMediaSource(MediaItem.Builder().setUri(uri).build())

        player!!.setMediaSource(mediaSource)
        player!!.prepare()
    }

    @SuppressLint("SourceLockedOrientationActivity")
    fun setFullScreenListener() {
        // Adding Full Screen Button Click Listeners.
        playerView?.setFullscreenButtonClickListener {
            var intent = Intent(_context, FullScreenActivity::class.java)
            var bundle = Bundle()
            bundle.putString("media_path", media_path)
            intent.putExtras(bundle)
            startActivity(intent)
        }
    }

    override fun onResume() {
        super.onResume()
        if (media_path != null && (media_type == "video" || media_type == "audio")) {
            initPlayer()
            playerView?.onResume()
        }
    }

    override fun onPause() {
        super.onPause()
        if (media_path != null && (media_type == "video" || media_type == "audio")) {
            playerView?.player = null
            player?.release()
            player = null
        }
    }

    override fun onStop() {
        super.onStop()
        if (media_path != null && (media_type == "video" || media_type == "audio")) {
            playerView?.player = null
            player?.release()
            player = null
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.i("MediaFragment", "OnDestroy called")
        if (media_path != null && (media_type == "video" || media_type == "audio")) {
            playerView?.player = null
            player?.release()
            player = null
        }
    }
}