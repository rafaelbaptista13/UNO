package com.example.unomobile.fragments

import android.animation.ValueAnimator
import android.annotation.SuppressLint
import android.content.ContentResolver
import android.content.Context
import android.content.Intent
import android.content.res.ColorStateList
import android.graphics.LightingColorFilter
import android.graphics.PorterDuff
import android.graphics.PorterDuffColorFilter
import android.graphics.drawable.GradientDrawable
import android.media.AudioManager
import android.media.SoundPool
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.util.Log
import android.util.TypedValue
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.MimeTypeMap
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.AppCompatButton
import androidx.core.content.ContextCompat
import androidx.core.graphics.drawable.DrawableCompat
import androidx.core.graphics.drawable.DrawableCompat.setTintList
import androidx.core.os.bundleOf
import androidx.core.view.marginLeft
import androidx.lifecycle.lifecycleScope
import com.example.unomobile.R
import com.example.unomobile.activities.ActivityPageActivity
import com.example.unomobile.activities.FullScreenActivity
import com.example.unomobile.models.Activity
import com.example.unomobile.models.MusicalNote
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.Api
import com.example.unomobile.network.CacheManager
import com.example.unomobile.network.Api.client
import com.example.unomobile.utils.*
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.MediaItem
import com.google.android.exoplayer2.ext.okhttp.OkHttpDataSource
import com.google.android.exoplayer2.source.ProgressiveMediaSource
import com.google.android.exoplayer2.ui.StyledPlayerView
import com.google.android.material.card.MaterialCardView
import com.google.gson.Gson
import kotlinx.coroutines.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.ResponseBody
import org.billthefarmer.mididriver.MidiDriver
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.File
import java.io.FileNotFoundException
import java.util.*

class GamePlayModeFragment : Fragment() {

    // Submitted User Video
    private var submitted_player: ExoPlayer? = null
    private var submitted_player_view: StyledPlayerView? = null
    private var submitted_video_message: TextView? = null
    private var submitted_media_path: String? = null

    private var title: String? = null
    private var description: String? = null
    private var order: Int? = null
    private var activity_id: Int? = null
    private var user: UserInfo? = null

    private var notes: Array<MusicalNote>? = null
    private var notes_views: Array<MusicalNoteView>? = null
    private var pause_state: Boolean = false

    private var vertical_game_line: View? = null
    private var game_card: MaterialCardView? = null
    private var play_button: ImageView? = null
    private var pause_button: ImageView? = null

    private lateinit var midiDriver: MidiDriver

    private var chosen_file: Uri? = null
    private lateinit var edit_submission_btn: AppCompatButton
    private lateinit var submit_btn: AppCompatButton
    private lateinit var record_video_button : AppCompatButton
    private lateinit var upload_video_button : AppCompatButton
    private lateinit var upload_video_buttons : LinearLayout
    // To handle if the user can change their submission or not
    private var editMode: Boolean = true

    private lateinit var loading_bar: ProgressBar

    private lateinit var _context: Context

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
        midiDriver = MidiDriver.getInstance()
        notes_views = arrayOf()
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
        type_text.text = order.toString() + ". Jogo - Reproduzir"
        val title_text = view.findViewById<TextView>(R.id.title)
        title_text.text = title
        val description_text = view.findViewById<TextView>(R.id.description)
        if (description != null && description != "") {
            description_text.text = description
        } else {
            description_text.visibility = View.GONE
        }
        loading_bar = view.findViewById(R.id.loading_progress_bar)
        val string1 = view.findViewById<LinearLayout>(R.id.row1)
        val string2 = view.findViewById<LinearLayout>(R.id.row2)
        val string3 = view.findViewById<LinearLayout>(R.id.row3)
        val string4 = view.findViewById<LinearLayout>(R.id.row4)
        game_card = view.findViewById(R.id.game_card)
        vertical_game_line = view.findViewById(R.id.vertical_game_line)

        // Place icon in submit buttons
        upload_video_buttons = view.findViewById(R.id.upload_video_buttons)
        record_video_button = view.findViewById(R.id.record_video)
        upload_video_button = view.findViewById(R.id.upload_video)
        val record_icon = ContextCompat.getDrawable(_context, R.drawable.record_icon)
        record_icon!!.setBounds(30, 0, 110, 80)
        record_video_button.setCompoundDrawables(record_icon, null, null, null)
        val upload_icon = ContextCompat.getDrawable(_context, R.drawable.upload_icon)
        upload_icon!!.setBounds(20, 0, 110, 80)
        upload_video_button.setCompoundDrawables(upload_icon, null, null, null)

        // Add click listeners on both buttons
        record_video_button.setOnClickListener {
            Log.i("PlayModeFragment", "Record Video Button clicked")
            val intent = Intent(MediaStore.ACTION_VIDEO_CAPTURE)
            val chooser = Intent.createChooser(intent, "Abrir câmera com")

            if (intent.resolveActivity(_context.packageManager) != null) {
                _context.startActivity(chooser)
            } else {
                // No camera app available
                Toast.makeText(context, "Não existe nenhuma aplicação de câmera.", Toast.LENGTH_SHORT).show()
            }
        }

        upload_video_button.setOnClickListener {
            if (editMode) {
                filePickerLauncher.launch("video/*")
            }
        }

        edit_submission_btn = view.findViewById(R.id.edit_submission)
        edit_submission_btn.setOnClickListener {
            editMode = true
            submit_btn.visibility = View.VISIBLE
            edit_submission_btn.visibility = View.GONE
            upload_video_buttons.visibility = View.VISIBLE
        }
        submit_btn = view.findViewById(R.id.submit)
        submit_btn.setOnClickListener {
            if (chosen_file != null) {
                submitVideo()
            } else {
                Toast.makeText(_context, "Por favor escolha um vídeo antes de submeter.", Toast.LENGTH_SHORT).show()
            }
        }

        val horizontal_scroll_view = view.findViewById<HorizontalScrollView>(R.id.horizontal_scroll_view)
        play_button = view.findViewById<ImageView>(R.id.play_button)
        pause_button = view.findViewById<ImageView>(R.id.pause_button)
        play_button!!.setOnClickListener {
            it.visibility = View.GONE
            pause_button!!.visibility = View.VISIBLE
            midiDriver.write(byteArrayOf((0xC0 + 0).toByte(), 40))

            lifecycleScope.launch {
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

                        delay(2000)

                        if (midi_code != null) {
                            midiDriver.write(byteArrayOf(0x80.toByte(), midi_code.toByte(),0))
                        } // Note off, middle C, zero velocity
                    }

                } else {
                    Log.i("GamePlayMode", "No start note found")
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

        Log.i("GamePlayModeFragment", order.toString())
        Log.i("GamePlayModeFragment", activity_id.toString())
        Log.i("GamePlayModeFragment", title.toString())
        Log.i("GamePlayModeFragment", description.toString())

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
                            if (context == null) {
                                return
                            }
                            val context = _context
                            Log.i("GamePlayModeFragment", response.body().toString())
                            val activity_data = response.body()!!
                            notes = activity_data.game_activity!!.notes

                            addInitialItems(string1, context)
                            addInitialItems(string2, context)
                            addInitialItems(string3, context)
                            addInitialItems(string4, context)

                            notes_views = showSolution(notes!!, string1, string2, string3, string4, context)

                            addFinalItems(string1, context, game_card!!, vertical_game_line!!)
                            addFinalItems(string2, context, game_card!!, vertical_game_line!!)
                            addFinalItems(string3, context, game_card!!, vertical_game_line!!)
                            addFinalItems(string4, context, game_card!!, vertical_game_line!!)

                            // Check if user already submitted the exercise
                            if (activity_data.completed == true) {
                                submitted_media_path = com.example.unomobile.network.BASE_URL + "activities/" + user!!.class_id + "/" + activity_data.id + "/game/submitted/media"
                                submitted_player_view!!.visibility = View.VISIBLE
                                submitted_video_message!!.text = "Vídeo enviado:"
                                submitted_video_message!!.visibility = View.VISIBLE
                                editMode = false
                                upload_video_buttons.visibility = View.GONE
                                submit_btn.visibility = View.GONE
                                edit_submission_btn.visibility = View.VISIBLE

                                CacheManager.getCache().removeResource(submitted_media_path!!)

                                setFullScreenListener(submitted_player_view, submitted_media_path!!)
                                initSubmittedPlayer()
                            } else {
                                upload_video_buttons.visibility = View.VISIBLE
                            }

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
        Log.i("GamePlayModeFragment", "OnDestroy called")
        // Release MIDI driver resources
        midiDriver.stop()
        if (submitted_media_path != null || chosen_file != null) {
            submitted_player?.release()
            submitted_player = null
        }
    }

    override fun onResume() {
        super.onResume()
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
        if (submitted_media_path != null || chosen_file != null) {
            submitted_player?.release()
            submitted_player = null
        }
        pause_button!!.visibility = View.GONE
        play_button!!.visibility = View.VISIBLE
        pause_state = true
        midiDriver.stop()
    }

    private fun initSubmittedPlayer() {
        // Create an ExoPlayer and set it as the player for content.
        submitted_player = ExoPlayer.Builder(_context).build()
        submitted_player_view?.player = submitted_player

        val uri = Uri.parse(submitted_media_path)
        val mediaSource = ProgressiveMediaSource.Factory(CacheManager.getCacheDataSourceFactory(client))
            .createMediaSource(MediaItem.Builder().setUri(uri).build())

        submitted_player!!.setMediaSource(mediaSource)
        submitted_player!!.prepare()
    }

    @SuppressLint("SourceLockedOrientationActivity")
    fun setFullScreenListener(view: StyledPlayerView?, path: String) {
        // Adding Full Screen Button Click Listeners.
        view?.setFullscreenButtonClickListener {
            var intent = Intent(_context, FullScreenActivity::class.java)
            var bundle = Bundle()
            bundle.putString("media_path", path)
            intent.putExtras(bundle)
            startActivity(intent)
        }
    }

    private val filePickerLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        if (uri != null) {

            val contentResolver = _context.contentResolver
            val fileDescriptor = contentResolver.openFileDescriptor(uri, "r")
            val fileSizeInBytes = fileDescriptor?.statSize ?: -1
            val fileSizeInMegabytes = fileSizeInBytes.toDouble() / (1024 * 1024)
            if (fileSizeInMegabytes > 95) {
                Toast.makeText(_context, "Esse ficheiro é muito grande. Escolhe outro mais pequeno. (Inferior a 95MB)", Toast.LENGTH_SHORT).show()
                Log.i("ExerciseFragment", "File too big")
                return@registerForActivityResult
            }

            chosen_file = uri
            submitted_video_message!!.text = "Vídeo escolhido:"
            submitted_video_message!!.visibility = View.VISIBLE
            submitted_player_view!!.visibility = View.INVISIBLE

            submitted_player_view?.setFullscreenButtonClickListener {
                var intent = Intent(_context, FullScreenActivity::class.java)
                var bundle = Bundle()
                Log.i("GamePlayModeFragment", chosen_file!!.path!!);
                bundle.putParcelable("uri", chosen_file)
                intent.putExtras(bundle)
                startActivity(intent)
            }

            submitted_player = ExoPlayer.Builder(_context).build()
            submitted_player_view?.player = submitted_player

            submitted_player!!.setMediaItem(MediaItem.Builder().setUri(chosen_file).build())
            submitted_player!!.prepare()

            submitted_player_view!!.visibility = View.VISIBLE
        } else {
            Log.i("GamePlayModeFragment", "URI was null")
        }
    }

    private fun submitVideo() {
        // Do something with the selected video file URI
        Log.i("GamePlayFragment", chosen_file!!.path!!)
        submit_btn.visibility = View.GONE
        loading_bar.visibility = View.VISIBLE

        val context = _context
        val video_file = getFileFromUri(chosen_file!!, context)
        val requestBody = video_file.asRequestBody(getMimeType(chosen_file!!, context)!!.toMediaTypeOrNull())
        val mediaPart = MultipartBody.Part.createFormData("media", video_file.name, requestBody)

        val call = Api.retrofitService.submitGamePlayModeActivity(user!!.class_id!!, activity_id!!, mediaPart)

        Toast.makeText(_context, "Espera um pouco... o vídeo está a ser enviado.", Toast.LENGTH_LONG).show()

        call.enqueue(object : Callback<ResponseBody> {
            override fun onResponse(
                call: Call<ResponseBody>,
                response: Response<ResponseBody>
            ) {
                if (response.isSuccessful) {
                    Toast.makeText(_context, "Vídeo submetido com sucesso.", Toast.LENGTH_SHORT).show()

                    var activitypageactivity = activity as? ActivityPageActivity
                    if (activitypageactivity != null) {
                        activitypageactivity.activities_status?.set(order!!-1, true)
                    }
                    editMode = false
                    submit_btn.visibility = View.GONE
                    edit_submission_btn.visibility = View.VISIBLE
                    upload_video_buttons.visibility = View.GONE
                    submitted_video_message!!.text = "Vídeo enviado:"
                } else {
                    submit_btn.visibility = View.VISIBLE
                    Toast.makeText(_context, "Ocorreu um erro ao submeter o vídeo.", Toast.LENGTH_SHORT).show()
                }
                loading_bar.visibility = View.GONE
            }

            override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                Toast.makeText(_context, "Ocorreu um erro ao submeter o vídeo. Tenta submeter um vídeo mais pequeno.", Toast.LENGTH_LONG).show()
                Log.i("GamePlayModeFragment", t.message.toString())
                submit_btn.visibility = View.VISIBLE
                loading_bar.visibility = View.GONE
            }

        })

    }

    private fun initChosenVideoPlayer() {
        submitted_player = ExoPlayer.Builder(_context).build()
        submitted_player_view?.player = submitted_player

        submitted_player!!.setMediaItem(MediaItem.Builder().setUri(chosen_file).build())
        submitted_player!!.prepare()
    }

}