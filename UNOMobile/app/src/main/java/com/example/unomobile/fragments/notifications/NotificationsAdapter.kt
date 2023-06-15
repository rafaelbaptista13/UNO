package com.example.unomobile.fragments.notifications

import android.content.Context
import com.example.unomobile.models.Activity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.recyclerview.widget.RecyclerView
import com.example.unomobile.R
import com.example.unomobile.fragments.activities.ActivitiesAdapter
import com.example.unomobile.models.Notification
import com.example.unomobile.models.SupportMaterial
import com.google.android.material.card.MaterialCardView

class NotificationsAdapter(private val data: List<Notification>, val context: Context) : RecyclerView.Adapter<NotificationsAdapter.MyViewHolder>() {

    private lateinit var mListener : onItemClickListener

    interface onItemClickListener{

        fun onItemClick(position : Int)
        fun onDeleteAreaClick(position: Int)
    }

    fun setOnItemClickListener(listener: onItemClickListener) {
        mListener = listener
    }

    class MyViewHolder(val view: View, listener: onItemClickListener): RecyclerView.ViewHolder(view) {
        val notification_area : ConstraintLayout = view.findViewById(R.id.notification_area)
        val notification_image : ImageView = view.findViewById(R.id.notification_image)
        val notification_title : TextView = view.findViewById(R.id.notification_title)
        val notification_description : TextView = view.findViewById(R.id.notification_description)
        val delete_area : ConstraintLayout = view.findViewById(R.id.delete_area)

        init {
            notification_area.setOnClickListener {
                listener.onItemClick(adapterPosition)
            }

            delete_area.setOnClickListener {
                listener.onDeleteAreaClick(adapterPosition)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.notification_list_item, parent, false)
        return MyViewHolder(v, mListener)
    }

    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        val currentItem = data[position]

        if (currentItem.type == "feedback_activity") {
            holder.notification_image.setImageResource(context.resources.getIdentifier("feedback_icon", "drawable", context.packageName))
        }
        if (currentItem.type == "new_trophy") {
            holder.notification_image.setImageResource(context.resources.getIdentifier("trophy_icon", "drawable", context.packageName))
        }
        holder.notification_title.text = currentItem.title
        holder.notification_description.text = currentItem.message
    }

    override fun getItemCount(): Int {
        return data.size
    }

}
