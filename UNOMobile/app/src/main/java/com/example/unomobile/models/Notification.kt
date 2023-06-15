package com.example.unomobile.models

data class Notification(
    val id: Int,
    val type: String,
    val title: String,
    val message: String,
    val activity_type: String?,
    val activity_id: Int?,
    val activity_order: Int?,
    val activity_title: String?,
    val activity_description: String?,
    val activitygroup_name: String?,
    val activity_game_mode: String?
    )