package com.example.unomobile.fragments

import android.content.Context
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.AppCompatButton
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import androidx.lifecycle.lifecycleScope
import com.example.unomobile.R
import com.example.unomobile.activities.ActivityPageActivity
import com.example.unomobile.models.Activity
import com.example.unomobile.models.MusicalNote
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.Api
import com.example.unomobile.utils.*
import com.google.android.material.card.MaterialCardView
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.ResponseBody
import org.billthefarmer.mididriver.MidiDriver
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class GameIdentifyModeFragment : Fragment() {

    // User Info
    private var user: UserInfo? = null

    // Activity Elements
    private var title: String? = null
    private var description: String? = null
    private var order: Int? = null
    private var activity_id: Int? = null

    //
    private var notes: Array<MusicalNote>? = null
    private var notes_views: Array<MusicalNoteView>? = null
    private var available_notes: Set<MusicalNote>? = null
    private var chosen_notes: Array<MusicalNote?> = arrayOf()
    private var chosen_notes_views: Array<MusicalNoteView?> = arrayOf()
    private var pause_state: Boolean = false

    private var vertical_game_line: View? = null
    private var game_card: MaterialCardView? = null
    private var play_button: ImageView? = null
    private var pause_button: ImageView? = null

    private var selected_note: MusicalNote? = null
    private var selected_note_cardview: MaterialCardView? = null

    // Game Interface Elements
    private lateinit var notes_available: LinearLayout
    private lateinit var string1: LinearLayout
    private lateinit var string2: LinearLayout
    private lateinit var string3: LinearLayout
    private lateinit var string4: LinearLayout

    // Game Status Elements
    private lateinit var submit_btn: AppCompatButton
    private lateinit var correct_card: MaterialCardView
    private lateinit var incorrect_message: TextView

    private lateinit var midiDriver: MidiDriver

    companion object {
        fun newInstance(activity_id: Int, order: Int, title: String, description: String?) = GameIdentifyModeFragment().apply {
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
        midiDriver = MidiDriver.getInstance()
        notes_views = arrayOf()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_game_identify_mode, container, false)

        val sharedPreferences = requireActivity().getSharedPreferences("data", AppCompatActivity.MODE_PRIVATE)
        val gson = Gson()
        val user_info = sharedPreferences.getString("user", "")
        user = gson.fromJson(user_info, UserInfo::class.java)

        if (activity_id == null) {
            return view
        }

        val type_text = view.findViewById<TextView>(R.id.type)
        type_text.text = order.toString() + ". Jogo"
        val title_text = view.findViewById<TextView>(R.id.title)
        title_text.text = title
        val description_text = view.findViewById<TextView>(R.id.description)
        if (description != null) {
            description_text.text = description
        } else {
            description_text.visibility = View.GONE
        }

        string1 = view.findViewById(R.id.row1)
        string2 = view.findViewById(R.id.row2)
        string3 = view.findViewById(R.id.row3)
        string4 = view.findViewById(R.id.row4)
        val middle_row = view.findViewById<LinearLayout>(R.id.middle_row)
        notes_available = view.findViewById(R.id.notes_available)
        game_card = view.findViewById(R.id.game_card)
        vertical_game_line = view.findViewById(R.id.vertical_game_line)

        val horizontal_scroll_view = view.findViewById<HorizontalScrollView>(R.id.horizontal_scroll_view)
        play_button = view.findViewById<ImageView>(R.id.play_button)
        pause_button = view.findViewById<ImageView>(R.id.pause_button)
        play_button!!.setOnClickListener {
            it.visibility = View.GONE
            pause_button!!.visibility = View.VISIBLE
            midiDriver.start()
            midiDriver.write(byteArrayOf((0xC0 + 0).toByte(), 40))

            lifecycleScope.launch {
                for (note in notes!!) {

                    if (pause_state) {
                        pause_state = false
                        withContext(Dispatchers.Main) {
                            horizontal_scroll_view.scrollTo(0, 0)
                        }
                        return@launch
                    }

                    // Get Midi Code
                    val midi_code = noteToMidiMap[note.note_code]
                    if (midi_code != null) {
                        midiDriver.write(byteArrayOf(0x90.toByte(), midi_code.toByte(), 127))
                    }   // Note on

                    withContext(Dispatchers.Main) {
                        horizontal_scroll_view.smoothScrollTo(notes_views!![note.order].x.toInt() - 5.dpToPx(requireContext()), 0)
                    }

                    delay(1000)

                    if (midi_code != null) {
                        midiDriver.write(byteArrayOf(0x80.toByte(), midi_code.toByte(),0))
                    } // Note off, middle C, zero velocity
                }
                pause_button!!.visibility = View.GONE
                it.visibility = View.VISIBLE
            }
        }
        pause_button!!.setOnClickListener {
            it.visibility = View.GONE
            play_button!!.visibility = View.VISIBLE
            pause_state = true
        }

        Log.i("GameIdentifyFragment", order.toString())
        Log.i("GameIdentifyFragment", activity_id.toString())
        Log.i("GameIdentifyFragment", title.toString())
        Log.i("GameIdentifyFragment", description.toString())

        submit_btn = view.findViewById(R.id.submit)
        correct_card = view.findViewById(R.id.correct_card)
        incorrect_message = view.findViewById(R.id.incorrect_text)
        submit_btn.setOnClickListener {
            submitAnswer()
        }

        lifecycleScope.launch {
            try {
                val call = Api.retrofitService.getActivity(
                    user!!.class_id!!,
                    activity_id
                )

                call.enqueue(object : Callback<Activity> {
                    override fun onResponse(call: Call<Activity>, response: Response<Activity>) {
                        if (response.isSuccessful) {
                            val context = requireContext()
                            Log.i("GameIdentifyFragment", response.body().toString())
                            val activity_data = response.body()!!
                            notes = activity_data.game_activity!!.notes
                            available_notes = notes!!.toSet()
                            chosen_notes = arrayOfNulls(notes!!.size)
                            chosen_notes_views = arrayOfNulls(notes!!.size)

                            addInitialItems(string1, context)
                            addInitialItems(string2, context)
                            addInitialItems(string3, context)
                            addInitialItems(string4, context)
                            addInitialItems(middle_row, context)

                            // Check if user already submitted the exercise
                            if (activity_data.completed == true) {
                                notes_views = showSolution(notes!!, string1, string2, string3, string4, context)

                                selected_note = null
                                notes_available.visibility = View.GONE
                                submit_btn.visibility = View.GONE
                                incorrect_message.visibility = View.GONE
                                correct_card.visibility = View.VISIBLE
                            } else {
                                showPossibleNotes()
                                notes_views = showNotesToBeSolved(notes!!, string1, string2, string3, string4, middle_row)
                            }

                            addFinalItems(string1, context, game_card!!, vertical_game_line!!)
                            addFinalItems(string2, context, game_card!!, vertical_game_line!!)
                            addFinalItems(string3, context, game_card!!, vertical_game_line!!)
                            addFinalItems(string4, context, game_card!!, vertical_game_line!!)

                        }
                    }

                    override fun onFailure(call: Call<Activity>, t: Throwable) {
                        Log.i("GameIdentifyFragment", "Failed request");
                        Log.i("GameIdentifyFragment", t.message!!)
                    }

                })
            } catch (e: Exception) {
                Log.e("MediaFragment", e.toString())
            }
        }

        return view
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.i("GameIdentifyFragment", "OnDestroy called")
        // Release MIDI driver resources
        midiDriver.stop()
    }

    override fun onResume() {
        super.onResume()
        pause_state = false
    }

    override fun onPause() {
        super.onPause()
        pause_button!!.visibility = View.GONE
        play_button!!.visibility = View.VISIBLE
        pause_state = true
        midiDriver.stop()
    }

    private fun addHiddenItem(string: LinearLayout, note_order: Int, context: Context) {
        val item = MusicalNoteView(context, null)
        item.visibility = View.INVISIBLE
        val layoutParams = item.layoutParams
        item.layoutParams = layoutParams
        item.setOnClickListener {
            defaultMusicalNoteClickListener(item, note_order)
        }
        string.addView(item)
    }

    private fun defaultMusicalNoteClickListener(clicked_note_view: MusicalNoteView, note_order: Int) {
        if (selected_note != chosen_notes[note_order] && selected_note != null) {
            val context = requireContext()
            clicked_note_view.visibility = View.INVISIBLE
            var note_view: MusicalNoteView? = null
            when (selected_note!!.violin_string) {
                1 -> {
                    note_view = string1.getChildAt(note_order + 1) as MusicalNoteView
                    if (selected_note!!.type == "LeftTriangle") {
                        updateMusicalNoteViewToLeftTriangle(note_view, selected_note!!, R.drawable.left_triangle_blue, context)
                    }
                    if (selected_note!!.type == "RightTriangle") {
                        updateMusicalNoteViewToRightTriangle(note_view, selected_note!!, R.drawable.right_triangle_blue, context)
                    }
                    if (selected_note!!.type == "Circle") {
                        updateMusicalNoteViewToCircle(note_view, selected_note!!, R.color.musical_note_blue, context)
                    }
                    note_view.visibility = View.VISIBLE
                }
                2 -> {
                    note_view = string2.getChildAt(note_order + 1) as MusicalNoteView
                    if (selected_note!!.type == "LeftTriangle") {
                        updateMusicalNoteViewToLeftTriangle(note_view, selected_note!!, R.drawable.left_triangle_yellow, context)
                    }
                    if (selected_note!!.type == "RightTriangle") {
                        updateMusicalNoteViewToRightTriangle(note_view, selected_note!!, R.drawable.right_triangle_yellow, context)
                    }
                    if (selected_note!!.type == "Circle") {
                        updateMusicalNoteViewToCircle(note_view, selected_note!!, R.color.musical_note_yellow, context)
                    }
                    note_view.visibility = View.VISIBLE
                }
                3 -> {
                    note_view = string3.getChildAt(note_order + 1) as MusicalNoteView
                    if (selected_note!!.type == "LeftTriangle") {
                        updateMusicalNoteViewToLeftTriangle(note_view, selected_note!!, R.drawable.left_triangle_red, context)
                    }
                    if (selected_note!!.type == "RightTriangle") {
                        updateMusicalNoteViewToRightTriangle(note_view, selected_note!!, R.drawable.right_triangle_red, context)
                    }
                    if (selected_note!!.type == "Circle") {
                        updateMusicalNoteViewToCircle(note_view, selected_note!!, R.color.musical_note_red, context)
                    }
                    note_view.visibility = View.VISIBLE
                }
                4 -> {
                    note_view = string4.getChildAt(note_order + 1) as MusicalNoteView
                    if (selected_note!!.type == "LeftTriangle") {
                        updateMusicalNoteViewToLeftTriangle(note_view, selected_note!!, R.drawable.left_triangle_green, context)
                    }
                    if (selected_note!!.type == "RightTriangle") {
                        updateMusicalNoteViewToRightTriangle(note_view, selected_note!!, R.drawable.right_triangle_green, context)
                    }
                    if (selected_note!!.type == "Circle") {
                        updateMusicalNoteViewToCircle(note_view, selected_note!!, R.color.musical_note_green, context)
                    }

                }
            }

            note_view!!.visibility = View.VISIBLE
            chosen_notes[note_order] = selected_note
            chosen_notes_views[note_order] = note_view
        }
    }

    private fun submitAnswer() {
        if (notes.contentEquals(chosen_notes)) {

            val call = Api.retrofitService.submitGameIdentifyModeActivity(user!!.class_id!!, activity_id!!)

            call.enqueue(object : Callback<ResponseBody> {
                override fun onResponse(
                    call: Call<ResponseBody>,
                    response: Response<ResponseBody>
                ) {
                    if (response.isSuccessful) {
                        Toast.makeText(requireContext(), "Jogo concluído com sucesso.", Toast.LENGTH_SHORT).show()

                        var activitypageactivity = activity as? ActivityPageActivity
                        if (activitypageactivity != null) {
                            activitypageactivity.activities_status?.set(order!!-1, true)
                        }

                        selected_note = null
                        notes_available.visibility = View.GONE
                        submit_btn.visibility = View.GONE
                        incorrect_message.visibility = View.GONE
                        correct_card.visibility = View.VISIBLE
                    } else {
                        Toast.makeText(requireContext(), "Ocorreu um erro ao submeter a sequência.", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                    Toast.makeText(requireContext(), "Ocorreu um erro ao submeter a sequência.", Toast.LENGTH_SHORT).show()
                    Log.i("GameIdentifyFragment", t.message.toString())
                }
            })

        } else {
            incorrect_message.visibility = View.VISIBLE
        }
    }

    private fun showPossibleNotes() {
        val context = requireContext()
        for (note in available_notes!!) {
            val note_view = createMusicalNoteViewForAvailableNotes(note, context)

            val card_view = MaterialCardView(context)
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(10.dpToPx(context), 10.dpToPx(context), 0, 15.dpToPx(context))
            card_view.layoutParams = params
            card_view.cardElevation = 10.dpToPx(context).toFloat()
            card_view.radius = 20.dpToPx(context).toFloat()
            card_view.setOnClickListener {
                Log.i("GameIdentifyFragment", it.toString())
                if (selected_note_cardview == null) {
                    selected_note_cardview = card_view
                    selected_note = note
                    card_view.strokeWidth = 2.dpToPx(context)
                    card_view.strokeColor = ContextCompat.getColor(context, R.color.primary_text)
                } else if (selected_note_cardview != card_view) {
                    selected_note_cardview!!.strokeWidth = 0
                    selected_note_cardview = card_view
                    selected_note = note
                    card_view.strokeWidth = 2.dpToPx(context)
                    card_view.strokeColor = ContextCompat.getColor(context, R.color.primary_text)
                } else {
                    selected_note_cardview!!.strokeWidth = 0
                    selected_note_cardview = null
                    selected_note = null
                }
            }
            card_view.addView(note_view)
            notes_available.addView(card_view)
        }
    }

    private fun showNotesToBeSolved(notes: Array<MusicalNote>, string1: LinearLayout, string2: LinearLayout, string3: LinearLayout, string4: LinearLayout, middle_row: LinearLayout): Array<MusicalNoteView>? {
        val context = requireContext()
        var notes_views = arrayOf<MusicalNoteView>()
        for (note in notes) {
            val note_view = MusicalNoteView(context, null)
            notes_views = notes_views.plus(note_view)

            Log.i("GameIdentifyFragment", note.toString())

            val circle_drawable = ContextCompat.getDrawable(context, R.drawable.circle_note) as GradientDrawable
            circle_drawable.let {
                it.setColor(ContextCompat.getColor(context, R.color.light_light_grey))
                it.setStroke(1.dpToPx(context), ContextCompat.getColor(context, R.color.light_grey))
                note_view.background = it
            }

            middle_row.addView(note_view)
            addHiddenItem(string1, note.order, context)
            addHiddenItem(string2, note.order, context)
            addHiddenItem(string3, note.order, context)
            addHiddenItem(string4, note.order, context)

            note_view.setOnClickListener {
                defaultMusicalNoteClickListener(note_view, note.order)
            }
        }
        return notes_views
    }
}