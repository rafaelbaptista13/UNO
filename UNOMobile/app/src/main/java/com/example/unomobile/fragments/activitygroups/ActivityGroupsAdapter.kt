package com.example.unomobile.fragments.activitygroups

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.unomobile.R
import com.example.unomobile.models.ActivityGroup

class ActivityGroupsAdapter(private val data: List<ActivityGroup>) : RecyclerView.Adapter<ActivityGroupsAdapter.MyViewHolder>() {

    private lateinit var mListener : onItemClickListener

    interface onItemClickListener{

        fun onItemClick(position : Int)
    }

    fun setOnItemClickListener(listener: onItemClickListener) {
        mListener = listener
    }

    class MyViewHolder(val view: View, listener: onItemClickListener): RecyclerView.ViewHolder(view) {

        val title : TextView = view.findViewById(R.id.week_title)
        val number_of_activities : TextView = view.findViewById(R.id.num_of_activities)

        init {
            view.setOnClickListener {
                listener.onItemClick(adapterPosition)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.activitygroup_list_item, parent, false)
        return MyViewHolder(v, mListener)
    }

    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        val currentItem = data[position]
        holder.title.text = currentItem.name
        var activities = ""
        if (currentItem.number_of_videos > 0) {
            activities += currentItem.number_of_videos.toString() + " vídeos\n"
        }
        if (currentItem.number_of_exercises > 0) {
            activities += currentItem.number_of_exercises.toString() + " exercícios\n"
        }
        holder.number_of_activities.text = activities

    }

    override fun getItemCount(): Int {
        return data.size
    }

}
