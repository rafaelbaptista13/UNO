package com.example.unomobile.fragments.activities

import android.content.Context
import android.util.Log
import com.example.unomobile.models.Activity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.unomobile.R
import com.google.android.material.card.MaterialCardView

class ActivitiesAdapter(private val data: List<Activity>, val context: Context) : RecyclerView.Adapter<ActivitiesAdapter.MyViewHolder>() {

    private lateinit var mListener : onItemClickListener

    interface onItemClickListener{

        fun onItemClick(position : Int)
    }

    fun setOnItemClickListener(listener: onItemClickListener) {
        mListener = listener
    }

    class MyViewHolder(val view: View, listener: onItemClickListener): RecyclerView.ViewHolder(view) {
        val activity_number : TextView = view.findViewById(R.id.activity_number)
        val activity_title : TextView = view.findViewById(R.id.activity_title)
        val activity_type : TextView = view.findViewById(R.id.activity_type)
        val activity_image : ImageView = view.findViewById(R.id.activity_image)
        val card : MaterialCardView = view.findViewById(R.id.card)
        val completed_icon : ImageView = view.findViewById(R.id.completed_icon)

        init {
            view.setOnClickListener {
                listener.onItemClick(adapterPosition)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.activity_list_item, parent, false)
        return MyViewHolder(v, mListener)
    }

    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        val currentItem = data[position]
        holder.activity_number.text = currentItem.order.toString() + "."
        holder.activity_title.text = currentItem.title
        holder.activity_type.text = context.resources.getString(
            context.resources.getIdentifier(currentItem.activitytype.name, "string", context.packageName))
        holder.activity_image.setImageResource(context.resources.getIdentifier(currentItem.activitytype.name.lowercase() + "_icon", "drawable", context.packageName))
        var current_color = ContextCompat.getColor(context, R.color.primary_text)

        when (currentItem.activitytype.name) {
            "Media" -> {
                if (currentItem.title == "Relaxamento Final") {
                    current_color = ContextCompat.getColor(context, R.color.final_relax_activity)
                } else {
                    current_color = ContextCompat.getColor(context, R.color.content)
                }
            }
            "Exercise" -> {
                current_color = ContextCompat.getColor(context, R.color.exercise)
            }
            "Question" -> {
                current_color = ContextCompat.getColor(context, R.color.question)
                holder.activity_title.text = "Hora da questão!"
            }
            "Game" -> {
                current_color = ContextCompat.getColor(context, R.color.game)
                if (currentItem.game_activity!!.mode == "Identify") {
                    holder.activity_type.text = "Jogo - Identificar"
                }
                if (currentItem.game_activity.mode == "Play") {
                    holder.activity_type.text = "Jogo - Reproduzir"
                }
                if (currentItem.game_activity.mode == "Build") {
                    holder.activity_type.text = "Jogo - Construir"
                }
            }
        }

        holder.activity_title.setTextColor(current_color)
        holder.activity_type.setTextColor(current_color)
        holder.activity_number.setTextColor(current_color)

        if (currentItem.completed == false) {
            holder.card.strokeWidth = 0
            holder.completed_icon.setImageResource(context.resources.getIdentifier("incompleted_icon", "drawable", context.packageName))
        } else {
            holder.card.strokeWidth = 5
            holder.completed_icon.setImageResource(context.resources.getIdentifier("completed_icon", "drawable", context.packageName))
        }

    }

    override fun getItemCount(): Int {
        return data.size
    }

}
