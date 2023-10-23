package com.example.unomobile.utils

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.text.DynamicLayout
import android.text.Layout
import android.text.StaticLayout
import android.text.TextPaint
import android.util.AttributeSet
import androidx.appcompat.widget.AppCompatTextView
import androidx.core.content.ContextCompat
import com.example.unomobile.R

class BorderedTextView(context: Context, attrs: AttributeSet) : AppCompatTextView(context, attrs) {
    private val borderPaint = TextPaint()
    private val textPaint = TextPaint()

    init {
        val typedArray = context.obtainStyledAttributes(attrs, R.styleable.BorderedTextView)
        val borderColor = typedArray.getColor(
            R.styleable.BorderedTextView_borderColor,
            ContextCompat.getColor(context, R.color.primary_text)
        ) // Default border color
        typedArray.recycle()

        borderPaint.color = borderColor // Set border color
        borderPaint.textSize = textSize
        borderPaint.typeface = typeface
        borderPaint.style = Paint.Style.STROKE
        borderPaint.strokeWidth = resources.getDimension(R.dimen.border_width) // Set border width

        textPaint.color = currentTextColor
        textPaint.textSize = textSize
        textPaint.typeface = typeface
    }

    override fun onDraw(canvas: Canvas) {
        val textString = text.toString()
        val x = paddingLeft.toFloat()
        val y = paddingTop.toFloat()

        val width = width - paddingLeft - paddingRight
        val height = height - paddingTop - paddingBottom

        // Create a StaticLayout for the text
        val textLayout = StaticLayout(
            textString, textPaint, width, Layout.Alignment.ALIGN_CENTER, 1.0f, 0.0f, false
        )

        // Create a StaticLayout for the border
        val borderLayout = StaticLayout(
            textString, borderPaint, width, Layout.Alignment.ALIGN_CENTER, 1.0f, 0.0f, false
        )

        val textHeight = textLayout.height
        val textY = (height - textHeight) / 2.toFloat()

        // Draw the border around the text
        canvas.save()
        canvas.translate(x, textY)
        borderLayout.draw(canvas)
        canvas.restore()

        // Draw the text on top of the border
        canvas.save()
        canvas.translate(x, textY)
        textLayout.draw(canvas)
        canvas.restore()
    }

    fun setColor(newTextColor: Int, newBorderColor: Int) {
        textPaint.color = newTextColor
        borderPaint.color = newBorderColor
        invalidate() // triggers a redraw of the view
    }
}