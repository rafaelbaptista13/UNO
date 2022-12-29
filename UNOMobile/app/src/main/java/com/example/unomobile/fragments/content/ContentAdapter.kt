package com.example.unomobile.fragments.content

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.unomobile.R
import com.example.unomobile.models.Content

class ContentAdapter(private val data: List<Content>) : RecyclerView.Adapter<ContentAdapter.MyViewHolder>() {

    class MyViewHolder(val view: View): RecyclerView.ViewHolder(view) {

        fun bind(content: Content) {
            //val tv = view.findViewById<TextView>(R.id.list_tv)
            //tv.text = text
            val title = view.findViewById<TextView>(R.id.week_title)
            val number_of_activities = view.findViewById<TextView>(R.id.num_of_activities)

            title.text = "Semana " + content.week_number

            var activities = ""
            if (content.number_of_videos > 0) {
                activities += content.number_of_videos.toString() + " vídeos\n"
            }
            if (content.number_of_exercises > 0) {
                activities += content.number_of_exercises.toString() + " exercícios\n"
            }

            number_of_activities.text = activities
        }

    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.content_list_item, parent, false)
        return MyViewHolder(v)
    }

    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        holder.bind(data[position])
    }

    override fun getItemCount(): Int {
        return data.size
    }

}