package com.example.unomobile.models

data class AnswerWithAdditionalData(val answer: String, val order: Int, val media_type: String?, val activity_id: Int, val class_id: Int, var chosen: Boolean?)