package com.example.unomobile.utils

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.util.AttributeSet
import android.util.TypedValue
import android.view.View
import android.view.ViewGroup
import android.widget.TableRow
import androidx.appcompat.content.res.AppCompatResources
import com.bumptech.glide.Glide.init
import com.example.unomobile.R

class MusicalNoteView(context: Context?, attrs: AttributeSet?) : View(context, attrs) {

    private val paint = Paint().apply {
        color = Color.WHITE
        textSize = 16.dpToPx().toFloat()
        isAntiAlias = true
    }
    private var text: String = ""

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
        val fontMetrics = paint.fontMetrics
        val baseline = height / 2f - fontMetrics.top / 2f - fontMetrics.bottom / 2f

        canvas.drawText(text, centerX, baseline, paint)
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

}