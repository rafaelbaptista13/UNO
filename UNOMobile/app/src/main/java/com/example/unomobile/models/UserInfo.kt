package com.example.unomobile.models

data class UserInfo(val id: Int, val first_name: String, val last_name: String, val email: String, val instrument: String?, val roles: List<String>)