package com.example.unomobile.fragments.activities

import android.content.Context
import com.example.unomobile.models.Activity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.unomobile.R

class ActivitiesAdapter(private val data: List<Activity>, val context: Context) : RecyclerView.Adapter<ActivitiesAdapter.MyViewHolder>() {

    class MyViewHolder(val view: View): RecyclerView.ViewHolder(view) {
        val activity_number : TextView = view.findViewById(R.id.activity_number)
        val activity_title : TextView = view.findViewById(R.id.activity_title)
        val activity_type : TextView = view.findViewById(R.id.activity_type)
        val activity_image : ImageView = view.findViewById(R.id.activity_image)

    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.activity_list_item, parent, false)
        return MyViewHolder(v)
    }

    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        val currentItem = data[position]
        holder.activity_number.text = currentItem.activity_number.toString() + "."
        holder.activity_title.text = currentItem.title
        holder.activity_type.text = context.resources.getString(
            context.resources.getIdentifier(currentItem.type, "string", context.packageName))
        holder.activity_image.setImageResource(context.resources.getIdentifier(currentItem.type + "_icon", "drawable", context.packageName))
    }

    override fun getItemCount(): Int {
        return data.size
    }

}
