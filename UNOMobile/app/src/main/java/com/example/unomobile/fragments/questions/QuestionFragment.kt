package com.example.unomobile.fragments.questions

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.AppCompatButton
import androidx.core.content.ContentProviderCompat.requireContext
import androidx.core.content.ContextCompat.startActivity
import androidx.core.os.bundleOf
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.unomobile.R
import com.example.unomobile.activities.ActivityPageActivity
import com.example.unomobile.activities.FullScreenActivity
import com.example.unomobile.models.Activity
import com.example.unomobile.models.AnswerWithAdditionalData
import com.example.unomobile.models.UserInfo
import com.example.unomobile.network.Api
import com.example.unomobile.network.client
import com.example.unomobile.utils.ImageLoader
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.MediaItem
import com.google.android.exoplayer2.ext.okhttp.OkHttpDataSource
import com.google.android.exoplayer2.source.ProgressiveMediaSource
import com.google.android.exoplayer2.ui.StyledPlayerView
import com.google.android.material.card.MaterialCardView
import com.google.gson.Gson
import kotlinx.coroutines.launch
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class QuestionFragment : Fragment() {

    private var player: ExoPlayer? = null
    private var playerView: StyledPlayerView? = null
    private var media_path: String? = null
    private var media_type: String? = null

    private var question: String? = null
    private var order: Int? = null
    private var activity_id: Int? = null

    private lateinit var recyclerView: RecyclerView
    private lateinit var manager: RecyclerView.LayoutManager
    private lateinit var adapter: RecyclerView.Adapter<*>
    private lateinit var data: List<AnswerWithAdditionalData>

    private lateinit var chosen_answers: Array<Int>
    private lateinit var edit_submission_btn: AppCompatButton
    private lateinit var submit_btn: AppCompatButton
    private lateinit var submitted_message: TextView

    private var one_answer_only: Boolean = false

    private lateinit var user: UserInfo

    // To handle if the user can change their answers or not
    private var editMode: Boolean = true

    private lateinit var loading_bar: ProgressBar

    companion object {
        fun newInstance(activity_id: Int, order: Int) = QuestionFragment().apply {
            arguments = bundleOf(
                "activity_id" to activity_id,
                "order" to order,
            )
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (arguments != null) {
            question = arguments?.getString("question")
            order = arguments?.getInt("order")
            activity_id = arguments?.getInt("activity_id")
        }

        val sharedPreferences = requireActivity().getSharedPreferences("data", AppCompatActivity.MODE_PRIVATE)
        val gson = Gson()
        val user_info = sharedPreferences.getString("user", "")
        user = gson.fromJson(user_info, UserInfo::class.java)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_question, container, false)

        if (activity_id == null) {
            return view
        }

        val type_text = view.findViewById<TextView>(R.id.type)
        type_text.text = order.toString() + ". Pergunta"
        val question_text = view.findViewById<TextView>(R.id.question)
        loading_bar = view.findViewById(R.id.loading_progress_bar)
        edit_submission_btn = view.findViewById(R.id.edit_submission)
        edit_submission_btn.setOnClickListener {
            editMode = true
            submit_btn.visibility = View.VISIBLE
            edit_submission_btn.visibility = View.GONE
            submitted_message.visibility = View.GONE
        }
        submit_btn = view.findViewById(R.id.submit)
        submit_btn.setOnClickListener {
            submitQuestion()
        }
        submitted_message = view.findViewById(R.id.submitted_message)

        Log.i("QuestionFragment", order.toString())
        Log.i("QuestionFragment", activity_id.toString())

        val image = view.findViewById<ImageView>(R.id.image_view)
        val video = view.findViewById<StyledPlayerView>(R.id.video_view)
        val question_frame_layout = view.findViewById<FrameLayout>(R.id.question_frame_layout)

        recyclerView = view.findViewById(R.id.recycler_view)
        manager = LinearLayoutManager(activity)
        recyclerView.layoutManager = manager
        recyclerView.adapter = AnswersAdapter(listOf(), requireContext())

        lifecycleScope.launch {
            try {
                val call = Api.retrofitService.getActivity(
                    user.class_id!!,
                    activity_id
                )

                call.enqueue(object : Callback<Activity> {
                    override fun onResponse(call: Call<Activity>, response: Response<Activity>) {
                        Log.i("QuestionFragment", response.isSuccessful.toString());
                        if (response.isSuccessful) {
                            val activity_data = response.body()
                            media_path = com.example.unomobile.network.BASE_URL + "activities/" + user.class_id + "/" + activity_data!!.id + "/question/media"
                            one_answer_only = activity_data.question_activity!!.one_answer_only
                            question_text.text = activity_data.question_activity.question
                            if (activity_data.question_activity.media_type != null) {
                                // Get media type
                                media_type = activity_data.question_activity.media_type.split("/")[0]

                                Log.i("QuestionFragment", media_type!!);

                                when (media_type) {
                                    "image" -> {
                                        question_frame_layout.visibility = View.VISIBLE
                                        image.visibility = View.VISIBLE
                                        video.visibility = View.GONE

                                        ImageLoader.picasso.load(media_path).into(image)
                                    }
                                    "video", "audio" -> {
                                        question_frame_layout.visibility = View.VISIBLE
                                        image.visibility = View.GONE
                                        video.visibility = View.VISIBLE

                                        playerView = video
                                        setFullScreenListener()
                                        initPlayer()
                                    }
                                }

                            }

                            chosen_answers = activity_data.question_activity.answers.filter {
                                it.chosen == true
                            }.map{ answer ->
                                answer.order
                            }.toTypedArray()
                            data = activity_data.question_activity.answers.map { answer ->
                                AnswerWithAdditionalData(answer.answer, answer.order, answer.media_type, activity_id!!,
                                    user.class_id!!, answer.chosen)
                            }.toTypedArray().toList()
                            Log.i("QuestionFragment", data[0].toString())
                            adapter = AnswersAdapter(data, requireContext())
                            recyclerView.adapter = adapter
                            (adapter as AnswersAdapter).setOnItemClickListener(object :
                                AnswersAdapter.onItemClickListener {
                                override fun onItemClick(position: Int) {
                                    if (editMode) {
                                        if (one_answer_only) {

                                            if (chosen_answers.size == 1 && data[position].chosen != true) {
                                                // Get the answer that is chosen
                                                var old_answer_id = chosen_answers[0]
                                                var old_answer = data.find { it.order == old_answer_id }

                                                // Remove from chosen answers
                                                chosen_answers = chosen_answers.filter { it != old_answer_id }.toTypedArray()
                                                old_answer!!.chosen = false

                                                data[position].chosen = true
                                                adapter.notifyItemChanged(position)
                                                adapter.notifyItemChanged(data.indexOfFirst { it == old_answer })
                                            }
                                            if (chosen_answers.size == 1 && data[position].chosen == true) {
                                                chosen_answers = emptyArray()

                                                data[position].chosen = false
                                                adapter.notifyItemChanged(position)
                                            }
                                            if (chosen_answers.isEmpty()) {
                                                data[position].chosen = true
                                                chosen_answers = chosen_answers.plus(position)
                                                adapter.notifyItemChanged(position)
                                            }
                                            Log.i("QuestionFragment", chosen_answers.toString())
                                        } else {
                                            data[position].chosen = data[position].chosen != true
                                            chosen_answers = if (data[position].chosen == true) {
                                                chosen_answers.plus(position)
                                            } else {
                                                chosen_answers.filter { it != position }.toTypedArray()
                                            }
                                            Log.i("QuestionFragment", chosen_answers.contentToString())
                                            adapter.notifyItemChanged(position)
                                        }
                                    }
                                }
                            })

                            // Check if the question has already been submitted
                            if (activity_data.completed == true) {
                                editMode = false
                                submit_btn.visibility = View.GONE
                                edit_submission_btn.visibility = View.VISIBLE
                                submitted_message.visibility = View.VISIBLE
                            } else {
                                editMode = true
                                submit_btn.visibility = View.VISIBLE
                                edit_submission_btn.visibility = View.GONE
                                submitted_message.visibility = View.GONE
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
                        Log.i("ActivityFragment", "Failed request");
                        Log.i("ActivityFrament", t.message!!)

                    }
                })


            } catch (e: Exception) {
                Log.e("MediaFragment", e.toString())
            }
        }

        return view
    }

    private fun submitQuestion() {
        submit_btn.visibility = View.GONE
        loading_bar.visibility = View.VISIBLE

        var requestBody = HashMap<String, Array<Int>>()
        requestBody["chosen_answers"] = chosen_answers
        val call = Api.retrofitService.submitQuestionActivity(user.class_id!!, activity_id!!, requestBody)

        call.enqueue(object : Callback<ResponseBody> {
            override fun onResponse(call: Call<ResponseBody>, response: Response<ResponseBody>) {
                if (response.isSuccessful) {
                    Toast.makeText(requireContext(), "Resposta submetida com sucesso.", Toast.LENGTH_SHORT).show()
                    editMode = false
                    submit_btn.visibility = View.GONE
                    edit_submission_btn.visibility = View.VISIBLE
                    submitted_message.visibility = View.VISIBLE

                    var activitypageactivity = activity as? ActivityPageActivity
                    if (activitypageactivity != null) {
                        activitypageactivity.activities_status?.set(order!!-1, true)
                    } else {
                        Log.i("QuestionFragment", "Failed to get Activity")
                    }
                } else {
                    submit_btn.visibility = View.VISIBLE
                    Toast.makeText(requireContext(), "Ocorreu um erro ao submeter a resposta.", Toast.LENGTH_SHORT).show()
                }
                loading_bar.visibility = View.GONE
            }

            override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                Toast.makeText(requireContext(), "Ocorreu um erro ao submeter a resposta.", Toast.LENGTH_SHORT).show()
                Log.i("QuestionFragment", t.message.toString())
            }

        })


    }

    private fun initPlayer() {
        // Create an ExoPlayer and set it as the player for content.
        player = ExoPlayer.Builder(requireContext()).build()
        playerView?.player = player

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
    fun setFullScreenListener() {
        // Adding Full Screen Button Click Listeners.
        playerView?.setFullscreenButtonClickListener {
            var intent = Intent(requireContext(), FullScreenActivity::class.java)
            var bundle = Bundle()
            bundle.putString("media_path", media_path)
            intent.putExtras(bundle)
            startActivity(intent)
        }
        onStart()
    }

    override fun onResume() {
        super.onResume()

        if (media_path != null && media_type == "video" || media_type == "audio") {
            initPlayer()
        }
    }

    override fun onPause() {
        super.onPause()
        if (media_path != null && media_type == "video" || media_type == "audio") {
            player?.release()
            player = null
        }
    }

    override fun onStop() {
        super.onStop()
        if (media_path != null && media_type == "video" || media_type == "audio") {
            player?.release()
            player = null
        }
    }
}