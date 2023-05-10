package com.example.unomobile.models

data class Activity(
    val id: Int,
    val order: Int,
    val title: String,
    val description: String?,
    val activitygroup_id: Int,
    val activitytype_id: Int,
    val activitytype: ActivityType,
    var completed: Boolean?,
    val teacher_feedback: String?,
    val trophy: Trophy?,
    val media_activity: MediaActivity?,
    val exercise_activity: ExerciseActivity?,
    val question_activity: QuestionActivity?,
    val game_activity: GameActivity?
    )