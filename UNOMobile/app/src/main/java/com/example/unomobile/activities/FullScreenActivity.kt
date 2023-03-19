package com.example.unomobile.activities

import android.content.pm.ActivityInfo
import android.net.Uri
import android.os.Build
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.ImageButton
import androidx.core.content.ContentProviderCompat.requireContext
import com.example.unomobile.R
import com.example.unomobile.network.client
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.MediaItem
import com.google.android.exoplayer2.ext.okhttp.OkHttpDataSource
import com.google.android.exoplayer2.source.ProgressiveMediaSource
import com.google.android.exoplayer2.ui.StyledPlayerView

class FullScreenActivity : AppCompatActivity() {

    private var player: ExoPlayer? = null
    private var playerView: StyledPlayerView? = null
    private var media_path: String? = null
    private var uri: Uri? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_full_screen_media)

        val bundle = intent.extras
        media_path = bundle?.getString("media_path")
        if (media_path == null) {
            uri = intent.getParcelableExtra("uri")
            Log.i("FullscreenActivity", uri!!.path!!)
        }


        playerView = findViewById(R.id.video_view)
        playerView?.findViewById<ImageButton>(com.google.android.exoplayer2.ui.R.id.exo_fullscreen)
            ?.setImageResource(R.drawable.ic_fullscreen_shrink)

        playerView?.setFullscreenButtonClickListener {
            this.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
            super.onBackPressed()
        }

        initPlayer()

    }

    override fun onBackPressed() {
        // User pressed back button. Exit Full Screen Mode.
        this.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        super.onBackPressed()
    }

    private fun initPlayer() {
        // Create an ExoPlayer and set it as the player for content.
        player = ExoPlayer.Builder(this).build()
        playerView?.player = player

        if (media_path != null) {
            val uri = Uri.parse(media_path)
            val dataSourceFactory = OkHttpDataSource.Factory(
                client
            )
            val mediaSource = ProgressiveMediaSource.Factory(
                dataSourceFactory
            ).createMediaSource(MediaItem.Builder().setUri(uri).build())

            player!!.setMediaSource(mediaSource)
        } else {
            player!!.setMediaItem(MediaItem.Builder().setUri(uri).build())
        }

        player!!.prepare()

        // Set Player Properties
        player!!.playWhenReady = true
    }

    override fun onResume() {
        super.onResume()
        if (Build.VERSION.SDK_INT <= 23 && media_path != null) {
            initPlayer()
            playerView?.onResume()
        }
    }

    override fun onPause() {
        super.onPause()
        if (Build.VERSION.SDK_INT <= 23) {
            playerView?.player = null
            player?.release()
            player = null
        }
    }

    override fun onStop() {
        super.onStop()
        if (Build.VERSION.SDK_INT > 23) {
            playerView?.player = null
            player?.release()
            player = null
        }
    }

}