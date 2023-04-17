package com.example.unomobile.fragments

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.AppCompatButton
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import androidx.lifecycle.lifecycleScope
import com.example.unomobile.R
import com.example.unomobile.activities.ActivityPageActivity
import com.example.unomobile.activities.FullScreenActivity
import com.example.unomobile.models.Activity
import com.example.unomobile.models.MusicalNote
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.Api
import com.example.unomobile.network.client
import com.example.unomobile.utils.*
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.MediaItem
import com.google.android.exoplayer2.ext.okhttp.OkHttpDataSource
import com.google.android.exoplayer2.source.ProgressiveMediaSource
import com.google.android.exoplayer2.ui.StyledPlayerView
import com.google.android.material.card.MaterialCardView
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.ResponseBody
import org.billthefarmer.mididriver.MidiDriver
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class GameBuildModeFragment : Fragment() {

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

    private var selected_note: MusicalNote? = null
    private var selected_note_cardview: MaterialCardView? = null

    private var edit_sequence_view: Boolean = true
    private lateinit var submit_sequence_button: AppCompatButton
    private lateinit var edit_sequence_button: AppCompatButton

    // Game Interface Elements
    private lateinit var notes_available: LinearLayout
    private lateinit var string1: LinearLayout
    private lateinit var string2: LinearLayout
    private lateinit var string3: LinearLayout
    private lateinit var string4: LinearLayout

    // Submitted User Video
    private var submitted_player: ExoPlayer? = null
    private var submitted_player_view: StyledPlayerView? = null
    private var submitted_video_message: TextView? = null
    private var submitted_media_path: String? = null
    private var chosen_file: Uri? = null
    private lateinit var edit_submission_btn: AppCompatButton
    private lateinit var submit_btn: AppCompatButton
    private lateinit var record_video_button : AppCompatButton
    private lateinit var upload_video_button : AppCompatButton
    private lateinit var upload_video_buttons : LinearLayout

    // To handle if the user can change their submission or not
    private var editSubmissionMode: Boolean = true

    private lateinit var midiDriver: MidiDriver

    companion object {
        fun newInstance(activity_id: Int, order: Int, title: String, description: String?) = GameBuildModeFragment().apply {
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
        val view = inflater.inflate(R.layout.fragment_game_build_mode, container, false)

        val sharedPreferences = requireActivity().getSharedPreferences("data", AppCompatActivity.MODE_PRIVATE)
        val gson = Gson()
        val user_info = sharedPreferences.getString("user", "")
        user = gson.fromJson(user_info, UserInfo::class.java)

        if (activity_id == null) {
            return view
        }

        val type_text = view.findViewById<TextView>(R.id.type)
        type_text.text = order.toString() + ". Jogo - Construir"
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
        submit_sequence_button = view.findViewById(R.id.submit_sequence)
        edit_sequence_button = view.findViewById(R.id.edit_sequence)
        submit_btn = view.findViewById(R.id.submit)
        edit_submission_btn = view.findViewById(R.id.edit_submission)
        submit_sequence_button.setOnClickListener {
            if (chosen_notes.all { note -> note != null }) {
                it.visibility = View.GONE
                edit_sequence_button.visibility = View.VISIBLE
                edit_sequence_view = false
                selected_note = null
                selected_note_cardview?.strokeWidth = 0
                selected_note_cardview = null
                notes_available.visibility = View.GONE
                submit_btn.visibility = View.VISIBLE
                upload_video_buttons.visibility = View.VISIBLE
            } else {
                Toast.makeText(requireContext(), "A melodia tem de estar completa.", Toast.LENGTH_SHORT).show()
            }
        }
        edit_sequence_button.setOnClickListener {
            it.visibility = View.GONE
            submit_sequence_button.visibility = View.VISIBLE
            edit_sequence_view = true
            notes_available.visibility = View.VISIBLE
            submit_btn.visibility = View.GONE
            upload_video_buttons.visibility = View.GONE
        }

        val horizontal_scroll_view = view.findViewById<HorizontalScrollView>(R.id.horizontal_scroll_view)
        play_button = view.findViewById<ImageView>(R.id.play_button)
        pause_button = view.findViewById<ImageView>(R.id.pause_button)

        play_button!!.setOnClickListener {
            it.visibility = View.GONE
            pause_button!!.visibility = View.VISIBLE
            midiDriver.write(byteArrayOf((0xC0 + 0).toByte(), 40))

            horizontal_scroll_view.scrollTo(0, 0)

            lifecycleScope.launch {
                for ((index, note) in chosen_notes.withIndex()) {
                    Log.i("GameBuildFragment", note.toString())
                    if (note == null) {
                        break;
                    }
                    if (pause_state) {
                        withContext(Dispatchers.Main) {
                            horizontal_scroll_view.scrollTo(0, 0)
                            pause_button!!.visibility = View.GONE
                            play_button!!.visibility = View.VISIBLE
                            pause_state = false
                        }
                        return@launch
                    }

                    // Get Midi Code
                    val midi_code = noteToMidiMap[note.note_code]
                    Log.i("GameBuildFragment", midi_code.toString())
                    if (midi_code != null) {
                        midiDriver.write(byteArrayOf(0x90.toByte(), midi_code.toByte(), 127))
                    }   // Note on

                    withContext(Dispatchers.Main) {
                        horizontal_scroll_view.smoothScrollTo(chosen_notes_views[index]!!.x.toInt() - 5.dpToPx(requireContext()), 0)
                    }

                    delay(2000)

                    if (midi_code != null) {
                        midiDriver.write(byteArrayOf(0x80.toByte(), midi_code.toByte(), 0))
                    }
                }
                pause_button!!.visibility = View.GONE
                it.visibility = View.VISIBLE
                if (pause_state) {
                    withContext(Dispatchers.Main) {
                        horizontal_scroll_view.scrollTo(0, 0)
                        pause_state = false
                    }
                    return@launch
                }
            }
        }
        pause_button!!.setOnClickListener {
            pause_state = true
        }

        // Place icon in submit buttons
        upload_video_buttons = view.findViewById(R.id.upload_video_buttons)
        record_video_button = view.findViewById(R.id.record_video)
        upload_video_button = view.findViewById(R.id.upload_video)
        val record_icon = ContextCompat.getDrawable(requireContext(), R.drawable.record_icon)
        record_icon!!.setBounds(30, 0, 110, 80)
        record_video_button.setCompoundDrawables(record_icon, null, null, null)
        val upload_icon = ContextCompat.getDrawable(requireContext(), R.drawable.upload_icon)
        upload_icon!!.setBounds(20, 0, 110, 80)
        upload_video_button.setCompoundDrawables(upload_icon, null, null, null)

        upload_video_button.setOnClickListener {
            if (editSubmissionMode) {
                filePickerLauncher.launch("video/*")
            }
        }

        edit_submission_btn.setOnClickListener {
            editSubmissionMode = true
            edit_submission_btn.visibility = View.GONE

            submit_sequence_button.visibility = View.VISIBLE
            edit_sequence_button.visibility = View.GONE
            edit_sequence_view = true
            notes_available.visibility = View.VISIBLE
            submit_btn.visibility = View.GONE
        }

        submit_btn.setOnClickListener {
            if (chosen_file != null) {
                submitGame()
            } else {
                Toast.makeText(requireContext(), "Escolha um vídeo para submeter.", Toast.LENGTH_SHORT).show()
            }
        }

        Log.i("GameBuildFragment", order.toString())
        Log.i("GameBuildFragment", activity_id.toString())
        Log.i("GameBuildFragment", title.toString())
        Log.i("GameBuildFragment", description.toString())

        submitted_player_view = view.findViewById(R.id.uploaded_video_view)
        submitted_video_message = view.findViewById(R.id.uploaded_video_message)

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
                            Log.i("GameBuildFragment", response.body().toString())
                            val activity_data = response.body()!!
                            notes = activity_data.game_activity!!.notes
                            available_notes = notes!!.toSet()
                            val sequence_length = activity_data.game_activity.sequence_length!!
                            chosen_notes = arrayOfNulls(sequence_length)
                            chosen_notes_views = arrayOfNulls(sequence_length)

                            addInitialItems(string1, context)
                            addInitialItems(string2, context)
                            addInitialItems(string3, context)
                            addInitialItems(string4, context)
                            addInitialItems(middle_row, context)

                            // Check if user already submitted the game
                            if (activity_data.completed == true) {
                                showPossibleNotes()
                                var submitted_notes = arrayOf<MusicalNote>()
                                for (note in activity_data.game_activity.chosen_notes!!) {
                                    chosen_notes[note.order] = notes!!.find { it.id == note.note_id }
                                    submitted_notes = submitted_notes.plus(chosen_notes[note.order]!!)
                                }

                                notes_views = showChosenNotes(submitted_notes, string1, string2, string3, string4)

                                submitted_media_path = com.example.unomobile.network.BASE_URL + "activities/" + user!!.class_id + "/" + activity_data.id + "/game/submitted/media"
                                submitted_player_view!!.visibility = View.VISIBLE
                                submitted_video_message!!.visibility = View.VISIBLE
                                editSubmissionMode = false

                                setFullScreenListener(submitted_player_view, submitted_media_path!!)
                                initSubmittedPlayer()

                                submit_sequence_button.visibility = View.GONE
                                edit_submission_btn.visibility = View.VISIBLE

                                selected_note = null
                                notes_available.visibility = View.GONE
                            } else {
                                showPossibleNotes()
                                notes_views = showNotesToBeSolved(sequence_length, string1, string2, string3, string4, middle_row)
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
                Log.e("GameBuildFragment", e.toString())
            }
        }

        return view
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.i("GameBuildFragment", "OnDestroy called")
        // Release MIDI driver resources
        midiDriver.stop()
    }

    override fun onResume() {
        super.onResume()
        Log.i("GameBuildFragment", "OnResume called")
        if (submitted_media_path != null && chosen_file == null) {
            initSubmittedPlayer()
        }
        if (chosen_file != null) {
            initChosenVideoPlayer()
        }
        midiDriver.start()
        pause_state = false
    }

    override fun onPause() {
        super.onPause()
        Log.i("GameBuildFragment", "OnPause called")
        if (submitted_media_path != null || chosen_file != null) {
            submitted_player?.release()
            submitted_player = null
        }
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

    private fun showPossibleNotes() {
        val context = requireContext()
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
            card_view.setOnClickListener {
                Log.i("GameBuildFragment", it.toString())
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

    private fun showNotesToBeSolved(sequence_length: Int, string1: LinearLayout, string2: LinearLayout, string3: LinearLayout, string4: LinearLayout, middle_row: LinearLayout): Array<MusicalNoteView>? {
        val context = requireContext()
        var notes_views = arrayOf<MusicalNoteView>()
        for (note in 0 until sequence_length) {
            val note_view = MusicalNoteView(context, null)
            notes_views = notes_views.plus(note_view)

            val circle_drawable = ContextCompat.getDrawable(context, R.drawable.circle_note) as GradientDrawable
            circle_drawable.let {
                it.setColor(ContextCompat.getColor(context, R.color.light_light_grey))
                it.setStroke(1.dpToPx(context), ContextCompat.getColor(context, R.color.light_grey))
                note_view.background = it
            }

            middle_row.addView(note_view)
            addHiddenItem(string1, note, context)
            addHiddenItem(string2, note, context)
            addHiddenItem(string3, note, context)
            addHiddenItem(string4, note, context)

            note_view.setOnClickListener {
                defaultMusicalNoteClickListener(note_view, note)
            }
        }
        return notes_views
    }

    private fun defaultMusicalNoteClickListener(clicked_note_view: MusicalNoteView, note_order: Int) {
        if (selected_note != chosen_notes[note_order] && selected_note != null && edit_sequence_view) {
            val context = requireContext()
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

    private val filePickerLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        if (uri != null) {
            chosen_file = uri

            submitted_video_message!!.visibility = View.VISIBLE
            submitted_player_view!!.visibility = View.INVISIBLE

            submitted_player_view?.setFullscreenButtonClickListener {
                var intent = Intent(requireContext(), FullScreenActivity::class.java)
                var bundle = Bundle()
                Log.i("GameBuildFragment", chosen_file!!.path!!);
                bundle.putParcelable("uri", chosen_file)
                intent.putExtras(bundle)
                startActivity(intent)
            }

            initChosenVideoPlayer()

            submitted_player_view!!.visibility = View.VISIBLE
        } else {
            Log.i("GamePlayModeFragment", "URI was null")
        }
    }

    private fun submitGame() {
        // Do something with the selected video file URI
        Log.i("GameBuildFragment", chosen_file!!.path!!)
        val context = requireContext()

        val video_file = getFileFromUri(chosen_file!!, context)
        val requestBody = video_file.asRequestBody(getMimeType(chosen_file!!, context)!!.toMediaTypeOrNull())
        val mediaPart = MultipartBody.Part.createFormData("media", video_file.name, requestBody)
        val chosen_notes_ids = chosen_notes.map { it!!.id!! }.toTypedArray()

        val call = Api.retrofitService.submitGameBuildModeActivity(user!!.class_id!!, activity_id!!, mediaPart, chosen_notes_ids)

        call.enqueue(object : Callback<ResponseBody> {
            override fun onResponse(
                call: Call<ResponseBody>,
                response: Response<ResponseBody>
            ) {
                if (response.isSuccessful) {
                    Toast.makeText(requireContext(), "Jogo submetido com sucesso.", Toast.LENGTH_SHORT).show()

                    var activitypageactivity = activity as? ActivityPageActivity
                    if (activitypageactivity != null) {
                        activitypageactivity.activities_status?.set(order!!-1, true)
                    }
                    editSubmissionMode = false
                    submit_btn.visibility = View.GONE
                    edit_submission_btn.visibility = View.VISIBLE
                    upload_video_buttons.visibility = View.GONE
                    edit_sequence_button.visibility = View.GONE
                } else {
                    Toast.makeText(requireContext(), "Ocorreu um erro ao submeter o jogo.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                Toast.makeText(requireContext(), "Ocorreu um erro ao submeter o jogo.", Toast.LENGTH_SHORT).show()
                Log.i("GameBuildFragment", t.message.toString())
            }

        })

    }


    private fun showChosenNotes(notes: Array<MusicalNote>, string1: LinearLayout, string2: LinearLayout, string3: LinearLayout, string4: LinearLayout): Array<MusicalNoteView>? {
        val context = requireContext()
        var notes_views = arrayOf<MusicalNoteView>()
        for ((index, note) in notes.withIndex()) {
            val note_view = MusicalNoteView(context, null)
            notes_views = notes_views.plus(note_view)

            if (note.violin_string == 1) {
                string1.addView(note_view)
                addHiddenItem(string2, index, context)
                addHiddenItem(string3, index, context)
                addHiddenItem(string4, index, context)
                if (note.type == "LeftTriangle") {
                    updateMusicalNoteViewToLeftTriangle(note_view, note, R.drawable.left_triangle_green, context)
                }
                if (note.type == "RightTriangle") {
                    updateMusicalNoteViewToRightTriangle(note_view, note, R.drawable.right_triangle_green, context)
                }
                if (note.type == "Circle") {
                    updateMusicalNoteViewToCircle(note_view, note, R.color.violin_string_1, context)
                }
            }
            if (note.violin_string == 2) {
                string2.addView(note_view)
                addHiddenItem(string1, index, context)
                addHiddenItem(string3, index, context)
                addHiddenItem(string4, index, context)
                if (note.type == "LeftTriangle") {
                    updateMusicalNoteViewToLeftTriangle(note_view, note, R.drawable.left_triangle_pink, context)
                }
                if (note.type == "RightTriangle") {
                    updateMusicalNoteViewToRightTriangle(note_view, note, R.drawable.right_triangle_pink, context)
                }
                if (note.type == "Circle") {
                    updateMusicalNoteViewToCircle(note_view, note, R.color.violin_string_2, context)
                }
            }
            if (note.violin_string == 3) {
                string3.addView(note_view)
                addHiddenItem(string2, index, context)
                addHiddenItem(string1, index, context)
                addHiddenItem(string4, index, context)
                if (note.type == "LeftTriangle") {
                    updateMusicalNoteViewToLeftTriangle(note_view, note, R.drawable.left_triangle_yellow, context)
                }
                if (note.type == "RightTriangle") {
                    updateMusicalNoteViewToRightTriangle(note_view, note, R.drawable.right_triangle_yellow, context)
                }
                if (note.type == "Circle") {
                    updateMusicalNoteViewToCircle(note_view, note, R.color.violin_string_3, context)
                }
            }
            if (note.violin_string == 4) {
                string4.addView(note_view)
                addHiddenItem(string2, index, context)
                addHiddenItem(string3, index, context)
                addHiddenItem(string1, index, context)
                if (note.type == "LeftTriangle") {
                    updateMusicalNoteViewToLeftTriangle(note_view, note, R.drawable.left_triangle_blue, context)
                }
                if (note.type == "RightTriangle") {
                    updateMusicalNoteViewToRightTriangle(note_view, note, R.drawable.right_triangle_blue, context)
                }
                if (note.type == "Circle") {
                    updateMusicalNoteViewToCircle(note_view, note, R.color.violin_string_4, context)
                }
            }

            chosen_notes_views[index] = note_view
            note_view.setOnClickListener {
                defaultMusicalNoteClickListener(note_view, index)
            }
        }
        return notes_views
    }

    private fun initSubmittedPlayer() {
        // Create an ExoPlayer and set it as the player for content.
        submitted_player = ExoPlayer.Builder(requireContext()).build()
        submitted_player_view?.player = submitted_player

        val uri = Uri.parse(submitted_media_path)
        val dataSourceFactory = OkHttpDataSource.Factory(
            client
        )
        val mediaSource = ProgressiveMediaSource.Factory(
            dataSourceFactory
        ).createMediaSource(MediaItem.Builder().setUri(uri).build())

        submitted_player!!.setMediaSource(mediaSource)
        submitted_player!!.prepare()
    }

    @SuppressLint("SourceLockedOrientationActivity")
    fun setFullScreenListener(view: StyledPlayerView?, path: String) {
        // Adding Full Screen Button Click Listeners.
        view?.setFullscreenButtonClickListener {
            var intent = Intent(requireContext(), FullScreenActivity::class.java)
            var bundle = Bundle()
            bundle.putString("media_path", path)
            intent.putExtras(bundle)
            startActivity(intent)
        }
    }

    private fun initChosenVideoPlayer() {
        submitted_player = ExoPlayer.Builder(requireContext()).build()
        submitted_player_view?.player = submitted_player

        submitted_player!!.setMediaItem(MediaItem.Builder().setUri(chosen_file).build())
        submitted_player!!.prepare()
    }
}