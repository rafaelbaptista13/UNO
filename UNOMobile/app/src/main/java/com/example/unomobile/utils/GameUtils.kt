package com.example.unomobile.utils

import android.content.Context
import android.graphics.drawable.GradientDrawable
import android.view.View
import android.widget.LinearLayout
import androidx.core.content.ContextCompat
import com.example.unomobile.R
import com.example.unomobile.models.MusicalNote
import com.google.android.material.card.MaterialCardView

fun showSolution(notes: Array<MusicalNote>, string1: LinearLayout, string2: LinearLayout, string3: LinearLayout, string4: LinearLayout, context: Context): Array<MusicalNoteView> {
    var notes_views = arrayOf<MusicalNoteView>()
    for (note in notes) {
        val note_view = MusicalNoteView(context, null)
        notes_views = notes_views.plus(note_view)

        if (note.violin_string == 1) {
            string1.addView(note_view)
            addInvisibleView(string2, context)
            addInvisibleView(string3, context)
            addInvisibleView(string4, context)
            if (note.type == "LeftTriangle") {
                updateMusicalNoteViewToLeftTriangle(note_view, note, R.drawable.left_triangle_blue, context)
            }
            if (note.type == "RightTriangle") {
                updateMusicalNoteViewToRightTriangle(note_view, note, R.drawable.right_triangle_blue, context)
            }
            if (note.type == "Circle") {
                updateMusicalNoteViewToCircle(note_view, note, R.color.musical_note_blue, context)
            }
        }
        if (note.violin_string == 2) {
            string2.addView(note_view)
            addInvisibleView(string1, context)
            addInvisibleView(string3, context)
            addInvisibleView(string4, context)
            if (note.type == "LeftTriangle") {
                updateMusicalNoteViewToLeftTriangle(note_view, note, R.drawable.left_triangle_yellow, context)
            }
            if (note.type == "RightTriangle") {
                updateMusicalNoteViewToRightTriangle(note_view, note, R.drawable.right_triangle_yellow, context)
            }
            if (note.type == "Circle") {
                updateMusicalNoteViewToCircle(note_view, note, R.color.musical_note_yellow, context)
            }
        }
        if (note.violin_string == 3) {
            string3.addView(note_view)
            addInvisibleView(string2, context)
            addInvisibleView(string1, context)
            addInvisibleView(string4, context)
            if (note.type == "LeftTriangle") {
                updateMusicalNoteViewToLeftTriangle(note_view, note, R.drawable.left_triangle_red, context)
            }
            if (note.type == "RightTriangle") {
                updateMusicalNoteViewToRightTriangle(note_view, note, R.drawable.right_triangle_red, context)
            }
            if (note.type == "Circle") {
                updateMusicalNoteViewToCircle(note_view, note, R.color.musical_note_red, context)
            }
        }
        if (note.violin_string == 4) {
            string4.addView(note_view)
            addInvisibleView(string2, context)
            addInvisibleView(string3, context)
            addInvisibleView(string1, context)
            if (note.type == "LeftTriangle") {
                updateMusicalNoteViewToLeftTriangle(note_view, note, R.drawable.left_triangle_green, context)
            }
            if (note.type == "RightTriangle") {
                updateMusicalNoteViewToRightTriangle(note_view, note, R.drawable.right_triangle_green, context)
            }
            if (note.type == "Circle") {
                updateMusicalNoteViewToCircle(note_view, note, R.color.musical_note_green, context)
            }
        }
    }
    return notes_views
}

fun addInvisibleView(string: LinearLayout, context: Context) {
    val dummyView = MusicalNoteView(context, null)
    dummyView.visibility = View.INVISIBLE
    string.addView(dummyView)
}

fun updateMusicalNoteViewToCircle(note_view: MusicalNoteView, note: MusicalNote, color: Int, context: Context) {
    note_view.setTextCircle(note.violin_finger.toString())
    val circle_drawable = ContextCompat.getDrawable(context, R.drawable.circle_note) as GradientDrawable
    circle_drawable.let {
        it.setColor(ContextCompat.getColor(context, color))
        it.setStroke(2.dpToPx(context), ContextCompat.getColor(context, R.color.primary_text))
        note_view.background = it
    }
}

fun updateMusicalNoteViewToLeftTriangle(note_view: MusicalNoteView, note: MusicalNote, drawable: Int, context: Context) {
    note_view.setTextLeftTriangle(note.violin_finger.toString())
    val drawable = ContextCompat.getDrawable(context, drawable)
    note_view.background = drawable
}

fun updateMusicalNoteViewToRightTriangle(note_view: MusicalNoteView, note: MusicalNote, drawable: Int, context: Context) {
    note_view.setTextRightTriangle(note.violin_finger.toString())
    val drawable = ContextCompat.getDrawable(context, drawable)
    note_view.background = drawable
}

fun addInitialItems(string: LinearLayout, context: Context) {
    val initial_item = FinalNoteView(context, null)
    initial_item.visibility = View.INVISIBLE
    val layoutParams = initial_item.layoutParams
    layoutParams.width = 50.dpToPx(context)
    initial_item.layoutParams = layoutParams
    string.addView(initial_item)
}

fun addFinalItems(string: LinearLayout, context: Context, game_card: MaterialCardView, vertical_game_line: View) {
    val end_item = FinalNoteView(context, null)
    end_item.visibility = View.INVISIBLE
    val layoutParams = end_item.layoutParams
    layoutParams.width = game_card.right - vertical_game_line.left - 15.dpToPx(context)
    end_item.layoutParams = layoutParams
    string.addView(end_item)
}

fun createMusicalNoteViewForAvailableNotes(note: MusicalNote, context: Context): MusicalNoteView {
    val note_view = MusicalNoteView(context, null)
    var string_color = 0
    var left_triangle_drawable = 0
    var right_triangle_drawable = 0
    when (note.violin_string) {
        1 -> {
            string_color = R.color.musical_note_blue
            left_triangle_drawable = R.drawable.left_triangle_blue
            right_triangle_drawable = R.drawable.right_triangle_blue
        }
        2 -> {
            string_color = R.color.musical_note_yellow
            left_triangle_drawable = R.drawable.left_triangle_yellow
            right_triangle_drawable = R.drawable.right_triangle_yellow
        }
        3 -> {
            string_color = R.color.musical_note_red
            left_triangle_drawable = R.drawable.left_triangle_red
            right_triangle_drawable = R.drawable.right_triangle_red
        }
        4 -> {
            string_color = R.color.musical_note_green
            left_triangle_drawable = R.drawable.left_triangle_green
            right_triangle_drawable = R.drawable.right_triangle_green
        }
    }

    when (note.type) {
        "Circle" -> {
            val circle_drawable = ContextCompat.getDrawable(context, R.drawable.circle_note) as GradientDrawable
            circle_drawable.let {
                it.setColor(ContextCompat.getColor(context, string_color))
                note_view.background = it
                note_view.setTextCircle(note.name)
            }
        }
        "RightTriangle" -> {
            note_view.setTextRightTriangle(note.name)
            val drawable = ContextCompat.getDrawable(context, right_triangle_drawable)
            note_view.background = drawable
        }
        "LeftTriangle" -> {
            note_view.setTextLeftTriangle(note.name)
            val drawable = ContextCompat.getDrawable(context, left_triangle_drawable)
            note_view.background = drawable
        }
    }

    return note_view
}
