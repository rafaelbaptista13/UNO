package com.example.unomobile.network

import com.example.unomobile.models.*
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.JavaNetCookieJar
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Call
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Query
import java.net.CookieHandler
import java.net.CookieManager
import java.util.concurrent.TimeUnit

private const val BASE_URL = "http://10.0.2.2:8080/api/"

private val moshi = Moshi.Builder().add(KotlinJsonAdapterFactory()).build()
private val interceptor = HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.BODY)

val cookieHandler = CookieManager()
private val client = OkHttpClient.Builder().addNetworkInterceptor(interceptor)
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

    @GET("contents/weeks")
    fun getContents(): Call<List<Content>>

    @GET("activities")
    fun getActivities(@Query("weekcontent_id") weekcontent_id: String): Call<List<Activity>>

    @POST("auth/signup")
    fun createAccount(@Body user_data: UserInfoToRegister): Call<ResponseMessage>

    @POST("auth/signin")
    fun login(@Body user_data: UserInfoToLogin): Call<UserInfo>

    @POST("auth/signout")
    fun logout(): Call<ResponseMessage>
}

object Api {

    val retrofitService: ApiService by lazy { retrofit.create(ApiService::class.java) }

}