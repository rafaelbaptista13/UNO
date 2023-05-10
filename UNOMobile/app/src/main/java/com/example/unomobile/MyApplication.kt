package com.example.unomobile

import android.app.Application
import android.util.Log
import com.example.unomobile.network.Api
import com.example.unomobile.network.CacheManager
import com.example.unomobile.utils.ImageLoader

class MyApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        CacheManager.init(this)
        Api.init(this)
        ImageLoader.initialize(this, Api.client)
    }

}