package com.example.unomobile.utils

import android.content.Context
import android.graphics.Canvas
import android.util.AttributeSet
import android.util.TypedValue
import android.view.View
import android.view.ViewGroup
import android.widget.TableRow
import androidx.appcompat.content.res.AppCompatResources
import com.example.unomobile.R

class MusicalNoteView(context: Context?, attrs: AttributeSet?) : View(context, attrs) {

    init {
        // Set the background color for the view
        background = AppCompatResources.getDrawable(context!!, R.drawable.circle_note)
        val layoutParams = TableRow.LayoutParams(30.dpToPx(), 30.dpToPx())
        layoutParams.setMargins(15.dpToPx(), 0, 15.dpToPx(), 0)
        this.layoutParams = layoutParams
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
    }

    private fun Int.dpToPx(): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP, this.toFloat(), resources.displayMetrics
        ).toInt()
    }

}