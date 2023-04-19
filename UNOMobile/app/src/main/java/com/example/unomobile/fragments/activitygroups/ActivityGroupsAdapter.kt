package com.example.unomobile.fragments.activitygroups

import android.content.Context
import android.util.Half.toFloat
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.content.res.AppCompatResources
import androidx.core.content.ContentProviderCompat.requireContext
import androidx.recyclerview.widget.RecyclerView
import com.example.unomobile.R
import com.example.unomobile.models.ActivityGroup
import com.google.android.material.card.MaterialCardView

class ActivityGroupsAdapter(private val data: List<ActivityGroup>, val context: Context) : RecyclerView.Adapter<ActivityGroupsAdapter.MyViewHolder>() {

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
        val progress_bar : ProgressBar = view.findViewById(R.id.progressBar)
        val status : TextView = view.findViewById(R.id.status)
        val card : MaterialCardView = view.findViewById(R.id.card)
        val completed_icon : ImageView = view.findViewById(R.id.image)

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
        if (currentItem.number_of_medias > 0) {
            activities += currentItem.number_of_medias.toString() + (if(currentItem.number_of_medias > 1) " conteúdos" else " conteúdo") + "\n"
        }
        if (currentItem.number_of_exercises > 0) {
            activities += currentItem.number_of_exercises.toString() + (if(currentItem.number_of_exercises > 1) " exercícios" else " exercício") + "\n"
        }
        if (currentItem.number_of_questions > 0) {
            activities += currentItem.number_of_questions.toString() + (if(currentItem.number_of_questions > 1) " perguntas" else " pergunta") + "\n"
        }
        if (currentItem.number_of_games > 0) {
            activities += currentItem.number_of_games.toString() + (if(currentItem.number_of_games > 1) " jogos" else " jogo") + "\n"
        }
        holder.number_of_activities.text = activities.trimEnd()

        val progress = ((currentItem.completed_activities.toFloat() / currentItem.total_activities.toFloat()) * 100).toInt()
        if (progress == 100) {
            holder.card.strokeWidth = 5
            holder.completed_icon.setImageResource(context.resources.getIdentifier("trophy_complete", "drawable", context.packageName))
            holder.progress_bar.progressDrawable = AppCompatResources.getDrawable(context, R.drawable.greenprogress)
        } else {
            holder.card.strokeWidth = 0
            holder.completed_icon.setImageResource(context.resources.getIdentifier("trophy_incomplete", "drawable", context.packageName))
            holder.progress_bar.progressDrawable = AppCompatResources.getDrawable(context, R.drawable.yellowprogress)
        }
        holder.progress_bar.progress = progress
        holder.status.text = currentItem.completed_activities.toString() + "/" + currentItem.total_activities.toString() + " completo"
    }

    override fun getItemCount(): Int {
        return data.size
    }

}
