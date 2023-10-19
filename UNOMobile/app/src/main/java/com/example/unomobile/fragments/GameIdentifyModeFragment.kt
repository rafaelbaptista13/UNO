package com.example.unomobile.fragments

import android.content.Context
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.provider.ContactsContract
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
import kotlinx.coroutines.*
import okhttp3.ResponseBody
import org.billthefarmer.mididriver.MidiDriver
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.util.stream.Collectors.toSet

class GameIdentifyModeFragment : Fragment() {

    // User Info
    private var user: UserInfo? = null

    // Activity Elements
    private var title: String? = null
    private var description: String? = null
    private var order: Int? = null
    private var activity_id: Int? = null

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
    private lateinit var seekBar: SeekBar

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

    private lateinit var _context: Context

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

        if (isAdded) {
            _context = requireContext()
        } else {
            onDestroy()
            return view
        }

        val type_text = view.findViewById<TextView>(R.id.type)
        type_text.text = order.toString() + ". Jogo - Identificar"
        val title_text = view.findViewById<TextView>(R.id.title)
        title_text.text = title
        val description_text = view.findViewById<TextView>(R.id.description)
        if (description != null && description != "") {
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
            midiDriver.write(byteArrayOf((0xC0 + 0).toByte(), 40))

            lifecycleScope.launch {
                Log.i("GameIdentifyMode", horizontal_scroll_view.scrollX.toString())
                val scrollX = horizontal_scroll_view.scrollX + 50.dpToPx(_context)

                var startNote: MusicalNote? = null
                for (note in notes!!) {
                    val noteView = notes_views!![note.order!!]
                    val noteViewX = noteView.x.toInt()
                    val noteViewWidth = noteView.width
                    val noteViewEndX = noteViewX + noteViewWidth

                    // Check if the note view is visible in the ScrollView
                    if (noteViewEndX > scrollX) {
                        startNote = note
                        break
                    }
                }

                if (startNote != null) {

                    for (i in (startNote.order!!) until notes!!.size) {
                        val note = notes!![i]

                        if (pause_state) {
                            pause_button!!.visibility = View.GONE
                            play_button!!.visibility = View.VISIBLE
                            pause_state = false
                            return@launch
                        }

                        // Get Midi Code
                        val midi_code = noteToMidiMap[note.note_code]
                        if (midi_code != null) {
                            midiDriver.write(byteArrayOf(0x90.toByte(), midi_code.toByte(), 127))
                        }   // Note on

                        withContext(Dispatchers.Main) {
                            horizontal_scroll_view.smoothScrollTo(notes_views!![note.order!!].x.toInt() - 5.dpToPx(_context), 0)
                        }

                        delay(60000 / (seekBar.progress.toLong() + 50))

                        if (midi_code != null) {
                            midiDriver.write(byteArrayOf(0x80.toByte(), midi_code.toByte(),0))
                        } // Note off, middle C, zero velocity
                    }

                } else {
                    // No start note found
                    Log.i("GameIdentifyMode", "No start note found")
                }

                pause_button!!.visibility = View.GONE
                it.visibility = View.VISIBLE
                if (pause_state) {
                    pause_state = false
                    return@launch
                }
            }
        }
        pause_button!!.setOnClickListener {
            pause_state = true
        }
        seekBar = view.findViewById(R.id.seekBar)
        seekBar.progress = 10  // Default value
        val seekBarValue = view.findViewById<TextView>(R.id.seekBarValue)
        seekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                val playbackSpeed = progress + 50
                seekBarValue.text = playbackSpeed.toString() + " Bpm"
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {
                // O usuário tocou na SeekBar
            }

            override fun onStopTrackingTouch(seekBar: SeekBar?) {
                // O usuário parou de arrastar a SeekBar
            }
        })

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
                            val context = _context
                            Log.i("GameIdentifyFragment", response.body().toString())
                            val activity_data = response.body()!!
                            notes = activity_data.game_activity!!.notes
                            available_notes = notes!!.map{ note ->
                                MusicalNote(
                                    null,
                                    null,
                                    note.name,
                                    note.violin_string,
                                    note.violin_finger,
                                    note.viola_string,
                                    note.viola_finger,
                                    note.note_code,
                                    note.type
                                )
                            }.toTypedArray().toSet()
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

                            if (activity_data.teacher_feedback !== null) {
                                val teacher_feedback_card = view.findViewById<MaterialCardView>(R.id.teacher_feedback_card)
                                val teacher_feedback = view.findViewById<TextView>(R.id.teacher_feedback)

                                teacher_feedback_card.visibility = View.VISIBLE
                                teacher_feedback.text = activity_data.teacher_feedback
                            }

                            if (activity_data.trophy !== null) {
                                val trophy_card = view.findViewById<MaterialCardView>(R.id.trophy_card)
                                val trophy_image = view.findViewById<ImageView>(R.id.trophy_image)
                                val trophy_name = view.findViewById<TextView>(R.id.trophy_name)

                                trophy_card.visibility = View.VISIBLE
                                val media_path = com.example.unomobile.network.BASE_URL + "images/" + activity_data.trophy.id
                                ImageLoader.picasso.load(media_path).into(trophy_image)
                                trophy_name.text = activity_data.trophy.name
                            }

                        }
                    }

                    override fun onFailure(call: Call<Activity>, t: Throwable) {
                        Log.i("GameIdentifyFragment", "Failed request");
                        Log.i("GameIdentifyFragment", t.message!!)
                    }

                })
            } catch (e: Exception) {
                Log.e("GameIdentifyFragment", e.toString())
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
        midiDriver.start()
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
            val context = _context
            clicked_note_view.visibility = View.INVISIBLE
            var note_view: MusicalNoteView? = null
            when (selected_note!!.violin_string) {
                1 -> {
                    note_view = string1.getChildAt(note_order + 1) as MusicalNoteView
                    if (selected_note!!.type == "LeftTriangle") {
                        updateMusicalNoteViewToLeftTriangle(note_view, selected_note!!, R.drawable.left_triangle_green, context)
                    }
                    if (selected_note!!.type == "RightTriangle") {
                        updateMusicalNoteViewToRightTriangle(note_view, selected_note!!, R.drawable.right_triangle_green, context)
                    }
                    if (selected_note!!.type == "Circle") {
                        updateMusicalNoteViewToCircle(note_view, selected_note!!, R.color.violin_string_1, context)
                    }
                    note_view.visibility = View.VISIBLE
                }
                2 -> {
                    note_view = string2.getChildAt(note_order + 1) as MusicalNoteView
                    if (selected_note!!.type == "LeftTriangle") {
                        updateMusicalNoteViewToLeftTriangle(note_view, selected_note!!, R.drawable.left_triangle_pink, context)
                    }
                    if (selected_note!!.type == "RightTriangle") {
                        updateMusicalNoteViewToRightTriangle(note_view, selected_note!!, R.drawable.right_triangle_pink, context)
                    }
                    if (selected_note!!.type == "Circle") {
                        updateMusicalNoteViewToCircle(note_view, selected_note!!, R.color.violin_string_2, context)
                    }
                    note_view.visibility = View.VISIBLE
                }
                3 -> {
                    note_view = string3.getChildAt(note_order + 1) as MusicalNoteView
                    if (selected_note!!.type == "LeftTriangle") {
                        updateMusicalNoteViewToLeftTriangle(note_view, selected_note!!, R.drawable.left_triangle_yellow, context)
                    }
                    if (selected_note!!.type == "RightTriangle") {
                        updateMusicalNoteViewToRightTriangle(note_view, selected_note!!, R.drawable.right_triangle_yellow, context)
                    }
                    if (selected_note!!.type == "Circle") {
                        updateMusicalNoteViewToCircle(note_view, selected_note!!, R.color.violin_string_3, context)
                    }
                    note_view.visibility = View.VISIBLE
                }
                4 -> {
                    note_view = string4.getChildAt(note_order + 1) as MusicalNoteView
                    if (selected_note!!.type == "LeftTriangle") {
                        updateMusicalNoteViewToLeftTriangle(note_view, selected_note!!, R.drawable.left_triangle_blue, context)
                    }
                    if (selected_note!!.type == "RightTriangle") {
                        updateMusicalNoteViewToRightTriangle(note_view, selected_note!!, R.drawable.right_triangle_blue, context)
                    }
                    if (selected_note!!.type == "Circle") {
                        updateMusicalNoteViewToCircle(note_view, selected_note!!, R.color.violin_string_4, context)
                    }

                }
            }

            note_view!!.visibility = View.VISIBLE
            chosen_notes[note_order] = selected_note
            chosen_notes_views[note_order] = note_view
        }
    }

    private fun submitAnswer() {
        val solution = notes!!.map { note ->
            MusicalNote(
                null,
                null,
                note.name,
                note.violin_string,
                note.violin_finger,
                note.viola_string,
                note.viola_finger,
                note.note_code,
                note.type
            )
        }.toTypedArray()

        if (solution.contentEquals(chosen_notes)) {

            val call = Api.retrofitService.submitGameIdentifyModeActivity(user!!.class_id!!, activity_id!!)

            call.enqueue(object : Callback<ResponseBody> {
                override fun onResponse(
                    call: Call<ResponseBody>,
                    response: Response<ResponseBody>
                ) {
                    if (response.isSuccessful) {
                        Toast.makeText(_context, "Jogo concluído com sucesso.", Toast.LENGTH_SHORT).show()

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
                        Toast.makeText(_context, "Ocorreu um erro ao submeter a sequência.", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                    Toast.makeText(_context, "Ocorreu um erro ao submeter a sequência.", Toast.LENGTH_SHORT).show()
                    Log.i("GameIdentifyFragment", t.message.toString())
                }
            })

        } else {
            val incorrect_positions = mutableListOf<Int>()

            for (i in solution.indices) {
                if (solution[i] != chosen_notes[i]) {
                    incorrect_positions.add(i+1)
                }
            }

            if (incorrect_positions.isEmpty()) {
                // all notes are correct
                incorrect_message.visibility = View.GONE
            } else {
                // construct incorrect message
                var incorrect_text = "Incorreto. "
                if (incorrect_positions.size == 1) {
                    incorrect_text += "A nota ${incorrect_positions[0]} está errada. "
                } else {
                    incorrect_text += "As notas "
                    for (i in incorrect_positions.indices) {
                        incorrect_text += incorrect_positions[i]
                        if (i < incorrect_positions.size - 2) {
                            incorrect_text += ", "
                        } else if (i == incorrect_positions.size - 2) {
                            incorrect_text += " e "
                        }
                    }
                    incorrect_text += " estão erradas. "
                }
                incorrect_text += "Tenta outra sequência."
                incorrect_message.text = incorrect_text
                incorrect_message.visibility = View.VISIBLE
            }
        }
    }

    private fun showPossibleNotes() {
        val context = _context
        for (note in available_notes!!) {
            val note_view = createMusicalNoteViewForAvailableNotes(note, context)

            val card_view = MaterialCardView(context)
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(10.dpToPx(context), 10.dpToPx(context), 10.dpToPx(context), 15.dpToPx(context))
            card_view.layoutParams = params
            card_view.cardElevation = 10.dpToPx(context).toFloat()
            card_view.radius = 20.dpToPx(context).toFloat()
            card_view.setCardBackgroundColor(ContextCompat.getColor(context, R.color.white))
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
        val context = _context
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
            addHiddenItem(string1, note.order!!, context)
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