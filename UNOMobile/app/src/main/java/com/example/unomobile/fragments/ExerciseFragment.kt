package com.example.unomobile.fragments

import android.annotation.SuppressLint
import android.app.Activity.RESULT_OK
import android.content.ActivityNotFoundException
import android.content.ContentResolver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.MimeTypeMap
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.AppCompatButton
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.example.unomobile.R
import com.example.unomobile.activities.ActivityPageActivity
import com.example.unomobile.activities.FullScreenActivity
import com.example.unomobile.activities.RecordVideoActivity
import com.example.unomobile.models.Activity
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.Api
import com.example.unomobile.network.client
import com.example.unomobile.utils.ImageLoader
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.MediaItem
import com.google.android.exoplayer2.ext.okhttp.OkHttpDataSource
import com.google.android.exoplayer2.source.ProgressiveMediaSource
import com.google.android.exoplayer2.ui.StyledPlayerView
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
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
import java.io.FileOutputStream
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.*

private val REQUEST_CODE = 123

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

    private var videoUriForAddingCaptureVideo : Uri? = null
    private var videoPathForAddingCaptureVideo : String? = null

    private val REQUEST_VIDEO_CAPTURE = 123

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

        val type_text = view.findViewById<TextView>(R.id.type)
        type_text.text = order.toString() + ". Exercício"
        val title_text = view.findViewById<TextView>(R.id.title)
        title_text.text = title
        val description_text = view.findViewById<TextView>(R.id.description)
        description_text.text = description
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
                submitQuestion()
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
        val record_icon = ContextCompat.getDrawable(requireContext(), R.drawable.record_icon)
        record_icon!!.setBounds(30, 0, 110, 80)
        record_video_button.setCompoundDrawables(record_icon, null, null, null)
        val upload_icon = ContextCompat.getDrawable(requireContext(), R.drawable.upload_icon)
        upload_icon!!.setBounds(20, 0, 110, 80)
        upload_video_button.setCompoundDrawables(upload_icon, null, null, null)

        // Add click listeners on both buttons
        record_video_button.setOnClickListener {
            Log.i("ExerciseFragment", "Record Video Button clicked")
            val takeVideoIntent = Intent(MediaStore.ACTION_VIDEO_CAPTURE)
            Log.i("ExerciseFragment", takeVideoIntent.resolveActivity(requireActivity().packageManager).toString())
            if (takeVideoIntent.resolveActivity(requireActivity().packageManager) != null) {
                try {
                    startActivity(takeVideoIntent)
                } catch (err: java.lang.Exception) {
                    Log.i("ExerciseFragment", err.message.toString())
                    Toast.makeText(requireContext(), "Ocorreu um erro ao abrir a câmera.", Toast.LENGTH_SHORT).show()
                }

            } else {
                Toast.makeText(requireContext(), "Ocorreu um erro ao abrir a câmera.", Toast.LENGTH_SHORT).show()
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
                                    "video", "audio" -> {
                                        image.visibility = View.GONE
                                        video.visibility = View.VISIBLE

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
                                submitted_video_message!!.visibility = View.VISIBLE
                                editMode = false
                                upload_video_buttons.visibility = View.GONE
                                submit_btn.visibility = View.GONE
                                edit_submission_btn.visibility = View.VISIBLE

                                setFullScreenListener(submitted_player_view, submitted_media_path!!)
                                initSubmittedPlayer()
                            } else {
                                upload_video_buttons.visibility = View.VISIBLE
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

    private fun submitQuestion() {
        // Do something with the selected video file URI
        Log.i("ExerciseFragment", chosen_file!!.path!!)

        val video_file = getFileFromUri(chosen_file!!)
        val requestBody = video_file.asRequestBody(getMimeType(chosen_file!!)!!.toMediaTypeOrNull())
        val mediaPart = MultipartBody.Part.createFormData("media", video_file.name, requestBody)

        val call = Api.retrofitService.submitExerciseActivity(user!!.class_id!!, activity_id!!, mediaPart)

        call.enqueue(object : Callback<ResponseBody> {
            override fun onResponse(
                call: Call<ResponseBody>,
                response: Response<ResponseBody>
            ) {
                if (response.isSuccessful) {
                    Toast.makeText(requireContext(), "Vídeo submetido com sucesso.", Toast.LENGTH_SHORT).show()

                    var activitypageactivity = activity as? ActivityPageActivity
                    if (activitypageactivity != null) {
                        activitypageactivity.activities_status?.set(order!!-1, true)
                    }
                    editMode = false
                    submit_btn.visibility = View.GONE
                    edit_submission_btn.visibility = View.VISIBLE
                    upload_video_buttons.visibility = View.GONE
                } else {
                    Toast.makeText(requireContext(), "Ocorreu um erro ao submeter o vídeo.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                Toast.makeText(requireContext(), "Ocorreu um erro ao submeter o vídeo.", Toast.LENGTH_SHORT).show()
                Log.i("ExerciseFragment", t.message.toString())
            }

        })

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

    private fun initPlayer() {
        // Create an ExoPlayer and set it as the player for content.
        player = ExoPlayer.Builder(requireContext()).build()
        player_view?.player = player

        val uri = Uri.parse(media_path)
        val dataSourceFactory = OkHttpDataSource.Factory(
            client
        )
        val mediaSource = ProgressiveMediaSource.Factory(
            dataSourceFactory
        ).createMediaSource(MediaItem.Builder().setUri(uri).build())

        player!!.setMediaSource(mediaSource)
        player!!.prepare()
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

    override fun onResume() {
        super.onResume()

        if (media_path != null && (media_type == "video" || media_type == "audio")) {
            initPlayer()
        }
        if (submitted_media_path != null) {
            initSubmittedPlayer()
        }
    }

    override fun onPause() {
        super.onPause()
        if (media_path != null && (media_type == "video" || media_type == "audio")) {
            player?.release()
            player = null
        }
        if (submitted_media_path != null) {
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
        if (submitted_media_path != null) {
            submitted_player?.release()
            submitted_player = null
        }
    }

    private fun getMimeType(uri: Uri): String? {
        var mimeType: String? = if (ContentResolver.SCHEME_CONTENT == uri.scheme) {
            val cr: ContentResolver = requireContext().contentResolver
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

        val inputStream = requireContext().contentResolver.openInputStream(uri) ?: throw FileNotFoundException()
        val mimeType = requireContext().contentResolver.getType(uri)
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
            chosen_file = uri

            submitted_video_message!!.visibility = View.VISIBLE
            submitted_player_view!!.visibility = View.INVISIBLE

            submitted_player_view?.setFullscreenButtonClickListener {
                var intent = Intent(requireContext(), FullScreenActivity::class.java)
                var bundle = Bundle()
                Log.i("ExerciseFragment", chosen_file!!.path!!);
                bundle.putParcelable("uri", chosen_file)
                intent.putExtras(bundle)
                startActivity(intent)
            }

            submitted_player = ExoPlayer.Builder(requireContext()).build()
            submitted_player_view?.player = submitted_player

            submitted_player!!.setMediaItem(MediaItem.Builder().setUri(chosen_file).build())
            submitted_player!!.prepare()

            submitted_player_view!!.visibility = View.VISIBLE
        } else {
            Log.i("ExerciseFragment", "URI was null")
        }
    }

}