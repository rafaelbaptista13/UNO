package com.example.unomobile.utils

import android.content.Context
import com.squareup.picasso.OkHttp3Downloader
import com.squareup.picasso.Picasso
import okhttp3.OkHttpClient

object ImageLoader {

    lateinit var picasso: Picasso

    fun initialize(context: Context, client: OkHttpClient) {
        picasso = Picasso.Builder(context).downloader(OkHttp3Downloader(client)).build()
        picasso.isLoggingEnabled = true
    }

}