package com.example.unomobile.network

import android.content.Context
import android.content.Intent
import android.util.Log
import com.example.unomobile.BuildConfig
import com.example.unomobile.activities.LoginActivity
import com.example.unomobile.models.*
import com.google.android.exoplayer2.ext.okhttp.OkHttpDataSource
import com.google.android.exoplayer2.upstream.cache.CacheDataSource
import com.google.android.exoplayer2.upstream.cache.LeastRecentlyUsedCacheEvictor
import com.google.android.exoplayer2.upstream.cache.SimpleCache
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.*
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Call
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.*
import java.io.File
import java.net.CookieManager
import java.security.SecureRandom
import java.security.cert.X509Certificate
import java.util.concurrent.TimeUnit
import javax.net.ssl.*


var BASE_URL = if (BuildConfig.IS_DEVELOPMENT_MODE) {
    Log.i("ApiService", BuildConfig.IS_DEVELOPMENT_MODE.toString())
    "http://10.0.2.2:8080/api/"
} else {
    Log.i("ApiService", BuildConfig.IS_DEVELOPMENT_MODE.toString())
    "https://deti-viola.ua.pt/rb-md-violuno-app-v1/internal-api/api/"
}

private val moshi = Moshi.Builder().add(KotlinJsonAdapterFactory()).build()
private val interceptor = HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.NONE)
val cookieHandler = CookieManager()

// Cache for ExoPlayer
object CacheManager {
    private var cacheDataSourceFactory: CacheDataSource.Factory? = null
    private lateinit var cache: SimpleCache

    fun init(context: Context) {
        val cacheDir = File(context.cacheDir, "media_cache")
        if (!cacheDir.exists()) {
            cacheDir.mkdirs()
        }
        cache = SimpleCache(cacheDir, LeastRecentlyUsedCacheEvictor(100 * 1024 * 1024)) // 100 MB cache
    }

    fun getCacheDataSourceFactory(client: OkHttpClient): CacheDataSource.Factory {
        if (cacheDataSourceFactory == null) {
            val dataSourceFactory = OkHttpDataSource.Factory(client)
            cacheDataSourceFactory = CacheDataSource.Factory()
                .setCache(cache)
                .setUpstreamDataSourceFactory(dataSourceFactory)
        }
        return cacheDataSourceFactory!!
    }

    fun getCache(): SimpleCache {
        return cache
    }
}


object TrustAllCerts {
    val trustManager = object : X509TrustManager {
        override fun checkClientTrusted(chain: Array<out X509Certificate>?, authType: String?) {}
        override fun checkServerTrusted(chain: Array<out X509Certificate>?, authType: String?) {}
        override fun getAcceptedIssuers(): Array<X509Certificate> = emptyArray()
    }

    private val sslContext = SSLContext.getInstance("SSL").apply {
        init(null, arrayOf(trustManager), SecureRandom())
    }

    val sslSocketFactory = sslContext.socketFactory

    val hostnameVerifier = HostnameVerifier { _, _ -> true }
}

interface ApiService {

    @GET("activitygroup/{class_id}")
    fun getActivityGroups(@Path("class_id") class_id: Number): Call<List<ActivityGroup>>

    @GET("activities/{class_id}")
    fun getActivities(@Path("class_id") class_id: Number, @Query("activitygroup_id") activitygroup_id: String): Call<List<Activity>>

    @GET("activities/{class_id}/{activity_id}")
    fun getActivity(@Path("class_id") class_id: Number, @Path("activity_id") activity_id: Int?): Call<Activity>

    @POST("activities/{class_id}/{activity_id}/media/submit")
    fun submitMediaActivity(@Path("class_id") class_id: Number, @Path("activity_id") activity_id: Number): Call<ResponseBody>

    @Multipart
    @POST("activities/{class_id}/{activity_id}/exercise/submit")
    fun submitExerciseActivity(@Path("class_id") class_id: Number, @Path("activity_id") activity_id: Number, @Part media: MultipartBody.Part): Call<ResponseBody>

    @POST("activities/{class_id}/{activity_id}/question/submit")
    fun submitQuestionActivity(@Path("class_id") class_id: Number, @Path("activity_id") activity_id: Number, @Body chosen_answers: Map<String, Array<Int>>): Call<ResponseBody>

    @Multipart
    @POST("activities/{class_id}/{activity_id}/game/play/submit")
    fun submitGamePlayModeActivity(@Path("class_id") class_id: Number, @Path("activity_id") activity_id: Number, @Part media: MultipartBody.Part): Call<ResponseBody>

    @POST("activities/{class_id}/{activity_id}/game/identify/submit")
    fun submitGameIdentifyModeActivity(@Path("class_id") class_id: Number, @Path("activity_id") activity_id: Number): Call<ResponseBody>

    @Multipart
    @POST("activities/{class_id}/{activity_id}/game/build/submit")
    fun submitGameBuildModeActivity(@Path("class_id") class_id: Number, @Path("activity_id") activity_id: Number, @Part media: MultipartBody.Part, @Part("chosen_notes") chosen_notes: Array<Int>): Call<ResponseBody>

    @GET("supportmaterials/{class_id}")
    fun getSupportMaterials(@Path("class_id") class_id: Number): Call<List<SupportMaterial>>

    @GET("trophies")
    fun getTrophies(): Call<List<Trophy>>

    @GET("activities/completed")
    fun getCompletedActivities(): Call<CompletedActivites>

    @POST("auth/student/signup")
    fun createAccount(@Body user_data: UserInfoToRegister): Call<ResponseMessage>

    @POST("auth/signin")
    fun login(@Body user_data: UserInfoToLogin): Call<UserInfo>

    @POST("auth/signout")
    fun logout(@Body device_token: DeviceToken): Call<ResponseMessage>
}

object Api {

    private lateinit var retrofit: Retrofit

    lateinit var client: OkHttpClient

    val retrofitService: ApiService
        get() = retrofit.create(ApiService::class.java)

    fun init(context: Context) {
        val redirectInterceptor = Interceptor { chain ->
            val request = chain.request()
            val response = chain.proceed(request)
            if (response.code == 403) {
                // Redirect the user to the login activity
                Log.i("ApiService", "Entrei aqui")
                val intent = Intent(context, LoginActivity::class.java)
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                context.startActivity(intent)
            }
            response
        }

        client = OkHttpClient.Builder()
            .addNetworkInterceptor(interceptor)
            .cookieJar(JavaNetCookieJar(cookieHandler))
            .addInterceptor(redirectInterceptor)
            .connectTimeout(10, TimeUnit.SECONDS)
            .writeTimeout(10, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .sslSocketFactory(TrustAllCerts.sslSocketFactory, TrustAllCerts.trustManager)
            .hostnameVerifier(TrustAllCerts.hostnameVerifier)
            .build()

        retrofit = Retrofit.Builder()
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .baseUrl(BASE_URL)
            .client(client)
            .build()
    }
}