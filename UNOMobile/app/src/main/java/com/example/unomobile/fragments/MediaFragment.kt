package com.example.unomobile.fragments

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.pm.ActivityInfo
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.example.unomobile.R
import com.example.unomobile.models.Activity
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.Api
import com.example.unomobile.network.client
import com.example.unomobile.utils.ImageLoader
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.MediaItem
import com.google.android.exoplayer2.ext.okhttp.OkHttpDataSource
import com.google.android.exoplayer2.source.ProgressiveMediaSource
import com.google.android.exoplayer2.ui.StyledPlayerView
import com.google.gson.Gson
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MediaFragment : Fragment() {

    private var player: ExoPlayer? = null
    private var playerView: StyledPlayerView? = null
    private var currentPlayer: StyledPlayerView? = null
    private var media_path: String? = null

    private var title: String? = null
    private var description: String? = null
    private var order: Int? = null
    private var activity_id: Int? = null

    companion object {
        fun newInstance(activity_id: Int, order: Int, title: String, description: String) = MediaFragment().apply {
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
            Log.i("asd", "Nao sou null")
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

        val type_text = view.findViewById<TextView>(R.id.type)
        type_text.text = order.toString() + ". Conteúdo"
        val title_text = view.findViewById<TextView>(R.id.title)
        title_text.text = title
        val description_text = view.findViewById<TextView>(R.id.description)
        description_text.text = description

        Log.i("MediaFragment", order.toString())
        Log.i("MediaFragment", activity_id.toString())
        Log.i("MediaFragment", title.toString())
        Log.i("MediaFragment", description.toString())

        val image = view.findViewById<ImageView>(R.id.image_view)
        val video = view.findViewById<StyledPlayerView>(R.id.video_view)
        val play_button = view.findViewById<ImageButton>(R.id.play_button)
        val pause_button = view.findViewById<ImageButton>(R.id.pause_button)

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
                            if (activity_data!!.activitytype.name == "Media") {
                                // Get media type
                                val media_type = activity_data.media!!.media_type.split("/")[0]

                                Log.i("ActivityFragment", media_type);
                                media_path = com.example.unomobile.network.BASE_URL + "activities/" + user.class_id + "/" + activity_data.activitygroup_id + "/" + activity_data.id + "/media"

                                when (media_type) {
                                    "image" -> {
                                        image.visibility = View.VISIBLE
                                        video.visibility = View.GONE
                                        play_button.visibility = View.GONE
                                        pause_button.visibility = View.GONE

                                        ImageLoader.picasso.load(media_path).into(image)
                                    }
                                    "video" -> {
                                        image.visibility = View.GONE
                                        video.visibility = View.VISIBLE
                                        play_button.visibility = View.GONE
                                        pause_button.visibility = View.GONE

                                        playerView = video
                                        currentPlayer = playerView
                                        Log.i("MediaFragment", "vou chamar")
                                        setFullScreenListener()
                                    }
                                    "audio" -> {
                                        image.visibility = View.GONE
                                        video.visibility = View.VISIBLE
                                        play_button.visibility = View.GONE
                                        pause_button.visibility = View.GONE

                                        playerView = video
                                        currentPlayer = playerView
                                        setFullScreenListener()
                                    }
                                }

                            }
                        }
                    }

                    override fun onFailure(call: Call<Activity>, t: Throwable) {
                        Log.i("ActivityFragment", "Failed request");
                        Log.i("ActivityFrament", t.message!!)
                        TODO("Not yet implemented")

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
        player = ExoPlayer.Builder(requireContext()).build()
        playerView?.player = player

        val uri = Uri.parse(media_path)
        val dataSourceFactory = OkHttpDataSource.Factory(
            client
        )
        val mediaSource = ProgressiveMediaSource.Factory(
            dataSourceFactory
        ).createMediaSource(MediaItem.Builder().setUri(uri).build())

        player!!.setMediaSource(mediaSource)
        player!!.prepare()

        // Set Player Properties
        player!!.playWhenReady = true
    }

    @SuppressLint("SourceLockedOrientationActivity")
    fun setFullScreenListener() {
        val fullScreenPlayerView = StyledPlayerView(requireContext())
        val dialog = object : Dialog(requireContext(), android.R.style.Theme_Black_NoTitleBar_Fullscreen){
            @Deprecated("Deprecated in Java")
            override fun onBackPressed() {
                // User pressed back button. Exit Full Screen Mode.
                playerView?.findViewById<ImageButton>(com.google.android.exoplayer2.ui.R.id.exo_fullscreen)
                    ?.setImageResource(R.drawable.ic_fullscreen_expand)
                player?.let { StyledPlayerView.switchTargetView(it, fullScreenPlayerView, playerView) }
                currentPlayer = playerView
                //requireActivity().requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
                super.onBackPressed()
            }

        }
        dialog.addContentView(
            fullScreenPlayerView,
            ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        )
        // Adding Full Screen Button Click Listeners.
        playerView?.setFullscreenButtonClickListener {
            // If full Screen Dialog is not visible, make player full screen.
            if(!dialog.isShowing){
                dialog.show()
                Log.i("asdsd", "ENTEEIII\n\n\n")
                fullScreenPlayerView.findViewById<ImageButton>(com.google.android.exoplayer2.ui.R.id.exo_fullscreen)
                    .setImageResource(R.drawable.ic_fullscreen_shrink)
                player?.let { StyledPlayerView.switchTargetView(it, playerView, fullScreenPlayerView) }
                currentPlayer = fullScreenPlayerView
                //requireActivity().requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
            }
        }
        fullScreenPlayerView.setFullscreenButtonClickListener {
            // Exit Full Screen.
            playerView?.findViewById<ImageButton>(com.google.android.exoplayer2.ui.R.id.exo_fullscreen)
                ?.setImageResource(R.drawable.ic_fullscreen_expand)
            player?.let { StyledPlayerView.switchTargetView(it, fullScreenPlayerView, playerView) }
            currentPlayer = playerView
            //requireActivity().requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
            dialog.dismiss()
        }

        onStart()
    }

    override fun onStart() {
        super.onStart()
        if (Build.VERSION.SDK_INT > 23 && media_path != null) {
            initPlayer()
            currentPlayer?.onResume()
        }
    }

    override fun onResume() {
        super.onResume()
        if (Build.VERSION.SDK_INT <= 23 && media_path != null) {
            initPlayer()
            currentPlayer?.onResume()
        }
    }

    override fun onPause() {
        super.onPause()
        if (Build.VERSION.SDK_INT <= 23) {
            currentPlayer?.player = null
            player?.release()
            player = null
        }
    }

    override fun onStop() {
        super.onStop()
        if (Build.VERSION.SDK_INT > 23) {
            currentPlayer?.player = null
            player?.release()
            player = null
        }
    }
}