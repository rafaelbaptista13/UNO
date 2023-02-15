package com.example.unomobile.network

import com.example.unomobile.models.*
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import retrofit2.Call
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

private const val BASE_URL = "http://10.0.2.2:8080/api/"

private val moshi = Moshi.Builder().add(KotlinJsonAdapterFactory()).build()
private val retrofit = Retrofit.Builder().addConverterFactory(MoshiConverterFactory.create(moshi)).baseUrl(BASE_URL).build()

interface ApiService {

    @GET("contents/weeks")
    fun getContents(): Call<List<Content>>

    @GET("activities")
    fun getActivities(@Query("weekcontent_id") weekcontent_id: String): Call<List<Activity>>

    @POST("auth/signup")
    fun createAccount(@Body user_data: UserInfoToRegister): Call<ResponseMessage>

    @POST("auth/signin")
    fun login(@Body user_data: UserInfoToLogin): Call<UserInfo>
}

object Api {

    val retrofitService: ApiService by lazy { retrofit.create(ApiService::class.java) }

}