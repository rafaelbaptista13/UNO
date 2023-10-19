// Generated by view binder compiler. Do not edit!
package com.example.unomobile.databinding;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.HorizontalScrollView;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.SeekBar;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.widget.AppCompatButton;
import androidx.viewbinding.ViewBinding;
import androidx.viewbinding.ViewBindings;
import com.example.unomobile.R;
import com.google.android.exoplayer2.ui.StyledPlayerView;
import com.google.android.material.card.MaterialCardView;
import java.lang.NullPointerException;
import java.lang.Override;
import java.lang.String;

public final class FragmentGamePlayModeBinding implements ViewBinding {
  @NonNull
  private final LinearLayout rootView;

  @NonNull
  public final TextView description;

  @NonNull
  public final AppCompatButton editSubmission;

  @NonNull
  public final MaterialCardView gameCard;

  @NonNull
  public final HorizontalScrollView horizontalScrollView;

  @NonNull
  public final View lineBreak;

  @NonNull
  public final ProgressBar loadingProgressBar;

  @NonNull
  public final ImageView pauseButton;

  @NonNull
  public final ImageView playButton;

  @NonNull
  public final AppCompatButton recordVideo;

  @NonNull
  public final LinearLayout row1;

  @NonNull
  public final LinearLayout row2;

  @NonNull
  public final LinearLayout row3;

  @NonNull
  public final LinearLayout row4;

  @NonNull
  public final SeekBar seekBar;

  @NonNull
  public final TextView seekBarValue;

  @NonNull
  public final AppCompatButton submit;

  @NonNull
  public final LinearLayout submitButtons;

  @NonNull
  public final TextView teacherFeedback;

  @NonNull
  public final MaterialCardView teacherFeedbackCard;

  @NonNull
  public final TextView teacherFeedbackHeader;

  @NonNull
  public final TextView title;

  @NonNull
  public final MaterialCardView trophyCard;

  @NonNull
  public final TextView trophyHeader;

  @NonNull
  public final ImageView trophyImage;

  @NonNull
  public final TextView trophyName;

  @NonNull
  public final TextView type;

  @NonNull
  public final AppCompatButton uploadVideo;

  @NonNull
  public final LinearLayout uploadVideoButtons;

  @NonNull
  public final TextView uploadedVideoMessage;

  @NonNull
  public final StyledPlayerView uploadedVideoView;

  @NonNull
  public final View verticalGameLine;

  private FragmentGamePlayModeBinding(@NonNull LinearLayout rootView, @NonNull TextView description,
      @NonNull AppCompatButton editSubmission, @NonNull MaterialCardView gameCard,
      @NonNull HorizontalScrollView horizontalScrollView, @NonNull View lineBreak,
      @NonNull ProgressBar loadingProgressBar, @NonNull ImageView pauseButton,
      @NonNull ImageView playButton, @NonNull AppCompatButton recordVideo,
      @NonNull LinearLayout row1, @NonNull LinearLayout row2, @NonNull LinearLayout row3,
      @NonNull LinearLayout row4, @NonNull SeekBar seekBar, @NonNull TextView seekBarValue,
      @NonNull AppCompatButton submit, @NonNull LinearLayout submitButtons,
      @NonNull TextView teacherFeedback, @NonNull MaterialCardView teacherFeedbackCard,
      @NonNull TextView teacherFeedbackHeader, @NonNull TextView title,
      @NonNull MaterialCardView trophyCard, @NonNull TextView trophyHeader,
      @NonNull ImageView trophyImage, @NonNull TextView trophyName, @NonNull TextView type,
      @NonNull AppCompatButton uploadVideo, @NonNull LinearLayout uploadVideoButtons,
      @NonNull TextView uploadedVideoMessage, @NonNull StyledPlayerView uploadedVideoView,
      @NonNull View verticalGameLine) {
    this.rootView = rootView;
    this.description = description;
    this.editSubmission = editSubmission;
    this.gameCard = gameCard;
    this.horizontalScrollView = horizontalScrollView;
    this.lineBreak = lineBreak;
    this.loadingProgressBar = loadingProgressBar;
    this.pauseButton = pauseButton;
    this.playButton = playButton;
    this.recordVideo = recordVideo;
    this.row1 = row1;
    this.row2 = row2;
    this.row3 = row3;
    this.row4 = row4;
    this.seekBar = seekBar;
    this.seekBarValue = seekBarValue;
    this.submit = submit;
    this.submitButtons = submitButtons;
    this.teacherFeedback = teacherFeedback;
    this.teacherFeedbackCard = teacherFeedbackCard;
    this.teacherFeedbackHeader = teacherFeedbackHeader;
    this.title = title;
    this.trophyCard = trophyCard;
    this.trophyHeader = trophyHeader;
    this.trophyImage = trophyImage;
    this.trophyName = trophyName;
    this.type = type;
    this.uploadVideo = uploadVideo;
    this.uploadVideoButtons = uploadVideoButtons;
    this.uploadedVideoMessage = uploadedVideoMessage;
    this.uploadedVideoView = uploadedVideoView;
    this.verticalGameLine = verticalGameLine;
  }

  @Override
  @NonNull
  public LinearLayout getRoot() {
    return rootView;
  }

  @NonNull
  public static FragmentGamePlayModeBinding inflate(@NonNull LayoutInflater inflater) {
    return inflate(inflater, null, false);
  }

  @NonNull
  public static FragmentGamePlayModeBinding inflate(@NonNull LayoutInflater inflater,
      @Nullable ViewGroup parent, boolean attachToParent) {
    View root = inflater.inflate(R.layout.fragment_game_play_mode, parent, false);
    if (attachToParent) {
      parent.addView(root);
    }
    return bind(root);
  }

  @NonNull
  public static FragmentGamePlayModeBinding bind(@NonNull View rootView) {
    // The body of this method is generated in a way you would not otherwise write.
    // This is done to optimize the compiled bytecode for size and performance.
    int id;
    missingId: {
      id = R.id.description;
      TextView description = ViewBindings.findChildViewById(rootView, id);
      if (description == null) {
        break missingId;
      }

      id = R.id.edit_submission;
      AppCompatButton editSubmission = ViewBindings.findChildViewById(rootView, id);
      if (editSubmission == null) {
        break missingId;
      }

      id = R.id.game_card;
      MaterialCardView gameCard = ViewBindings.findChildViewById(rootView, id);
      if (gameCard == null) {
        break missingId;
      }

      id = R.id.horizontal_scroll_view;
      HorizontalScrollView horizontalScrollView = ViewBindings.findChildViewById(rootView, id);
      if (horizontalScrollView == null) {
        break missingId;
      }

      id = R.id.line_break;
      View lineBreak = ViewBindings.findChildViewById(rootView, id);
      if (lineBreak == null) {
        break missingId;
      }

      id = R.id.loading_progress_bar;
      ProgressBar loadingProgressBar = ViewBindings.findChildViewById(rootView, id);
      if (loadingProgressBar == null) {
        break missingId;
      }

      id = R.id.pause_button;
      ImageView pauseButton = ViewBindings.findChildViewById(rootView, id);
      if (pauseButton == null) {
        break missingId;
      }

      id = R.id.play_button;
      ImageView playButton = ViewBindings.findChildViewById(rootView, id);
      if (playButton == null) {
        break missingId;
      }

      id = R.id.record_video;
      AppCompatButton recordVideo = ViewBindings.findChildViewById(rootView, id);
      if (recordVideo == null) {
        break missingId;
      }

      id = R.id.row1;
      LinearLayout row1 = ViewBindings.findChildViewById(rootView, id);
      if (row1 == null) {
        break missingId;
      }

      id = R.id.row2;
      LinearLayout row2 = ViewBindings.findChildViewById(rootView, id);
      if (row2 == null) {
        break missingId;
      }

      id = R.id.row3;
      LinearLayout row3 = ViewBindings.findChildViewById(rootView, id);
      if (row3 == null) {
        break missingId;
      }

      id = R.id.row4;
      LinearLayout row4 = ViewBindings.findChildViewById(rootView, id);
      if (row4 == null) {
        break missingId;
      }

      id = R.id.seekBar;
      SeekBar seekBar = ViewBindings.findChildViewById(rootView, id);
      if (seekBar == null) {
        break missingId;
      }

      id = R.id.seekBarValue;
      TextView seekBarValue = ViewBindings.findChildViewById(rootView, id);
      if (seekBarValue == null) {
        break missingId;
      }

      id = R.id.submit;
      AppCompatButton submit = ViewBindings.findChildViewById(rootView, id);
      if (submit == null) {
        break missingId;
      }

      id = R.id.submit_buttons;
      LinearLayout submitButtons = ViewBindings.findChildViewById(rootView, id);
      if (submitButtons == null) {
        break missingId;
      }

      id = R.id.teacher_feedback;
      TextView teacherFeedback = ViewBindings.findChildViewById(rootView, id);
      if (teacherFeedback == null) {
        break missingId;
      }

      id = R.id.teacher_feedback_card;
      MaterialCardView teacherFeedbackCard = ViewBindings.findChildViewById(rootView, id);
      if (teacherFeedbackCard == null) {
        break missingId;
      }

      id = R.id.teacher_feedback_header;
      TextView teacherFeedbackHeader = ViewBindings.findChildViewById(rootView, id);
      if (teacherFeedbackHeader == null) {
        break missingId;
      }

      id = R.id.title;
      TextView title = ViewBindings.findChildViewById(rootView, id);
      if (title == null) {
        break missingId;
      }

      id = R.id.trophy_card;
      MaterialCardView trophyCard = ViewBindings.findChildViewById(rootView, id);
      if (trophyCard == null) {
        break missingId;
      }

      id = R.id.trophy_header;
      TextView trophyHeader = ViewBindings.findChildViewById(rootView, id);
      if (trophyHeader == null) {
        break missingId;
      }

      id = R.id.trophy_image;
      ImageView trophyImage = ViewBindings.findChildViewById(rootView, id);
      if (trophyImage == null) {
        break missingId;
      }

      id = R.id.trophy_name;
      TextView trophyName = ViewBindings.findChildViewById(rootView, id);
      if (trophyName == null) {
        break missingId;
      }

      id = R.id.type;
      TextView type = ViewBindings.findChildViewById(rootView, id);
      if (type == null) {
        break missingId;
      }

      id = R.id.upload_video;
      AppCompatButton uploadVideo = ViewBindings.findChildViewById(rootView, id);
      if (uploadVideo == null) {
        break missingId;
      }

      id = R.id.upload_video_buttons;
      LinearLayout uploadVideoButtons = ViewBindings.findChildViewById(rootView, id);
      if (uploadVideoButtons == null) {
        break missingId;
      }

      id = R.id.uploaded_video_message;
      TextView uploadedVideoMessage = ViewBindings.findChildViewById(rootView, id);
      if (uploadedVideoMessage == null) {
        break missingId;
      }

      id = R.id.uploaded_video_view;
      StyledPlayerView uploadedVideoView = ViewBindings.findChildViewById(rootView, id);
      if (uploadedVideoView == null) {
        break missingId;
      }

      id = R.id.vertical_game_line;
      View verticalGameLine = ViewBindings.findChildViewById(rootView, id);
      if (verticalGameLine == null) {
        break missingId;
      }

      return new FragmentGamePlayModeBinding((LinearLayout) rootView, description, editSubmission,
          gameCard, horizontalScrollView, lineBreak, loadingProgressBar, pauseButton, playButton,
          recordVideo, row1, row2, row3, row4, seekBar, seekBarValue, submit, submitButtons,
          teacherFeedback, teacherFeedbackCard, teacherFeedbackHeader, title, trophyCard,
          trophyHeader, trophyImage, trophyName, type, uploadVideo, uploadVideoButtons,
          uploadedVideoMessage, uploadedVideoView, verticalGameLine);
    }
    String missingId = rootView.getResources().getResourceName(id);
    throw new NullPointerException("Missing required view with ID: ".concat(missingId));
  }
}
