package com.example.unomobile.fragments

import android.annotation.SuppressLint
import android.app.Activity.RESULT_OK
import android.content.ContentResolver
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.MimeTypeMap
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.AppCompatButton
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.example.unomobile.R
import com.example.unomobile.activities.FullScreenMediaActivity
import com.example.unomobile.models.Activity
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.Api
import com.example.unomobile.network.ApiService
import com.example.unomobile.network.client
import com.example.unomobile.utils.ImageLoader
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.MediaItem
import com.google.android.exoplayer2.ext.okhttp.OkHttpDataSource
import com.google.android.exoplayer2.source.ProgressiveMediaSource
import com.google.android.exoplayer2.ui.StyledPlayerView
import com.google.gson.Gson
import kotlinx.coroutines.launch
import okhttp3.MediaType
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

    private val launcher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == RESULT_OK) {
            val data = result.data?.getStringExtra("data_key")
            // use data as needed
        }
    }

    private val filePickerLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        if (uri != null) {
            // Do something with the selected video file URI
            Log.i("ExerciseFragment", uri.path!!)

            val video_file = getFileFromUri(uri)
            val requestBody = video_file.asRequestBody(getMimeType(uri)!!.toMediaTypeOrNull())
            val mediaPart = MultipartBody.Part.createFormData("media", video_file.name, requestBody)

            val call = Api.retrofitService.submitExercise(user!!.class_id!!, activity_id!!, mediaPart)

            call.enqueue(object : Callback<ResponseBody> {
                override fun onResponse(
                    call: Call<ResponseBody>,
                    response: Response<ResponseBody>
                ) {
                    if (response.isSuccessful) {
                        Toast.makeText(requireContext(), "Vídeo submetido com sucesso.", Toast.LENGTH_SHORT)
                        submitted_video_message!!.visibility = View.VISIBLE
                        submitted_player_view!!.visibility = View.VISIBLE

                        submitted_player_view?.setFullscreenButtonClickListener {
                            var intent = Intent(requireContext(), FullScreenMediaActivity::class.java)
                            var bundle = Bundle()
                            bundle.putString("media_path", submitted_media_path)
                            intent.putExtras(bundle)
                            startActivity(intent)
                        }

                        submitted_player = ExoPlayer.Builder(requireContext()).build()
                        submitted_player_view?.player = submitted_player

                        submitted_player!!.setMediaItem(MediaItem.Builder().setUri(uri).build())
                        submitted_player!!.prepare()
                    } else {
                        Toast.makeText(requireContext(), "Ocorreu um erro ao submeter o vídeo.", Toast.LENGTH_SHORT)
                    }
                }

                override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                    Toast.makeText(requireContext(), "Ocorreu um erro ao submeter o vídeo.", Toast.LENGTH_SHORT)
                    Log.i("ExerciseFragment", t.message.toString())
                }

            })

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

        Log.i("ExerciseFragment", order.toString())
        Log.i("ExerciseFragment", activity_id.toString())
        Log.i("ExerciseFragment", title.toString())
        Log.i("ExerciseFragment", description.toString())

        val image = view.findViewById<ImageView>(R.id.image_view)
        val video = view.findViewById<StyledPlayerView>(R.id.video_view)
        submitted_player_view = view.findViewById(R.id.uploaded_video_view)
        submitted_video_message = view.findViewById(R.id.uploaded_video_message)

        // Place icon in submit buttons
        val record_video_button = view.findViewById<AppCompatButton>(R.id.record_video)
        val upload_video_button = view.findViewById<AppCompatButton>(R.id.upload_video)
        val record_icon = ContextCompat.getDrawable(requireContext(), R.drawable.record_icon)
        record_icon!!.setBounds(30, 0, 110, 80)
        record_video_button.setCompoundDrawables(record_icon, null, null, null)
        val upload_icon = ContextCompat.getDrawable(requireContext(), R.drawable.upload_icon)
        upload_icon!!.setBounds(20, 0, 110, 80)
        upload_video_button.setCompoundDrawables(upload_icon, null, null, null)

        // Add click listeners on both buttons
        /*record_video_button.setOnClickListener {
            val intent = Intent(requireActivity(), RecordVideoActivity::class.java)
            launcher.launch(intent)
        }*/
        record_video_button.isEnabled = false
        record_video_button.isClickable = false

        upload_video_button.setOnClickListener {
            filePickerLauncher.launch("video/*")
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
                            // Get media type
                            media_type = activity_data.media!!.media_type.split("/")[0]

                            Log.i("ActivityFragment", media_type!!);
                            media_path = com.example.unomobile.network.BASE_URL + "activities/" + user!!.class_id + "/" + activity_data.id + "/exercise/media"

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

                            // Check if user already submitted the exercise
                            if (activity_data.completed == true) {
                                submitted_player_view!!.visibility = View.VISIBLE
                                submitted_video_message!!.visibility = View.VISIBLE
                                submitted_media_path = com.example.unomobile.network.BASE_URL + "activities/" + user!!.class_id + "/" + activity_data.id + "/exercise/submitted/media"
                                setFullScreenListener(submitted_player_view, submitted_media_path!!)
                                initSubmittedPlayer()
                            }
                        }
                    }

                    override fun onFailure(call: Call<Activity>, t: Throwable) {
                        Log.i("ExerciseFragment", "Failed request");
                        Log.i("ExerciseFragment", t.message!!)
                        TODO("Not yet implemented")
                    }
                })
            } catch (e: Exception) {
                Log.e("ExerciseFragment", e.toString())
            }
        }

        return view
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
            var intent = Intent(requireContext(), FullScreenMediaActivity::class.java)
            var bundle = Bundle()
            bundle.putString("media_path", path)
            intent.putExtras(bundle)
            startActivity(intent)
        }
    }

    override fun onResume() {
        super.onResume()

        if (media_path != null && media_type == "video" || media_type == "audio") {
            initPlayer()
        }
        if (submitted_media_path != null) {
            initSubmittedPlayer()
        }
    }

    override fun onPause() {
        super.onPause()
        if (media_path != null && media_type == "video" || media_type == "audio") {
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
        if (media_path != null && media_type == "video" || media_type == "audio") {
            player?.release()
            player = null
        }
        if (submitted_media_path != null) {
            submitted_player?.release()
            submitted_player = null
        }
    }

    fun getMimeType(uri: Uri): String? {
        var mimeType: String? = null
        mimeType = if (ContentResolver.SCHEME_CONTENT == uri.scheme) {
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
}