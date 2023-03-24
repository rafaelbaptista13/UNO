package com.example.unomobile.utils

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.util.TypedValue
import android.view.View
import android.view.ViewGroup
import android.widget.TableRow
import androidx.appcompat.content.res.AppCompatResources
import androidx.core.content.ContentProviderCompat.requireContext
import androidx.core.content.ContextCompat
import com.bumptech.glide.Glide.init
import com.example.unomobile.R

class MusicalNoteView(context: Context?, attrs: AttributeSet?) : View(context, attrs) {

    private val paint = Paint().apply {
        color = Color.WHITE
        textSize = 16.dpToPx().toFloat()
        isAntiAlias = true
    }
    private var text: String = ""
    private var note_type: String = ""

    init {
        // Set the background color for the view
        background = AppCompatResources.getDrawable(context!!, R.drawable.circle_note)

        val layoutParams = TableRow.LayoutParams(30.dpToPx(), 30.dpToPx())
        layoutParams.setMargins(15.dpToPx(), 0, 15.dpToPx(), 0)
        this.layoutParams = layoutParams
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        paint.textAlign = Paint.Align.CENTER
        val centerX = width / 2f
        var finalX = centerX
        val fontMetrics = paint.fontMetrics
        val baseline = height / 2f - fontMetrics.top / 2f - fontMetrics.bottom / 2f
        if (note_type == "LeftTriangle") {
            finalX += width / 4f
        } else if (note_type == "RightTriangle") {
            finalX -= width / 4f
        }

        canvas.drawText(text, finalX, baseline, paint)
    }

    private fun Int.dpToPx(): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP, this.toFloat(), resources.displayMetrics
        ).toInt()
    }

    fun setText(newText: String) {
        text = newText
        invalidate() // triggers a redraw of the view
    }

    fun setTextLeftTriangle(newText: String) {
        note_type = "LeftTriangle"
        setText(newText)
    }

    fun setTextRightTriangle(newText: String) {
        note_type = "RightTriangle"
        setText(newText)
    }

}