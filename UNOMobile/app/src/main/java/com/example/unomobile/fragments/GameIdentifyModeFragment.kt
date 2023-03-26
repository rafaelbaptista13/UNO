package com.example.unomobile.fragments

import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.util.Log
import android.util.TypedValue
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.HorizontalScrollView
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TableRow
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import androidx.lifecycle.lifecycleScope
import com.example.unomobile.R
import com.example.unomobile.models.Activity
import com.example.unomobile.models.MusicalNote
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.Api
import com.example.unomobile.utils.FinalNoteView
import com.example.unomobile.utils.MusicalNoteView
import com.example.unomobile.utils.noteToMidiMap
import com.google.android.material.card.MaterialCardView
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.billthefarmer.mididriver.MidiDriver
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class GameIdentifyModeFragment : Fragment() {

    private var title: String? = null
    private var description: String? = null
    private var order: Int? = null
    private var activity_id: Int? = null
    private var user: UserInfo? = null

    private var notes: Array<MusicalNote>? = null
    private var notes_views: Array<MusicalNoteView>? = null
    private var available_notes: Set<MusicalNote>? = null
    private var pause_state: Boolean = false

    private var vertical_game_line: View? = null
    private var game_card: MaterialCardView? = null
    private var play_button: ImageView? = null
    private var pause_button: ImageView? = null

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

        val string1 = view.findViewById<LinearLayout>(R.id.row1)
        val string2 = view.findViewById<LinearLayout>(R.id.row2)
        val string3 = view.findViewById<LinearLayout>(R.id.row3)
        val string4 = view.findViewById<LinearLayout>(R.id.row4)
        val middle_row = view.findViewById<LinearLayout>(R.id.middle_row)
        val notes_available = view.findViewById<LinearLayout>(R.id.notes_available)
        game_card = view.findViewById(R.id.game_card)
        vertical_game_line = view.findViewById(R.id.vertical_game_line)

        val horizontal_scroll_view = view.findViewById<HorizontalScrollView>(R.id.horizontal_scroll_view)
        play_button = view.findViewById<ImageView>(R.id.play_button)
        pause_button = view.findViewById<ImageView>(R.id.pause_button)
        play_button!!.setOnClickListener {
            it.visibility = View.GONE
            pause_button!!.visibility = View.VISIBLE
            // Calculate the maximum scroll position
            val childView = horizontal_scroll_view.getChildAt(0)

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
                        horizontal_scroll_view.smoothScrollTo(notes_views!![note.order].x.toInt() - 5.dpToPx(), 0)
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

        lifecycleScope.launch {
            try {
                val call = Api.retrofitService.getActivity(
                    user!!.class_id!!,
                    activity_id
                )

                call.enqueue(object : Callback<Activity> {
                    override fun onResponse(call: Call<Activity>, response: Response<Activity>) {
                        if (response.isSuccessful) {
                            Log.i("GameIdentifyFragment", response.body().toString())
                            val activity_data = response.body()!!
                            notes = activity_data.game_activity!!.notes
                            available_notes = notes!!.toSet()

                            addInitialItems(string1)
                            addInitialItems(string2)
                            addInitialItems(string3)
                            addInitialItems(string4)
                            addInitialItems(middle_row)

                            for (note in available_notes!!) {
                                val note_view = MusicalNoteView(requireContext(), null)
                                val circle_drawable = ContextCompat.getDrawable(requireContext(), R.drawable.circle_note) as GradientDrawable
                                circle_drawable.let {
                                    var string_color = 0
                                    when (note.violin_string) {
                                        1 -> string_color = R.color.musical_note_blue
                                        2 -> string_color = R.color.musical_note_yellow
                                        3 -> string_color = R.color.musical_note_red
                                        4 -> string_color = R.color.musical_note_green
                                    }
                                    it.setColor(ContextCompat.getColor(requireContext(), string_color))
                                    it.setStroke(0, ContextCompat.getColor(requireContext(), R.color.black))
                                    note_view.background = it
                                    note_view.setText(note.name)
                                }
                                val card_view = MaterialCardView(requireContext())
                                val params = LinearLayout.LayoutParams(
                                    LinearLayout.LayoutParams.MATCH_PARENT,
                                    LinearLayout.LayoutParams.WRAP_CONTENT
                                )
                                params.setMargins(10.dpToPx(), 10.dpToPx(), 0, 15.dpToPx())
                                card_view.layoutParams = params
                                card_view.cardElevation = 10.dpToPx().toFloat()
                                card_view.radius = 20.dpToPx().toFloat()
                                card_view.addView(note_view)
                                notes_available.addView(card_view)
                            }

                            for (note in notes!!) {
                                val note_view = MusicalNoteView(requireContext(), null)
                                notes_views = notes_views?.plus(note_view)

                                Log.i("GameIdentifyFragment", note.toString())

                                val circle_drawable = ContextCompat.getDrawable(requireContext(), R.drawable.circle_note) as GradientDrawable
                                circle_drawable.let {
                                    it.setColor(ContextCompat.getColor(requireContext(), R.color.light_light_grey))
                                    it.setStroke(1.dpToPx(), ContextCompat.getColor(requireContext(), R.color.light_grey))
                                    note_view.background = it
                                }

                                middle_row.addView(note_view)
                                addHiddenItem(string1)
                                addHiddenItem(string2)
                                addHiddenItem(string3)
                                addHiddenItem(string4)

                                /*
                                if (note.violin_string == 1) {
                                    string1.addView(note_view)
                                    addInvisibleView(string2)
                                    addInvisibleView(string3)
                                    addInvisibleView(string4)
                                    if (note.type == "LeftTriangle") {
                                        updateMusicalNoteViewToLeftTriangle(note_view, note, R.drawable.left_triangle_blue)
                                    }
                                    if (note.type == "RightTriangle") {
                                        updateMusicalNoteViewToRightTriangle(note_view, note, R.drawable.right_triangle_blue)
                                    }
                                    if (note.type == "Circle") {
                                        updateMusicalNoteViewToCircle(note_view, note, R.color.musical_note_blue)
                                    }
                                }
                                if (note.violin_string == 2) {
                                    string2.addView(note_view)
                                    addInvisibleView(string1)
                                    addInvisibleView(string3)
                                    addInvisibleView(string4)
                                    if (note.type == "LeftTriangle") {
                                        updateMusicalNoteViewToLeftTriangle(note_view, note, R.drawable.left_triangle_yellow)
                                    }
                                    if (note.type == "RightTriangle") {
                                        updateMusicalNoteViewToRightTriangle(note_view, note, R.drawable.right_triangle_yellow)
                                    }
                                    if (note.type == "Circle") {
                                        updateMusicalNoteViewToCircle(note_view, note, R.color.musical_note_yellow)
                                    }
                                }
                                if (note.violin_string == 3) {
                                    string3.addView(note_view)
                                    addInvisibleView(string2)
                                    addInvisibleView(string1)
                                    addInvisibleView(string4)
                                    if (note.type == "LeftTriangle") {
                                        updateMusicalNoteViewToLeftTriangle(note_view, note, R.drawable.left_triangle_red)
                                    }
                                    if (note.type == "RightTriangle") {
                                        updateMusicalNoteViewToRightTriangle(note_view, note, R.drawable.right_triangle_red)
                                    }
                                    if (note.type == "Circle") {
                                        updateMusicalNoteViewToCircle(note_view, note, R.color.musical_note_red)
                                    }
                                }
                                if (note.violin_string == 4) {
                                    string4.addView(note_view)
                                    addInvisibleView(string2)
                                    addInvisibleView(string3)
                                    addInvisibleView(string1)
                                    if (note.type == "LeftTriangle") {
                                        updateMusicalNoteViewToLeftTriangle(note_view, note, R.drawable.left_triangle_green)
                                    }
                                    if (note.type == "RightTriangle") {
                                        updateMusicalNoteViewToRightTriangle(note_view, note, R.drawable.right_triangle_green)
                                    }
                                    if (note.type == "Circle") {
                                        updateMusicalNoteViewToCircle(note_view, note, R.color.musical_note_green)
                                    }
                                }

                                 */
                            }

                            addFinalItems(string1)
                            addFinalItems(string2)
                            addFinalItems(string3)
                            addFinalItems(string4)

                            // Check if user already submitted the exercise
                            if (activity_data.completed == true) {
                                //submitted_media_path = com.example.unomobile.network.BASE_URL + "activities/" + user!!.class_id + "/" + activity_data.id + "/game/submitted/media"
                                //submitted_player_view!!.visibility = View.VISIBLE
                                //submitted_video_message!!.visibility = View.VISIBLE
                                //editMode = false
                                //upload_video_buttons.visibility = View.GONE
                                //submit_btn.visibility = View.GONE
                                //edit_submission_btn.visibility = View.VISIBLE

                                //setFullScreenListener(submitted_player_view, submitted_media_path!!)
                                //initSubmittedPlayer()
                            } else {
                                //upload_video_buttons.visibility = View.VISIBLE
                            }

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

    private fun Int.dpToPx(): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP, this.toFloat(), resources.displayMetrics
        ).toInt()
    }

    fun addInitialItems(string: LinearLayout) {
        val initial_item = FinalNoteView(requireContext(), null)
        initial_item.visibility = View.INVISIBLE
        val layoutParams = initial_item.layoutParams
        layoutParams.width = 50.dpToPx()
        initial_item.layoutParams = layoutParams
        string.addView(initial_item)
    }

    fun addHiddenItem(string: LinearLayout) {
        val item = MusicalNoteView(requireContext(), null)
        item.visibility = View.INVISIBLE
        val layoutParams = item.layoutParams
        item.layoutParams = layoutParams
        string.addView(item)
    }

    fun addFinalItems(string: LinearLayout) {
        val end_item = FinalNoteView(requireContext(), null)
        end_item.visibility = View.INVISIBLE
        val layoutParams = end_item.layoutParams
        layoutParams.width = game_card!!.right - vertical_game_line!!.left - 15.dpToPx()
        end_item.layoutParams = layoutParams
        string.addView(end_item)
    }
}