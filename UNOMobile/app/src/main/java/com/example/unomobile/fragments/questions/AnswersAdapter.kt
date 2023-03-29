package com.example.unomobile.fragments.questions

import android.content.Context
import android.util.TypedValue
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.unomobile.R
import com.example.unomobile.models.AnswerWithAdditionalData
import com.example.unomobile.utils.ImageLoader
import com.google.android.material.card.MaterialCardView

class AnswersAdapter(private val data: List<AnswerWithAdditionalData>, val context: Context) : RecyclerView.Adapter<AnswersAdapter.MyViewHolder>() {

    private lateinit var mListener : onItemClickListener

    interface onItemClickListener{

        fun onItemClick(position : Int)
    }

    fun setOnItemClickListener(listener: onItemClickListener) {
        mListener = listener
    }

    class MyViewHolder(val view: View, listener: onItemClickListener): RecyclerView.ViewHolder(view) {
        val order : TextView = view.findViewById(R.id.order)
        val text : TextView = view.findViewById(R.id.text)
        val image : ImageView = view.findViewById(R.id.image)
        val card : MaterialCardView = view.findViewById(R.id.card)

        init {
            view.setOnClickListener {
                listener.onItemClick(adapterPosition)
            }
        }
    }

    private fun mapNumberToLetter(number: Int): Char {
        return (number + 65).toChar()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.answer_list_item, parent, false)
        return MyViewHolder(v, mListener)
    }

    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        val currentItem = data[position]
        holder.order.text = mapNumberToLetter(currentItem.order).toString()
        holder.text.text = currentItem.answer
        if (currentItem.media_type != null) {
            holder.image.visibility = View.INVISIBLE
            val media_path = com.example.unomobile.network.BASE_URL + "activities/" + currentItem.class_id + "/" + currentItem.activity_id + "/question/answers/" + currentItem.order + "/media"
            ImageLoader.picasso.load(media_path).into(holder.image)
            holder.image.visibility = View.VISIBLE
        } else {
            holder.image.visibility = View.GONE
        }

        if (currentItem.chosen != true) {
            holder.card.strokeWidth = 0
        } else {
            holder.card.strokeWidth = dpToPx(3)
        }

    }

    override fun getItemCount(): Int {
        return data.size
    }

    private fun dpToPx(dp: Int): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP, dp.toFloat(),
            context.resources.displayMetrics
        ).toInt()
    }
}
