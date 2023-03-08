package com.example.unomobile.network

import android.content.Context
import com.example.unomobile.models.*
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import com.squareup.picasso.OkHttp3Downloader
import com.squareup.picasso.Picasso
import okhttp3.JavaNetCookieJar
import okhttp3.OkHttpClient
import okhttp3.ResponseBody
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Call
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.*
import java.net.CookieManager
import java.util.concurrent.TimeUnit

const val BASE_URL = "http://10.0.2.2:8080/api/"

private val moshi = Moshi.Builder().add(KotlinJsonAdapterFactory()).build()
private val interceptor = HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.BODY)

val cookieHandler = CookieManager()
val client = OkHttpClient.Builder().addNetworkInterceptor(interceptor)
    .cookieJar(JavaNetCookieJar(cookieHandler))
    .connectTimeout(10, TimeUnit.SECONDS)
    .writeTimeout(10, TimeUnit.SECONDS)
    .readTimeout(30, TimeUnit.SECONDS)
    .build();

private val retrofit = Retrofit.Builder()
    .addConverterFactory(MoshiConverterFactory.create(moshi))
    .baseUrl(BASE_URL)
    .client(client)
    .build()

interface ApiService {

    @GET("activitygroup/{class_id}")
    fun getActivityGroups(@Path("class_id") class_id: Number): Call<List<ActivityGroup>>

    @GET("activities/{class_id}")
    fun getActivities(@Path("class_id") class_id: Number, @Query("activitygroup_id") activitygroup_id: String): Call<List<Activity>>

    @GET("activities/{class_id}/{activity_id}")
    fun getActivity(@Path("class_id") class_id: Number, @Path("activity_id") activity_id: Int?): Call<Activity>

    @POST("auth/student/signup")
    fun createAccount(@Body user_data: UserInfoToRegister): Call<ResponseMessage>

    @POST("auth/signin")
    fun login(@Body user_data: UserInfoToLogin): Call<UserInfo>

    @POST("auth/signout")
    fun logout(): Call<ResponseMessage>
}

object Api {

    val retrofitService: ApiService by lazy { retrofit.create(ApiService::class.java) }

}