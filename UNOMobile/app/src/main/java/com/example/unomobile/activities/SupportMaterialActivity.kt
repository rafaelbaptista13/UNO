package com.example.unomobile.activities

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.AttributeSet
import android.util.Log
import android.view.View
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.AppCompatButton
import androidx.navigation.fragment.findNavController
import com.example.unomobile.R
import com.example.unomobile.fragments.*
import com.example.unomobile.fragments.questions.QuestionFragment
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.Api
import com.example.unomobile.network.client
import com.example.unomobile.utils.ImageLoader
import com.example.unomobile.utils.dpToPx
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.MediaItem
import com.google.android.exoplayer2.ext.okhttp.OkHttpDataSource
import com.google.android.exoplayer2.source.ProgressiveMediaSource
import com.google.android.exoplayer2.ui.StyledPlayerView
import com.google.gson.Gson
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class SupportMaterialActivity : AppCompatActivity() {

    private var player: ExoPlayer? = null
    private var playerView: StyledPlayerView? = null
    private var media_path: String? = null
    private var media_type: String? = null

    private var title: String? = null
    private var description: String? = null
    private var order: Int? = null
    private var supportmaterial_id: Int? = null
    private var user: UserInfo? = null

    private lateinit var image: ImageView
    private lateinit var video: StyledPlayerView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_supportmaterial)

        val back_button = findViewById<ImageView>(R.id.back_button)
        back_button.setOnClickListener {
            Log.i("MaterialActivity", "Back Button clicked")
            onBackPressed()
        }

        val sharedPreferences = this.getSharedPreferences("data", AppCompatActivity.MODE_PRIVATE)
        val gson = Gson()
        val user_info = sharedPreferences.getString("user", "")
        user = gson.fromJson(user_info, UserInfo::class.java)

        val bundle = intent.extras
        supportmaterial_id = bundle?.getInt("supportmaterial_id")
        order = bundle?.getInt("supportmaterial_order")
        title = bundle?.getString("supportmaterial_title")
        description = bundle?.getString("supportmaterial_description")
        media_type = bundle?.getString("supportmaterial_media_type")

        findViewById<TextView>(R.id.title).text = title
        findViewById<TextView>(R.id.description).text = description
        findViewById<TextView>(R.id.supportmaterials_header).text = order.toString() + ". Material de apoio"

        image = findViewById(R.id.image_view)
        video = findViewById(R.id.video_view)

        media_path = com.example.unomobile.network.BASE_URL + "supportmaterials/" + user!!.class_id + "/" + supportmaterial_id + "/media"

        if (media_type != null) {
            media_type = media_type!!.split("/")[0]
        }

        when (media_type) {
            "image" -> {
                ImageLoader.picasso.load(media_path).into(image)

                image.visibility = View.VISIBLE
                video.visibility = View.GONE
            }
            "video" -> {
                image.visibility = View.GONE
                video.visibility = View.VISIBLE

                val params = video.layoutParams
                params.height = 150.dpToPx(this)
                video.layoutParams = params
                playerView = video
                setFullScreenListener()
                initPlayer()
            }
            "audio" -> {
                image.visibility = View.GONE
                video.visibility = View.VISIBLE

                val params = video.layoutParams
                params.height = 50.dpToPx(this)
                video.layoutParams = params
                playerView = video
                setFullScreenListener()
                initPlayer()
            }
        }
    }

    @SuppressLint("SourceLockedOrientationActivity")
    fun setFullScreenListener() {
        // Adding Full Screen Button Click Listeners.
        playerView?.setFullscreenButtonClickListener {
            var intent = Intent(this, FullScreenActivity::class.java)
            var bundle = Bundle()
            bundle.putString("media_path", media_path)
            intent.putExtras(bundle)
            startActivity(intent)
        }
    }

    private fun initPlayer() {
        // Create an ExoPlayer and set it as the player for content.
        player = ExoPlayer.Builder(this).build()
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
        Log.i("MaterialActivity", "OnDestroy called")
        if (media_path != null && (media_type == "video" || media_type == "audio")) {
            playerView?.player = null
            player?.release()
            player = null
        }
    }
}