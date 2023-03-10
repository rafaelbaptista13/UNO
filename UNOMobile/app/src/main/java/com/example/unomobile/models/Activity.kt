package com.example.unomobile.models

data class Activity(val id: Int, val order: Int, val title: String, val description: String, val activitygroup_id: Int, val activitytype_id: Int, val activitytype: ActivityType, val media: MediaActivity?, var completed: Boolean?)