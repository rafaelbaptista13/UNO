package com.example.unomobile.fragments.trophies

import android.content.Context
import android.util.Log
import com.example.unomobile.models.Activity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.unomobile.R
import com.example.unomobile.fragments.activities.ActivitiesAdapter
import com.example.unomobile.models.SupportMaterial
import com.example.unomobile.models.Trophy
import com.example.unomobile.utils.ImageLoader
import com.google.android.material.card.MaterialCardView

class TrophiesAdapter(private val data: List<Trophy>, val context: Context) : RecyclerView.Adapter<TrophiesAdapter.MyViewHolder>() {

    class MyViewHolder(val view: View): RecyclerView.ViewHolder(view) {
        val image : ImageView = view.findViewById(R.id.trophy_image)
        val name : TextView = view.findViewById(R.id.trophy_name)
        val date : TextView = view.findViewById(R.id.trophy_date)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.trophie_list_item, parent, false)
        return MyViewHolder(v)
    }

    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        val currentItem = data[position]
        holder.name.text = currentItem.name
        holder.date.text = currentItem.createdAt.split("T")[0]
        val media_path = com.example.unomobile.network.BASE_URL + "images/" + currentItem.id
        ImageLoader.picasso.load(media_path).into(holder.image)
    }

    override fun getItemCount(): Int {
        return data.size
    }

}
