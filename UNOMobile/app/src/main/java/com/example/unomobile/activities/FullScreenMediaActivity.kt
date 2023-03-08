package com.example.unomobile.activities

import android.content.pm.ActivityInfo
import android.net.Uri
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.ImageButton
import androidx.core.content.ContentProviderCompat.requireContext
import com.example.unomobile.R
import com.example.unomobile.network.client
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.MediaItem
import com.google.android.exoplayer2.ext.okhttp.OkHttpDataSource
import com.google.android.exoplayer2.source.ProgressiveMediaSource
import com.google.android.exoplayer2.ui.StyledPlayerView

class FullScreenMediaActivity : AppCompatActivity() {

    private var player: ExoPlayer? = null
    private var playerView: StyledPlayerView? = null
    private var currentPlayer: StyledPlayerView? = null
    private var media_path: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_full_screen_media)

        val bundle = intent.extras
        media_path = bundle?.getString("media_path")

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

}