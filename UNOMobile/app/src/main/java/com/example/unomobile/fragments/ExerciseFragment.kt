package com.example.unomobile.fragments

import android.annotation.SuppressLint
import android.content.ComponentName
import android.content.ContentResolver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.MimeTypeMap
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.AppCompatButton
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.example.unomobile.R
import com.example.unomobile.activities.ActivityPageActivity
import com.example.unomobile.activities.FullScreenActivity
import com.example.unomobile.models.Activity
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.Api
import com.example.unomobile.network.CacheManager
import com.example.unomobile.network.Api.client
import com.example.unomobile.utils.ImageLoader
import com.example.unomobile.utils.dpToPx
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.MediaItem
import com.google.android.exoplayer2.ext.okhttp.OkHttpDataSource
import com.google.android.exoplayer2.source.ProgressiveMediaSource
import com.google.android.exoplayer2.ui.StyledPlayerView
import com.google.android.exoplayer2.upstream.cache.CacheDataSource
import com.google.android.exoplayer2.upstream.cache.LeastRecentlyUsedCacheEvictor
import com.google.android.exoplayer2.upstream.cache.SimpleCache
import com.google.android.material.card.MaterialCardView
import com.google.gson.Gson
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.File
import java.io.FileNotFoundException
import java.util.*


class ExerciseFragment : Fragment() {

    // Activity Video
    private var player: ExoPlayer? = null
    private var player_view: StyledPlayerView? = null
    private var media_path: String? = null
    private var media_type: String? = null

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
        fun newInstance(activity_id: Int, order: Int, title: String, description: String) = ExerciseFragment().apply {
            arguments = bundleOf(
                "activity_id" to activity_id,
                "order" to order,
                "title" to title,
                "description" to description,
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

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_exercise, container, false)

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
        type_text.text = order.toString() + ". Exercício"
        val title_text = view.findViewById<TextView>(R.id.title)
        title_text.text = title
        val description_text = view.findViewById<TextView>(R.id.description)
        description_text.text = description
        loading_bar = view.findViewById(R.id.loading_progress_bar)
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
                submitExercise()
            } else {
                Toast.makeText(_context, "Por favor escolha um vídeo antes de submeter.", Toast.LENGTH_SHORT).show()
            }
        }

        Log.i("ExerciseFragment", order.toString())
        Log.i("ExerciseFragment", activity_id.toString())
        Log.i("ExerciseFragment", title.toString())
        Log.i("ExerciseFragment", description.toString())

        val image = view.findViewById<ImageView>(R.id.image_view)
        val video = view.findViewById<StyledPlayerView>(R.id.video_view)
        submitted_player_view = view.findViewById(R.id.uploaded_video_view)
        submitted_video_message = view.findViewById(R.id.uploaded_video_message)

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
            Log.i("ExerciseFragment", "Record Video Button clicked")
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

        lifecycleScope.launch {
            try {
                val call = Api.retrofitService.getActivity(
                    user!!.class_id!!,
                    activity_id
                )

                call.enqueue(object : Callback<Activity> {
                    override fun onResponse(call: Call<Activity>, response: Response<Activity>) {
                        Log.i("ExerciseFragment", response.isSuccessful.toString());
                        if (response.isSuccessful) {
                            val activity_data = response.body()!!

                            if (activity_data.exercise_activity!!.media_type != null) {
                                // There is media to present
                                media_path = com.example.unomobile.network.BASE_URL + "activities/" + user!!.class_id + "/" + activity_data.id + "/exercise/media"
                                // Get media type
                                media_type = activity_data.exercise_activity.media_type!!.split("/")[0]

                                Log.i("ActivityFragment", media_type!!);

                                when (media_type) {
                                    "image" -> {
                                        image.visibility = View.VISIBLE
                                        video.visibility = View.GONE

                                        ImageLoader.picasso.load(media_path).into(image)
                                    }
                                    "video" -> {
                                        image.visibility = View.GONE
                                        video.visibility = View.VISIBLE
                                        val params = video.layoutParams
                                        params.height = 100.dpToPx(_context)
                                        video.layoutParams = params

                                        player_view = video
                                        setFullScreenListener(player_view, media_path!!)
                                        initPlayer()
                                    }
                                    "audio" -> {
                                        image.visibility = View.GONE
                                        video.visibility = View.VISIBLE
                                        val params = video.layoutParams
                                        params.height = 50.dpToPx(_context)
                                        video.layoutParams = params

                                        player_view = video
                                        setFullScreenListener(player_view, media_path!!)
                                        initPlayer()
                                    }
                                }
                            }
                            // Check if user already submitted the exercise
                            if (activity_data.completed == true) {
                                submitted_media_path = com.example.unomobile.network.BASE_URL + "activities/" + user!!.class_id + "/" + activity_data.id + "/exercise/submitted/media"
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
                        }
                    }

                    override fun onFailure(call: Call<Activity>, t: Throwable) {
                        Log.i("ExerciseFragment", "Failed request");
                        Log.i("ExerciseFragment", t.message!!)
                    }
                })
            } catch (e: Exception) {
                Log.e("ExerciseFragment", e.toString())
            }
        }

        return view
    }

    private fun submitExercise() {
        // Do something with the selected video file URI
        Log.i("ExerciseFragment", chosen_file!!.path!!)
        submit_btn.visibility = View.GONE
        loading_bar.visibility = View.VISIBLE

        val video_file = getFileFromUri(chosen_file!!)
        val requestBody = video_file.asRequestBody(getMimeType(chosen_file!!)!!.toMediaTypeOrNull())
        val mediaPart = MultipartBody.Part.createFormData("media", video_file.name, requestBody)

        val call = Api.retrofitService.submitExerciseActivity(user!!.class_id!!, activity_id!!, mediaPart)

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
                Log.i("ExerciseFragment", t.message.toString())
                submit_btn.visibility = View.VISIBLE
                loading_bar.visibility = View.GONE
            }

        })

    }

    private fun initSubmittedPlayer() {
        // Create an ExoPlayer and set it as the player for content.
        submitted_player = ExoPlayer.Builder(_context).build()
        submitted_player_view?.player = submitted_player

        val uri = Uri.parse(submitted_media_path)
        val mediaSource = ProgressiveMediaSource.Factory(CacheManager.getCacheDataSourceFactory(_context, client))
            .createMediaSource(MediaItem.Builder().setUri(uri).build())

        submitted_player!!.setMediaSource(mediaSource)
        submitted_player!!.prepare()
    }

    private fun initPlayer() {
        // Create an ExoPlayer and set it as the player for content.
        player = ExoPlayer.Builder(_context).build()
        player_view?.player = player

        val uri = Uri.parse(media_path)
        val mediaSource = ProgressiveMediaSource.Factory(CacheManager.getCacheDataSourceFactory(_context, client))
            .createMediaSource(MediaItem.Builder().setUri(uri).build())

        player!!.setMediaSource(mediaSource)
        player!!.prepare()
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

    override fun onDestroy() {
        super.onDestroy()
        Log.i("ExerciseFragment", "OnDestroy called")
        if (media_path != null && (media_type == "video" || media_type == "audio")) {
            player?.release()
            player = null
        }
        if (submitted_media_path != null || chosen_file != null) {
            submitted_player?.release()
            submitted_player = null
        }
    }

    override fun onResume() {
        super.onResume()

        if (media_path != null && (media_type == "video" || media_type == "audio")) {
            initPlayer()
        }
        if (submitted_media_path != null && chosen_file == null) {
            initSubmittedPlayer()
        }
        if (chosen_file != null) {
            initChosenVideoPlayer()
        }
    }

    override fun onPause() {
        super.onPause()
        if (media_path != null && (media_type == "video" || media_type == "audio")) {
            player?.release()
            player = null
        }
        if (submitted_media_path != null || chosen_file != null) {
            submitted_player?.release()
            submitted_player = null
        }
    }

    override fun onStop() {
        super.onStop()
        if (media_path != null && (media_type == "video" || media_type == "audio")) {
            player?.release()
            player = null
        }
        if (submitted_media_path != null || chosen_file != null) {
            submitted_player?.release()
            submitted_player = null
        }
    }

    private fun getMimeType(uri: Uri): String? {
        var mimeType: String? = if (ContentResolver.SCHEME_CONTENT == uri.scheme) {
            val cr: ContentResolver = _context.contentResolver
            cr.getType(uri)
        } else {
            val fileExtension = MimeTypeMap.getFileExtensionFromUrl(
                uri
                    .toString()
            )
            MimeTypeMap.getSingleton().getMimeTypeFromExtension(
                fileExtension.lowercase(Locale.getDefault())
            )
        }
        return mimeType
    }

    private fun getFileFromUri(uri: Uri): File {
        val file = File(uri.path!!)
        if (file.exists()) {
            return file
        }

        val inputStream = _context.contentResolver.openInputStream(uri) ?: throw FileNotFoundException()
        val mimeType = _context.contentResolver.getType(uri)
        val fileExtension = mimeType?.let { MimeTypeMap.getSingleton().getExtensionFromMimeType(it) }
        val tempFile = createTempFile("upload", fileExtension)
        tempFile.outputStream().use { outputStream ->
            inputStream.use { inputStream ->
                inputStream.copyTo(outputStream)
            }
        }
        return tempFile
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
                Log.i("ExerciseFragment", chosen_file!!.path!!);
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
            Log.i("ExerciseFragment", "URI was null")
        }
    }

    private fun initChosenVideoPlayer() {
        // Create an ExoPlayer and set it as the player for content.
        submitted_player = ExoPlayer.Builder(_context).build()
        submitted_player_view?.player = submitted_player

        submitted_player!!.setMediaItem(MediaItem.Builder().setUri(chosen_file).build())
        submitted_player!!.prepare()
    }

}