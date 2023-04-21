package com.example.unomobile.fragments.supportmaterials

import android.content.Context
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
import com.google.android.material.card.MaterialCardView

class SupportMaterialsAdapter(private val data: List<SupportMaterial>, val context: Context) : RecyclerView.Adapter<SupportMaterialsAdapter.MyViewHolder>() {

    private lateinit var mListener : onItemClickListener

    interface onItemClickListener{

        fun onItemClick(position : Int)
    }

    fun setOnItemClickListener(listener: onItemClickListener) {
        mListener = listener
    }

    class MyViewHolder(val view: View, listener: onItemClickListener): RecyclerView.ViewHolder(view) {
        val material_order : TextView = view.findViewById(R.id.supportmaterial_order)
        val material_title : TextView = view.findViewById(R.id.supportmaterial_title)

        init {
            view.setOnClickListener {
                listener.onItemClick(adapterPosition)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.supportmaterial_list_item, parent, false)
        return MyViewHolder(v, mListener)
    }

    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        val currentItem = data[position]
        holder.material_order.text = currentItem.order.toString() + "."
        holder.material_title.text = currentItem.title
    }

    override fun getItemCount(): Int {
        return data.size
    }

}
