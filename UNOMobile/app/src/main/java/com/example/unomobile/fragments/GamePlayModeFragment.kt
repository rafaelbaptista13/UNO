package com.example.unomobile.fragments

import android.animation.ValueAnimator
import android.content.Context
import android.media.midi.MidiManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.util.TypedValue
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.HorizontalScrollView
import android.widget.ImageView
import android.widget.TableLayout
import android.widget.TableRow
import android.widget.TextView
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.content.res.AppCompatResources
import androidx.core.content.ContextCompat.getSystemService
import androidx.core.os.bundleOf
import androidx.lifecycle.lifecycleScope
import com.example.unomobile.R
import com.example.unomobile.models.Activity
import com.example.unomobile.models.MusicalNote
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.Api
import com.example.unomobile.utils.FinalNoteView
import com.example.unomobile.utils.MusicalNoteView
import com.google.android.material.card.MaterialCardView
import com.google.gson.Gson
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class GamePlayModeFragment : Fragment() {

    private var title: String? = null
    private var description: String? = null
    private var order: Int? = null
    private var activity_id: Int? = null

    private var notes: Array<MusicalNote>? = null

    private var vertical_game_line: View? = null
    private var game_card: MaterialCardView? = null


    companion object {
        fun newInstance(activity_id: Int, order: Int, title: String, description: String?) = GamePlayModeFragment().apply {
            arguments = bundleOf(
                "activity_id" to activity_id,
                "order" to order,
                "title" to title,
                "description" to description
            )
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (arguments != null) {
            title = arguments?.getString("title")
            description = arguments?.getString("description")
            order = arguments?.getInt("order")
            activity_id = arguments?.getInt("activity_id")
        }
    }

    @RequiresApi(Build.VERSION_CODES.M)
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_game_play_mode, container, false)

        val sharedPreferences = requireActivity().getSharedPreferences("data", AppCompatActivity.MODE_PRIVATE)
        val gson = Gson()
        val user_info = sharedPreferences.getString("user", "")
        val user = gson.fromJson(user_info, UserInfo::class.java)

        if (activity_id == null) {
            return view
        }

        val type_text = view.findViewById<TextView>(R.id.type)
        type_text.text = order.toString() + ". Conteúdo"
        val title_text = view.findViewById<TextView>(R.id.title)
        title_text.text = title
        val description_text = view.findViewById<TextView>(R.id.description)
        description_text.text = description
        val string1 = view.findViewById<TableRow>(R.id.row1)
        val string2 = view.findViewById<TableRow>(R.id.row2)
        val string3 = view.findViewById<TableRow>(R.id.row3)
        val string4 = view.findViewById<TableRow>(R.id.row4)
        game_card = view.findViewById(R.id.game_card)
        vertical_game_line = view.findViewById(R.id.vertical_game_line)

        val horizontal_scroll_view = view.findViewById<HorizontalScrollView>(R.id.horizontal_scroll_view)
        val play_button = view.findViewById<ImageView>(R.id.play_button)
        val pause_button = view.findViewById<ImageView>(R.id.pause_button)
        play_button.setOnClickListener {
            it.visibility = View.GONE
            pause_button.visibility = View.VISIBLE
            // Calculate the maximum scroll position
            val childView = horizontal_scroll_view.getChildAt(0)
            val maxScrollX = childView.width - horizontal_scroll_view.width

            // Create a value animator to animate the scroll position
            val animator = ValueAnimator.ofInt(horizontal_scroll_view.scrollX, maxScrollX)
            animator.duration = 2000 // replace with the desired duration in milliseconds
            animator.addUpdateListener { valueAnimator ->
                val value = valueAnimator.animatedValue as Int
                horizontal_scroll_view.scrollTo(value, 0)
            }
            animator.start()
        }
        pause_button.setOnClickListener {
            it.visibility = View.GONE
            play_button.visibility = View.VISIBLE
            horizontal_scroll_view.scrollTo(0, 0)
        }

        Log.i("GamePlayModeFragment", order.toString())
        Log.i("GamePlayModeFragment", activity_id.toString())
        Log.i("GamePlayModeFragment", title.toString())
        Log.i("GamePlayModeFragment", description.toString())

        lifecycleScope.launch {
            try {
                val call = Api.retrofitService.getActivity(
                    user.class_id!!,
                    activity_id
                )

                call.enqueue(object : Callback<Activity> {
                    override fun onResponse(call: Call<Activity>, response: Response<Activity>) {
                        if (response.isSuccessful) {
                            Log.i("GamePlayModeFragment", response.body().toString())

                            notes = response.body()!!.game_activity!!.notes

                            addInitialItems(string1)
                            addInitialItems(string2)
                            addInitialItems(string3)
                            addInitialItems(string4)

                            for (note in notes!!) {
                                val circle = MusicalNoteView(requireContext(), null)

                                if (note.violin_string == 1) {
                                    string1.addView(circle)
                                    addInvisibleView(string2)
                                    addInvisibleView(string3)
                                    addInvisibleView(string4)
                                }
                                if (note.violin_string == 2) {
                                    string2.addView(circle)
                                    addInvisibleView(string1)
                                    addInvisibleView(string3)
                                    addInvisibleView(string4)
                                }
                                if (note.violin_string == 3) {
                                    string3.addView(circle)
                                    addInvisibleView(string2)
                                    addInvisibleView(string1)
                                    addInvisibleView(string4)
                                }
                                if (note.violin_string == 4) {
                                    string4.addView(circle)
                                    addInvisibleView(string2)
                                    addInvisibleView(string3)
                                    addInvisibleView(string1)
                                }
                            }

                            addFinalItems(string1)
                            addFinalItems(string2)
                            addFinalItems(string3)
                            addFinalItems(string4)
                        }
                    }

                    override fun onFailure(call: Call<Activity>, t: Throwable) {
                        Log.i("GamePlayModeFragment", "Failed request");
                        Log.i("GamePlayModeFragment", t.message!!)
                    }

                })
            } catch (e: Exception) {
                Log.e("MediaFragment", e.toString())
            }
        }

        return view
    }

    fun addInvisibleView(string: TableRow) {
        val dummyView = MusicalNoteView(requireContext(), null)
        dummyView.visibility = View.INVISIBLE
        string.addView(dummyView)
    }

    fun addInitialItems(string: TableRow) {
        val initial_item = FinalNoteView(requireContext(), null)
        initial_item.visibility = View.INVISIBLE
        val layoutParams = initial_item.layoutParams
        layoutParams.width = 50.dpToPx() - 15.dpToPx() + 2.dpToPx()
        initial_item.layoutParams = layoutParams
        string.addView(initial_item)
    }

    fun addFinalItems(string: TableRow) {
        val end_item = FinalNoteView(requireContext(), null)
        end_item.visibility = View.INVISIBLE
        val layoutParams = end_item.layoutParams
        layoutParams.width = game_card!!.right - vertical_game_line!!.left - 15.dpToPx()
        end_item.layoutParams = layoutParams
        string.addView(end_item)
    }

    private fun Int.dpToPx(): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP, this.toFloat(), resources.displayMetrics
        ).toInt()
    }
}